import { supabaseAuth } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

type SupabaseAuth = SupabaseClient['auth'];

const SupabaseAuthContext = createContext<SupabaseAuth | null>(null);

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SupabaseAuthContext.Provider value={supabaseAuth}>{children}</SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const client = useContext(SupabaseAuthContext);
  if (!client) throw new Error('useSupabaseAuth must be used within SupabaseProvider');
  return client;
};
