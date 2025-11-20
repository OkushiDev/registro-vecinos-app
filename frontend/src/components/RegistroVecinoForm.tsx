import React, { useState } from 'react';
import {
  TextField,
  Grid,
  Button,
  Box,
  Alert
} from '@mui/material';
import api from '../api';

interface RegistroVecinoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const RegistroVecinoForm: React.FC<RegistroVecinoFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rut: '',
    numero_socio: '',
    direccion: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones básicas
    if (!formData.nombres.trim() || !formData.apellido_paterno.trim() || !formData.rut.trim()) {
      setError('Por favor completa todos los campos obligatorios');
      setLoading(false);
      return;
    }

    if (!formData.numero_socio || parseInt(formData.numero_socio) <= 0) {
      setError('El número de socio debe ser mayor a 0');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        nombres: formData.nombres.trim(),
        apellido_paterno: formData.apellido_paterno.trim(),
        apellido_materno: formData.apellido_materno.trim(),
        rut: formData.rut.trim(),
        numero_socio: parseInt(formData.numero_socio),
        direccion: formData.direccion.trim()
      };

      console.log('Enviando datos:', dataToSend); // Para debug

      const response = await api.post('/agregar-vecino/', dataToSend);
      console.log('Respuesta exitosa:', response.data); // Para debug
      
      // Mostrar mensaje de éxito (opcional)
      alert('Vecino registrado exitosamente');
      
      onSuccess(); // Cierra el modal y actualiza la lista
    } catch (error: any) {
      console.error('Error completo:', error); // Para debug
      
      let errorMessage = 'Error al registrar el vecino';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nombres"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Apellido Paterno"
            name="apellido_paterno"
            value={formData.apellido_paterno}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Apellido Materno"
            name="apellido_materno"
            value={formData.apellido_materno}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="RUT"
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            placeholder="12.345.678-9"
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Número de Socio"
            name="numero_socio"
            type="number"
            value={formData.numero_socio}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
          />
        </Grid>
      </Grid>

      {/* Botones del formulario */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Registrar Vecino'}
        </Button>
      </Box>
    </Box>
  );
};

export default RegistroVecinoForm;