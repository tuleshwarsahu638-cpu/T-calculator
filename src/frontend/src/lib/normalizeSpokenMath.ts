// Converts spoken-style Hindi/Hinglish math questions into a plain
// digit+operator string. Example:
//   "ek aur ek kitna hota hai"        -> "1 + 1"
//   "paanch guna teen"                -> "5 * 3"
//   "das mein se char ghatao"         -> "10 - 4"
//   "bees ko char se bhaag do"        -> "20 / 4"
// Returns the original text unchanged if nothing recognizable is found,
// so it's always safe to run before the existing number-based solvers.

const HINDI_NUMBERS: Record<string, number> = {
  shunya: 0, sun: 0,
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4,
  panch: 5, paanch: 5, chhe: 6, che: 6, saat: 7,
  aath: 8, nau: 9, das: 10, dus: 10,
  gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15,
  solah: 16, satrah: 17, atharah: 18, unnis: 19, bees: 20, bis: 20,
  tees: 30, chalis: 40, pachas: 50, saath: 60, sattar: 70,
  assi: 80, nabbe: 90, sau: 100, hazar: 1000, hazaar: 1000,
};

const OPERATOR_WORDS: Array<{ pattern: RegExp; symbol: string }> = [
  { pattern: /\b(jama|jod|jodo|plus|aur|add)\b/g, symbol: "+" },
  { pattern: /\b(ghata|ghatao|minus|kam|subtract)\b/g, symbol: "-" },
  { pattern: /\b(guna|gunaa|multiply|times|cross)\b/g, symbol: "*" },
  { pattern: /\b(bhaag|bhag|divide|divided)\b/g, symbol: "/" },
];

// Trailing/filler phrases that just mean "what is the answer" — safe to drop.
const FILLER_PHRASES = [
  /kitna hota hai\??/g,
  /kitna hoga\??/g,
  /kya hota hai\??/g,
  /kya hai\??/g,
  /batao\??/g,
  /bolo\??/g,
  /mein se/g, // "10 mein se 4" -> "10 4" (handled together with ghatao below)
  /ko/g,
  /se/g,
];

export function normalizeSpokenMath(raw: string): string {
  let text = ` ${raw.toLowerCase().trim()} `;

  // Replace Hindi number words with digits (longest words first so
  // "bees" doesn't get partially matched inside a longer word, etc.)
  const words = Object.keys(HINDI_NUMBERS).sort((a, b) => b.length - a.length);
  for (const w of words) {
    text = text.replace(new RegExp(`\\b${w}\\b`, "g"), ` ${HINDI_NUMBERS[w]} `);
  }

  // Replace operator words with symbols
  for (const { pattern, symbol } of OPERATOR_WORDS) {
    text = text.replace(pattern, ` ${symbol} `);
  }

  // Drop filler phrases
  for (const f of FILLER_PHRASES) {
    text = text.replace(f, " ");
  }

  // Collapse extra whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text || raw;
}
