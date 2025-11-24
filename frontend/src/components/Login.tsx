import * as React from "react";
import { useState } from "react";
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import authService from "../services/authService";
import type { UserProfile } from "./Navbar";

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

export default function Login({ onLogin }: LoginProps): React.ReactElement {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validación básica
      if (!username.trim() || !password.trim()) {
        setError("Por favor ingrese RUT y contraseña");
        setLoading(false);
        return;
      }

      // Normalizar el RUT al formato "12345678-9"

      let cleanUsername = username.replace(/\./g, ""); // Quitar puntos

      // Si no tiene guión, agregarlo antes del último carácter
      if (!cleanUsername.includes("-")) {
        const rut = cleanUsername.slice(0, -1);
        const dv = cleanUsername.slice(-1);
        cleanUsername = `${rut}-${dv}`;
      }

      console.log("RUT normalizado:", cleanUsername);

      // Intentar hacer login
      const response = await authService.login({
        username: cleanUsername,
        password: password,
      });

      // Convertir el rol del backend al perfil del frontend
      const userProfile: UserProfile =
        response.rol === "presidente" ? "presidente" : "vecino";

      // Notificar al componente padre
      onLogin(userProfile);
    } catch (err: any) {
      console.error("Error de login:", err);

      if (err.response?.status === 401) {
        setError("RUT o contraseña incorrectos");
      } else if (err.response?.status === 403) {
        setError("Usuario deshabilitado. Contacte al administrador.");
      } else if (err.response?.status === 503) {
        setError("Error de conexión con la base de datos. Intente nuevamente.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Error al conectar con el servidor. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Typography component="h1" variant="h4" gutterBottom>
              Junta de Vecinos
            </Typography>
            <Typography
              component="h2"
              variant="h6"
              color="textSecondary"
              gutterBottom
            >
              Iniciar Sesión
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="RUT"
              placeholder="12345678-9"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              disabled={loading}
              helperText="Ingrese su RUT sin puntos, con guión (ej: 12345678-9)"
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Contraseña inicial: Apellido + primeros 4 dígitos del RUT"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ py: 2, mt: 2 }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            <Box sx={{ mt: 2, textAlign: "center", width: "100%" }}>
              <Typography variant="caption" color="textSecondary">
                ¿Olvidó su contraseña? Contacte al presidente de la junta
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
