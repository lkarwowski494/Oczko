import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {symbol}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FAFAFA',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: '#1A1A1A',
        },
        tabBarActiveTintColor: '#8B5E3C',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Licznik',
          tabBarLabel: 'Licznik',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon symbol="🧶" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projekty',
          tabBarLabel: 'Projekty',
          tabBarIcon: ({ focused }) => <TabIcon symbol="📁" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stash"
        options={{
          title: 'Magazyn',
          tabBarLabel: 'Magazyn',
          tabBarIcon: ({ focused }) => <TabIcon symbol="📦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Nauka',
          tabBarLabel: 'Nauka',
          tabBarIcon: ({ focused }) => <TabIcon symbol="📖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ustawienia',
          tabBarLabel: 'Ustawienia',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
    opacity: 0.7,
  },
  iconFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
});
