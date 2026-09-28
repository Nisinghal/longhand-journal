import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space, type } from '../../src/theme/tokens';

/** Placeholder — the bloom calendar is the next screen to build. */
export default function Timeline() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors(scheme);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { backgroundColor: c.paper, paddingTop: insets.top + space.lg }]}>
      <Text style={[type.label, styles.upper, { color: c.inkFaint }]}>Timeline</Text>
      <Text style={[type.prompt, { color: c.inkMuted, marginTop: space.sm }]}>
        A month of blooms, coming next.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: space.md + 4 },
  upper: { textTransform: 'uppercase' },
});
