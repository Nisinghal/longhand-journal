import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { MoodPicker } from '../../src/features/composer/MoodPicker';
import { getEntry, saveEntry } from '../../src/db/entries';
import { dayKey, longDate, countWords } from '../../src/lib/dates';
import { promptForDay } from '../../src/lib/promptLibrary';
import { colors, space, type } from '../../src/theme/tokens';
import type { Scheme } from '../../src/theme/mood';

const AUTOSAVE_MS = 800;

export default function Today() {
  const scheme: Scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors(scheme);
  const insets = useSafeAreaInsets();

  const day = dayKey();
  const prompt = promptForDay(day);

  const [body, setBody] = useState('');
  const [valence, setValence] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [writing, setWriting] = useState(false);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loaded, setLoaded] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promptFade = useSharedValue(1);

  useEffect(() => {
    (async () => {
      const existing = await getEntry(day);
      if (existing) {
        setBody(existing.body);
        if (existing.valence) setValence(existing.valence);
        if (existing.energy) setEnergy(existing.energy);
        if (existing.body.length > 0) promptFade.value = 0.42;
      }
      setLoaded(true);
    })();
  }, [day, promptFade]);

  const persist = useCallback(
    (next: { body?: string; valence?: number; energy?: number }) => {
      if (!loaded) return;
      if (timer.current) clearTimeout(timer.current);
      setSaved('saving');
      timer.current = setTimeout(async () => {
        await saveEntry({
          day,
          body: next.body ?? body,
          promptId: prompt.id,
          valence: next.valence ?? valence,
          energy: next.energy ?? energy,
        });
        setSaved('saved');
      }, AUTOSAVE_MS);
    },
    [body, valence, energy, day, prompt.id, loaded]
  );

  const onChangeText = (text: string) => {
    setBody(text);
    promptFade.value = withTiming(text.length > 0 ? 0.42 : 1, { duration: 420 });
    persist({ body: text });
  };

  const onMood = (v: number, e: number) => {
    setValence(v);
    setEnergy(e);
    persist({ valence: v, energy: e });
  };

  const promptStyle = useAnimatedStyle(() => ({ opacity: promptFade.value }));
  const words = countWords(body);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.paper }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + space.lg, paddingBottom: space.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[type.date, styles.upper, { color: c.inkFaint }]}>{longDate()}</Text>

        <Animated.Text style={[type.prompt, styles.prompt, { color: c.inkMuted }, promptStyle]}>
          {prompt.text}
        </Animated.Text>

        <TextInput
          value={body}
          onChangeText={onChangeText}
          onFocus={() => setWriting(true)}
          onBlur={() => setWriting(false)}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          placeholder="Start anywhere."
          placeholderTextColor={c.inkFaint}
          selectionColor={c.inkMuted}
          style={[type.body, styles.input, { color: c.ink }]}
        />

        {words > 0 && (
          <Animated.Text
            entering={FadeIn.duration(300)}
            style={[type.label, styles.upper, styles.meta, { color: c.inkFaint }]}
          >
            {words} {words === 1 ? 'word' : 'words'}
            {saved === 'saved' ? '   ·   Saved on this device' : ''}
          </Animated.Text>
        )}
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: insets.bottom + space.sm }]}>
        <MoodPicker
          valence={valence}
          energy={energy}
          onChange={onMood}
          collapsed={writing}
          onExpand={() => setWriting(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: space.md + 4 },
  upper: { textTransform: 'uppercase' },
  prompt: { marginTop: space.md, marginBottom: space.lg, maxWidth: 460 },
  input: { minHeight: 220, padding: 0, maxWidth: 560 },
  meta: { marginTop: space.lg },
  dock: { paddingHorizontal: space.md + 4 },
});
