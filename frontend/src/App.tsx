import * as React from "react";
import { useState } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Navbar, { type UserProfile } from "./components/Navbar";
import Login from "./components/Login.tsx";
import ListaVecinos from "./components/pages/ListaVecinos.tsx";
import GestionVecino from "./components/pages/RegistroVecino.tsx";
import Historial from "./components/pages/Historial.tsx";

export default function App(): React.ReactElement {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUserProfile(null);
    setIsAuthenticated(false);
  };

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
            <Route
              path="/"
              element={<Navigate to="/presidente/vecinos" replace />}
            />
            <Route path="/presidente/vecinos" element={<ListaVecinos />} />
            <Route path="/presidente/registrar" element={<GestionVecino />} />
            <Route path="/presidente/historial" element={<Historial />} />
            <Route path="*" element={<div>Ruta no encontrada</div>} />
          </>
        ) : (
          <>
            {/* <Route
              path="/"
              element={<Navigate to="/vecino/antecedentes" replace />}
            />
            <Route
              path="/vecino/antecedentes"
              element={<AntecedenteVecino />}
            />
            <Route
              path="/vecino/subir-archivo"
              element={<SubirAntecedente />}
            />
            <Route
              path="/vecino/certificado"
              element={<div>Solicitar Certificado</div>}
            />
            <Route
              path="*"
              element={<Navigate to="/vecino/antecedentes" replace />}
            /> */}
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
