/**
 * Theme configuration for the app using React Native Paper MD3
 * Provides Material You theming with dynamic color support
 */

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { Platform } from 'react-native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';

const tintColorLight = '#6366f1';
const tintColorDark = '#818cf8';

export const Colors = {
  light: {
    text: '#1f2937',
    background: '#fafafa',
    tint: tintColorLight,
    icon: '#6b7280',
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    border: 'rgba(0,0,0,0.08)',
    accent: '#ec4899',
  },
  dark: {
    text: '#f3f4f6',
    background: '#0f0f0f',
    tint: tintColorDark,
    icon: '#9ca3af',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorDark,
    card: '#1a1a1a',
    border: 'rgba(255,255,255,0.1)',
    accent: '#f472b6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Adapt navigation themes for Paper integration
const { LightTheme: AdaptedLightTheme, DarkTheme: AdaptedDarkTheme } =
  adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

// MD3 Light Theme with custom colors
export const PaperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: tintColorLight,
    primaryContainer: '#E8E5FF',
    secondary: '#625B71',
    secondaryContainer: '#E8DEF8',
    tertiary: '#7D5260',
    tertiaryContainer: '#FFD8E4',
    error: '#B3261E',
    errorContainer: '#F9DEDC',
    surface: Colors.light.background,
    surfaceVariant: '#E7E0EC',
    outline: '#79747E',
    background: Colors.light.background,
  },
};

// MD3 Dark Theme with custom colors
export const PaperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: tintColorDark,
    primaryContainer: '#4F378B',
    secondary: '#CCC2DC',
    secondaryContainer: '#4A4458',
    tertiary: '#EFB8C8',
    tertiaryContainer: '#633B48',
    error: '#F2B8B5',
    errorContainer: '#8C1D18',
    surface: Colors.dark.background,
    surfaceVariant: '#49454F',
    outline: '#938F99',
    background: Colors.dark.background,
  },
};

// Navigation themes that can be used with ThemeProvider
export const NavigationLightTheme = {
  ...AdaptedLightTheme,
  colors: {
    ...AdaptedLightTheme.colors,
    primary: tintColorLight,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

export const NavigationDarkThemeCustom = {
  ...AdaptedDarkTheme,
  colors: {
    ...AdaptedDarkTheme.colors,
    primary: tintColorDark,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

export type AppTheme = typeof PaperLightTheme;
