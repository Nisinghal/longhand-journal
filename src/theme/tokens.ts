import type { Scheme } from './mood';

export const palette = {
  light: {
    paper: '#FBFAF7',
    paperAlt: '#F3F1EA',
    ink: '#1B1A21',
    inkMuted: '#57545F',
    inkFaint: '#8B8794',
    rule: '#E4E0D6',
    hollow: '#E7E3D9',
  },
  dark: {
    paper: '#121216',
    paperAlt: '#1A1A20',
    ink: '#EDEBF2',
    inkMuted: '#A7A3B0',
    inkFaint: '#74707E',
    rule: '#2A2933',
    hollow: '#2C2A36',
  },
} as const;

export function colors(scheme: Scheme) {
  return palette[scheme];
}

/** 8pt-derived, with a 6 for tight optical pairs. */
export const space = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  xxl: 72,
} as const;

export const font = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  body: 'Newsreader_300Light',
  bodyMedium: 'Newsreader_500Medium',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
} as const;

/**
 * The writing is the interface, so body sits large with a lot of leading and
 * everything else stays out of its way.
 */
export const type = {
  prompt: { fontFamily: font.displayItalic, fontSize: 25, lineHeight: 32 },
  body: { fontFamily: font.body, fontSize: 19, lineHeight: 33 },
  label: { fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.3 },
  labelStrong: { fontFamily: font.monoMedium, fontSize: 10.5, letterSpacing: 1.3 },
  date: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.5 },
} as const;

export const motion = {
  /** Springs, not durations — the bloom should settle, not arrive. */
  bloom: { damping: 13, stiffness: 170, mass: 0.7 },
  ui: { damping: 20, stiffness: 220 },
} as const;
