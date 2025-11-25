import * as React from "react";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Navbar, { type UserProfile } from "./components/Navbar";
import Login from "./components/Login.tsx";
import ListaVecinos from "./components/pages/ListaVecinos.tsx";
import Historial from "./components/pages/Historial.tsx";
import AntecedentesVecino from "./components/pages/Antecedentes_vecino.tsx";
import authService from "./services/authService";
import "./services/axiosConfig"; // Importar configuración de axios
import SubirDocumento from "./components/pages/SubirDocumento.tsx";

export default function App(): React.ReactElement {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
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
    );
  }

  // Si no está autenticado, mostrar Login
  if (!isAuthenticated || !userProfile) {
    return <Login onLogin={handleLogin} />;
  }

  // Si está autenticado, mostrar la aplicación con navegación
  return (
    <BrowserRouter>
      <Navbar userProfile={userProfile} onLogout={handleLogout} />
      <Routes>
        {userProfile === "presidente" ? (
          <>
            {/* Redirigir la ruta raíz a la lista de vecinos */}
            <Route
              path="/"
              element={<Navigate to="/presidente/vecinos" replace />}
            />

            {/* Ruta: Lista de Vecinos (implementada) */}
            <Route path="/presidente/vecinos" element={<ListaVecinos />} />

            {/* Ruta: Historial de Acciones (implementada) */}
            <Route path="/presidente/historial" element={<Historial />} />

            {/* Ruta no encontrada - redirigir a vecinos */}
            <Route
              path="*"
              element={<Navigate to="/presidente/vecinos" replace />}
            />
          </>
        ) : (
          <>
            {/* Redirigir la ruta raíz a antecedentes del vecino */}
            <Route
              path="/"
              element={<Navigate to="/vecino/antecedentes-vecino" replace />}
            />

            {/* Ruta: Antecedentes del Vecino (implementada) */}
            <Route
              path="/vecino/antecedentes-vecino"
              element={<AntecedentesVecino />}
            />

            {/* RUTAS PENDIENTES DE IMPLEMENTAR: */}

            {/* Ruta: Subir Archivo/Antecedente */}
            
            <Route
              path="/vecino/subir-archivo"
              element={<SubirDocumento />}
            />
            

            {/* Ruta: Solicitar Certificado de Residencia */}
            {/* 
            <Route
              path="/vecino/certificado"
              element={<SolicitarCertificado />}
            />
            */}

            {/* Ruta: Ver Documentos Subidos */}
            {/* 
            <Route
              path="/vecino/documentos"
              element={<MisDocumentos />}
            />
            */}

            {/* Ruta: Perfil / Editar Datos Personales */}
            {/* 
            <Route
              path="/vecino/perfil"
              element={<PerfilVecino />}
            />
            */}

            {/* Ruta no encontrada - redirigir a antecedentes */}
            <Route
              path="*"
              element={<Navigate to="/vecino/antecedentes-vecino" replace />}
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
