import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUser, signIn, signOut, signUp } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  role: 'teacher' | 'student';
  full_name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: 'teacher' | 'student') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await signIn(email, password);
          
          if (error) throw error;
          
          if (data.user) {
            set({
              user: {
                id: data.user.id,
                email: data.user.email || '',
                role: (data.user.user_metadata?.role as 'teacher' | 'student') || 'student',
                full_name: data.user.user_metadata?.full_name || '',
              },
              isAuthenticated: true,
            });
          }
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (email, password, fullName, role) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await signUp(email, password, {
            full_name: fullName,
            role,
          });
          
          if (error) throw error;
          
          if (data.user) {
            set({
              user: {
                id: data.user.id,
                email: data.user.email || '',
                role: role,
                full_name: fullName,
              },
              isAuthenticated: true,
            });
          }
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await signOut();
          if (error) throw error;
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      checkAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await getCurrentUser();
          
          if (user) {
            set({
              user: {
                id: user.id,
                email: user.email || '',
                role: (user.user_metadata?.role as 'teacher' | 'student') || 'student',
                full_name: user.user_metadata?.full_name || '',
              },
              isAuthenticated: true,
            });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          set({ error: (error as Error).message, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'armadex-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);