import * as React from "react";
import { useState } from "react";
import {
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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

// --- UTILIDAD DE SEGURIDAD ---
const getErrorMessage = (error: any): string => {
    if (!error) return "Error desconocido";

    if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.detail && Array.isArray(data.detail)) {
            return `Datos inválidos: ${data.detail.map((e: any) => e.loc[1] || e.msg).join(", ")}`;
        }
        if (data.detail && typeof data.detail === 'string') {
            return data.detail;
        }
    }
    if (error.response?.status === 401) return "RUT o contraseña incorrectos.";
    if (error.response?.status === 403) return "Usuario deshabilitado o sin permisos.";
    if (error.message) return error.message;

    return "Error de conexión. Intente nuevamente.";
};

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

export default function Login({ onLogin }: LoginProps): React.ReactElement {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // CAMBIO: Ya no recibimos 'e: React.FormEvent' porque no usamos form
  const handleLoginClick = async () => {
    setError("");
    setLoading(true);

    try {
      // 1. Validación básica
      if (!username.trim() || !password.trim()) {
        throw new Error("Por favor ingrese RUT y contraseña");
      }

      // 2. Normalizar RUT
      let cleanUsername = username.replace(/\./g, "").trim();
      if (!cleanUsername.includes("-") && cleanUsername.length > 1) {
        const rut = cleanUsername.slice(0, -1);
        const dv = cleanUsername.slice(-1);
        cleanUsername = `${rut}-${dv}`;
      }

      console.log("Enviando credenciales...");

      // 3. Llamada al Backend
      const response = await authService.login({
        username: cleanUsername,
        password: password,
      });

      // 4. VERIFICACIÓN DEFENSIVA (Esto evita el crash si authService falla silenciosamente)
      if (!response) {
         throw new Error("El servidor no devolvió respuesta (Posible error de conexión).");
      }
      if (!response.access_token && !response.token && !response.rol) {
         // Si llegamos aquí sin token ni rol, algo salió mal en el servicio pero no lanzó error
         throw new Error("Credenciales inválidas.");
      }

      console.log("Login exitoso:", response);

      // 5. Guardar sesión
      localStorage.setItem("usuario", JSON.stringify(response));

      // 6. Redirigir
      const userRole = response.rol || response.role || "vecino";
      const userProfile: UserProfile = userRole === "presidente" ? "presidente" : "vecino";
      onLogin(userProfile);

    } catch (err: any) {
      console.error("Error capturado en Login:", err);
      const msg = getErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Manejador para detectar ENTER en los inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoginClick();
    }
  };

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
    },
  };

  const features = [
    { icon: <SettingsSuggest sx={{ color: "#90caf9" }} />, title: "Gestión eficiente", desc: "Trámites y solicitudes en línea." },
    { icon: <Security sx={{ color: "#90caf9" }} />, title: "Seguridad", desc: "Acceso exclusivo para residentes verificados." },
    { icon: <ThumbUpAlt sx={{ color: "#90caf9" }} />, title: "Comunidad", desc: "Mantente informado de las novedades." },
  ];

  return (
    <>
      <CssBaseline />
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
        <Paper
          elevation={10}
          sx={{
            width: "100%",
            maxWidth: "1000px",
            height: { xs: "auto", md: "600px" },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "#1e293b",
          }}
        >
          {/* SECCIÓN IZQUIERDA */}
          <Box
            sx={{
              flex: 1,
              background: "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)",
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              p: 6,
              color: "white",
              borderRight: "1px solid rgba(255,255,255,0.1)",
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
                <ListItem key={index} sx={{ px: 0, py: 1.5, alignItems: "flex-start" }}>
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>{feature.icon}</ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle2" fontWeight="bold" color="white">{feature.title}</Typography>}
                    secondary={<Typography variant="caption" color="rgba(255,255,255,0.6)">{feature.desc}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* SECCIÓN DERECHA */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#1e293b",
              p: { xs: 4, md: 8 },
              width: "100%",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography component="h1" variant="h5" fontWeight="bold" sx={{ color: "white", mb: 1 }}>
                Iniciar Sesión
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
                Ingrese sus credenciales para acceder.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                  {error}
                </Alert>
              )}

              {/* HEMOS ELIMINADO LA ETIQUETA <form> */}
              <Box sx={{ width: "100%" }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="RUT"
                  placeholder="12345678-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown} // Para que funcione el Enter
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
                  onKeyDown={handleKeyDown} // Para que funcione el Enter
                  autoComplete="current-password"
                  disabled={loading}
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
                  onClick={handleLoginClick} // Usamos onClick directo
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mt: 3,
                    bgcolor: "white",
                    color: "#0f172a",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.3)" },
                  }}
                >
                  {loading ? "Ingresando..." : "INGRESAR"}
                </Button>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">
                    ¿No tienes cuenta? Contacta a tu administrador.
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