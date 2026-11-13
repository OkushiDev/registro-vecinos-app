import { createContext, useContext } from "react";

export type UserProfile = "presidente" | "vecino";

export interface AuthContextValue {
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDarkMode: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
  toggleTheme: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
