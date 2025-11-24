import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import api from "../../api";

interface VecinoData {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  numero_socio: number;
  nombre_calle: string;
  numero_casa: string;
  relacion_propiedad: string;
  telefono: string;
  email: string;
  fecha_registro: string;
  estado: number;
}

// Función para formatear RUT con puntos y guión
const formatearRutConPuntos = (rut: string): string => {
  if (!rut) return "-";

  // Limpiar el RUT (quitar puntos y guiones)
  const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").trim();

  if (rutLimpio.length < 2) return rut;

  // Separar número y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Formatear el cuerpo con puntos
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpoFormateado}-${dv}`;
};

const AntecedentesVecino: React.FC = () => {
  const [vecinoData, setVecinoData] = useState<VecinoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchVecinoData = async () => {
      try {
        setIsLoading(true);
        // TODO: Reemplazar con el ID del vecino logueado desde el contexto de autenticación
        const vecinoId = 1; // Placeholder - obtener del usuario autenticado

        const response = await api.get(`/vecino/${vecinoId}`);
        setVecinoData(response.data);
      } catch (error: any) {
        console.error("Error al cargar datos del vecino:", error);
        setError("Error al cargar los datos. Por favor, intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVecinoData();
  }, []);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando información...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!vecinoData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se encontraron datos del vecino</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mis Antecedentes
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Información personal registrada en el sistema
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* SECCIÓN: DATOS PERSONALES */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Datos Personales</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nombres
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {vecinoData.nombres}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Apellido Paterno
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {vecinoData.apellido_paterno}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Apellido Materno
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {vecinoData.apellido_materno}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    RUT
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatearRutConPuntos(vecinoData.rut)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Número de Socio
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {vecinoData.numero_socio}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Registro
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(vecinoData.fecha_registro).toLocaleDateString(
                      "es-ES"
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* SECCIÓN: DIRECCIÓN */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <HomeIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Dirección</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nombre de la Calle
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {vecinoData.nombre_calle || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Número de Casa
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {vecinoData.numero_casa || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Relación con la Propiedad
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {vecinoData.relacion_propiedad || "-"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* SECCIÓN: CONTACTO */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ContactPhoneIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Contacto</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {vecinoData.telefono || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {vecinoData.email || "-"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Nota informativa */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          Si necesita modificar su información de contacto (teléfono, email,
          usuario o contraseña), por favor contacte al administrador.
        </Alert>
      </Box>
    </Box>
  );
};

export default AntecedentesVecino;
