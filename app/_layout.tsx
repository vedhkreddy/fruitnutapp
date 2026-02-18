import { AppProvider } from '@/lib/AppContext';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <AppProvider>
      <Slot />
    </AppProvider>
  );
}
