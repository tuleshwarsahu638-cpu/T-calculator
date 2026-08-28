import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, GraduationCap, Percent, Table } from "lucide-react";
import { useState } from "react";

type SubTab =
  | "percentage"
  | "cgpa"
  | "gpa"
  | "average"
  | "lcm"
  | "prime"
  | "table";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export default function EducationCalculator() {
  const [subTab, setSubTab] = useState<SubTab>("percentage");

  // Percentage
  const [pctValue, setPctValue] = useState("");
  const [pctTotal, setPctTotal] = useState("");
  const [pctResult, setPctResult] = useState<string | null>(null);

  // CGPA
  const [cgpaValue, setCgpaValue] = useState("");
  const [cgpaResult, setCgpaResult] = useState<string | null>(null);

  // GPA
  const [gpaSubjects, setGpaSubjects] = useState<
    { grade: string; credits: string }[]
  >([
    { grade: "", credits: "" },
    { grade: "", credits: "" },
    { grade: "", credits: "" },
  ]);
  const [gpaResult, setGpaResult] = useState<string | null>(null);

  // Average
  const [avgNumbers, setAvgNumbers] = useState("");
  const [avgResult, setAvgResult] = useState<string | null>(null);

  // LCM/HCF
  const [lcmA, setLcmA] = useState("");
  const [lcmB, setLcmB] = useState("");
  const [lcmResult, setLcmResult] = useState<{
    lcm: number;
    hcf: number;
  } | null>(null);

  // Prime
  const [primeNum, setPrimeNum] = useState("");
  const [primeResult, setPrimeResult] = useState<{
    isPrime: boolean;
    factors: number[];
  } | null>(null);

  // Table
  const [tableNum, setTableNum] = useState("");
  const [tableResult, setTableResult] = useState<number[] | null>(null);

  const tabs: { id: SubTab; label: string }[] = [
    { id: "percentage", label: "%" },
    { id: "cgpa", label: "CGPA" },
    { id: "gpa", label: "GPA" },
    { id: "average", label: "Avg" },
    { id: "lcm", label: "LCM" },
    { id: "prime", label: "Prime" },
    { id: "table", label: "Table" },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <GraduationCap className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Education</h3>
          <p className="text-xs text-muted-foreground">
            Percentage, GPA, LCM, primes, tables
          </p>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              subTab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`education.tab.${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Percentage */}
      {subTab === "percentage" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input
                type="number"
                value={pctValue}
                onChange={(e) => setPctValue(e.target.value)}
                placeholder="e.g. 45"
                data-ocid="education.pct.value.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Total</Label>
              <Input
                type="number"
                value={pctTotal}
                onChange={(e) => setPctTotal(e.target.value)}
                placeholder="e.g. 100"
                data-ocid="education.pct.total.input"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              const v = Number.parseFloat(pctValue);
              const t = Number.parseFloat(pctTotal);
              if (t > 0) setPctResult(`${((v / t) * 100).toFixed(2)}%`);
            }}
            className="w-full"
            data-ocid="education.pct.button"
          >
            Calculate
          </Button>
          {pctResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-ocid="education.pct.result"
            >
              <Percent className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{pctResult}</p>
            </div>
          )}
        </div>
      )}

      {/* CGPA */}
      {subTab === "cgpa" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">CGPA (out of 10)</Label>
            <Input
              type="number"
              step="0.01"
              value={cgpaValue}
              onChange={(e) => setCgpaValue(e.target.value)}
              placeholder="e.g. 8.5"
              data-ocid="education.cgpa.input"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              const c = Number.parseFloat(cgpaValue);
              if (c >= 0 && c <= 10) setCgpaResult(`${(c * 9.5).toFixed(2)}%`);
            }}
            className="w-full"
            data-ocid="education.cgpa.button"
          >
            Convert to %
          </Button>
          {cgpaResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-ocid="education.cgpa.result"
            >
              <p className="text-2xl font-bold text-foreground">{cgpaResult}</p>
            </div>
          )}
        </div>
      )}

      {/* GPA */}
      {subTab === "gpa" && (
        <div className="space-y-3">
          {gpaSubjects.map((s, idx) => (
            <div
              key={`gpa-subject-${s.grade}-${s.credits}-${idx}`}
              className="grid grid-cols-2 gap-2"
            >
              <div className="space-y-1">
                <Label className="text-xs">Grade {idx + 1}</Label>
                <select
                  value={s.grade}
                  onChange={(e) => {
                    const next = [...gpaSubjects];
                    next[idx] = { ...next[idx], grade: e.target.value };
                    setGpaSubjects(next);
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                  data-ocid={`education.gpa.grade.${idx + 1}.select`}
                >
                  <option value="">Select</option>
                  <option value="10">A+ (10)</option>
                  <option value="9">A (9)</option>
                  <option value="8">B (8)</option>
                  <option value="7">C (7)</option>
                  <option value="6">D (6)</option>
                  <option value="5">E (5)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Credits</Label>
                <Input
                  type="number"
                  value={s.credits}
                  onChange={(e) => {
                    const next = [...gpaSubjects];
                    next[idx] = { ...next[idx], credits: e.target.value };
                    setGpaSubjects(next);
                  }}
                  placeholder="e.g. 4"
                  data-ocid={`education.gpa.credits.${idx + 1}.input`}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              setGpaSubjects([...gpaSubjects, { grade: "", credits: "" }])
            }
            variant="outline"
            className="w-full text-xs"
            data-ocid="education.gpa.add_subject.button"
          >
            + Add Subject
          </Button>
          <Button
            type="button"
            onClick={() => {
              let totalPoints = 0;
              let totalCredits = 0;
              for (const s of gpaSubjects) {
                const g = Number.parseFloat(s.grade);
                const c = Number.parseFloat(s.credits);
                if (!Number.isNaN(g) && !Number.isNaN(c) && c > 0) {
                  totalPoints += g * c;
                  totalCredits += c;
                }
              }
              if (totalCredits > 0)
                setGpaResult((totalPoints / totalCredits).toFixed(2));
            }}
            className="w-full"
            data-ocid="education.gpa.button"
          >
            Calculate GPA
          </Button>
          {gpaResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-ocid="education.gpa.result"
            >
              <p className="text-2xl font-bold text-foreground">{gpaResult}</p>
            </div>
          )}
        </div>
      )}

      {/* Average */}
      {subTab === "average" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Numbers (comma separated)</Label>
            <Input
              type="text"
              value={avgNumbers}
              onChange={(e) => setAvgNumbers(e.target.value)}
              placeholder="e.g. 10, 20, 30"
              data-ocid="education.avg.input"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              const nums = avgNumbers
                .split(",")
                .map((n) => Number.parseFloat(n.trim()))
                .filter((n) => !Number.isNaN(n));
              if (nums.length > 0)
                setAvgResult(
                  (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2),
                );
            }}
            className="w-full"
            data-ocid="education.avg.button"
          >
            Calculate Average
          </Button>
          {avgResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-ocid="education.avg.result"
            >
              <p className="text-2xl font-bold text-foreground">{avgResult}</p>
            </div>
          )}
        </div>
      )}

      {/* LCM / HCF */}
      {subTab === "lcm" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Number A</Label>
              <Input
                type="number"
                value={lcmA}
                onChange={(e) => setLcmA(e.target.value)}
                placeholder="e.g. 12"
                data-ocid="education.lcm.a.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Number B</Label>
              <Input
                type="number"
                value={lcmB}
                onChange={(e) => setLcmB(e.target.value)}
                placeholder="e.g. 18"
                data-ocid="education.lcm.b.input"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              const a = Number.parseInt(lcmA);
              const b = Number.parseInt(lcmB);
              if (a > 0 && b > 0)
                setLcmResult({ lcm: lcm(a, b), hcf: gcd(a, b) });
            }}
            className="w-full"
            data-ocid="education.lcm.button"
          >
            Calculate
          </Button>
          {lcmResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 space-y-2"
              data-ocid="education.lcm.result"
            >
              <div className="tool-result-row">
                <span className="tool-result-label">LCM</span>
                <span className="tool-result-value">{lcmResult.lcm}</span>
              </div>
              <div className="tool-result-row">
                <span className="tool-result-label">HCF / GCD</span>
                <span className="tool-result-value">{lcmResult.hcf}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prime */}
      {subTab === "prime" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Number</Label>
            <Input
              type="number"
              value={primeNum}
              onChange={(e) => setPrimeNum(e.target.value)}
              placeholder="e.g. 97"
              data-ocid="education.prime.input"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              const n = Number.parseInt(primeNum);
              if (!Number.isNaN(n)) {
                const factors: number[] = [];
                for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i);
                setPrimeResult({ isPrime: isPrime(n), factors });
              }
            }}
            className="w-full"
            data-ocid="education.prime.button"
          >
            Check Prime
          </Button>
          {primeResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 space-y-2"
              data-ocid="education.prime.result"
            >
              <p className="text-center text-lg font-bold text-foreground">
                {primeResult.isPrime ? "Prime" : "Not Prime"}
              </p>
              <div className="tool-result-row">
                <span className="tool-result-label">Factors</span>
                <span className="tool-result-value">
                  {primeResult.factors.join(", ")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {subTab === "table" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Number</Label>
            <Input
              type="number"
              value={tableNum}
              onChange={(e) => setTableNum(e.target.value)}
              placeholder="e.g. 7"
              data-ocid="education.table.input"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              const n = Number.parseInt(tableNum);
              if (!Number.isNaN(n))
                setTableResult(
                  Array.from({ length: 10 }, (_, i) => n * (i + 1)),
                );
            }}
            className="w-full"
            data-ocid="education.table.button"
          >
            Generate Table
          </Button>
          {tableResult && (
            <div
              className="bg-card border border-border rounded-xl p-4"
              data-ocid="education.table.result"
            >
              <div className="grid grid-cols-2 gap-1">
                {tableResult.map((v, idx) => (
                  <div
                    key={`table-row-${tableNum}-${v}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Table className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {tableNum} × {idx + 1} =
                    </span>
                    <span className="font-semibold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
