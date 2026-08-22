import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Lightbulb, Wand2 } from "lucide-react";
import { useState } from "react";
import { TRIG_TABLE } from "../data/scienceData";

export interface Step {
  description: string;
  value: string;
}

export interface Solution {
  original: string;
  steps: Step[];
  finalAnswer: string;
}

export function parseAndSolve(input: string): Solution | null {
  const clean = input
    .toLowerCase()
    .replace(/[^\d+\-*/().\s\^]/g, "")
    .trim();
  if (!clean) return null;

  const steps: Step[] = [];

  // Try to extract a simple arithmetic expression
  const exprMatch = clean.match(/[\d+\-*/().\s\^]+/);
  if (!exprMatch) return null;

  const expr = exprMatch[0].replace(/\^/g, "**").replace(/\s/g, "");

  steps.push({
    description: "Parsed expression",
    value: expr,
  });

  // Break down the expression
  const numbers = expr.match(/\d+(\.\d+)?/g);
  if (numbers && numbers.length > 1) {
    steps.push({
      description: `Found ${numbers.length} numbers`,
      value: numbers.join(", "),
    });
  }

  // Evaluate
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${expr}`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      steps.push({
        description: "Calculated result",
        value: String(Number.parseFloat(result.toFixed(10))),
      });

      return {
        original: input,
        steps,
        finalAnswer: String(Number.parseFloat(result.toFixed(10))),
      };
    }
  } catch {
    // Try word problem parsing
  }

  // Word problem parsing
  const wordClean = input.toLowerCase();

  // "what is X plus Y"
  const plusMatch = wordClean.match(
    /what is (\d+(?:\.\d+)?) plus (\d+(?:\.\d+)?)/,
  );
  if (plusMatch) {
    const a = Number.parseFloat(plusMatch[1]);
    const b = Number.parseFloat(plusMatch[2]);
    steps.push({
      description: "Identified addition problem",
      value: `${a} + ${b}`,
    });
    steps.push({ description: "Added the numbers", value: String(a + b) });
    return { original: input, steps, finalAnswer: String(a + b) };
  }

  // "what is X minus Y"
  const minusMatch = wordClean.match(
    /what is (\d+(?:\.\d+)?) minus (\d+(?:\.\d+)?)/,
  );
  if (minusMatch) {
    const a = Number.parseFloat(minusMatch[1]);
    const b = Number.parseFloat(minusMatch[2]);
    steps.push({
      description: "Identified subtraction problem",
      value: `${a} - ${b}`,
    });
    steps.push({ description: "Subtracted", value: String(a - b) });
    return { original: input, steps, finalAnswer: String(a - b) };
  }

  // "what is X times Y"
  const timesMatch = wordClean.match(
    /what is (\d+(?:\.\d+)?) times (\d+(?:\.\d+)?)/,
  );
  if (timesMatch) {
    const a = Number.parseFloat(timesMatch[1]);
    const b = Number.parseFloat(timesMatch[2]);
    steps.push({
      description: "Identified multiplication problem",
      value: `${a} × ${b}`,
    });
    steps.push({ description: "Multiplied", value: String(a * b) });
    return { original: input, steps, finalAnswer: String(a * b) };
  }

  // "what is X divided by Y"
  const divMatch = wordClean.match(
    /what is (\d+(?:\.\d+)?) divided by (\d+(?:\.\d+)?)/,
  );
  if (divMatch) {
    const a = Number.parseFloat(divMatch[1]);
    const b = Number.parseFloat(divMatch[2]);
    steps.push({
      description: "Identified division problem",
      value: `${a} ÷ ${b}`,
    });
    steps.push({ description: "Divided", value: String(a / b) });
    return { original: input, steps, finalAnswer: String(a / b) };
  }

  // "square root of X"
  const sqrtMatch = wordClean.match(/square root of (\d+(?:\.\d+)?)/);
  if (sqrtMatch) {
    const a = Number.parseFloat(sqrtMatch[1]);
    steps.push({ description: "Identified square root", value: `√${a}` });
    steps.push({
      description: "Calculated square root",
      value: String(Math.sqrt(a)),
    });
    return { original: input, steps, finalAnswer: String(Math.sqrt(a)) };
  }

  // "X percent of Y"
  const percentMatch = wordClean.match(
    /(\d+(?:\.\d+)?) percent of (\d+(?:\.\d+)?)/,
  );
  if (percentMatch) {
    const a = Number.parseFloat(percentMatch[1]);
    const b = Number.parseFloat(percentMatch[2]);
    steps.push({
      description: "Identified percentage problem",
      value: `${a}% of ${b}`,
    });
    steps.push({
      description: "Calculated percentage",
      value: String((a / 100) * b),
    });
    return { original: input, steps, finalAnswer: String((a / 100) * b) };
  }

  // "X cubed"
  const cubedMatch = wordClean.match(/(\d+(?:\.\d+)?) cubed/);
  if (cubedMatch) {
    const a = Number.parseFloat(cubedMatch[1]);
    steps.push({ description: "Identified cube operation", value: `${a}³` });
    steps.push({ description: "Cubed the number", value: String(a * a * a) });
    return { original: input, steps, finalAnswer: String(a * a * a) };
  }

  // "cube root of X"
  const cbrtMatch = wordClean.match(/cube root of (-?\d+(?:\.\d+)?)/);
  if (cbrtMatch) {
    const a = Number.parseFloat(cbrtMatch[1]);
    steps.push({ description: "Identified cube root", value: `∛${a}` });
    const result = Math.cbrt(a);
    steps.push({ description: "Calculated cube root", value: String(result) });
    return { original: input, steps, finalAnswer: String(result) };
  }

  // "X to the power of Y" / "X to the power Y"
  const powerMatch = wordClean.match(
    /(\d+(?:\.\d+)?) to the power(?: of)? (\d+(?:\.\d+)?)/,
  );
  if (powerMatch) {
    const a = Number.parseFloat(powerMatch[1]);
    const b = Number.parseFloat(powerMatch[2]);
    steps.push({ description: "Identified power operation", value: `${a}^${b}` });
    const result = a ** b;
    steps.push({ description: "Raised to power", value: String(result) });
    return { original: input, steps, finalAnswer: String(result) };
  }

  // "average of A, B, C, ..."
  const avgMatch = wordClean.match(/average of ([\d.,\sand]+)/);
  if (avgMatch) {
    const nums = avgMatch[1]
      .replace(/and/g, ",")
      .split(",")
      .map((s) => Number.parseFloat(s.trim()))
      .filter((n) => !Number.isNaN(n));
    if (nums.length > 0) {
      steps.push({
        description: `Found ${nums.length} numbers`,
        value: nums.join(", "),
      });
      const sum = nums.reduce((acc, n) => acc + n, 0);
      steps.push({ description: "Summed the numbers", value: String(sum) });
      const avg = sum / nums.length;
      steps.push({
        description: `Divided by count (${nums.length})`,
        value: String(avg),
      });
      return { original: input, steps, finalAnswer: String(avg) };
    }
  }

  // "X increased/decreased by Y percent"
  const percentChangeMatch = wordClean.match(
    /(\d+(?:\.\d+)?) (increased|decreased) by (\d+(?:\.\d+)?) ?(?:percent|%)/,
  );
  if (percentChangeMatch) {
    const base = Number.parseFloat(percentChangeMatch[1]);
    const direction = percentChangeMatch[2];
    const pct = Number.parseFloat(percentChangeMatch[3]);
    const change = (base * pct) / 100;
    const result = direction === "increased" ? base + change : base - change;
    steps.push({
      description: `Identified ${direction === "increased" ? "increase" : "decrease"} by percentage`,
      value: `${base} ${direction === "increased" ? "+" : "-"} ${pct}%`,
    });
    steps.push({ description: "Calculated change amount", value: String(change) });
    steps.push({ description: "Applied change", value: String(result) });
    return { original: input, steps, finalAnswer: String(result) };
  }

  // Simple linear equation: "solve for x: 2x + 3 = 11" or "2x+3=11"
  const equationMatch = wordClean
    .replace(/solve( for x)?:?/g, "")
    .trim()
    .match(/^(-?\d*\.?\d*)\s*x\s*([+-]\s*\d+(?:\.\d+)?)?\s*=\s*(-?\d+(?:\.\d+)?)$/);
  if (equationMatch) {
    const coeff = equationMatch[1] === "" || equationMatch[1] === "-" 
      ? (equationMatch[1] === "-" ? -1 : 1) 
      : Number.parseFloat(equationMatch[1]);
    const constant = equationMatch[2]
      ? Number.parseFloat(equationMatch[2].replace(/\s/g, ""))
      : 0;
    const rhs = Number.parseFloat(equationMatch[3]);
    if (coeff !== 0) {
      steps.push({
        description: "Identified linear equation",
        value: `${coeff}x ${constant >= 0 ? "+" : ""}${constant} = ${rhs}`,
      });
      const isolated = rhs - constant;
      steps.push({
        description: `Moved constant to the other side`,
        value: `${coeff}x = ${isolated}`,
      });
      const x = isolated / coeff;
      steps.push({ description: "Divided by coefficient of x", value: `x = ${x}` });
      return { original: input, steps, finalAnswer: `x = ${x}` };
    }
  }

  // LCM of two numbers
  const lcmMatch = wordClean.match(/lcm of (\d+) and (\d+)/);
  if (lcmMatch) {
    const a = Number.parseInt(lcmMatch[1], 10);
    const b = Number.parseInt(lcmMatch[2], 10);
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const lcm = (a * b) / gcd(a, b);
    steps.push({ description: "Identified LCM problem", value: `LCM(${a}, ${b})` });
    steps.push({ description: "Computed via GCD", value: `GCD = ${gcd(a, b)}` });
    return { original: input, steps, finalAnswer: String(lcm) };
  }

  // HCF/GCD of two numbers
  const hcfMatch = wordClean.match(/(?:hcf|gcd) of (\d+) and (\d+)/);
  if (hcfMatch) {
    const a = Number.parseInt(hcfMatch[1], 10);
    const b = Number.parseInt(hcfMatch[2], 10);
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    steps.push({ description: "Identified HCF/GCD problem", value: `HCF(${a}, ${b})` });
    return { original: input, steps, finalAnswer: String(gcd(a, b)) };
  }

  // Trigonometric ratio of standard angles: "sin of 30", "sin 30", "value of cos 60"
  const trigMatch = wordClean.match(/(sin|cos|tan)(?:\s*(?:of|\())?\s*(\d+)/);
  if (trigMatch) {
    const ratio = trigMatch[1] as "sin" | "cos" | "tan";
    const angle = Number.parseInt(trigMatch[2], 10);
    const table = TRIG_TABLE[ratio];
    if (table && angle in table) {
      steps.push({
        description: "Identified trigonometric ratio",
        value: `${ratio}(${angle}°)`,
      });
      steps.push({
        description: "Looked up standard angle value",
        value: `${ratio}(${angle}°) = ${table[angle]}`,
      });
      return { original: input, steps, finalAnswer: table[angle] };
    }
  }

  // Geometry — area of circle/square/rectangle/triangle by given dimensions
  const areaCircleMatch = wordClean.match(/area of (?:a |the )?circle.*?radius\s*(?:is|=)?\s*(\d+(?:\.\d+)?)/);
  if (areaCircleMatch) {
    const r = Number.parseFloat(areaCircleMatch[1]);
    const area = Math.PI * r * r;
    steps.push({ description: "Identified: Area of a circle", value: `radius r = ${r}` });
    steps.push({ description: "Applied formula A = πr²", value: `A = π × ${r}²` });
    return { original: input, steps, finalAnswer: String(Number.parseFloat(area.toFixed(4))) };
  }
  const areaRectMatch = wordClean.match(
    /area of (?:a |the )?rectangle.*?length\s*(?:is|=)?\s*(\d+(?:\.\d+)?).*?(?:width|breadth)\s*(?:is|=)?\s*(\d+(?:\.\d+)?)/,
  );
  if (areaRectMatch) {
    const l = Number.parseFloat(areaRectMatch[1]);
    const w = Number.parseFloat(areaRectMatch[2]);
    steps.push({ description: "Identified: Area of a rectangle", value: `length = ${l}, width = ${w}` });
    steps.push({ description: "Applied formula A = length × width", value: `A = ${l} × ${w}` });
    return { original: input, steps, finalAnswer: String(l * w) };
  }
  const areaSquareMatch = wordClean.match(/area of (?:a |the )?square.*?side\s*(?:is|=)?\s*(\d+(?:\.\d+)?)/);
  if (areaSquareMatch) {
    const s = Number.parseFloat(areaSquareMatch[1]);
    steps.push({ description: "Identified: Area of a square", value: `side = ${s}` });
    steps.push({ description: "Applied formula A = side²", value: `A = ${s}²` });
    return { original: input, steps, finalAnswer: String(s * s) };
  }
  const areaTriangleMatch = wordClean.match(
    /area of (?:a |the )?triangle.*?base\s*(?:is|=)?\s*(\d+(?:\.\d+)?).*?height\s*(?:is|=)?\s*(\d+(?:\.\d+)?)/,
  );
  if (areaTriangleMatch) {
    const b = Number.parseFloat(areaTriangleMatch[1]);
    const h = Number.parseFloat(areaTriangleMatch[2]);
    steps.push({ description: "Identified: Area of a triangle", value: `base = ${b}, height = ${h}` });
    steps.push({ description: "Applied formula A = ½ × base × height", value: `A = ½ × ${b} × ${h}` });
    return { original: input, steps, finalAnswer: String(0.5 * b * h) };
  }
  const perimeterRectMatch = wordClean.match(
    /perimeter of (?:a |the )?rectangle.*?length\s*(?:is|=)?\s*(\d+(?:\.\d+)?).*?(?:width|breadth)\s*(?:is|=)?\s*(\d+(?:\.\d+)?)/,
  );
  if (perimeterRectMatch) {
    const l = Number.parseFloat(perimeterRectMatch[1]);
    const w = Number.parseFloat(perimeterRectMatch[2]);
    steps.push({ description: "Identified: Perimeter of a rectangle", value: `length = ${l}, width = ${w}` });
    steps.push({ description: "Applied formula P = 2 × (l + w)", value: `P = 2 × (${l} + ${w})` });
    return { original: input, steps, finalAnswer: String(2 * (l + w)) };
  }

  // Banking — simple interest: "simple interest on 1000 at 5 percent for 2 years"
  const siMatch = wordClean.match(
    /simple interest on (\d+(?:\.\d+)?) at (\d+(?:\.\d+)?)\s*(?:%|percent) for (\d+(?:\.\d+)?)\s*years?/,
  );
  if (siMatch) {
    const p = Number.parseFloat(siMatch[1]);
    const r = Number.parseFloat(siMatch[2]);
    const t = Number.parseFloat(siMatch[3]);
    const si = (p * r * t) / 100;
    steps.push({ description: "Identified: Simple Interest problem", value: `P = ${p}, R = ${r}%, T = ${t} years` });
    steps.push({ description: "Applied formula SI = (P × R × T) / 100", value: `SI = (${p} × ${r} × ${t}) / 100` });
    return { original: input, steps, finalAnswer: String(si) };
  }

  // Quadratic equation: "solve x^2 + 5x + 6 = 0" style
  const quadMatch = wordClean.match(
    /x\^?2\s*([+-]\s*\d+(?:\.\d+)?)?x?\s*([+-]\s*\d+(?:\.\d+)?)?\s*=\s*0/,
  );
  if (quadMatch) {
    const bTerm = quadMatch[1] ? Number.parseFloat(quadMatch[1].replace(/\s/g, "")) : 0;
    const cTerm = quadMatch[2] ? Number.parseFloat(quadMatch[2].replace(/\s/g, "")) : 0;
    const a = 1;
    const disc = bTerm * bTerm - 4 * a * cTerm;
    steps.push({
      description: "Identified quadratic equation",
      value: `x² ${bTerm >= 0 ? "+" : ""}${bTerm}x ${cTerm >= 0 ? "+" : ""}${cTerm} = 0`,
    });
    steps.push({ description: "Calculated discriminant (b² - 4ac)", value: String(disc) });
    if (disc < 0) {
      return {
        original: input,
        steps,
        finalAnswer: "No real roots (discriminant is negative)",
      };
    }
    const sqrtDisc = Math.sqrt(disc);
    const x1 = (-bTerm + sqrtDisc) / (2 * a);
    const x2 = (-bTerm - sqrtDisc) / (2 * a);
    steps.push({ description: "Applied the quadratic formula", value: `x = (-b ± √disc) / 2a` });
    return {
      original: input,
      steps,
      finalAnswer: disc === 0 ? `x = ${x1}` : `x = ${x1} or x = ${x2}`,
    };
  }

  return null;
}

const EXAMPLES = [
  "What is 25 plus 17?",
  "Square root of 144",
  "20 percent of 500",
  "2 to the power 5",
  "Average of 4, 8, 15, 16",
  "Solve for x: 2x + 3 = 11",
];

export default function AiMathSolver() {
  const [input, setInput] = useState("");
  const [solution, setSolution] = useState<Solution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  const solve = () => {
    if (!input.trim()) return;
    setIsSolving(true);
    setError(null);

    // Small delay for UX
    setTimeout(() => {
      const result = parseAndSolve(input);
      if (result) {
        setSolution(result);
        setError(null);
      } else {
        setSolution(null);
        setError(
          "Could not understand the problem. Try a simpler expression or use standard math notation.",
        );
      }
      setIsSolving(false);
    }, 300);
  };

  const _useExample = (example: string) => {
    setInput(example);
    setSolution(null);
    setError(null);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <BrainCircuit className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            AI Math Solver
          </h3>
          <p className="text-xs text-muted-foreground">
            Type a math problem in plain English
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") solve();
          }}
          placeholder="e.g., What is 25 plus 17? or 3 + 5 * 2"
          className="w-full"
          data-ocid="ai_solver.input"
        />
        <Button
          type="button"
          onClick={solve}
          disabled={isSolving || !input.trim()}
          className="w-full"
          data-ocid="ai_solver.solve.button"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {isSolving ? "Solving..." : "Solve"}
        </Button>
      </div>

      {/* Examples */}
      {!solution && !error && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Try these examples:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((example) => (
              <button
                type="button"
                key={example}
                onClick={() => {
                  setInput(example);
                  solve();
                }}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                data-ocid={`ai_solver.example.${example.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive"
          data-ocid="ai_solver.error_state"
        >
          {error}
        </div>
      )}

      {/* Solution */}
      {solution && (
        <div
          className="bg-card border border-border rounded-2xl p-4 space-y-3"
          data-ocid="ai_solver.result.panel"
        >
          <div>
            <p className="text-xs text-muted-foreground mb-1">Problem</p>
            <p className="text-sm font-medium text-foreground">
              {solution.original}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Step-by-step
            </p>
            {solution.steps.map((step, stepIdx) => (
              <div
                key={`step-${step.description}-${stepIdx}`}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/50 border border-border/50"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                  {stepIdx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                  <p className="text-sm font-mono font-semibold text-foreground mt-0.5">
                    {step.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-3">
            <p className="text-xs text-primary font-medium mb-1">
              Final Answer
            </p>
            <p
              className="text-2xl font-bold font-mono text-foreground"
              data-ocid="ai_solver.final_answer"
            >
              {solution.finalAnswer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
