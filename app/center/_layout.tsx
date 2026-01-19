import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function CenterLayout() {
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
        name="volunteer-stats"
        options={{
          title: 'Volunteers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          headerTitle: 'Volunteer Stats',
        }}
      />

      <Tabs.Screen
        name="open-times"
        options={{
          title: 'Open Times',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
          headerTitle: 'Open Times & Capacity',
        }}
      />
    </Tabs>
  );
}
