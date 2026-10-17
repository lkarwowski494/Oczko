import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../src/core/theme';
import {
  CounterIcon,
  ProjectsIcon,
  StashIcon,
  LearnIcon,
  SettingsIcon,
} from '../../src/components/icons/CraftIcons';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.bgCard,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: theme.colors.textPrimary,
          fontSize: 17,
        },
        headerRight: () => (
          <TouchableOpacity
            testID="header-settings-button"
            onPress={() => router.push('/settings')}
            style={styles.headerSettingsBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Ustawienia aplikacji"
          >
            <SettingsIcon size={22} color={theme.colors.textSecondary} strokeWidth={1.8} />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: theme.colors.terracotta,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.bgCard,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Licznik',
          tabBarLabel: 'Licznik',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <CounterIcon
              size={22}
              color={color as string}
              strokeWidth={focused ? 2.2 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projekty',
          tabBarLabel: 'Projekty',
          tabBarIcon: ({ color, focused }) => (
            <ProjectsIcon
              size={22}
              color={color as string}
              strokeWidth={focused ? 2.2 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stash"
        options={{
          title: 'Magazyn',
          tabBarLabel: 'Magazyn',
          tabBarIcon: ({ color, focused }) => (
            <StashIcon
              size={22}
              color={color as string}
              strokeWidth={focused ? 2.2 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Warsztat',
          tabBarLabel: 'Warsztat',
          tabBarIcon: ({ color, focused }) => (
            <LearnIcon
              size={22}
              color={color as string}
              strokeWidth={focused ? 2.2 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ustawienia',
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerSettingsBtn: {
    marginRight: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
