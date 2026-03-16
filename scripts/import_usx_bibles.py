#!/usr/bin/env python3
"""Convert USX DBL zip bundles (ACF/ARA) into project Bible JSON files."""

from __future__ import annotations

import argparse
import html
import json
import re
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

BOOK_ORDER = [
    "GEN",
    "EXO",
    "LEV",
    "NUM",
    "DEU",
    "JOS",
    "JDG",
    "RUT",
    "1SA",
    "2SA",
    "1KI",
    "2KI",
    "1CH",
    "2CH",
    "EZR",
    "NEH",
    "EST",
    "JOB",
    "PSA",
    "PRO",
    "ECC",
    "SNG",
    "ISA",
    "JER",
    "LAM",
    "EZK",
    "DAN",
    "HOS",
    "JOL",
    "AMO",
    "OBA",
    "JON",
    "MIC",
    "NAM",
    "HAB",
    "ZEP",
    "HAG",
    "ZEC",
    "MAL",
    "MAT",
    "MRK",
    "LUK",
    "JHN",
    "ACT",
    "ROM",
    "1CO",
    "2CO",
    "GAL",
    "EPH",
    "PHP",
    "COL",
    "1TH",
    "2TH",
    "1TI",
    "2TI",
    "TIT",
    "PHM",
    "HEB",
    "JAS",
    "1PE",
    "2PE",
    "1JN",
    "2JN",
    "3JN",
    "JUD",
    "REV",
]

CHAPTER_RE = re.compile(r'<chapter\s+number="([^\"]+)"[^>]*/>')
VERSE_RE = re.compile(r'<verse\s+number="([^\"]+)"[^>]*/>')
TOC1_RE = re.compile(r'<para\s+style="toc1">(.*?)</para>', re.DOTALL)
NOTE_RE = re.compile(r'<note\b.*?</note>', re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
MULTISPACE_RE = re.compile(r"\s+")
DIGIT_RE = re.compile(r"(\d+)")


def normalize_slug(value: str) -> str:
    value = value.strip().lower()
    value = "".join(ch for ch in value if ch.isalnum())
    return value


def parse_metadata(zf: zipfile.ZipFile) -> dict[str, dict[str, str]]:
    metadata_path = next(name for name in zf.namelist() if name.endswith("metadata.xml"))
    root = ET.fromstring(zf.read(metadata_path))

    names: dict[str, dict[str, str]] = {}
    names_node = root.find("names")
    if names_node is None:
        return names

    for name_node in names_node.findall("name"):
        name_id = name_node.attrib.get("id", "")
        if not name_id.startswith("book-"):
            continue

        key = name_id.replace("book-", "")
        abbr = (name_node.findtext("abbr") or "").strip()
        short = (name_node.findtext("short") or "").strip()
        long = (name_node.findtext("long") or "").strip()

        names[key] = {
            "abbr": abbr,
            "short": short,
            "long": long,
        }

    return names


def usx_code_to_meta_key(code: str) -> str:
    if code[:1].isdigit():
        return f"{code[0]}{code[1:].lower()}"
    return code.lower()


def parse_usx_book(xml_text: str) -> tuple[str, list[list[str]]]:
    toc_match = TOC1_RE.search(xml_text)
    inferred_name = ""
    if toc_match:
        inferred_name = html.unescape(TAG_RE.sub(" ", toc_match.group(1))).strip()

    chapter_matches = list(CHAPTER_RE.finditer(xml_text))
    chapters: list[list[str]] = []

    for chapter_index, chapter_match in enumerate(chapter_matches):
        chapter_number_match = DIGIT_RE.search(chapter_match.group(1))
        if not chapter_number_match:
            continue
        chapter_number = int(chapter_number_match.group(1))

        chunk_start = chapter_match.end()
        chunk_end = chapter_matches[chapter_index + 1].start() if chapter_index + 1 < len(chapter_matches) else len(xml_text)
        chapter_chunk = xml_text[chunk_start:chunk_end]

        verse_matches = list(VERSE_RE.finditer(chapter_chunk))
        verses: list[str] = []

        for verse_index, verse_match in enumerate(verse_matches):
            verse_number_match = DIGIT_RE.search(verse_match.group(1))
            if not verse_number_match:
                continue
            verse_number = int(verse_number_match.group(1))

            verse_start = verse_match.end()
            verse_end = verse_matches[verse_index + 1].start() if verse_index + 1 < len(verse_matches) else len(chapter_chunk)
            raw_verse = chapter_chunk[verse_start:verse_end]

            raw_verse = NOTE_RE.sub(" ", raw_verse)
            raw_verse = TAG_RE.sub(" ", raw_verse)
            normalized = MULTISPACE_RE.sub(" ", html.unescape(raw_verse)).strip()

            while len(verses) < verse_number - 1:
                verses.append("")

            if len(verses) == verse_number - 1:
                verses.append(normalized)
            else:
                current = verses[verse_number - 1]
                verses[verse_number - 1] = f"{current} {normalized}".strip() if normalized else current

        while len(chapters) < chapter_number - 1:
            chapters.append([])
        chapters.append(verses)

    return inferred_name, chapters


def extract_usx_files(zf: zipfile.ZipFile) -> dict[str, str]:
    output: dict[str, str] = {}
    for name in zf.namelist():
        if not name.endswith(".usx"):
            continue
        if "/release/USX_1/" not in name:
            continue
        code = Path(name).stem.upper()
        output[code] = name
    return output


def convert_zip(zip_path: Path) -> list[dict]:
    with zipfile.ZipFile(zip_path) as zf:
        metadata = parse_metadata(zf)
        usx_files = extract_usx_files(zf)

        books: list[dict] = []

        for code in BOOK_ORDER:
            usx_path = usx_files.get(code)
            if not usx_path:
                raise RuntimeError(f"USX file not found for code: {code}")

            xml_text = zf.read(usx_path).decode("utf-8")
            inferred_name, chapters = parse_usx_book(xml_text)

            meta_key = usx_code_to_meta_key(code)
            meta = metadata.get(meta_key, {})
            name = meta.get("short") or meta.get("long") or inferred_name or code
            abbr = normalize_slug(meta.get("abbr") or code)

            books.append(
                {
                    "abbrev": abbr,
                    "name": name,
                    "chapters": chapters,
                }
            )

    return books


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert ACF/ARA USX bundles to local JSON datasets.")
    parser.add_argument("--acf-zip", required=True, type=Path)
    parser.add_argument("--ara-zip", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    args = parser.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)

    acf = convert_zip(args.acf_zip)
    ara = convert_zip(args.ara_zip)

    (args.out_dir / "acf.json").write_text(json.dumps(acf, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (args.out_dir / "ara.json").write_text(json.dumps(ara, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {len(acf)} books to {args.out_dir / 'acf.json'}")
    print(f"Wrote {len(ara)} books to {args.out_dir / 'ara.json'}")


if __name__ == "__main__":
    main()
