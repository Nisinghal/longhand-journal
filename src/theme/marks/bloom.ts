/**
 * Bloom — the day mark.
 *
 * Energy sets petal count and how far the bloom opens: a spent day is a closed
 * bud, a charged day throws six or seven petals. Valence sets the hue (see
 * theme/mood.ts). The seed makes each day's wobble stable — the same day always
 * draws the same way, but no two days are identical.
 *
 * All geometry is authored in a 40x40 box. There are only 25 possible
 * (valence, energy) states, so callers should build them once and index in
 * rather than regenerating during a drag.
 */

export const BLOOM_BOX = 40;

export type BloomGeometry = {
  /** Petal outlines, drawn as wash fill then stroke. */
  petals: string[];
  /** Radius of the centre dot; 0 when the bloom is still a bud. */
  centerR: number;
  /** Extra strokes (bud stem and seam) drawn in ink only, no fill. */
  lines: string[];
  strokeWidth: number;
  isBud: boolean;
};

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (x: number) => Math.round(x * 100) / 100;

export function bloomGeometry(valence: number, energy: number, seed = 7): BloomGeometry {
  const r = mulberry32(seed * 2654435761);
  const cx = 20;
  const cy = 20;

  // Energy 1 — the bloom hasn't opened. A closed bud on a short stem.
  if (energy <= 1) {
    const w = 3.6 + r() * 0.7;
    const bot = 25.5;
    const top = 9.5;
    const d =
      `M20 ${bot} C${n(20 - w)} ${n(bot - 3.5)}, ${n(20 - w * 0.92)} ${n(top + 3.5)}, 20 ${top} ` +
      `C${n(20 + w * 0.92)} ${n(top + 3.5)}, ${n(20 + w)} ${n(bot - 3.5)}, 20 ${bot}Z`;
    return {
      petals: [d],
      centerR: 0,
      lines: [`M20 ${n(bot - 0.5)} L20 31.5`, `M20 ${n(top + 5)} L20 ${n(bot - 2)}`],
      strokeWidth: 1.05,
      isBud: true,
    };
  }

  const petalCount = 2 + Math.round((energy - 1) * 1.5); // 4..8
  const R = 5.2 + energy * 1.95;
  const petals: string[] = [];

  for (let i = 0; i < petalCount; i++) {
    const a = (i / petalCount) * Math.PI * 2 + (r() - 0.5) * 0.22 - Math.PI / 2;
    const rr = R + (r() - 0.5) * 1.8;
    const tx = cx + Math.cos(a) * rr;
    const ty = cy + Math.sin(a) * rr;
    const c1x = cx + Math.cos(a - 0.62) * rr * 0.72;
    const c1y = cy + Math.sin(a - 0.62) * rr * 0.72;
    const c2x = cx + Math.cos(a + 0.62) * rr * 0.72;
    const c2y = cy + Math.sin(a + 0.62) * rr * 0.72;
    petals.push(
      `M${cx} ${cy} Q${n(c1x)} ${n(c1y)} ${n(tx)} ${n(ty)} Q${n(c2x)} ${n(c2y)} ${cx} ${cy}Z`
    );
  }

  return {
    petals,
    centerR: 1.1 + energy * 0.16,
    lines: [],
    strokeWidth: 0.85 + energy * 0.06,
    isBud: false,
  };
}

/** All 25 states, built once. Index as FIELD[valence - 1][energy - 1]. */
export function buildBloomField(seed = 7): BloomGeometry[][] {
  return Array.from({ length: 5 }, (_, v) =>
    Array.from({ length: 5 }, (_, e) => bloomGeometry(v + 1, e + 1, seed + v * 5 + e))
  );
}
