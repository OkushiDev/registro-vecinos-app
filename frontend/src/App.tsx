import * as React from "react";
import { useMemo, Suspense } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Navbar from "./components/Navbar";
import Login from "./components/Login.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/auth";

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

function AppShell(): React.ReactElement {
  const { userProfile, isAuthenticated, isLoading, isDarkMode } = useAuth();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
          background: {
            default: isDarkMode ? "#0b1121" : "#f1f5f9",
            paper: isDarkMode ? "#1e293b" : "#ffffff",
          },
          text: {
            primary: isDarkMode ? "#ffffff" : "#0f172a",
          },
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
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
          <Login />
        ) : (
          <>
            <Navbar />

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
                    <Route
                      path="/presidente/historial"
                      element={<Historial />}
                    />
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
                    <Route path="*" element={<NotFound />} />
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
                    <Route path="*" element={<NotFound />} />
                  </>
                )}
              </Routes>
            </Suspense>
          </>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ErrorBoundary>
  );
}
