// A tiny keyword-based classifier — good enough to label a history box,
// not meant to be exact. Runs fully offline, no dependencies.
const CATEGORY_KEYWORDS: Array<{ category: string; words: RegExp }> = [
  { category: "Math", words: /\b(plus|minus|times|divided|square|cube|equation|solve|percent|average|lcm|hcf|gcd|triangle|circle|rectangle|area|perimeter|volume|sin|cos|tan|algebra|fraction)\b/i },
  { category: "Physics", words: /\b(force|velocity|acceleration|energy|newton|gravity|speed|density|ohm|current|voltage|resistance)\b/i },
  { category: "Chemistry", words: /\b(atom|molecule|reaction|acid|base|valency|isotope|element|compound|periodic)\b/i },
  { category: "Biology", words: /\b(cell|dna|photosynthesis|mitosis|respiration|ecosystem|chromosome|vertebrate|organism)\b/i },
  { category: "English", words: /\b(noun|verb|adjective|adverb|pronoun|preposition|synonym|antonym|tense|grammar|essay)\b/i },
  { category: "Hindi", words: /संज्ञा|सर्वनाम|क्रिया|विशेषण|व्याकरण|sangya|sarvanam|kriya|visheshan/i },
  { category: "Computer", words: /\b(algorithm|variable|loop|function|binary|cpu|ram|internet|software|hardware|database|program)\b/i },
  { category: "Banking", words: /\b(interest|deposit|inflation|gdp|profit|loss|bank|loan|emi)\b/i },
];

export function guessCategory(text: string): string {
  for (const { category, words } of CATEGORY_KEYWORDS) {
    if (words.test(text)) return category;
  }
  return "General";
}
