import { Component, type ReactNode } from "react";
import { Box, Typography, Button } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: 2,
            p: 4,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Algo salió mal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ocurrió un error inesperado. Intenta recargar la página.
          </Typography>
          {this.state.error && (
            <Typography
              variant="caption"
              sx={{
                color: "error.main",
                fontFamily: "monospace",
                maxWidth: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {this.state.error.message}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Recargar página
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
