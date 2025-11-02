import * as React from "react";
import { useState } from "react";
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import type { UserProfile } from "./Navbar";

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

export default function Login({ onLogin }: LoginProps): React.ReactElement {
  const [error, setError] = useState<string>("");

  const handleLogin = (userType: UserProfile) => {
    setError("");
    // Simular verificación básica
    setTimeout(() => {
      onLogin(userType);
    }, 500);
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
              Selecciona tu perfil
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => handleLogin("presidente")}
                sx={{ py: 2 }}
              >
                Entrar como Presidente
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => handleLogin("vecino")}
                sx={{ py: 2 }}
              >
                Entrar como Vecino
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
