import { create } from "zustand";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  requiresPasswordChange: boolean;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  hasPermission: (permission) => {
    const { user } = get();
    return !!user?.permissions?.includes(permission);
  },
  hasAnyPermission: (permissions) => {
    const { user } = get();
    return permissions.some(p => user?.permissions?.includes(p));
  }
}));
