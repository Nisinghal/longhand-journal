/**
 * OKLCH -> sRGB hex.
 *
 * React Native has no oklch() colour support, so the whole mood system is
 * authored in OKLCH (where the ramps stay perceptually even) and converted
 * here at the last moment. Keep the ramps in mood.ts; keep the maths here.
 */

function gamma(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.min(1, Math.max(0, v));
}

function toByte(c: number): string {
  return Math.round(c * 255)
    .toString(16)
    .padStart(2, '0');
}

/**
 * @param L lightness 0..1
 * @param C chroma, roughly 0..0.13 in this app
 * @param H hue in degrees
 */
export function oklchToHex(L: number, C: number, H: number): string {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return `#${toByte(gamma(r))}${toByte(gamma(g))}${toByte(gamma(bl))}`;
}
