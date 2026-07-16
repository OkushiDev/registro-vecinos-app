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
import { useTheme } from "@mui/material/styles";
import {
  Visibility,
  VisibilityOff,
  SettingsSuggest,
  Security,
  ThumbUpAlt,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import authService from "../services/authService";
import { limpiarRut, formatearRut } from "../utils/rut";
import { getErrorMessage } from "../utils/error";
import type { UserProfile } from "./Navbar";

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function Login({
  onLogin,
  isDarkMode,
  onToggleTheme,
}: LoginProps): React.ReactElement {
  const theme = useTheme();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoginClick = async () => {
    setError("");
    setLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error("Por favor ingrese RUT y contraseña");
      }

      // Normalizar RUT usando utilidades compartidas
      const cleanUsername = formatearRut(limpiarRut(username));

      const response = await authService.login({
        username: cleanUsername,
        password,
      });

      if (!response?.access_token) {
        throw new Error("Credenciales inválidas.");
      }

      const userProfile: UserProfile =
        response.rol === "presidente" ? "presidente" : "vecino";
      onLogin(userProfile);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Manejador para detectar ENTER en los inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLoginClick();
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: theme.palette.text.primary,
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.02)",
      "& fieldset": {
        borderColor:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.23)"
            : "rgba(0, 0, 0, 0.23)",
      },
      "&:hover fieldset": { borderColor: theme.palette.text.primary },
      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.text.secondary,
      "&.Mui-focused": { color: theme.palette.primary.main },
    },
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      color: theme.palette.text.secondary,
    },
    "& .MuiFormHelperText-root": {
      color: theme.palette.text.secondary,
    },
  };

  const features = [
    {
      icon: <SettingsSuggest sx={{ color: theme.palette.primary.main }} />,
      title: "Gestión eficiente",
      desc: "Trámites y solicitudes en línea.",
    },
    {
      icon: <Security sx={{ color: theme.palette.primary.main }} />,
      title: "Seguridad",
      desc: "Acceso exclusivo para residentes verificados.",
    },
    {
      icon: <ThumbUpAlt sx={{ color: theme.palette.primary.main }} />,
      title: "Comunidad",
      desc: "Mantente informado de las novedades.",
    },
  ];

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          bgcolor: theme.palette.background.default,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        {/* Botón de cambio de tema - Esquina superior derecha */}
        <IconButton
          onClick={onToggleTheme}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: theme.palette.text.primary,
            bgcolor: theme.palette.background.paper,
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
            },
          }}
        >
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>

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
            bgcolor: theme.palette.background.paper,
          }}
        >
          {/* SECCIÓN IZQUIERDA */}
          <Box
            sx={{
              flex: 1,
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)"
                  : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              p: 6,
              color: "white",
              borderRight:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "none",
            }}
          >
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
              <Security fontSize="large" sx={{ color: "white" }} />
              <Typography variant="h5" fontWeight="bold">
                Junta de Vecinos
              </Typography>
            </Box>

            <List disablePadding>
              {features.map((feature) => (
                <ListItem
                  key={feature.title}
                  sx={{ px: 0, py: 1.5, alignItems: "flex-start" }}
                >
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    {React.cloneElement(feature.icon, {
                      sx: { color: "white" },
                    })}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="white"
                      >
                        {feature.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="rgba(255,255,255,0.8)"
                      >
                        {feature.desc}
                      </Typography>
                    }
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
              bgcolor: theme.palette.background.paper,
              p: { xs: 4, md: 8 },
              width: "100%",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography
                component="h1"
                variant="h5"
                fontWeight="bold"
                sx={{ color: theme.palette.text.primary, mb: 1 }}
              >
                Iniciar Sesión
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mb: 3 }}
              >
                Ingrese sus credenciales para acceder.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ width: "100%" }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="RUT"
                  placeholder="12345678-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  helperText="Sin puntos (ej: 12345678-9)"
                  sx={inputStyles}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  disabled={loading}
                  sx={inputStyles}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  onClick={handleLoginClick}
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mt: 3,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "white"
                        : theme.palette.primary.main,
                    color: theme.palette.mode === "dark" ? "#0f172a" : "white",
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.9)"
                          : theme.palette.primary.dark,
                    },
                    "&.Mui-disabled": {
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {loading ? "Ingresando..." : "INGRESAR"}
                </Button>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    color={theme.palette.text.secondary}
                  >
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
