import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProjectProvider } from '../src/core/project-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProjectProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ProjectProvider>
    </SafeAreaProvider>
  );
}
