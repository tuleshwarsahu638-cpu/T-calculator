// Lightweight beep-based sound effects using the Web Audio API.
// No audio files needed — works fully offline, tiny footprint.

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  // biome-ignore lint/suspicious/noExplicitAny: vendor-prefixed fallback
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

function beep(frequency: number, durationMs: number, volume: number, type: OscillatorType = "sine") {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = Math.max(0, Math.min(1, volume)) * 0.15;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000);
}

const THEME_FREQ: Record<string, { click: number; result: number; error: number }> = {
  classic: { click: 600, result: 880, error: 220 },
  soft: { click: 440, result: 660, error: 260 },
  digital: { click: 1000, result: 1400, error: 180 },
};

export function playClickSound(volume: number, theme = "classic") {
  const f = THEME_FREQ[theme] ?? THEME_FREQ.classic;
  beep(f.click, 40, volume / 100, "square");
}

export function playResultSound(volume: number, theme = "classic") {
  const f = THEME_FREQ[theme] ?? THEME_FREQ.classic;
  beep(f.result, 120, volume / 100, "sine");
}

export function playErrorSound(volume: number, theme = "classic") {
  const f = THEME_FREQ[theme] ?? THEME_FREQ.classic;
  beep(f.error, 200, volume / 100, "sawtooth");
}
