import React, { createContext, useContext, useState } from 'react';

export type AppRole = 'farmer' | 'volunteer' | 'center' | null;

// Fixed demo UUIDs — match what's seeded in Supabase
export const DEMO_FARM_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_CENTER_ID = '00000000-0000-0000-0000-000000000002';
export const DEMO_VOLUNTEER_NAME = 'Demo Volunteer';

type AppContextType = {
  role: AppRole;
  setRole: (role: AppRole) => void;
  farmId: string;
  centerId: string;
};

const AppContext = createContext<AppContextType>({
  role: null,
  setRole: () => {},
  farmId: DEMO_FARM_ID,
  centerId: DEMO_CENTER_ID,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole>(null);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        farmId: DEMO_FARM_ID,
        centerId: DEMO_CENTER_ID,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
