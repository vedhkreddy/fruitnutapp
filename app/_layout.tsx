import { Slot } from 'expo-router';

export default function RootLayout() {
  // Root layout simply renders the active route (Home or role-specific layouts).
  // Role-specific tab layouts live under /farmer, /volunteer, /center.
  return <Slot />;
}
