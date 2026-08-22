import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React from "react";
import {
  type BoxType,
  useThumbLayerSettingsContext,
} from "../context/ThumbLayerSettingsContext";
import { ColorPickerControl } from "./ColorPickerControl";
import { getContrastColor } from "../lib/contrastColor";

const BOX_TYPES: { key: BoxType; label: string }[] = [
  { key: "digit", label: "Number Buttons" },
  { key: "operator", label: "Operator Buttons" },
  { key: "function", label: "Function Buttons" },
  { key: "equals", label: "Equals Button" },
  { key: "display", label: "Display Area" },
];

const QUICK_THEMES = [
  {
    name: "Dark Pro",
    colors: {
      digit: {
        backgroundColor: "#1e293b",
        textColor: "#f1f5f9",
        outlineColor: "#334155",
      },
      operator: {
        backgroundColor: "#f59e0b",
        textColor: "#1e293b",
        outlineColor: "#d97706",
      },
      function: {
        backgroundColor: "#0f172a",
        textColor: "#94a3b8",
        outlineColor: "#1e293b",
      },
      equals: {
        backgroundColor: "#10b981",
        textColor: "#ffffff",
        outlineColor: "#059669",
      },
      display: {
        backgroundColor: "#0f172a",
        textColor: "#f1f5f9",
        outlineColor: "#1e293b",
      },
    },
  },
  {
    name: "Ocean Blue",
    colors: {
      digit: {
        backgroundColor: "#1e3a5f",
        textColor: "#e0f2fe",
        outlineColor: "#2563eb",
      },
      operator: {
        backgroundColor: "#0ea5e9",
        textColor: "#ffffff",
        outlineColor: "#0284c7",
      },
      function: {
        backgroundColor: "#0c1a2e",
        textColor: "#7dd3fc",
        outlineColor: "#1e3a5f",
      },
      equals: {
        backgroundColor: "#06b6d4",
        textColor: "#ffffff",
        outlineColor: "#0891b2",
      },
      display: {
        backgroundColor: "#0c1a2e",
        textColor: "#e0f2fe",
        outlineColor: "#1e3a5f",
      },
    },
  },
  {
    name: "Sunset",
    colors: {
      digit: {
        backgroundColor: "#3b1f2b",
        textColor: "#fde68a",
        outlineColor: "#7c3f5e",
      },
      operator: {
        backgroundColor: "#ef4444",
        textColor: "#ffffff",
        outlineColor: "#dc2626",
      },
      function: {
        backgroundColor: "#1c0f17",
        textColor: "#f9a8d4",
        outlineColor: "#3b1f2b",
      },
      equals: {
        backgroundColor: "#f97316",
        textColor: "#ffffff",
        outlineColor: "#ea580c",
      },
      display: {
        backgroundColor: "#1c0f17",
        textColor: "#fde68a",
        outlineColor: "#3b1f2b",
      },
    },
  },
  {
    name: "Forest",
    colors: {
      digit: {
        backgroundColor: "#1a2e1a",
        textColor: "#d1fae5",
        outlineColor: "#166534",
      },
      operator: {
        backgroundColor: "#22c55e",
        textColor: "#ffffff",
        outlineColor: "#16a34a",
      },
      function: {
        backgroundColor: "#0d1a0d",
        textColor: "#86efac",
        outlineColor: "#1a2e1a",
      },
      equals: {
        backgroundColor: "#84cc16",
        textColor: "#ffffff",
        outlineColor: "#65a30d",
      },
      display: {
        backgroundColor: "#0d1a0d",
        textColor: "#d1fae5",
        outlineColor: "#1a2e1a",
      },
    },
  },
  {
    name: "Purple Haze",
    colors: {
      digit: {
        backgroundColor: "#2d1b69",
        textColor: "#ede9fe",
        outlineColor: "#5b21b6",
      },
      operator: {
        backgroundColor: "#8b5cf6",
        textColor: "#ffffff",
        outlineColor: "#7c3aed",
      },
      function: {
        backgroundColor: "#1a0f3d",
        textColor: "#c4b5fd",
        outlineColor: "#2d1b69",
      },
      equals: {
        backgroundColor: "#a855f7",
        textColor: "#ffffff",
        outlineColor: "#9333ea",
      },
      display: {
        backgroundColor: "#1a0f3d",
        textColor: "#ede9fe",
        outlineColor: "#2d1b69",
      },
    },
  },
  {
    name: "Minimal Light",
    colors: {
      digit: {
        backgroundColor: "#f8fafc",
        textColor: "#1e293b",
        outlineColor: "#cbd5e1",
      },
      operator: {
        backgroundColor: "#3b82f6",
        textColor: "#ffffff",
        outlineColor: "#2563eb",
      },
      function: {
        backgroundColor: "#f1f5f9",
        textColor: "#475569",
        outlineColor: "#e2e8f0",
      },
      equals: {
        backgroundColor: "#10b981",
        textColor: "#ffffff",
        outlineColor: "#059669",
      },
      display: {
        backgroundColor: "#f1f5f9",
        textColor: "#1e293b",
        outlineColor: "#e2e8f0",
      },
    },
  },
];

export function ThumbLayerSettings() {
  const { settings, updateBoxStyle, setEffect3d, resetSettings } =
    useThumbLayerSettingsContext();

  const applyTheme = (theme: (typeof QUICK_THEMES)[0]) => {
    for (const boxType of Object.keys(theme.colors) as BoxType[]) {
      const style = theme.colors[boxType];
      updateBoxStyle(boxType, "backgroundColor", style.backgroundColor);
      updateBoxStyle(boxType, "textColor", style.textColor);
      updateBoxStyle(boxType, "outlineColor", style.outlineColor);
    }
  };

  return (
    <div className="space-y-5">
      {/* Button Colors — per-type color pickers */}
      <h3 className="text-sm font-semibold text-foreground">
        Button Colors
      </h3>
      {BOX_TYPES.map(({ key, label }) => (
        <div key={key} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">
            {label}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <ColorPickerControl
              label="Background"
              value={settings[key].backgroundColor}
              onChange={(v) => updateBoxStyle(key, "backgroundColor", v)}
            />
            {key === "display" ? (
              <p className="text-[11px] text-muted-foreground px-1">
                Number color adjusts automatically for readability against
                whatever background you pick above.
              </p>
            ) : (
              <ColorPickerControl
                label="Text Color"
                value={settings[key].textColor}
                onChange={(v) => updateBoxStyle(key, "textColor", v)}
              />
            )}
            <ColorPickerControl
              label="Outline Color"
              value={settings[key].outlineColor}
              onChange={(v) => updateBoxStyle(key, "outlineColor", v)}
            />
          </div>
          {/* Live preview */}
          <div className="flex gap-2 mt-1">
            <div
              className="flex-1 rounded-lg flex items-center justify-center text-sm font-semibold py-2"
              style={{
                backgroundColor: settings[key].backgroundColor,
                color:
                  key === "display"
                    ? getContrastColor(settings[key].backgroundColor)
                    : settings[key].textColor,
                border: `2px solid ${settings[key].outlineColor}`,
                ...(settings.effect3d
                  ? {
                      boxShadow: `0 4px 0 ${settings[key].outlineColor}, 0 6px 8px rgba(0,0,0,0.3)`,
                      transform: "translateY(-2px)",
                    }
                  : {}),
              }}
            >
              {key === "digit"
                ? "7"
                : key === "operator"
                  ? "+"
                  : key === "function"
                    ? "sin"
                    : key === "equals"
                      ? "="
                      : "Display"}
            </div>
          </div>
        </div>
      ))}

      {/* Quick Themes */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Quick Themes
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_THEMES.map((theme) => (
            <button
              type="button"
              key={theme.name}
              onClick={() => applyTheme(theme)}
              className="p-2 rounded-lg border border-border hover:border-primary transition-all text-xs font-medium text-center"
              style={{
                backgroundColor: theme.colors.digit.backgroundColor,
                color: theme.colors.digit.textColor,
              }}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Effect Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
        <div>
          <Label className="text-sm font-semibold text-foreground">
            3D Effect
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Adds depth and shadow to buttons
          </p>
        </div>
        <Switch checked={settings.effect3d} onCheckedChange={setEffect3d} />
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={resetSettings}
        className="w-full py-2 rounded-xl border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm font-medium"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
