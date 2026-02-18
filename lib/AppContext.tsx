import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppRole = 'farmer' | 'volunteer' | 'center' | null;

// Kept for backward compat — still seeded in DB
export const DEMO_FARM_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_CENTER_ID = '00000000-0000-0000-0000-000000000002';
export const DEMO_VOLUNTEER_NAME = 'Demo Volunteer';

export type UserProfile = {
  id: string;
  userId: string;
  role: 'farmer' | 'volunteer' | 'center';
  farmId: string | null;
  centerId: string | null;
  volunteerName: string | null;
  phone: string | null;
  waiverAgreed: boolean;
};

type AppContextType = {
  session: Session | null;
  isLoading: boolean;
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  setActiveProfile: (p: UserProfile | null) => void;
  refreshProfiles: () => Promise<void>;
  signOut: () => Promise<void>;
  // Convenience — derived from activeProfile (fall back to demo values)
  role: AppRole;
  farmId: string;
  centerId: string;
  volunteerName: string;
};

const AppContext = createContext<AppContextType>({
  session: null,
  isLoading: true,
  profiles: [],
  activeProfile: null,
  setActiveProfile: () => {},
  refreshProfiles: async () => {},
  signOut: async () => {},
  role: null,
  farmId: DEMO_FARM_ID,
  centerId: DEMO_CENTER_ID,
  volunteerName: DEMO_VOLUNTEER_NAME,
});

function rowToProfile(row: any): UserProfile {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    farmId: row.farm_id ?? null,
    centerId: row.center_id ?? null,
    volunteerName: row.volunteer_name ?? null,
    phone: row.phone ?? null,
    waiverAgreed: row.waiver_agreed ?? false,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  async function fetchProfiles(userId: string) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId);
    const parsed = (data ?? []).map(rowToProfile);
    setProfiles(parsed);
    return parsed;
  }

  async function refreshProfiles() {
    if (!session?.user?.id) return;
    const parsed = await fetchProfiles(session.user.id);
    // Keep activeProfile in sync if it still exists
    if (activeProfile) {
      const updated = parsed.find(p => p.id === activeProfile.id);
      setActiveProfile(updated ?? null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        await fetchProfiles(s.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        setSession(s);
        if (event === 'SIGNED_IN' && s?.user?.id) {
          await fetchProfiles(s.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfiles([]);
          setActiveProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  const role: AppRole = activeProfile?.role ?? null;
  const farmId = activeProfile?.farmId ?? DEMO_FARM_ID;
  const centerId = activeProfile?.centerId ?? DEMO_CENTER_ID;
  const volunteerName = activeProfile?.volunteerName ?? DEMO_VOLUNTEER_NAME;

  return (
    <AppContext.Provider
      value={{
        session,
        isLoading,
        profiles,
        activeProfile,
        setActiveProfile,
        refreshProfiles,
        signOut,
        role,
        farmId,
        centerId,
        volunteerName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
