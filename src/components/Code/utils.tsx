import { MAX_CODE_HEIGHT, ROW_HEIGHT, ROW_WIDTH } from './constants';
import type { SyntaxHighlighterRow } from './types';

const DATA_URL_BASE64_REGEX = /^data:([^;,]+);base64,/i;

export function isValidUrl(string: string) {
  try {
    const url = new URL(string);
    const path = url.pathname.toLowerCase();
    return /\/[^/]+\.(jpg|jpeg|png|gif|svg|webp)$/i.test(path);
  } catch {
    return false;
  }
}

export function getMimeTypeFromDataUrl(string: string): string | null {
  const match = string.match(DATA_URL_BASE64_REGEX);
  return match?.[1] ?? null;
}

export function calculateTotalHeight(
  rows: SyntaxHighlighterRow[],
  containerWidth?: number
) {
  const totalRows = rows.reduce((sum, row) => {
    const text = row.children
      .map((child) => child.children?.[0]?.value || '')
      .join('');

    const charsPerLine = containerWidth
      ? Math.floor(containerWidth / 8)
      : ROW_WIDTH;
    const additionalRows = Math.floor(text.length / charsPerLine);
    return sum + 1 + additionalRows;
  }, 0);

  const height = totalRows * ROW_HEIGHT;

  return Math.min(height, MAX_CODE_HEIGHT);
}
