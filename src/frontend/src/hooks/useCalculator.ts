import { useCallback, useRef, useState } from "react";

export type CalculatorMode = "basic" | "scientific";

interface CalculatorState {
  display: string;
  expression: string;
  memory: number;
  isResult: boolean;
  lastOperator: string;
  lastValue: string;
  runningTotal: number;
  operationCount: number;
  lastPressedButton: string;
  addMeMode: boolean;
}

const initialState: CalculatorState = {
  display: "0",
  expression: "",
  memory: 0,
  isResult: false,
  lastOperator: "",
  lastValue: "",
  runningTotal: 0,
  operationCount: 0,
  lastPressedButton: "",
  addMeMode: false,
};

export function safeEval(expr: string): number {
  try {
    const sanitized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\^/g, "**")
      .replace(/π/g, String(Math.PI))
      .replace(/e(?![0-9])/g, String(Math.E));
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${sanitized}`)();
    if (typeof result !== "number" || !Number.isFinite(result))
      throw new Error("Invalid");
    return result;
  } catch {
    throw new Error("Error");
  }
}

function getDecimalPlaces(): number {
  try {
    const s = JSON.parse(localStorage.getItem("appSettings") || "{}");
    return typeof s.decimalPlaces === "number" ? s.decimalPlaces : 8;
  } catch {
    return 8;
  }
}

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const undoStack = useRef<CalculatorState[]>([]);
  const redoStack = useRef<CalculatorState[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pressButton = useCallback((value: string, angleMode: "deg" | "rad" = "deg") => {
    setState((prev) => {
      // Snapshot before mutating, for undo. Any new action clears redo.
      undoStack.current.push(prev);
      if (undoStack.current.length > 50) undoStack.current.shift();
      redoStack.current = [];
      setCanUndo(true);
      setCanRedo(false);

      const next = { ...prev, lastPressedButton: value };

      if (value === "AC") {
        // All Clear — full reset (expression, display, running total, etc.)
        return {
          ...initialState,
          memory: prev.memory,
          addMeMode: prev.addMeMode,
        };
      }

      if (value === "C") {
        // Clear Entry — clears only the current input on screen, keeping
        // any expression already built up (e.g. "5 +" stays after C).
        return { ...next, display: "0", isResult: false };
      }

      if (value === "⌫") {
        if (prev.isResult) return next;
        const newDisplay =
          prev.display.length > 1 ? prev.display.slice(0, -1) : "0";
        return { ...next, display: newDisplay };
      }

      if (value === "=") {
        try {
          const expr = prev.expression + prev.display;
          const result = safeEval(expr);
          const dp = getDecimalPlaces();
          const resultStr = Number.parseFloat(result.toFixed(dp)).toString();
          return {
            ...next,
            display: resultStr,
            expression: "",
            isResult: true,
            lastOperator: "",
            lastValue: prev.display,
            runningTotal: result,
            operationCount: prev.operationCount + 1,
          };
        } catch {
          return { ...next, display: "Error", expression: "", isResult: true };
        }
      }

      if (["+", "-", "×", "÷", "^"].includes(value)) {
        const newExpr = prev.isResult
          ? prev.display + value
          : prev.expression + prev.display + value;
        return {
          ...next,
          expression: newExpr,
          display: "0",
          isResult: false,
          lastOperator: value,
        };
      }

      if (value === ".") {
        if (prev.isResult) return { ...next, display: "0.", isResult: false };
        if (prev.display.includes(".")) return next;
        return { ...next, display: `${prev.display}.`, isResult: false };
      }

      if (value === "+/-") {
        const newVal = prev.display.startsWith("-")
          ? prev.display.slice(1)
          : `-${prev.display}`;
        return { ...next, display: newVal };
      }

      if (value === "%") {
        const num = Number.parseFloat(prev.display);
        return { ...next, display: String(num / 100), isResult: true };
      }

      // Scientific functions
      if (value === "sin" || value === "cos" || value === "tan") {
        const num = Number.parseFloat(prev.display);
        const rad = angleMode === "deg" ? (num * Math.PI) / 180 : num;
        const result =
          value === "sin"
            ? Math.sin(rad)
            : value === "cos"
              ? Math.cos(rad)
              : Math.tan(rad);
        return {
          ...next,
          display: Number.parseFloat(result.toFixed(10)).toString(),
          isResult: true,
        };
      }
      if (value === "sin⁻¹" || value === "cos⁻¹" || value === "tan⁻¹") {
        const num = Number.parseFloat(prev.display);
        const result =
          value === "sin⁻¹"
            ? Math.asin(num)
            : value === "cos⁻¹"
              ? Math.acos(num)
              : Math.atan(num);
        const converted = angleMode === "deg" ? (result * 180) / Math.PI : result;
        return {
          ...next,
          display: Number.parseFloat(converted.toFixed(10)).toString(),
          isResult: true,
        };
      }
      if (value === "√") {
        const num = Number.parseFloat(prev.display);
        return {
          ...next,
          display: Number.parseFloat(Math.sqrt(num).toFixed(10)).toString(),
          isResult: true,
        };
      }
      if (value === "x²") {
        const num = Number.parseFloat(prev.display);
        return { ...next, display: String(num * num), isResult: true };
      }
      if (value === "x³") {
        const num = Number.parseFloat(prev.display);
        return { ...next, display: String(num * num * num), isResult: true };
      }
      if (value === "log") {
        const num = Number.parseFloat(prev.display);
        return {
          ...next,
          display: Number.parseFloat(Math.log10(num).toFixed(10)).toString(),
          isResult: true,
        };
      }
      if (value === "ln") {
        const num = Number.parseFloat(prev.display);
        return {
          ...next,
          display: Number.parseFloat(Math.log(num).toFixed(10)).toString(),
          isResult: true,
        };
      }
      if (value === "π") {
        return { ...next, display: String(Math.PI), isResult: false };
      }
      if (value === "e") {
        return { ...next, display: String(Math.E), isResult: false };
      }
      if (value === "1/x") {
        const num = Number.parseFloat(prev.display);
        return { ...next, display: String(1 / num), isResult: true };
      }
      if (value === "|x|") {
        const num = Number.parseFloat(prev.display);
        return { ...next, display: String(Math.abs(num)), isResult: true };
      }
      if (value === "n!") {
        const num = Number.parseInt(prev.display);
        let fact = 1;
        for (let i = 2; i <= num; i++) fact *= i;
        return { ...next, display: String(fact), isResult: true };
      }
      if (value === "10^x") {
        const num = Number.parseFloat(prev.display);
        return { ...next, display: String(10 ** num), isResult: true };
      }
      if (value === "e^x") {
        const num = Number.parseFloat(prev.display);
        return {
          ...next,
          display: Number.parseFloat(Math.exp(num).toFixed(10)).toString(),
          isResult: true,
        };
      }

      // Memory
      if (value === "MC") return { ...next, memory: 0 };
      if (value === "MR")
        return { ...next, display: String(prev.memory), isResult: false };
      if (value === "M+")
        return {
          ...next,
          memory: prev.memory + Number.parseFloat(prev.display),
        };
      if (value === "M-")
        return {
          ...next,
          memory: prev.memory - Number.parseFloat(prev.display),
        };
      if (value === "MS")
        return { ...next, memory: Number.parseFloat(prev.display) };

      // Parentheses
      if (value === "(") {
        // Start a sub-expression: push current into expression
        const newExpr = prev.isResult
          ? `${prev.display}*(`
          : `${prev.expression}${prev.display !== "0" ? `${prev.display}*(` : "("}`;
        return { ...next, expression: newExpr, display: "0", isResult: false };
      }
      if (value === ")") {
        const newExpr = `${prev.expression}${prev.display})`;
        return { ...next, expression: newExpr, display: "0", isResult: false };
      }

      // Digits
      if (prev.isResult) {
        return { ...next, display: value, isResult: false, expression: "" };
      }
      const newDisplay = prev.display === "0" ? value : prev.display + value;
      return { ...next, display: newDisplay };
    });
  }, []);

  const toggleAddMeMode = useCallback(() => {
    setState((prev) => ({ ...prev, addMeMode: !prev.addMeMode }));
  }, []);

  const clearAll = useCallback(() => {
    undoStack.current.push(state);
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
    setState((prev) => ({
      ...initialState,
      memory: prev.memory,
      addMeMode: prev.addMeMode,
    }));
  }, [state]);

  const undo = useCallback(() => {
    const prevState = undoStack.current.pop();
    if (!prevState) return;
    setState((current) => {
      redoStack.current.push(current);
      setCanRedo(true);
      setCanUndo(undoStack.current.length > 0);
      return prevState;
    });
  }, []);

  const redo = useCallback(() => {
    const nextState = redoStack.current.pop();
    if (!nextState) return;
    setState((current) => {
      undoStack.current.push(current);
      setCanUndo(true);
      setCanRedo(redoStack.current.length > 0);
      return nextState;
    });
  }, []);

  const loadExpression = useCallback((expr: string) => {
    undoStack.current.push(state);
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
    setState((prev) => ({
      ...prev,
      expression: expr,
      display: "0",
      isResult: false,
    }));
  }, [state]);

  return {
    display: state.display,
    expression: state.expression,
    memory: state.memory,
    isResult: state.isResult,
    runningTotal: state.runningTotal,
    operationCount: state.operationCount,
    lastPressedButton: state.lastPressedButton,
    addMeMode: state.addMeMode,
    pressButton,
    toggleAddMeMode,
    clearAll,
    undo,
    redo,
    canUndo,
    canRedo,
    loadExpression,
  };
}
