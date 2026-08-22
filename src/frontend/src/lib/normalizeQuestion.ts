// Copy-pasted questions (from PDFs, WhatsApp, browsers) often carry extra
// whitespace, stray line breaks, and non-breaking spaces. This cleans that
// up before the question reaches the solver, without touching the words.
export function normalizeQuestion(raw: string): string {
  return raw
    .replace(/\u00A0/g, " ") // non-breaking spaces
    .replace(/[ \t]+/g, " ") // collapse repeated spaces/tabs
    .replace(/\n{3,}/g, "\n\n") // collapse excessive blank lines
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}
