import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cpu, Equal, Grid3x3, Sigma } from "lucide-react";
import { useState } from "react";

type SubTab = "matrix" | "vector" | "complex" | "poly" | "linear";

interface Matrix {
  rows: number;
  cols: number;
  data: number[][];
}

function parseMatrix(input: string): Matrix | null {
  try {
    const rows = input
      .trim()
      .split(";")
      .map((r) => r.split(",").map((n) => Number.parseFloat(n.trim())));
    if (rows.some((r) => r.some((n) => Number.isNaN(n)))) return null;
    return { rows: rows.length, cols: rows[0].length, data: rows };
  } catch {
    return null;
  }
}

function matrixToString(m: Matrix): string {
  return m.data.map((r) => r.join(", ")).join("; ");
}

function addMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a.rows !== b.rows || a.cols !== b.cols) return null;
  return {
    rows: a.rows,
    cols: a.cols,
    data: a.data.map((r, i) => r.map((v, j) => v + b.data[i][j])),
  };
}

function subtractMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a.rows !== b.rows || a.cols !== b.cols) return null;
  return {
    rows: a.rows,
    cols: a.cols,
    data: a.data.map((r, i) => r.map((v, j) => v - b.data[i][j])),
  };
}

function multiplyMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a.cols !== b.rows) return null;
  const result: number[][] = [];
  for (let i = 0; i < a.rows; i++) {
    result[i] = [];
    for (let j = 0; j < b.cols; j++) {
      let sum = 0;
      for (let k = 0; k < a.cols; k++) sum += a.data[i][k] * b.data[k][j];
      result[i][j] = Number(sum.toFixed(4));
    }
  }
  return { rows: a.rows, cols: b.cols, data: result };
}

function transposeMatrix(m: Matrix): Matrix {
  const data: number[][] = [];
  for (let j = 0; j < m.cols; j++) {
    data[j] = [];
    for (let i = 0; i < m.rows; i++) data[j][i] = m.data[i][j];
  }
  return { rows: m.cols, cols: m.rows, data };
}

function determinant2x2(m: Matrix): number {
  return m.data[0][0] * m.data[1][1] - m.data[0][1] * m.data[1][0];
}

function determinant3x3(m: Matrix): number {
  const d = m.data;
  return (
    d[0][0] * (d[1][1] * d[2][2] - d[1][2] * d[2][1]) -
    d[0][1] * (d[1][0] * d[2][2] - d[1][2] * d[2][0]) +
    d[0][2] * (d[1][0] * d[2][1] - d[1][1] * d[2][0])
  );
}

function determinant(m: Matrix): number | null {
  if (m.rows !== m.cols) return null;
  if (m.rows === 2) return determinant2x2(m);
  if (m.rows === 3) return determinant3x3(m);
  return null;
}

function inverse2x2(m: Matrix): Matrix | null {
  const det = determinant2x2(m);
  if (Math.abs(det) < 1e-10) return null;
  const invDet = 1 / det;
  return {
    rows: 2,
    cols: 2,
    data: [
      [m.data[1][1] * invDet, -m.data[0][1] * invDet],
      [-m.data[1][0] * invDet, m.data[0][0] * invDet],
    ],
  };
}

export default function EngineeringCalculator() {
  const [subTab, setSubTab] = useState<SubTab>("matrix");

  // Matrix
  const [matrixA, setMatrixA] = useState("1,2;3,4");
  const [matrixB, setMatrixB] = useState("5,6;7,8");
  const [matrixOp, setMatrixOp] = useState<
    "add" | "sub" | "mul" | "trans" | "det" | "inv"
  >("add");
  const [matrixResult, setMatrixResult] = useState<string | null>(null);

  // Vector
  const [vecA, setVecA] = useState("1,2,3");
  const [vecB, setVecB] = useState("4,5,6");
  const [vecOp, setVecOp] = useState<"dot" | "cross">("dot");
  const [vecResult, setVecResult] = useState<string | null>(null);

  // Complex
  const [cReal1, setCReal1] = useState("");
  const [cImag1, setCImag1] = useState("");
  const [cReal2, setCReal2] = useState("");
  const [cImag2, setCImag2] = useState("");
  const [cOp, setCOp] = useState<"add" | "sub" | "mul" | "div">("add");
  const [cResult, setCResult] = useState<string | null>(null);

  // Polynomial
  const [polyCoeffs, setPolyCoeffs] = useState("1,-3,2");
  const [polyRoots, setPolyRoots] = useState<string | null>(null);

  // Linear equations
  const [linEq, setLinEq] = useState("2,3,8;1,-1,1");
  const [linResult, setLinResult] = useState<string | null>(null);

  const tabs: { id: SubTab; label: string }[] = [
    { id: "matrix", label: "Matrix" },
    { id: "vector", label: "Vector" },
    { id: "complex", label: "Complex" },
    { id: "poly", label: "Poly" },
    { id: "linear", label: "Linear" },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Cpu className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Engineering</h3>
          <p className="text-xs text-muted-foreground">
            Matrix, vector, complex, equations
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
            data-ocid={`engineering.tab.${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Matrix */}
      {subTab === "matrix" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Matrix A (rows separated by ;)</Label>
            <Input
              value={matrixA}
              onChange={(e) => setMatrixA(e.target.value)}
              placeholder="1,2;3,4"
              className="font-mono text-xs"
              data-ocid="engineering.matrix.a.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Matrix B</Label>
            <Input
              value={matrixB}
              onChange={(e) => setMatrixB(e.target.value)}
              placeholder="5,6;7,8"
              className="font-mono text-xs"
              data-ocid="engineering.matrix.b.input"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["add", "sub", "mul", "trans", "det", "inv"] as const).map(
              (op) => (
                <button
                  type="button"
                  key={op}
                  onClick={() => setMatrixOp(op)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    matrixOp === op
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  data-ocid={`engineering.matrix.op.${op}.button`}
                >
                  {op === "add"
                    ? "A+B"
                    : op === "sub"
                      ? "A-B"
                      : op === "mul"
                        ? "A×B"
                        : op === "trans"
                          ? "Transpose"
                          : op === "det"
                            ? "Det"
                            : "Inverse"}
                </button>
              ),
            )}
          </div>
          <Button
            type="button"
            onClick={() => {
              const a = parseMatrix(matrixA);
              if (!a) {
                setMatrixResult("Invalid Matrix A");
                return;
              }
              let res: Matrix | number | null = null;
              switch (matrixOp) {
                case "add": {
                  const b = parseMatrix(matrixB);
                  res = b ? addMatrices(a, b) : null;
                  break;
                }
                case "sub": {
                  const b = parseMatrix(matrixB);
                  res = b ? subtractMatrices(a, b) : null;
                  break;
                }
                case "mul": {
                  const b = parseMatrix(matrixB);
                  res = b ? multiplyMatrices(a, b) : null;
                  break;
                }
                case "trans":
                  res = transposeMatrix(a);
                  break;
                case "det":
                  res = determinant(a);
                  break;
                case "inv":
                  res = a.rows === 2 && a.cols === 2 ? inverse2x2(a) : null;
                  break;
              }
              if (res === null) setMatrixResult("Operation not possible");
              else if (typeof res === "number")
                setMatrixResult(`Determinant = ${res.toFixed(4)}`);
              else setMatrixResult(matrixToString(res));
            }}
            className="w-full"
            data-ocid="engineering.matrix.button"
          >
            Calculate
          </Button>
          {matrixResult && (
            <div
              className="bg-card border border-border rounded-xl p-3 font-mono text-xs"
              data-ocid="engineering.matrix.result"
            >
              <pre className="whitespace-pre-wrap break-words">
                {matrixResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Vector */}
      {subTab === "vector" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Vector A (x,y,z)</Label>
              <Input
                value={vecA}
                onChange={(e) => setVecA(e.target.value)}
                placeholder="1,2,3"
                className="font-mono text-xs"
                data-ocid="engineering.vec.a.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Vector B</Label>
              <Input
                value={vecB}
                onChange={(e) => setVecB(e.target.value)}
                placeholder="4,5,6"
                className="font-mono text-xs"
                data-ocid="engineering.vec.b.input"
              />
            </div>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setVecOp("dot")}
              className={`px-3 py-1 rounded-md text-xs font-medium ${vecOp === "dot" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              data-ocid="engineering.vec.op.dot.button"
            >
              Dot Product
            </button>
            <button
              type="button"
              onClick={() => setVecOp("cross")}
              className={`px-3 py-1 rounded-md text-xs font-medium ${vecOp === "cross" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              data-ocid="engineering.vec.op.cross.button"
            >
              Cross Product
            </button>
          </div>
          <Button
            type="button"
            onClick={() => {
              const a = vecA.split(",").map((n) => Number.parseFloat(n.trim()));
              const b = vecB.split(",").map((n) => Number.parseFloat(n.trim()));
              if (
                a.some(Number.isNaN) ||
                b.some(Number.isNaN) ||
                a.length !== b.length
              ) {
                setVecResult("Invalid vectors");
                return;
              }
              if (vecOp === "dot") {
                const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
                setVecResult(`Dot Product = ${dot}`);
              } else {
                if (a.length !== 3 || b.length !== 3) {
                  setVecResult("Cross product needs 3D vectors");
                  return;
                }
                const cross = [
                  a[1] * b[2] - a[2] * b[1],
                  a[2] * b[0] - a[0] * b[2],
                  a[0] * b[1] - a[1] * b[0],
                ];
                setVecResult(`Cross Product = (${cross.join(", ")})`);
              }
            }}
            className="w-full"
            data-ocid="engineering.vec.button"
          >
            Calculate
          </Button>
          {vecResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center font-mono text-sm"
              data-ocid="engineering.vec.result"
            >
              {vecResult}
            </div>
          )}
        </div>
      )}

      {/* Complex */}
      {subTab === "complex" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Real 1</Label>
              <Input
                type="number"
                value={cReal1}
                onChange={(e) => setCReal1(e.target.value)}
                placeholder="1"
                data-ocid="engineering.c.real1.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Imag 1</Label>
              <Input
                type="number"
                value={cImag1}
                onChange={(e) => setCImag1(e.target.value)}
                placeholder="2"
                data-ocid="engineering.c.imag1.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Real 2</Label>
              <Input
                type="number"
                value={cReal2}
                onChange={(e) => setCReal2(e.target.value)}
                placeholder="3"
                data-ocid="engineering.c.real2.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Imag 2</Label>
              <Input
                type="number"
                value={cImag2}
                onChange={(e) => setCImag2(e.target.value)}
                placeholder="4"
                data-ocid="engineering.c.imag2.input"
              />
            </div>
          </div>
          <div className="flex gap-1">
            {(["add", "sub", "mul", "div"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setCOp(op)}
                className={`px-2 py-1 rounded-md text-xs font-medium ${cOp === op ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                data-ocid={`engineering.c.op.${op}.button`}
              >
                {op === "add"
                  ? "+"
                  : op === "sub"
                    ? "−"
                    : op === "mul"
                      ? "×"
                      : "÷"}
              </button>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => {
              const r1 = Number.parseFloat(cReal1) || 0;
              const i1 = Number.parseFloat(cImag1) || 0;
              const r2 = Number.parseFloat(cReal2) || 0;
              const i2 = Number.parseFloat(cImag2) || 0;
              let rr = 0;
              let ri = 0;
              switch (cOp) {
                case "add":
                  rr = r1 + r2;
                  ri = i1 + i2;
                  break;
                case "sub":
                  rr = r1 - r2;
                  ri = i1 - i2;
                  break;
                case "mul":
                  rr = r1 * r2 - i1 * i2;
                  ri = r1 * i2 + i1 * r2;
                  break;
                case "div": {
                  const den = r2 * r2 + i2 * i2;
                  if (den === 0) {
                    setCResult("Division by zero");
                    return;
                  }
                  rr = (r1 * r2 + i1 * i2) / den;
                  ri = (i1 * r2 - r1 * i2) / den;
                  break;
                }
              }
              const sign = ri >= 0 ? "+" : "−";
              setCResult(
                `${rr.toFixed(4)} ${sign} ${Math.abs(ri).toFixed(4)}i`,
              );
            }}
            className="w-full"
            data-ocid="engineering.c.button"
          >
            Calculate
          </Button>
          {cResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center font-mono text-sm"
              data-ocid="engineering.c.result"
            >
              {cResult}
            </div>
          )}
        </div>
      )}

      {/* Polynomial */}
      {subTab === "poly" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">
              Coefficients (highest to lowest degree, comma separated)
            </Label>
            <Input
              value={polyCoeffs}
              onChange={(e) => setPolyCoeffs(e.target.value)}
              placeholder="1,-3,2 → x² - 3x + 2"
              className="font-mono text-xs"
              data-ocid="engineering.poly.input"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              const coeffs = polyCoeffs
                .split(",")
                .map((n) => Number.parseFloat(n.trim()))
                .filter((n) => !Number.isNaN(n));
              if (coeffs.length < 2) {
                setPolyRoots("Need at least 2 coefficients");
                return;
              }
              // Quadratic formula for degree 2
              if (coeffs.length === 3) {
                const [a, b, c] = coeffs;
                const disc = b * b - 4 * a * c;
                if (disc < 0) {
                  const real = -b / (2 * a);
                  const imag = Math.sqrt(-disc) / (2 * a);
                  setPolyRoots(`x = ${real.toFixed(4)} ± ${imag.toFixed(4)}i`);
                } else {
                  const r1 = (-b + Math.sqrt(disc)) / (2 * a);
                  const r2 = (-b - Math.sqrt(disc)) / (2 * a);
                  setPolyRoots(`x₁ = ${r1.toFixed(4)}, x₂ = ${r2.toFixed(4)}`);
                }
              } else {
                setPolyRoots("Only quadratic (ax²+bx+c) supported");
              }
            }}
            className="w-full"
            data-ocid="engineering.poly.button"
          >
            Find Roots
          </Button>
          {polyRoots && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center font-mono text-sm"
              data-ocid="engineering.poly.result"
            >
              {polyRoots}
            </div>
          )}
        </div>
      )}

      {/* Linear Equations */}
      {subTab === "linear" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">
              Equations (a,b,c for ax+by=c; rows separated by ;)
            </Label>
            <Input
              value={linEq}
              onChange={(e) => setLinEq(e.target.value)}
              placeholder="2,3,8;1,-1,1"
              className="font-mono text-xs"
              data-ocid="engineering.linear.input"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              const rows = linEq
                .split(";")
                .map((r) =>
                  r.split(",").map((n) => Number.parseFloat(n.trim())),
                );
              if (
                rows.length !== 2 ||
                rows.some((r) => r.length !== 3 || r.some(Number.isNaN))
              ) {
                setLinResult(
                  "Need exactly 2 equations with 3 values each (a,b,c)",
                );
                return;
              }
              const [[a1, b1, c1], [a2, b2, c2]] = rows;
              const det = a1 * b2 - a2 * b1;
              if (Math.abs(det) < 1e-10) {
                setLinResult("No unique solution (determinant = 0)");
                return;
              }
              const x = (c1 * b2 - c2 * b1) / det;
              const y = (a1 * c2 - a2 * c1) / det;
              setLinResult(`x = ${x.toFixed(4)}, y = ${y.toFixed(4)}`);
            }}
            className="w-full"
            data-ocid="engineering.linear.button"
          >
            Solve
          </Button>
          {linResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center font-mono text-sm"
              data-ocid="engineering.linear.result"
            >
              {linResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
