export interface AtToken {
  text: string;
  start: number;
  end: number;
}

export function getAtTokenFromText(text: string, cursorPos: number): AtToken | null {
  const safeCursor = Math.min(Math.max(cursorPos, 0), text.length);
  const leftSide = text.slice(0, safeCursor);
  const atIndex = leftSide.lastIndexOf("@");

  if (atIndex < 0) return null;

  const previousChar = text[atIndex - 1];
  if (atIndex > 0 && previousChar && /[^\s([{-]/.test(previousChar)) {
    return null;
  }

  const candidate = leftSide.slice(atIndex + 1);
  if (candidate.includes("\n") || candidate.includes("]")) {
    return null;
  }

  return {
    text: candidate,
    start: atIndex,
    end: safeCursor
  };
}
