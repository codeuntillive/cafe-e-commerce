/**
 * Session Store
 * Zustand store for customer session management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CustomerSession } from '../types/index.ts';

/**
 * Session state interface
 */
interface SessionState {
  session: CustomerSession | null;
  isAuthenticated: boolean;
  
  // Actions
  setSession: (session: CustomerSession) => void;
  clearSession: () => void;
  updateCustomer: (customerId: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,

      setSession: (session) => {
        set({
          session,
          isAuthenticated: true,
        });
      },

      clearSession: () => {
        set({
          session: null,
          isAuthenticated: false,
        });
      },

      updateCustomer: (customerId) => {
        set((state) => ({
          session: state.session
            ? { ...state.session, customerId }
            : null,
        }));
      },
    }),
    {
      name: 'customer-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useSessionStore;
