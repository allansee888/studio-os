import { create } from "zustand";
import {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkRole,
  checkAnyRole,
} from "../../packages/utils/rbac";

export interface User {
  id: string;
  username?: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName: string;
  requiresPasswordChange?: boolean;
  status?: string;
  permissions: string[];
  role?: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/v1/auth/me", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return;
      }

      // If /me fails with 401, try token refresh
      const refreshSuccess = await get().refreshToken();
      if (!refreshSuccess) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  refreshToken: async () => {
    try {
      const res = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    return checkPermission(user.permissions || [], permission, user.roles || []);
  },

  hasAnyPermission: (permissions) => {
    const { user } = get();
    if (!user) return false;
    return checkAnyPermission(user.permissions || [], permissions, user.roles || []);
  },

  hasAllPermissions: (permissions) => {
    const { user } = get();
    if (!user) return false;
    return checkAllPermissions(user.permissions || [], permissions, user.roles || []);
  },

  hasRole: (role) => {
    const { user } = get();
    if (!user) return false;
    return checkRole(user.roles || [], role);
  },

  hasAnyRole: (roles) => {
    const { user } = get();
    if (!user) return false;
    return checkAnyRole(user.roles || [], roles);
  },
}));
