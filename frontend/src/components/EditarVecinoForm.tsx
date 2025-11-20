import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../api';

interface EditarVecinoFormProps {
  vecinoId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditarVecinoForm: React.FC<EditarVecinoFormProps> = ({ vecinoId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rut: '',
    numero_socio: '',
    direccion: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del vecino al montar el componente
  useEffect(() => {
    const cargarDatosVecino = async () => {
      try {
        setLoadingData(true);
        console.log(`Cargando datos del vecino ID: ${vecinoId}`);
        
        const response = await api.get(`/vecino/${vecinoId}`);
        const vecino = response.data;
        
        console.log('Datos del vecino cargados:', vecino);
        
        setFormData({
          nombres: vecino.nombres || '',
          apellido_paterno: vecino.apellido_paterno || '',
          apellido_materno: vecino.apellido_materno || '',
          rut: vecino.rut || '',
          numero_socio: vecino.numero_socio?.toString() || '',
          direccion: vecino.direccion || ''
        });
      } catch (error: any) {
        console.error('Error al cargar datos del vecino:', error);
        setError('Error al cargar los datos del vecino');
      } finally {
        setLoadingData(false);
      }
    };

    if (vecinoId) {
      cargarDatosVecino();
    }
  }, [vecinoId]);

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

    // Validaciones básicas (iguales al formulario de registro)
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

      console.log('Enviando datos de actualización:', dataToSend);

      const response = await api.put(`/editar-vecino/${vecinoId}`, dataToSend);
      console.log('Respuesta exitosa:', response.data);
      
      // Mostrar mensaje de éxito (opcional)
      alert('Vecino actualizado exitosamente');
      
      onSuccess(); // Cierra el modal y actualiza la lista
    } catch (error: any) {
      console.error('Error completo:', error);
      
      let errorMessage = 'Error al actualizar el vecino';
      
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

  // Mostrar loading mientras se cargan los datos
  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
        <Box sx={{ ml: 2 }}>
          Cargando datos del vecino...
        </Box>
      </Box>
    );
  }

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
          {loading ? 'Actualizando...' : 'Actualizar Vecino'}
        </Button>
      </Box>
    </Box>
  );
};

export default EditarVecinoForm;