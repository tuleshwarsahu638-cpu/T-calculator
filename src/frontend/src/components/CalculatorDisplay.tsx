import { Check, ChevronDown, ChevronUp, Copy, Share2, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { formatIndianCommas } from "../lib/formatIndianCommas";

interface DisplayHistoryItem {
  expression: string;
  result: string;
}

interface CalculatorDisplayProps {
  expression: string;
  display: string;
  memory?: number;
  runningTotal?: number;
  className?: string;
  style?: React.CSSProperties;
  history?: DisplayHistoryItem[];
  onSwipeDelete?: () => void;
  onSaveFavorite?: () => void;
  onEditExpression?: () => void;
  isFavorite?: boolean;
  useCommas?: boolean;
  livePreview?: string | null;
}

export function CalculatorDisplay({
  expression,
  display,
  memory = 0,
  runningTotal = 0,
  className = "",
  style,
  history = [],
  onSwipeDelete,
  onSaveFavorite,
  onEditExpression,
  isFavorite = false,
  useCommas = true,
  livePreview = null,
}: CalculatorDisplayProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const resultScrollRef = useRef<HTMLDivElement>(null);

  // Same scaling logic for both lines, so digit-count changes don't make
  // the result feel disproportionately small compared to the expression.
  const getDisplaySize = (len: number) => {
    if (len > 18) return "text-3xl";
    if (len > 14) return "text-4xl";
    if (len > 10) return "text-5xl";
    return "text-6xl";
  };

  const formattedDisplay = useCommas ? formatIndianCommas(display) : display;
  const recent = history.slice(-4);

  // Long results auto-scroll to the end (rightmost/most-recent digit)
  // instead of shrinking illegibly small.
  useEffect(() => {
    if (resultScrollRef.current) {
      resultScrollRef.current.scrollLeft = resultScrollRef.current.scrollWidth;
    }
  }, [display]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API unavailable — silently ignore, nothing else to do.
    }
  };

  const handleShare = async () => {
    const text = expression ? `${expression} = ${display}` : display;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      } catch {
        /* ignore */
      }
    }
  };

  // Swipe left/right on the number to delete the last digit — a quick
  // gesture alternative to tapping the backspace button.
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !onSwipeDelete) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;
    touchStartX.current = null;
    if (Math.abs(delta) > 40) {
      onSwipeDelete();
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 mb-3 min-h-[150px] flex flex-col justify-end bg-display-bg border-2 border-display-border ${className}`}
      style={style}
    >
      {/* Decorative glossy sheen — purely visual, sits behind the content */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 15% 10%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 90% 90%, rgba(255,255,255,0.12), transparent 55%)",
        }}
      />
      {/* Top-right corner icons — small, out of the number's way */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
        {onSaveFavorite && (
          <button
            type="button"
            onClick={onSaveFavorite}
            className={`p-1 rounded transition-colors ${isFavorite ? "text-amber-500" : "text-display-expr/50 hover:text-display-expr"}`}
            aria-label={isFavorite ? "Saved to favorites" : "Save to favorites"}
          >
            <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="p-1 rounded text-display-expr/50 hover:text-display-expr transition-colors"
          aria-label="Share result"
        >
          <Share2 size={14} />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded text-display-expr/50 hover:text-display-expr transition-colors"
            aria-label="Copy result"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          {copied && (
            <span className="absolute -top-6 right-0 text-[10px] font-medium bg-foreground text-background px-1.5 py-0.5 rounded whitespace-nowrap animate-fade-up">
              Copied
            </span>
          )}
        </div>
        {recent.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="p-1 rounded text-display-expr/50 hover:text-display-expr transition-colors"
            aria-label={showHistory ? "Hide recent calculations" : "Show recent calculations"}
          >
            {showHistory ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        )}
      </div>

      {/* Recent calculations (last few), most recent closest to current line */}
      <div className="relative">
        {showHistory && recent.length > 0 && (
          <div className="mb-2 space-y-0.5 border-b border-display-border/50 pb-2">
            {recent.map((item, i) => (
              <div
                key={`${item.expression}-${i}`}
                className="text-xs text-display-expr/70 text-right leading-tight"
              >
                <span className="truncate">{item.expression}</span>{" "}
                <span className="font-semibold">= {item.result}</span>
              </div>
            ))}
          </div>
        )}

        {/* Expression — tap to bring it back for editing; wraps/scrolls
            instead of being cut off */}
        <button
          type="button"
          onClick={onEditExpression}
          disabled={!onEditExpression || !expression}
          className={`w-full text-right text-3xl font-semibold text-display-expr break-all min-h-[26px] max-h-16 overflow-y-auto tracking-wide bg-transparent border-0 ${onEditExpression && expression ? "cursor-pointer" : "cursor-default"}`}
        >
          {expression || "\u00A0"}
        </button>

        {/* Live preview while typing — "=" still confirms the real result */}
        {livePreview !== null && (
          <div className="text-right text-sm text-display-expr/60 -mt-0.5 mb-0.5">
            = {useCommas ? formatIndianCommas(livePreview) : livePreview}
          </div>
        )}

        {/* Main display — swipe left/right to delete last digit, auto-scrolls
            when the number is too long to fit */}
        <div
          ref={resultScrollRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`text-right font-mono font-bold leading-none mt-1 text-display-text ${getDisplaySize(formattedDisplay.length)} result-animate overflow-x-auto scrollbar-hide whitespace-nowrap`}
        >
          {formattedDisplay}
        </div>

        {/* Memory indicator */}
        {memory !== 0 && (
          <div className="text-xs text-display-expr text-right mt-1">
            M: {memory}
          </div>
        )}
      </div>
    </div>
  );
}
