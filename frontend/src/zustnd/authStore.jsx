import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = 'http://localhost:3000/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      
      login: async (email, password) => {
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              username: email,
              password: password
            })
          });

          if (res.ok) {
            // Get user data
            const userRes = await fetch(`${API_URL}/auth/user`, {
              credentials: 'include'
            });
            const userData = await userRes.json();

            if (userData.validate) {
              // Check if admin
              const adminRes = await fetch(`${API_URL}/auth/is-admin`, {
                credentials: 'include'
              });
              const adminData = await adminRes.json();

              set({ 
                user: userData.user, 
                isAuthenticated: true,
                isAdmin: adminData.isAdmin 
              });
              
              return { success: true, isAdmin: adminData.isAdmin };
            }
          }
          
          const errorText = await res.text();
          return { success: false, error: errorText };
        } catch (err) {
          console.error('Login error:', err);
          return { success: false, error: 'An error occurred during login' };
        }
      },

      logout: async () => {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
          });
        } catch (err) {
          console.error('Logout error:', err);
        }
        set({ user: null, isAuthenticated: false, isAdmin: false });
      },

      checkAuth: async () => {
        try {
          const res = await fetch(`${API_URL}/auth/check-auth`, {
            credentials: 'include'
          });
          const data = await res.json();

          if (data.authenticated) {
            // Get user data
            const userRes = await fetch(`${API_URL}/auth/user`, {
              credentials: 'include'
            });
            const userData = await userRes.json();

            if (userData.validate) {
              // Check if admin
              const adminRes = await fetch(`${API_URL}/auth/is-admin`, {
                credentials: 'include'
              });
              const adminData = await adminRes.json();

              set({ 
                user: userData.user, 
                isAuthenticated: true,
                isAdmin: adminData.isAdmin 
              });
              return true;
            }
          }
          
          set({ user: null, isAuthenticated: false, isAdmin: false });
          return false;
        } catch (err) {
          console.error('Auth check error:', err);
          set({ user: null, isAuthenticated: false, isAdmin: false });
          return false;
        }
      },

      register: async (fullname, email, password) => {
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ fullname, email, password })
          });
          
          const data = await res.json();
          return data;
        } catch (err) {
          console.error('Registration error:', err);
          return { validate: false, message: 'An error occurred during registration' };
        }
      },

      verifyOtp: async (otp) => {
        try {
          const res = await fetch(`${API_URL}/auth/otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ otp })
          });
          
          const data = await res.json();
          
          if (data.validate) {
            // Get user data after successful verification
            const userRes = await fetch(`${API_URL}/auth/user`, {
              credentials: 'include'
            });
            const userData = await userRes.json();

            if (userData.validate) {
              set({ 
                user: userData.user, 
                isAuthenticated: true,
                isAdmin: false 
              });
            }
          }
          
          return data;
        } catch (err) {
          console.error('OTP verification error:', err);
          return { validate: false, message: 'An error occurred during OTP verification' };
        }
      },

      resendOtp: async () => {
        try {
          const res = await fetch(`${API_URL}/auth/resend-otp`, {
            method: 'POST',
            credentials: 'include'
          });
          
          const data = await res.json();
          return data;
        } catch (err) {
          console.error('Resend OTP error:', err);
          return { validate: false, message: 'An error occurred while resending OTP' };
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin
      })
    }
  )
);

export default useAuthStore;
