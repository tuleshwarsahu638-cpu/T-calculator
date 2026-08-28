import type React from "react";
import { useCallback } from "react";
import { useThumbLayerSettingsContext } from "../context/ThumbLayerSettingsContext";
import { useSettings } from "../hooks/useSettings";
import { playClickSound } from "../lib/sounds";

export type ButtonType = "digit" | "operator" | "function" | "equals";

interface CalculatorButtonProps {
  label: string;
  value: string;
  type: ButtonType;
  onPress: (value: string) => void;
  span2?: boolean;
  extraClass?: string;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

// Lighten/darken a hex color by a percentage (-100 to 100).
function shadeColor(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const num = Number.parseInt(clean, 16);
  let r = (num >> 16) + Math.round((percent / 100) * 255);
  let g = ((num >> 8) & 0x00ff) + Math.round((percent / 100) * 255);
  let b = (num & 0x0000ff) + Math.round((percent / 100) * 255);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function CalculatorButton({
  label,
  value,
  type,
  onPress,
  span2 = false,
  extraClass = "",
  active = false,
  disabled = false,
  compact = false,
}: CalculatorButtonProps) {
  const { settings: thumbSettings } = useThumbLayerSettingsContext();
  const { settings } = useSettings();
  const { effect3d } = thumbSettings;

  const getButtonStyle = useCallback((): React.CSSProperties => {
    const s = thumbSettings[type];
    const base: React.CSSProperties = {
      backgroundColor: s.backgroundColor,
      color: s.textColor,
      border: `2px solid ${s.outlineColor}`,
    };
    if (effect3d) {
      // Glossy gradient sheen — lighter top-left fading to the base color,
      // giving buttons a polished, tactile look.
      base.background = `linear-gradient(155deg, ${shadeColor(s.backgroundColor, 22)} 0%, ${s.backgroundColor} 55%, ${shadeColor(s.backgroundColor, -12)} 100%)`;
      base.boxShadow = `0 5px 0 ${shadeColor(s.outlineColor, -15)}, 0 8px 14px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.35)`;
      base.transform = "translateY(-2px)";
      base.transition = "all 0.1s ease";
    }
    if (active) {
      base.outline = "3px solid #3b82f6";
      base.outlineOffset = "2px";
    }
    return base;
  }, [thumbSettings, type, effect3d, active]);

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        if (settings.soundEnabled && settings.clickSound) {
          playClickSound(settings.volume, settings.soundTheme);
        }
        onPress(value);
      }}
      disabled={disabled}
      className={`
        calc-btn rounded-xl font-semibold transition-all duration-100
        flex items-center justify-center cursor-pointer select-none
        ${compact ? "min-h-[36px]" : "min-h-[56px]"} h-full press-feedback
        ${span2 ? "col-span-2" : ""}
        ${extraClass}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
        ${effect3d && !disabled ? "hover:translate-y-[-4px] active:translate-y-[2px] active:shadow-none" : "hover:brightness-110 active:brightness-90"}
      `}
      style={{
        ...getButtonStyle(),
        fontSize: compact
          ? "calc(0.8rem * var(--key-scale, 1))"
          : "calc(1.125rem * var(--key-scale, 1))",
      }}
      data-ocid={`calc.button.${value}`}
      aria-label={label}
    >
      {label}
    </button>
  );
}
