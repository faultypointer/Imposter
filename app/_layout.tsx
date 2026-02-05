/**
 * Root Layout - App navigation and providers
 */

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import {
  NavigationDarkThemeCustom,
  NavigationLightTheme,
  PaperDarkTheme,
  PaperLightTheme,
} from '@/constants/theme';
import { GameProvider } from '@/contexts/game-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? PaperDarkTheme : PaperLightTheme;
  const navTheme = colorScheme === 'dark' ? NavigationDarkThemeCustom : NavigationLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navTheme}>
        <GameProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="player-setup"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                title: 'Game Settings',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="reveal"
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="game"
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </GameProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}
