import { extractText } from "unpdf";

/**
 * PDF text extraction.
 *
 * Runs server-side for three reasons: the parser is large and has no business
 * in the browser bundle, the text is written to a column the client cannot
 * write, and the source file lives in a private bucket the server reads with
 * the service-role key.
 */

/** Stored text is capped so one enormous PDF can't dominate a row or a prompt. */
export const MAX_EXTRACTED_CHARS = 200_000;

/**
 * Below this, the PDF has no usable text layer — almost always a scan. Real
 * generation cannot work from it, so the document is marked failed with an
 * explanation rather than silently accepted.
 */
export const MIN_USEFUL_CHARS = 100;

export interface ExtractionResult {
  text: string;
  pages: number;
  truncated: boolean;
}

export async function extractPdfText(data: Uint8Array): Promise<ExtractionResult> {
  const { totalPages, text } = await extractText(data, { mergePages: true });
  const normalized = normalize(text);

  return {
    text: normalized.slice(0, MAX_EXTRACTED_CHARS),
    pages: totalPages,
    truncated: normalized.length > MAX_EXTRACTED_CHARS,
  };
}

/** PDF text arrives with ragged line breaks and runs of spaces from the layout. */
function normalize(text: string): string {
  return (
    text
      .replace(/\r\n?/g, "\n")
      // PDFs carry non-breaking and narrow spaces from the layout engine.
      .replace(/[ \t\u00a0\u2007\u202f]+/g, " ")
      .replace(/ ?\n ?/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
