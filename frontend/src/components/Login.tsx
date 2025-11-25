import * as React from "react";
import { useState } from "react";
import {
  Container,
  Paper,
  Button,
  Typography,
  Box, // Usaremos Box para maquetar en lugar de Grid
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Link,
  CssBaseline,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  SettingsSuggest,
  Security,
  ThumbUpAlt,
} from "@mui/icons-material";
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
  const [rememberMe, setRememberMe] = useState<boolean>(false);

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

      // Normalizar RUT
      let cleanUsername = username.replace(/\./g, "");
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
        setError("Error de conexión con la base de datos.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Error de conexión con la base de datos. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Estilos para inputs oscuros
  const darkInputStyles = {
    "& .MuiOutlinedInput-root": {
      color: "white",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.23)" },
      "&:hover fieldset": { borderColor: "white" },
      "&.Mui-focused fieldset": { borderColor: "#90caf9" },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.7)",
      "&.Mui-focused": { color: "#90caf9" },
    },
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      color: "rgba(255, 255, 255, 0.7)",
    },
    "& .MuiFormHelperText-root": {
       color: "rgba(255, 255, 255, 0.5)",
    }
  };

  const features = [
    { icon: <SettingsSuggest sx={{ color: "#90caf9" }} />, title: "Gestión adaptable", desc: "Plataforma ajustable a la comunidad." },
    { icon: <Security sx={{ color: "#90caf9" }} />, title: "Seguro y confiable", desc: "Datos protegidos con altos estándares." },
    { icon: <ThumbUpAlt sx={{ color: "#90caf9" }} />, title: "Experiencia usuario", desc: "Interfaz intuitiva para vecinos." },
  ];

  return (
    <>
      <CssBaseline />
      {/* 1. FONDO DE PANTALLA COMPLETA CENTRADO */}
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          bgcolor: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        {/* 2. TARJETA FLOTANTE */}
        <Paper
          elevation={10}
          sx={{
            width: "100%",
            maxWidth: "1000px",
            height: { xs: "auto", md: "600px" },
            display: "flex", // Usamos Flex en lugar de Grid container
            flexDirection: { xs: "column", md: "row" }, // Columna en móvil, Fila en escritorio
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "#1e293b",
          }}
        >
          
            {/* --- SECCIÓN IZQUIERDA (Info) --- */}
            <Box
              sx={{
                flex: 1, // Ocupa el 50% del espacio disponible
                background: "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)",
                display: { xs: "none", md: "flex" }, // Oculto en móvil
                flexDirection: "column",
                justifyContent: "center",
                p: 6,
                color: "white",
                borderRight: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                <Security fontSize="large" sx={{ color: "#90caf9" }} />
                <Typography variant="h5" fontWeight="bold">
                  Junta de Vecinos
                </Typography>
              </Box>

              <List disablePadding>
                {features.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                      {feature.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle2" fontWeight="bold" color="white">{feature.title}</Typography>}
                      secondary={<Typography variant="caption" color="rgba(255,255,255,0.6)">{feature.desc}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* --- SECCIÓN DERECHA (Formulario) --- */}
            <Box
              sx={{
                flex: 1, // Ocupa el otro 50%
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#1e293b",
                p: { xs: 4, md: 8 },
                width: "100%"
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Typography component="h1" variant="h5" fontWeight="bold" sx={{ color: "white", mb: 1 }}>
                  Iniciar Sesión
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
                  Bienvenido a la plataforma vecinal.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: "100%" }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="RUT"
                    placeholder="12345678-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    autoFocus
                    disabled={loading}
                    helperText="Sin puntos (ej: 12345678-9)"
                    sx={darkInputStyles}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    helperText="Apellido + 4 primeros dígitos"
                    sx={darkInputStyles}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      bgcolor: "white",
                      color: "#0f172a",
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                      "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.3)" }
                    }}
                  >
                    {loading ? "Iniciando..." : "INGRESAR"}
                  </Button>
                  
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">
                       ¿No tienes cuenta? Contacta a tu presidente.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          
        </Paper>
      </Box>
    </>
  );
}
