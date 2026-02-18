import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function VolunteerLayout() {
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
        name="shifts"
        options={{
          title: 'Shifts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          headerTitle: 'Shifts',
        }}
      />

      <Tabs.Screen
        name="farms"
        options={{
          title: 'My Harvests',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
          headerTitle: 'My Harvests',
        }}
      />

      <Tabs.Screen
        name="donations"
        options={{
          title: 'My Contributions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
          headerTitle: 'My Contributions',
        }}
      />

      <Tabs.Screen name="waiver" options={{ href: null, headerTitle: 'Waiver' }} />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerTitle: 'My Profile',
        }}
      />

      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="my-shifts" options={{ href: null }} />
    </Tabs>
  );
}
