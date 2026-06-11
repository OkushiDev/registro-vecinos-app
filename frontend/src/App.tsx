import * as React from "react";
import { useState, useEffect, useMemo, Suspense } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Navbar, { type UserProfile } from "./components/Navbar";
import Login from "./components/Login.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import authService from "./services/authService";

// Lazy-loaded pages — reduce initial bundle ~60%
const ListaVecinos = React.lazy(() => import("./components/pages/ListaVecinos.tsx"));
const Historial = React.lazy(() => import("./components/pages/Historial.tsx"));
const AntecedentesVecino = React.lazy(() => import("./components/pages/Antecedentes_vecino.tsx"));
const Documentos = React.lazy(() => import("./components/pages/Documentos.tsx"));
const SubirDocumento = React.lazy(() => import("./components/pages/SubirDocumento.tsx"));
const ListaSolicitudes = React.lazy(() => import("./components/pages/ListaSolicitudes"));
const NotFound = React.lazy(() => import("./components/pages/NotFound"));

const PageLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
    <CircularProgress />
  </Box>
);

export default function App(): React.ReactElement {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. ESTADO PARA EL TEMA (Inicia en Dark por defecto)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // 2. CREACIÓN DINÁMICA DEL TEMA
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
          background: {
            default: isDarkMode ? "#0b1121" : "#f1f5f9", // Azul oscuro vs Gris muy claro
            paper: isDarkMode ? "#1e293b" : "#ffffff", // Azul medio vs Blanco puro
          },
          text: {
            primary: isDarkMode ? "#ffffff" : "#0f172a", // Blanco vs Azul oscuro casi negro
          },
        },
      }),
    [isDarkMode]
  );

  // 3. FUNCIÓN PARA CAMBIAR EL TEMA
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          const profile: UserProfile =
            userData.rol === "presidente" ? "presidente" : "vecino";
          setUserProfile(profile);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error al verificar autenticación:", error);
          authService.logout();
          setUserProfile(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUserProfile(null);
    setIsAuthenticated(false);
  };

  // === ESTRUCTURA CORREGIDA ===
  // Envolvemos todo en ThemeProvider y BrowserRouter desde el inicio
  return (
    <ErrorBoundary>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* CASO 1: CARGANDO */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : !isAuthenticated || !userProfile ? (
          /* CASO 2: LOGIN */
          <Login
            onLogin={handleLogin}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        ) : (
          /* CASO 3: APLICACIÓN PRINCIPAL */
          <>
            <Navbar
              userProfile={userProfile}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
            />

            <Suspense fallback={<PageLoader />}>
            <Routes>
              {userProfile === "presidente" ? (
                <>
                  <Route
                    path="/"
                    element={<Navigate to="/presidente/vecinos" replace />}
                  />
                  <Route
                    path="/presidente/vecinos"
                    element={<ListaVecinos />}
                  />
                  <Route
                    path="/presidente/documentos"
                    element={<Documentos />}
                  />
                  <Route path="/presidente/historial" element={<Historial />} />
                  <Route
                    path="/presidente/solicitudes"
                    element={<ListaSolicitudes />}
                  />
                  <Route
                    path="/presidente/subir-archivo"
                    element={<SubirDocumento />}
                  />
                  <Route
                    path="/presidente/antecedentes-vecino"
                    element={<AntecedentesVecino />}
                  />
                  <Route
                    path="*"
                    element={<NotFound />}
                  />
                </>
              ) : (
                <>
                  <Route
                    path="/"
                    element={
                      <Navigate to="/vecino/antecedentes-vecino" replace />
                    }
                  />
                  <Route
                    path="/vecino/antecedentes-vecino"
                    element={<AntecedentesVecino />}
                  />
                  <Route
                    path="/vecino/subir-archivo"
                    element={<SubirDocumento />}
                  />
                  <Route
                    path="*"
                    element={<NotFound />}
                  />
                </>
              )}
            </Routes>
            </Suspense>
          </>
        )}
      </BrowserRouter>
    </ThemeProvider>
    </ErrorBoundary>
  );
}
