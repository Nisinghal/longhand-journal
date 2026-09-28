import React, { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Bloom } from '../../components/Bloom';
import { buildBloomField } from '../../theme/marks/bloom';
import { VALENCE_LABEL, ENERGY_LABEL, type Scheme } from '../../theme/mood';
import { colors, motion, space, type } from '../../theme/tokens';

const PAD = 232;
const STEPS = 5;

type Props = {
  valence: number;
  energy: number;
  onChange: (valence: number, energy: number) => void;
  /** Collapses to a single line while the keyboard is up. */
  collapsed?: boolean;
  onExpand?: () => void;
};

/**
 * The mood input is the mark itself. Drag anywhere on the pad: across for
 * valence, up for energy, and the bloom opens under your thumb. There are only
 * 25 states, so every geometry is built once at mount and indexed during the
 * drag — no path maths on the gesture path.
 */
export function MoodPicker({ valence, energy, onChange, collapsed, onExpand }: Props) {
  const scheme: Scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors(scheme);
  const field = useMemo(() => buildBloomField(), []);

  const last = useRef({ v: valence, e: energy });

  const pop = useSharedValue(1);
  const guides = useSharedValue(0);

  const commit = useCallback(
    (v: number, e: number) => {
      if (v === last.current.v && e === last.current.e) return;
      last.current = { v, e };
      pop.value = withSpring(1.06, motion.bloom, () => {
        pop.value = withSpring(1, motion.bloom);
      });
      Haptics.selectionAsync();
      onChange(v, e);
    },
    [onChange, pop]
  );

  const toStep = (ratio: number) =>
    Math.min(STEPS, Math.max(1, Math.round(ratio * (STEPS - 1)) + 1));

  const pan = Gesture.Pan()
    .onBegin((ev) => {
      guides.value = withSpring(1, motion.ui);
      runOnJS(commit)(toStep(ev.x / PAD), toStep(1 - ev.y / PAD));
    })
    .onUpdate((ev) => {
      runOnJS(commit)(toStep(ev.x / PAD), toStep(1 - ev.y / PAD));
    })
    .onFinalize(() => {
      guides.value = withSpring(0, motion.ui);
    });

  const bloomStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  // Lattice dots: invisible at rest, appear while dragging.
  const latticeStyle = useAnimatedStyle(() => ({ opacity: guides.value * 0.9 }));
  // Axis legend: always legible (0.55) so direction is taught before the first
  // touch, brightens to full while dragging as active confirmation.
  const legendStyle = useAnimatedStyle(() => ({ opacity: 0.55 + guides.value * 0.45 }));

  if (collapsed) {
    return (
      <Pressable
        onPress={onExpand}
        style={[styles.collapsed, { borderTopColor: c.rule }]}
        accessibilityRole="button"
        accessibilityLabel={`Mood: ${VALENCE_LABEL[valence - 1]}, ${ENERGY_LABEL[energy - 1]}. Tap to change.`}
      >
        <Bloom
          valence={valence}
          energy={energy}
          size={30}
          scheme={scheme}
          geometry={field[valence - 1][energy - 1]}
        />
        <Text style={[type.label, styles.upper, { color: c.inkFaint }]}>
          {VALENCE_LABEL[valence - 1]} · {ENERGY_LABEL[energy - 1]}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      <GestureDetector gesture={pan}>
        <View style={[styles.pad, { width: PAD, height: PAD }]}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.lattice, latticeStyle]}>
            {Array.from({ length: STEPS }, (_, row) => (
              <View key={row} style={styles.latticeRow}>
                {Array.from({ length: STEPS }, (__, col) => (
                  <View key={col} style={[styles.dot, { backgroundColor: c.hollow }]} />
                ))}
              </View>
            ))}
          </Animated.View>

          <Animated.View style={bloomStyle}>
            <Bloom
              valence={valence}
              energy={energy}
              size={132}
              scheme={scheme}
              geometry={field[valence - 1][energy - 1]}
            />
          </Animated.View>
        </View>
      </GestureDetector>

      <Text style={[type.labelStrong, styles.upper, { color: c.inkMuted, marginTop: space.sm }]}>
        {VALENCE_LABEL[valence - 1]} · {ENERGY_LABEL[energy - 1]}
      </Text>

      <Animated.Text
        style={[type.label, styles.upper, styles.hint, { color: c.inkFaint }, legendStyle]}
      >
        Heavy ← → Bright   ·   Spent ↓ ↑ Charged
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: space.md },
  pad: { alignItems: 'center', justifyContent: 'center' },
  lattice: { justifyContent: 'space-around', paddingVertical: 26, paddingHorizontal: 26 },
  latticeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dot: { width: 3, height: 3, borderRadius: 1.5 },
  upper: { textTransform: 'uppercase' },
  hint: { marginTop: space.xs },
  collapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
