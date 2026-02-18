import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function FarmerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3C6E47',
        tabBarInactiveTintColor: '#66785F',
        tabBarStyle: {
          backgroundColor: '#FAF9F6',
          borderTopColor: '#E8F3EC',
        },
        headerStyle: {
          backgroundColor: '#3C6E47',
        },
        headerTintColor: '#fff',
      }}>
      <Tabs.Screen
        name="donations"
        options={{
          title: 'Donations',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift" size={size} color={color} />
          ),
          headerTitle: 'Donations',
        }}
      />

      <Tabs.Screen
        name="shifts"
        options={{
          title: 'Harvests',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
          headerTitle: 'Harvests',
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
          headerTitle: 'Reports & Stats',
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}
