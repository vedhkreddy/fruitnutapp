import { AppProvider, useApp } from '@/lib/AppContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#3C6E47" />
    </View>
  );
}

function AuthGuard() {
  const { isLoading, session, activeProfile, profiles } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === 'auth';
    if (!session && !inAuth) {
      router.replace('/auth/sign-in');
      return;
    }
    if (session && !activeProfile && !inAuth) {
      // First-time user: no profiles yet → go to role setup
      if (profiles.length === 0) {
        router.replace('/auth/role-setup');
      } else if (segments[0] !== 'home') {
        router.replace('/home');
      }
      return;
    }
    if (session && activeProfile) {
      const correct = segments[0] === activeProfile.role;
      if (!correct && !inAuth) {
        router.replace(`/${activeProfile.role}` as any);
      }
    }
  }, [isLoading, session, activeProfile, profiles, segments]);

  if (isLoading) return <LoadingScreen />;
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthGuard />
    </AppProvider>
  );
}
