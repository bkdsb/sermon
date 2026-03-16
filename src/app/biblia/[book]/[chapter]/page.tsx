import { notFound } from "next/navigation";
import BibleChapter from "@/components/bible/BibleChapter";
import { getBook, getChapter } from "@/lib/bible/getBible";

interface BibleChapterPageProps {
  params: Promise<{
    book: string;
    chapter: string;
  }>;
}

export default async function BibleChapterPage({ params }: BibleChapterPageProps) {
  const { book, chapter } = await params;
  const chapterNumber = Number.parseInt(chapter, 10);

  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
    notFound();
  }

  const bookData = getBook(book);
  const chapterData = getChapter(book, chapterNumber);

  if (!bookData || !chapterData) {
    notFound();
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <header className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--primary)]">
          {bookData.name} {chapterNumber}
        </h1>
      </header>

      <BibleChapter book={bookData.abbrev} chapter={chapterNumber} />
    </section>
  );
}
