import { oklchToHex } from './oklch';

/**
 * The mood field.
 *
 * Valence (1..5) moves hue along a dawn arc: night indigo -> blue hour ->
 * sage -> wheat -> clay. There is deliberately no red on the scale; nothing
 * here is a score.
 *
 * Energy (1..5) is NOT carried by colour. It is carried by the drawn form of
 * the bloom (petal count and openness) — see theme/marks/bloom.ts. Energy only
 * nudges stroke weight here.
 */
export const MOOD_HUE = [268, 243, 152, 85, 40] as const;

export const VALENCE_LABEL = ['Heavy', 'Muted', 'Even', 'Warm', 'Bright'] as const;
export const ENERGY_LABEL = ['Spent', 'Slow', 'Steady', 'Lively', 'Charged'] as const;

export type Scheme = 'light' | 'dark';

/** Lightness/chroma of the ink the bloom is drawn in. */
const MARK = {
  light: { L: 0.5, C: 0.088 },
  dark: { L: 0.745, C: 0.078 },
} as const;

/** Lightness/chroma of the petal fill behind the stroke. */
const WASH = {
  light: { L: 0.905, C: 0.05 },
  dark: { L: 0.375, C: 0.052 },
} as const;

export function markColor(valence: number, scheme: Scheme): string {
  const { L, C } = MARK[scheme];
  return oklchToHex(L, C, MOOD_HUE[clampStep(valence) - 1]);
}

export function washColor(valence: number, scheme: Scheme): string {
  const { L, C } = WASH[scheme];
  return oklchToHex(L, C, MOOD_HUE[clampStep(valence) - 1]);
}

export function clampStep(n: number): number {
  return Math.min(5, Math.max(1, Math.round(n)));
}

export function moodLabel(valence: number, energy: number): string {
  return `${VALENCE_LABEL[clampStep(valence) - 1]} · ${ENERGY_LABEL[clampStep(energy) - 1]}`;
}
