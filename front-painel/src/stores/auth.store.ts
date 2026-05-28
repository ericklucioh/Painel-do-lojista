import { create } from "zustand";
import type { AuthUser } from "@/types/api";

type AuthState = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    setSession: (user: AuthUser) => void;
    clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    setSession: (user) => set({ user, isAuthenticated: true }),
    clearSession: () => set({ user: null, isAuthenticated: false }),
}));
