import { create } from "zustand";
import { api } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "ADMIN" | "USER";
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<User>;
  signup: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.get<User>("/auth/me");
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/login", { email, password });
      const user = await get().checkAuth();
      if (!user) throw new Error("Authentication failed");
      return user;
    } catch (err: any) {
      const msg = err.message || "Invalid email or password";
      set({ error: msg, isLoading: false, isAuthenticated: false, user: null });
      throw new Error(msg);
    }
  },

  signup: async (fullName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });
      // Automatically log in after registration
      return await get().login(email, password);
    } catch (err: any) {
      const msg = err.message || "Registration failed";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors on logout
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
