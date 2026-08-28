import type { Solution } from "../pages/AiMathSolver";

export type StepLanguageMode = "hi" | "en" | "mix";

const TITLES: Record<StepLanguageMode, Record<string, string>> = {
  hi: {
    understand: "प्रश्न को समझना",
    given: "दी गई जानकारी (Given)",
    required: "क्या चाहिए (Required)",
    formula: "सूत्र / अवधारणा",
    calc: "गणना",
    final: "अंतिम उत्तर",
  },
  en: {
    understand: "Understanding the question",
    given: "Given information",
    required: "Required information",
    formula: "Formula / Concept used",
    calc: "Calculation",
    final: "Final Answer",
  },
  mix: {
    understand: "Sawaal ko samajhna",
    given: "Given (diya gaya)",
    required: "Required (kya chahiye)",
    formula: "Formula / Concept",
    calc: "Calculation",
    final: "Final Answer",
  },
};

const STEP_WORD: Record<StepLanguageMode, string> = {
  hi: "चरण",
  en: "Step",
  mix: "Step",
};

// Turns a raw Solution (original text + a flat list of intermediate steps)
// into the academic narrative the study assistant should show, in the
// chosen language mode (Hindi / English / Hindi+English mix). The Formula
// step can be turned off (Formula On/Off control); when it's off, the
// remaining steps renumber cleanly instead of leaving a gap.
//
// The underlying solver (AiMathSolver.parseAndSolve) already produces a
// short ordered trail of {description, value} steps — we don't change that
// contract (other pages depend on it), we just re-narrate it here for the
// chat view.
export function formatStepByStep(
  solution: Solution,
  mode: StepLanguageMode = "mix",
  showFormula = true,
): string {
  const { original, steps, finalAnswer } = solution;
  const t = TITLES[mode];
  const word = STEP_WORD[mode];

  const [given, ...rest] = steps;
  const formulaStep = rest.find((s) => /formula|applied|identity/i.test(s.description));
  const calcSteps = rest.filter((s) => s !== formulaStep);

  const requiredText =
    mode === "hi"
      ? "ऊपर दिए गए के लिए अंतिम मान/उत्तर निकालना है।"
      : mode === "en"
        ? "Find the final value/answer for the above."
        : "Upar diye gaye ke liye final value/answer nikalna hai.";

  const sections: Array<{ title: string; body: string[] }> = [
    { title: t.understand, body: [original.trim()] },
    { title: t.given, body: [given ? given.value : original.trim()] },
    { title: t.required, body: [requiredText] },
  ];
  if (formulaStep && showFormula) {
    sections.push({ title: t.formula, body: [formulaStep.value] });
  }
  sections.push({
    title: t.calc,
    body:
      calcSteps.length > 0
        ? calcSteps.map((s) => `- ${s.description}: \`${s.value}\``)
        : [`\`${finalAnswer}\``],
  });
  sections.push({ title: t.final, body: [`**${finalAnswer}**`] });

  const lines: string[] = [];
  sections.forEach((section, i) => {
    lines.push(`**${word} ${i + 1} — ${section.title}**`);
    lines.push(...section.body);
    lines.push("");
  });

  return lines.join("\n").trim();
}
