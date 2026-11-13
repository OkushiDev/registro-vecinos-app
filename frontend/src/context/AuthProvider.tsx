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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
          setIsAuthenticated(true);
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
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUserProfile(null);
    setIsAuthenticated(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

  const value = useMemo(
    () => ({
      userProfile,
      isAuthenticated,
      isLoading,
      isDarkMode,
      login,
      logout,
      toggleTheme,
    }),
    [
      userProfile,
      isAuthenticated,
      isLoading,
      isDarkMode,
      login,
      logout,
      toggleTheme,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
