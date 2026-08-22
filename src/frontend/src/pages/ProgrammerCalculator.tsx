import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalculatorButton } from "../components/CalculatorButton";
import { useThumbLayerSettingsContext } from "../context/ThumbLayerSettingsContext";

type Base = "bin" | "oct" | "dec" | "hex";
type BitWidth = 8 | 16 | 32 | 64;

interface BaseDisplay {
  bin: string;
  oct: string;
  dec: string;
  hex: string;
}

const BASE_LABELS: Record<Base, string> = {
  bin: "BIN",
  oct: "OCT",
  dec: "DEC",
  hex: "HEX",
};

const RADIX: Record<Base, number> = { bin: 2, oct: 8, dec: 10, hex: 16 };

function maskToWidth(value: bigint, width: BitWidth): bigint {
  const bits = BigInt(width);
  const modulus = 1n << bits;
  let v = value % modulus;
  if (v < 0n) v += modulus;
  return v;
}

// Two's complement signed interpretation, for display purposes only.
function toSigned(value: bigint, width: BitWidth): bigint {
  const bits = BigInt(width);
  const half = 1n << (bits - 1n);
  const modulus = 1n << bits;
  const unsigned = maskToWidth(value, width);
  return unsigned >= half ? unsigned - modulus : unsigned;
}

function toBase(value: bigint, base: number): string {
  if (base === 10) return value.toString(10);
  return value.toString(base).toUpperCase();
}

function fromBase(value: string, base: number): bigint {
  const clean = value.replace(/\s/g, "").toLowerCase();
  if (!clean) return 0n;
  try {
    if (base === 10) return BigInt(clean);
    const digits = "0123456789abcdef".slice(0, base);
    let result = 0n;
    for (const ch of clean) {
      const d = digits.indexOf(ch);
      if (d === -1) continue;
      result = result * BigInt(base) + BigInt(d);
    }
    return result;
  } catch {
    return 0n;
  }
}

export default function ProgrammerCalculator() {
  const { settings: thumbSettings } = useThumbLayerSettingsContext();
  const [activeBase, setActiveBase] = useState<Base>("dec");
  const [bitWidth, setBitWidth] = useState<BitWidth>(32);
  const [currentValue, setCurrentValue] = useState("0");
  const [display, setDisplay] = useState<BaseDisplay>({
    bin: "0",
    oct: "0",
    dec: "0",
    hex: "0",
  });
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [storedValue, setStoredValue] = useState<bigint | null>(null);
  const [freshInput, setFreshInput] = useState(true);

  const updateDisplays = useCallback(
    (val: bigint) => {
      const masked = maskToWidth(val, bitWidth);
      setDisplay({
        bin: toBase(masked, 2),
        oct: toBase(masked, 8),
        dec: toBase(masked, 10),
        hex: toBase(masked, 16),
      });
    },
    [bitWidth],
  );

  const getCurrentNum = useCallback(
    () => maskToWidth(fromBase(currentValue, RADIX[activeBase]), bitWidth),
    [currentValue, activeBase, bitWidth],
  );

  const toActiveBase = useCallback(
    (val: bigint) => toBase(maskToWidth(val, bitWidth), RADIX[activeBase]),
    [activeBase, bitWidth],
  );

  const handleDigit = useCallback(
    (digit: string) => {
      if (freshInput) {
        setCurrentValue(digit);
        setFreshInput(false);
      } else {
        setCurrentValue((prev) => (prev === "0" ? digit : prev + digit));
      }
    },
    [freshInput],
  );

  const handleOperation = useCallback(
    (op: string) => {
      const num = getCurrentNum();
      const mask = (1n << BigInt(bitWidth)) - 1n;

      if (op === "NOT") {
        const result = (~num) & mask;
        updateDisplays(result);
        setCurrentValue(toActiveBase(result));
        setFreshInput(true);
        return;
      }
      const computePending = (): bigint => {
        if (!lastOperation || storedValue === null) return num;
        switch (lastOperation) {
          case "AND":
            return storedValue & num;
          case "OR":
            return storedValue | num;
          case "XOR":
            return storedValue ^ num;
          case "SHL":
            return (storedValue << num) & mask;
          case "SHR":
            return storedValue >> num;
          default:
            return num;
        }
      };

      if (op === "=" && lastOperation && storedValue !== null) {
        const result = computePending();
        updateDisplays(result);
        setCurrentValue(toActiveBase(result));
        setStoredValue(null);
        setLastOperation(null);
        setFreshInput(true);
        return;
      }
      // A new operator while one is already pending: chain instead of
      // silently discarding the first operand (e.g. "5 AND 3 OR 2").
      const chainedValue =
        lastOperation && storedValue !== null ? computePending() : num;
      setStoredValue(chainedValue);
      setLastOperation(op);
      setFreshInput(true);
    },
    [getCurrentNum, lastOperation, storedValue, updateDisplays, toActiveBase, bitWidth],
  );

  const handleClear = useCallback(() => {
    setCurrentValue("0");
    setStoredValue(null);
    setLastOperation(null);
    setFreshInput(true);
    updateDisplays(0n);
  }, [updateDisplays]);

  const handleBackspace = useCallback(() => {
    setCurrentValue((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  }, []);

  // Tap a bit in the visual bit grid to flip it directly.
  const toggleBit = useCallback(
    (bitIndex: number) => {
      const num = getCurrentNum();
      const flipped = num ^ (1n << BigInt(bitIndex));
      const masked = maskToWidth(flipped, bitWidth);
      updateDisplays(masked);
      setCurrentValue(toActiveBase(masked));
      setFreshInput(true);
    },
    [getCurrentNum, bitWidth, updateDisplays, toActiveBase],
  );

  useEffect(() => {
    const num = getCurrentNum();
    updateDisplays(num);
  }, [getCurrentNum, updateDisplays]);

  const validDigits: Record<Base, string[]> = {
    bin: ["0", "1"],
    oct: ["0", "1", "2", "3", "4", "5", "6", "7"],
    dec: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    hex: [
      "0", "1", "2", "3", "4", "5", "6", "7",
      "8", "9", "A", "B", "C", "D", "E", "F",
    ],
  };

  const displayStyle: React.CSSProperties = {
    backgroundColor: thumbSettings.display.backgroundColor,
    color: thumbSettings.display.textColor,
    border: `2px solid ${thumbSettings.display.outlineColor}`,
  };

  const signedValue = useMemo(
    () => toSigned(getCurrentNum(), bitWidth),
    [getCurrentNum, bitWidth],
  );

  const bits = useMemo(() => {
    const num = getCurrentNum();
    const arr: boolean[] = [];
    for (let i = bitWidth - 1; i >= 0; i--) {
      arr.push(((num >> BigInt(i)) & 1n) === 1n);
    }
    return arr;
  }, [getCurrentNum, bitWidth]);

  return (
    <div className="w-full flex flex-col">
      {/* Bit-width selector */}
      <div className="flex items-center gap-1 mb-2">
        {([8, 16, 32, 64] as BitWidth[]).map((w) => (
          <button
            type="button"
            key={w}
            onClick={() => setBitWidth(w)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              bitWidth === w
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`programmer.bitwidth.${w}`}
          >
            {w}-bit
          </button>
        ))}
      </div>

      {/* Base selector tabs */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-hide">
        {(Object.keys(BASE_LABELS) as Base[]).map((base) => (
          <button
            type="button"
            key={base}
            onClick={() => {
              setActiveBase(base);
              setCurrentValue("0");
              setFreshInput(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0 ${
              activeBase === base
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`programmer.base.tab.${base}`}
          >
            {BASE_LABELS[base]}
          </button>
        ))}
      </div>

      {/* All bases display */}
      <div
        className="rounded-2xl p-3 mb-2 space-y-2 bg-display-bg border-2 border-display-border"
        style={displayStyle}
      >
        {(Object.keys(BASE_LABELS) as Base[]).map((base) => (
          <div key={base} className="flex items-center gap-2">
            <span className="text-xs font-semibold text-display-expr w-8 flex-shrink-0">
              {BASE_LABELS[base]}
            </span>
            <div
              className={`flex-1 font-mono text-sm truncate text-right ${
                base === activeBase
                  ? "text-display-text font-bold"
                  : "text-display-expr"
              }`}
            >
              {display[base]}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-display-border/50">
          <span className="text-xs font-semibold text-display-expr w-8 flex-shrink-0">
            SIGNED
          </span>
          <div className="flex-1 font-mono text-xs truncate text-right text-display-expr">
            {signedValue.toString()}
          </div>
        </div>
      </div>

      {/* Visual bit grid — tap any bit to flip it */}
      <div className="mb-2 p-2 rounded-xl bg-muted/40 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 justify-end min-w-max">
          {bits.map((bit, i) => {
            const bitIndex = bitWidth - 1 - i;
            return (
              <button
                type="button"
                key={bitIndex}
                onClick={() => toggleBit(bitIndex)}
                className={`w-6 h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                  bit
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground border border-border"
                } ${bitIndex % 4 === 3 ? "mr-1" : ""}`}
                aria-label={`Bit ${bitIndex}`}
              >
                {bit ? 1 : 0}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bitwise operations */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {[
          ["AND", "AND"],
          ["OR", "OR"],
          ["XOR", "XOR"],
          ["NOT", "NOT"],
          ["SHL", "SHL"],
          ["SHR", "SHR"],
          ["=", "="],
          ["AC", "AC"],
          ["⌫", "⌫"],
        ].map(([label, value]) => (
          <CalculatorButton
            key={label}
            label={label}
            value={value}
            type="function"
            onPress={(v) => {
              if (v === "AC") handleClear();
              else if (v === "⌫") handleBackspace();
              else handleOperation(v);
            }}
            extraClass="text-xs"
          />
        ))}
      </div>

      {/* Digit keypad - dynamic based on base */}
      <div className="grid grid-cols-4 gap-2">
        {validDigits[activeBase].map((digit) => (
          <CalculatorButton
            key={digit}
            label={digit}
            value={digit}
            type="digit"
            onPress={handleDigit}
          />
        ))}
      </div>

      {lastOperation && storedValue !== null && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {toActiveBase(storedValue)} {lastOperation} ...
        </div>
      )}
    </div>
  );
}
