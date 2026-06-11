import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  Autocomplete,
} from "@mui/material";
import api from "../api";
import {
  formatearRut,
  validarFormatoRut,
} from "../utils/rut";
import { CALLES, RELACIONES_PROPIEDAD } from "../constants/calles";

interface EditarVecinoFormProps {
  vecinoId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditarVecinoForm: React.FC<EditarVecinoFormProps> = ({
  vecinoId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    rut: "",
    numero_socio: "",
    nombre_calle: "",
    numero_casa: "",
    relacion_propiedad: "",
    telefono: "",
    email: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVecino = async () => {
      try {
        const response = await api.get(`/vecino/${vecinoId}`);
        const vecino = response.data;

        setFormData({
          nombres: vecino.nombres || "",
          apellido_paterno: vecino.apellido_paterno || "",
          apellido_materno: vecino.apellido_materno || "",
          rut: vecino.rut || "",
          numero_socio: vecino.numero_socio?.toString() || "",
          nombre_calle: vecino.nombre_calle || "",
          numero_casa: vecino.numero_casa || "",
          relacion_propiedad: vecino.relacion_propiedad || "",
          telefono: vecino.telefono || "",
          email: vecino.email || "",
        });
      } catch (error) {
        console.error("Error al cargar vecino:", error);
        setSubmitError("Error al cargar los datos del vecino");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVecino();
  }, [vecinoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Restricción especial para numero_casa: solo números y máximo 4 dígitos
    if (name === "numero_casa") {
      const numericValue = value.replace(/\D/g, ""); // Solo números
      if (numericValue.length <= 4) {
        setFormData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = "El nombre es obligatorio";
    }
    if (!formData.apellido_paterno.trim()) {
      newErrors.apellido_paterno = "El apellido paterno es obligatorio";
    }
    if (!formData.apellido_materno.trim()) {
      newErrors.apellido_materno = "El apellido materno es obligatorio";
    }
    if (!formData.rut.trim()) {
      newErrors.rut = "El RUT es obligatorio";
    } else if (!validarFormatoRut(formData.rut)) {
      newErrors.rut = "RUT inválido. Debe tener entre 8 y 9 dígitos";
    }
    if (!formData.numero_socio) {
      newErrors.numero_socio = "El número de socio es obligatorio";
    }
    if (!formData.nombre_calle.trim()) {
      newErrors.nombre_calle = "El nombre de la calle es obligatorio";
    }
    if (!formData.numero_casa.trim()) {
      newErrors.numero_casa = "El número de casa es obligatorio";
    } else if (formData.numero_casa.length !== 4) {
      newErrors.numero_casa =
        "El número de casa debe tener exactamente 4 dígitos";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.telefono && !/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      newErrors.telefono = "Teléfono inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Formatear el RUT antes de enviar
      const rutFormateado = formatearRut(formData.rut);

      const dataToSend = {
        ...formData,
        rut: rutFormateado, // RUT formateado sin puntos, con guión
        numero_socio: parseInt(formData.numero_socio),
        nombre_calle: formData.nombre_calle.trim(),
        numero_casa: formData.numero_casa.trim(),
        relacion_propiedad: formData.relacion_propiedad.trim() || null,
        telefono: formData.telefono.trim() || null,
        email: formData.email.trim() || null,
      };

      console.log("RUT original:", formData.rut);
      console.log("RUT formateado:", rutFormateado);

      await api.put(`/editar-vecino/${vecinoId}`, dataToSend);
      onSuccess();
    } catch (error: any) {
      console.error("Error al actualizar vecino:", error);
      if (error.response?.data?.detail) {
        setSubmitError(error.response.data.detail);
      } else {
        setSubmitError("Error al actualizar el vecino. Intente nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando datos...</Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom sx={{ mt: 2, width: "100%" }}>
        Datos Personales
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            label="Nombres"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            error={!!errors.nombres}
            helperText={errors.nombres}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="Apellido Paterno"
            name="apellido_paterno"
            value={formData.apellido_paterno}
            onChange={handleChange}
            error={!!errors.apellido_paterno}
            helperText={errors.apellido_paterno}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="Apellido Materno"
            name="apellido_materno"
            value={formData.apellido_materno}
            onChange={handleChange}
            error={!!errors.apellido_materno}
            helperText={errors.apellido_materno}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="RUT"
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            error={!!errors.rut}
            helperText={errors.rut || "Ej: 12345678-9 o 12.345.678-9"}
            placeholder="12345678-9"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="Número de Socio"
            name="numero_socio"
            type="number"
            value={formData.numero_socio}
            onChange={handleChange}
            error={!!errors.numero_socio}
            helperText={errors.numero_socio}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}></Grid>

        <Typography
          variant="h6"
          gutterBottom
          sx={{ mt: 3, ml: 2, width: "100%" }}
        >
          Dirección
        </Typography>
        <Divider sx={{ mb: 2, width: "100%" }} />

        <Grid size={{ xs: 12, sm: 8 }}>
          <Autocomplete
            options={CALLES}
            value={formData.nombre_calle}
            onChange={(_event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                nombre_calle: newValue || "",
              }));
              if (errors.nombre_calle) {
                setErrors((prev) => ({ ...prev, nombre_calle: "" }));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Nombre de la Calle"
                error={!!errors.nombre_calle}
                helperText={
                  errors.nombre_calle || "Seleccione una opción de la lista"
                }
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            required
            label="Número de Casa"
            name="numero_casa"
            type="text"
            value={formData.numero_casa}
            onChange={handleChange}
            error={!!errors.numero_casa}
            helperText={errors.numero_casa || "Debe tener 4 dígitos (ej: 0123)"}
            inputProps={{
              maxLength: 4,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            placeholder="0000"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Autocomplete
            options={RELACIONES_PROPIEDAD}
            value={formData.relacion_propiedad}
            onChange={(_event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                relacion_propiedad: newValue || "",
              }));
              if (errors.relacion_propiedad) {
                setErrors((prev) => ({ ...prev, relacion_propiedad: "" }));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Relación con la Propiedad"
                error={!!errors.relacion_propiedad}
                helperText={
                  errors.relacion_propiedad ||
                  "Seleccione una opción de la lista"
                }
              />
            )}
          />
        </Grid>

        <Typography
          variant="h6"
          gutterBottom
          sx={{ mt: 3, ml: 2, width: "100%" }}
        >
          Contacto
        </Typography>
        <Divider sx={{ mb: 2, width: "100%" }} />

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            error={!!errors.telefono}
            helperText={errors.telefono}
            placeholder="+56912345678"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            placeholder="ejemplo@correo.com"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button onClick={onCancel} variant="outlined" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </Box>
    </Box>
  );
};

export default EditarVecinoForm;
