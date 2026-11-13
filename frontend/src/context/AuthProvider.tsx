import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import authService from "../services/authService";
import { AuthContext, type UserProfile } from "./auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUserProfile(
            userData.rol === "presidente" ? "presidente" : "vecino"
          );
        } catch {
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUserProfile(null);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

  const value = useMemo(
    () => ({
      userProfile,
      isAuthenticated: userProfile !== null,
      isLoading,
      isDarkMode,
      login,
      logout,
      toggleTheme,
    }),
    [userProfile, isLoading, isDarkMode, login, logout, toggleTheme]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
