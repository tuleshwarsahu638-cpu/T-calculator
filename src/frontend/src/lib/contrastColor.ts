// Automatically picks a readable, premium-looking text color based on the
// chosen background color — so if someone sets the display to white (or
// any light color), the numbers switch to a dark tone instead of vanishing,
// and vice versa. Uses relative luminance (WCAG-style) rather than a fixed
// black/white so the result still looks intentional, not flat.

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) return [15, 23, 42]; // fallback: slate-900
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Returns a premium off-black or off-white depending on which one is more
 * readable against the given background hex color.
 */
export function getContrastColor(backgroundHex: string): string {
  const luminance = relativeLuminance(hexToRgb(backgroundHex));
  // Threshold ~0.5 splits light vs dark backgrounds reliably.
  return luminance > 0.5 ? "#161221" : "#f8f7fb";
}
