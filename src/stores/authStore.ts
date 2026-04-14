import { create } from 'zustand';
import type { Profile } from '../types';
import { IS_DEMO_MODE, supabase } from '../lib/supabase';
import { DEMO_ADMIN, DEMO_REPORTERS } from '../lib/demoData';
import { loginByEmail } from '../lib/supabaseService';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: { id: string; email: string } | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  loginDemo: (email: string, password?: string) => boolean;
  loginSupabase: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),

  loginDemo: (email: string, _password?: string) => {
    if (!IS_DEMO_MODE) return false;
    
    const allProfiles = [DEMO_ADMIN, ...DEMO_REPORTERS];
    const found = allProfiles.find((p) => p.email === email);
    
    if (found) {
      set({
        user: { id: found.id, email: found.email },
        profile: found,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('demo_user_email', email);
      return true;
    }
    return false;
  },

  loginSupabase: async (email: string) => {
    try {
      set({ isLoading: true });
      const profile = await loginByEmail(email);
      
      if (profile) {
        set({
          user: { id: profile.id, email: profile.email },
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
        localStorage.setItem('supabase_user_email', email);
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Supabase login error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  loginWithGoogle: async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch (error) {
      console.error('Google login error:', error);
    }
  },

  logout: async () => {
    if (!IS_DEMO_MODE) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('demo_user_email');
    localStorage.removeItem('supabase_user_email');
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
