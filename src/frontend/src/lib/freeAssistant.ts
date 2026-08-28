import { CONCEPTS, FORMULAS, PERIODIC_TABLE, PHYSICS_CONSTANTS } from "../data/scienceData";

export interface FreeAssistantResult {
  answer: string;
  detail?: string;
}

function findElementByName(query: string) {
  const q = query.trim().toLowerCase();
  return PERIODIC_TABLE.find(
    (e) => e.name.toLowerCase() === q || e.sym.toLowerCase() === q,
  );
}

function lookupScience(input: string): FreeAssistantResult | null {
  const q = input.trim().toLowerCase().replace(/[?.!]/g, "");

  // "atomic number of X" / "atomic number for X"
  let m = q.match(/atomic number (?:of|for) ([a-z\s]+)/);
  if (m) {
    const el = findElementByName(m[1]);
    if (el) {
      return {
        answer: `${el.name} ka atomic number hai **${el.n}**`,
        detail: `Symbol: ${el.sym}, Atomic mass: ${el.mass}, Category: ${el.category}`,
      };
    }
  }

  // "symbol for X" / "symbol of X"
  m = q.match(/symbol (?:for|of) ([a-z\s]+)/);
  if (m) {
    const el = findElementByName(m[1]);
    if (el) return { answer: `${el.name} ka symbol hai **${el.sym}**` };
  }

  // "atomic mass of X" / "atomic weight of X"
  m = q.match(/atomic (?:mass|weight) of ([a-z\s]+)/);
  if (m) {
    const el = findElementByName(m[1]);
    if (el) return { answer: `${el.name} ka atomic mass hai **${el.mass}**` };
  }

  // "what is X" / "what's X" where X is an element name or symbol
  m = q.match(/what(?:'s| is) ([a-z]+)$/);
  if (m) {
    const el = findElementByName(m[1]);
    if (el) {
      return {
        answer: `${el.name} (${el.sym}) — atomic number **${el.n}**`,
        detail: `Atomic mass: ${el.mass}, Category: ${el.category}`,
      };
    }
  }

  // "element number X" / "element X"
  m = q.match(/element (?:number )?(\d+)/);
  if (m) {
    const el = PERIODIC_TABLE.find((e) => e.n === Number.parseInt(m![1], 10));
    if (el) {
      return {
        answer: `Element ${el.n} hai **${el.name} (${el.sym})**`,
        detail: `Atomic mass: ${el.mass}, Category: ${el.category}`,
      };
    }
  }

  // Physics constants — "value of X" / "what is X"
  for (const [key, data] of Object.entries(PHYSICS_CONSTANTS)) {
    if (q.includes(key)) {
      return { answer: `**${data.value} ${data.unit}**` };
    }
  }

  // Formulas — "formula for X" / "formula of X"
  m = q.match(/formula (?:for|of) ([a-z\s]+)/);
  if (m) {
    const key = m[1].trim();
    for (const [fKey, formula] of Object.entries(FORMULAS)) {
      if (fKey.includes(key) || key.includes(fKey)) {
        return { answer: `Formula: **${formula}**` };
      }
    }
  }
  // Also match direct mentions without "formula for" prefix
  for (const [key, formula] of Object.entries(FORMULAS)) {
    if (q.includes(key)) {
      return { answer: `Formula: **${formula}**` };
    }
  }

  // Basic concept explanations — "what is X" / "explain X" for science & CS
  m = q.match(/(?:what is|what's|explain|define) ([a-z\s]+)/);
  if (m) {
    const key = m[1].trim();
    for (const [cKey, explanation] of Object.entries(CONCEPTS)) {
      if (cKey === key || key.includes(cKey)) {
        return { answer: explanation };
      }
    }
  }
  // Direct mention fallback
  for (const [key, explanation] of Object.entries(CONCEPTS)) {
    if (q.includes(key)) {
      return { answer: explanation };
    }
  }

  return null;
}

const SMALL_TALK: Array<{ patterns: RegExp; replies: string[] }> = [
  {
    patterns: /^(hi|hii+|hello|hey|namaste|namaskar)\b/,
    replies: [
      "Hello! Kya calculate karna hai aaj?",
      "Hi! Main yahan hoon — math, science, ya kuch bhi poochho.",
    ],
  },
  {
    patterns: /^(good\s?morning)\b/,
    replies: ["Good morning! Aaj kya solve karein?"],
  },
  {
    patterns: /^(good\s?night)\b/,
    replies: ["Good night! Zaroorat ho to phir se pooch lena."],
  },
  {
    patterns: /^(bye|goodbye|see\s?you|tata)\b/,
    replies: ["Bye! Zaroorat ho to phir aa jana.", "Alvida! Take care."],
  },
  {
    patterns: /^(thanks?|thank\s?you|shukriya|dhanyavad)\b/,
    replies: ["Aapka swagat hai! 😊", "Koi baat nahi, khushi hui madad karke."],
  },
  {
    patterns: /^(help|madad|kya kar sakte ho|what can you do)\b/,
    replies: [
      "Main ye kar sakta hoon: math solve (jaise '25 + 17'), periodic table (jaise 'symbol for Gold'), physics constants, formulas, aur simple baat-cheet. Khule sawalon ke liye AI+ tab try karein.",
    ],
  },
  {
    patterns: /^(how are you|kaise ho|kya haal)\b/,
    replies: ["Main theek hoon, dhanyavad! Aap batao, kya calculate karna hai?"],
  },
];

function trySmallTalk(input: string): FreeAssistantResult | null {
  const q = input.trim().toLowerCase();
  for (const entry of SMALL_TALK) {
    if (entry.patterns.test(q)) {
      const reply =
        entry.replies[Math.floor(Math.random() * entry.replies.length)];
      return { answer: reply };
    }
  }
  return null;
}

function tryTimeDateQuery(input: string): FreeAssistantResult | null {
  const q = input.trim().toLowerCase();
  const isTimeQuery = /\b(samay|time|baje)\b.*\b(kya|what)\b|\b(kya|what)\b.*\b(samay|time|baje)\b|kitne baje/.test(q);
  const isDateQuery = /\b(tareek|tarikh|date)\b.*\b(kya|what)\b|\b(kya|what)\b.*\b(tareek|tarikh|date)\b|aaj.*(kaun sa din|din kaun sa)/.test(q);

  if (isTimeQuery) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return { answer: `Abhi **${timeStr}** baje hain.` };
  }
  if (isDateQuery) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return { answer: `Aaj **${dateStr}** hai.` };
  }
  return null;
}

export function solveFree(input: string): FreeAssistantResult | null {
  const timeDate = tryTimeDateQuery(input);
  if (timeDate) return timeDate;
  const smallTalk = trySmallTalk(input);
  if (smallTalk) return smallTalk;
  const science = lookupScience(input);
  if (science) return science;
  return null;
}
