import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

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
      <Typography variant="h2" fontWeight="bold" color="text.secondary">
        404
      </Typography>
      <Typography variant="h6">Página no encontrada</Typography>
      <Typography variant="body2" color="text.secondary">
        La ruta que buscas no existe o fue movida.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        Volver al inicio
      </Button>
    </Box>
  );
}
