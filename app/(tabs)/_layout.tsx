/**
 * Tab Layout - Bottom tab navigation
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { useTheme } from 'react-native-paper';

import { Layout } from '@/constants/theme';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  const theme = useTheme();

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarShowIcon: true,
        tabBarIndicatorStyle: {
          backgroundColor: 'transparent',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
          position: 'absolute',
          bottom: Layout.floatingBar.bottom,
          marginHorizontal: Layout.floatingBar.marginHorizontal,
          left: 0,
          right: 0,
          height: 64,
          borderRadius: Layout.floatingBar.borderRadius,
          elevation: Layout.floatingBar.elevation,
          shadowColor: '#000',
          shadowOffset: Layout.floatingBar.shadowOffset,
          shadowOpacity: Layout.floatingBar.shadowOpacity,
          shadowRadius: Layout.floatingBar.shadowRadius,
        },
        tabBarContentContainerStyle: {
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          textTransform: 'none',
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}>
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Play',
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="gamepad-variant" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="explore"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="view-grid-plus" size={24} color={color} />
          ),
        }}
      />
    </MaterialTopTabs>
  );
}
