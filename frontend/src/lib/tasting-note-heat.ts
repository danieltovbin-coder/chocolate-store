/**
 * Maps a tasting note to a warmth score (0 = coolest / pink, 1 = hottest / dark red).
 */
export function tastingNoteWarmth(note: string): number {
  const key = note.trim().toLowerCase();
  if (key in NOTE_WARMTH) return NOTE_WARMTH[key];

  let score = 0.35;
  for (const { pattern, warmth } of WARMTH_PATTERNS) {
    if (pattern.test(key)) score = Math.max(score, warmth);
  }
  return score;
}

/** Tailwind classes for heat-map badge styling (pink → dark red). */
export function tastingNoteHeatClasses(note: string): string {
  const w = tastingNoteWarmth(note);
  if (w < 0.2) {
    return "border-pink-200/80 bg-pink-100 text-pink-950 dark:border-pink-800/60 dark:bg-pink-950/50 dark:text-pink-100";
  }
  if (w < 0.4) {
    return "border-rose-200/80 bg-rose-200 text-rose-950 dark:border-rose-800/60 dark:bg-rose-950/45 dark:text-rose-100";
  }
  if (w < 0.55) {
    return "border-red-200/80 bg-red-300 text-red-950 dark:border-red-800/50 dark:bg-red-900/55 dark:text-red-50";
  }
  if (w < 0.75) {
    return "border-red-400/80 bg-red-500 text-white dark:border-red-700 dark:bg-red-700 dark:text-red-50";
  }
  return "border-red-800/80 bg-red-900 text-red-50 dark:border-red-950 dark:bg-red-950 dark:text-red-100";
}

/** Per-note warmth for seed data and common descriptors. */
const NOTE_WARMTH: Record<string, number> = {
  mint: 0.05,
  tart: 0.1,
  berry: 0.12,
  "black tea": 0.15,
  fig: 0.18,
  orange: 0.2,
  marmalade: 0.22,
  creamy: 0.18,
  sweet: 0.2,
  balanced: 0.22,
  vanilla: 0.2,
  pistachio: 0.25,
  almond: 0.28,
  oat: 0.25,
  hazelnut: 0.3,
  praline: 0.32,
  milk: 0.28,
  caramel: 0.35,
  "sea salt": 0.38,
  raspberry: 0.3,
  ganache: 0.35,
  cocoa: 0.4,
  "cocoa nibs": 0.42,
  roasted: 0.48,
  "toasted almond": 0.45,
  "red fruit": 0.38,
  smoke: 0.52,
  "long finish": 0.45,
  cinnamon: 0.68,
  chili: 0.92,
  "warm spice": 0.88,
};

const WARMTH_PATTERNS: { pattern: RegExp; warmth: number }[] = [
  { pattern: /\b(chili|chilli|cayenne|pepper|spicy|heat)\b/, warmth: 0.92 },
  { pattern: /\bwarm\b/, warmth: 0.85 },
  { pattern: /\b(cinnamon|ginger|nutmeg|clove|allspice)\b/, warmth: 0.68 },
  { pattern: /\b(smoke|smoky|roasted|toast)\b/, warmth: 0.5 },
  { pattern: /\b(mint|cool|tart|citrus|berry|fig|creamy|vanilla|sweet)\b/, warmth: 0.15 },
];
