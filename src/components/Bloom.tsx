import React, { useMemo } from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { BLOOM_BOX, bloomGeometry, type BloomGeometry } from '../theme/marks/bloom';
import { markColor, washColor, moodLabel, type Scheme } from '../theme/mood';

type Props = {
  valence: number;
  energy: number;
  size: number;
  scheme: Scheme;
  seed?: number;
  /** Pass a prebuilt state from buildBloomField to avoid regenerating on drag. */
  geometry?: BloomGeometry;
  /** Petal fill can be dropped for very small marks where it muddies. */
  wash?: boolean;
};

export function Bloom({
  valence,
  energy,
  size,
  scheme,
  seed = 7,
  geometry,
  wash = true,
}: Props) {
  const g = useMemo(
    () => geometry ?? bloomGeometry(valence, energy, seed),
    [geometry, valence, energy, seed]
  );

  const ink = markColor(valence, scheme);
  const fill = washColor(valence, scheme);

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${BLOOM_BOX} ${BLOOM_BOX}`}
      accessibilityRole="image"
      accessibilityLabel={moodLabel(valence, energy)}
    >
      {wash && (
        <G>
          {g.petals.map((d, i) => (
            <Path key={`w${i}`} d={d} fill={fill} />
          ))}
        </G>
      )}
      <G>
        {g.petals.map((d, i) => (
          <Path
            key={`p${i}`}
            d={d}
            fill="none"
            stroke={ink}
            strokeWidth={g.strokeWidth}
            strokeLinejoin="round"
          />
        ))}
        {g.lines.map((d, i) => (
          <Path
            key={`l${i}`}
            d={d}
            fill="none"
            stroke={ink}
            strokeWidth={g.strokeWidth * 0.9}
            strokeLinecap="round"
            opacity={i === 1 ? 0.6 : 1}
          />
        ))}
        {g.centerR > 0 && <Circle cx={20} cy={20} r={g.centerR} fill={ink} />}
      </G>
    </Svg>
  );
}
