import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

function parseFunction(expr: string): ((x: number) => number) | null {
  const clean = expr
    .replace(/\^/g, "**")
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/sqrt\(/g, "Math.sqrt(")
    .replace(/abs\(/g, "Math.abs(")
    .replace(/pi/g, "Math.PI")
    .replace(/e(?![a-zA-Z0-9])/g, "Math.E");

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("x", `return ${clean}`);
    // Test it
    const test = fn(1);
    if (typeof test === "number" && Number.isFinite(test)) {
      return (x: number) => {
        try {
          const y = fn(x);
          return Number.isFinite(y) ? y : Number.NaN;
        } catch {
          return Number.NaN;
        }
      };
    }
  } catch {
    // Invalid expression
  }
  return null;
}

export default function GraphPlotter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [expression, setExpression] = useState("x^2");
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(40); // pixels per unit
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState<Point[]>([]);

  const canvasWidth = 360;
  const canvasHeight = 280;

  const centerX = canvasWidth / 2 + offsetX;
  const centerY = canvasHeight / 2 + offsetY;

  const plotFunction = useCallback(() => {
    const fn = parseFunction(expression);
    if (!fn) {
      setError("Invalid expression");
      setPoints([]);
      return;
    }

    setError(null);
    const newPoints: Point[] = [];
    const step = 1 / scale;
    const minX = -(centerX / scale);
    const maxX = (canvasWidth - centerX) / scale;

    for (let x = minX; x <= maxX; x += step) {
      const y = fn(x);
      if (Number.isFinite(y)) {
        newPoints.push({ x, y });
      }
    }

    setPoints(newPoints);
  }, [expression, scale, centerX]);

  useEffect(() => {
    plotFunction();
  }, [plotFunction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Background
    ctx.fillStyle =
      getComputedStyle(canvas).getPropertyValue("--card") || "#1e1e1e";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Grid
    ctx.strokeStyle = "rgba(128,128,128,0.15)";
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = centerX % scale; x < canvasWidth; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = centerY % scale; y < canvasHeight; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(200,200,200,0.4)";
    ctx.lineWidth = 2;

    // X axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvasHeight);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "rgba(200,200,200,0.6)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";

    // X labels
    for (
      let i = -Math.floor(centerX / scale);
      i <= Math.floor((canvasWidth - centerX) / scale);
      i++
    ) {
      if (i === 0) continue;
      const x = centerX + i * scale;
      ctx.fillText(String(i), x, centerY + 14);
    }

    // Y labels
    ctx.textAlign = "right";
    for (
      let i = -Math.floor((canvasHeight - centerY) / scale);
      i <= Math.floor(centerY / scale);
      i++
    ) {
      if (i === 0) continue;
      const y = centerY - i * scale;
      ctx.fillText(String(i), centerX - 6, y + 4);
    }

    // Plot function
    if (points.length > 0) {
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();

      let first = true;
      for (const pt of points) {
        const px = centerX + pt.x * scale;
        const py = centerY - pt.y * scale;

        if (py < -1000 || py > canvasHeight + 1000) {
          first = true;
          continue;
        }

        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }
  }, [points, centerX, centerY, scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.5, 200));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.5, 10));
  const handleReset = () => {
    setScale(40);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Function input */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          <LineChart className="h-3 w-3" />
          Function: y =
        </Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g., x^2, sin(x), log(x)"
            className="flex-1 font-mono text-sm"
            data-ocid="graph.function.input"
          />
          <Button
            type="button"
            onClick={plotFunction}
            data-ocid="graph.plot.button"
          >
            Plot
          </Button>
        </div>
        {error && (
          <p className="text-xs text-destructive" data-ocid="graph.error_state">
            {error}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground">
          Supported: +, -, *, /, ^, sin, cos, tan, log, ln, sqrt, abs, pi, e
        </p>
      </div>

      {/* Canvas */}
      <div className="bg-card border border-border rounded-2xl p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="w-full rounded-xl cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          data-ocid="graph.canvas"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          data-ocid="graph.zoom_out.button"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          data-ocid="graph.reset.button"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          data-ocid="graph.zoom_in.button"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Drag to pan • Use buttons to zoom
      </p>
    </div>
  );
}
