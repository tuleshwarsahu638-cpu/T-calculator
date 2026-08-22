import { Label } from "@/components/ui/label";

interface ColorPickerControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const presetColors = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export function ColorPickerControl({
  label,
  value,
  onChange,
}: ColorPickerControlProps) {
  // Convert oklch/var to hex for color input
  const getHexValue = (colorValue: string): string => {
    if (colorValue.startsWith("#")) return colorValue;

    // For oklch/var values, create a temporary element to get computed color
    const temp = document.createElement("div");
    temp.style.color = colorValue;
    document.body.appendChild(temp);
    const computed = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);

    // Convert rgb to hex
    const match = computed.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    return "#000000";
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-3">
        {/* Preset colors */}
        <div className="grid grid-cols-10 gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className="w-8 h-8 rounded-lg border-2 border-border hover:scale-110 transition-transform touch-manipulation"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        {/* Custom color picker */}
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={getHexValue(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 h-10 rounded-lg border-2 border-border cursor-pointer"
            aria-label={`Custom ${label.toLowerCase()}`}
          />
          <div className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm font-mono">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
