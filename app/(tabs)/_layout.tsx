import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { colors, type as t } from '../../src/theme/tokens';

export default function TabsLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors(scheme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.ink,
        tabBarInactiveTintColor: c.inkFaint,
        tabBarStyle: { backgroundColor: c.paper, borderTopColor: c.rule },
        tabBarLabelStyle: { ...t.label, textTransform: 'uppercase' },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="timeline" options={{ title: 'Timeline' }} />
    </Tabs>
  );
}
