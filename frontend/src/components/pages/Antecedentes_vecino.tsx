import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import KeyIcon from "@mui/icons-material/Key";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../../api"; 

// --- UTILIDADES ---
const formatearRutConPuntos = (rut: string): string => {
  if (!rut) return "-";
  const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").trim();
  if (rutLimpio.length < 2) return rut;
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoFormateado}-${dv}`;
};

const getErrorMessage = (error: any): string => {
    console.log("Analizando error:", error);
    
    if (!error) return "Error desconocido";

    if (error.response && error.response.data) {
        const data = error.response.data;
        
        // Caso FastAPI 422 (Error de validación de campos)
        if (data.detail && Array.isArray(data.detail)) {
            // Muestra qué campos faltan o están mal
            return `Faltan datos: ${data.detail.map((e: any) => e.loc[1]).join(", ")}`;
        }
        
        if (data.detail && typeof data.detail === 'string') {
            return data.detail;
        }
    }

    if (error.message) return error.message;

    return "Ocurrió un error inesperado al guardar.";
};

interface VecinoData {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  rut: string;
  numero_socio: number | null;
  nombre_calle: string | null;
  numero_casa: string | null;
  relacion_propiedad: string | null;
  telefono: string | null;
  email: string | null;
  fecha_registro: string;
  estado: number;
}

const AntecedentesVecino: React.FC = () => {
  const [vecinoData, setVecinoData] = useState<VecinoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Modales
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Formularios
  const [contactForm, setContactForm] = useState({
    telefono: "",
    email: "",
    currentPassword: "", 
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const storedUser = localStorage.getItem("usuario");
        
        if (!storedUser) throw new Error("No hay sesión activa.");

        const userSession = JSON.parse(storedUser);
        let userId = 
            userSession.vecino_id || 
            userSession.id || 
            (userSession.user && userSession.user.id) || 
            (userSession.user && userSession.user.vecino_id);

        if (!userId) throw new Error("Error de sesión: ID no encontrado.");
        setCurrentUserId(userId);

        const response = await api.get(`/vecino/${userId}`);
        setVecinoData(response.data);

      } catch (err: any) {
        console.error("Error al cargar:", err);
        setError(err.message || "Error al cargar información.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleClose = () => {
    if (isSubmitting) return;
    setOpenContactDialog(false);
    setOpenPasswordDialog(false);
    setErrors({});
    setShowCurrentPass(false);
    setShowNewPass(false);
  };

  // --- 1. GUARDAR CONTACTO (CORREGIDO) ---
  const handleSaveContact = async () => {
    setErrors({});
    if (!contactForm.currentPassword) {
        setErrors({ currentPassword: "Debe ingresar su contraseña" });
        return;
    }
    if (!vecinoData) return;

    setIsSubmitting(true);
    try {
      // AQUÍ ESTÁ LA CORRECCIÓN: Enviamos TODOS los campos requeridos por el Backend
      const payload = {
        nombres: vecinoData.nombres,
        apellido_paterno: vecinoData.apellido_paterno,
        apellido_materno: vecinoData.apellido_materno || "", // Si es null, enviamos string vacío
        rut: vecinoData.rut,
        numero_socio: vecinoData.numero_socio,
        nombre_calle: vecinoData.nombre_calle || "",
        numero_casa: vecinoData.numero_casa || "",
        relacion_propiedad: vecinoData.relacion_propiedad || "",
        
        // Datos nuevos
        telefono: contactForm.telefono,
        email: contactForm.email,
        
        // Seguridad
        currentPassword: contactForm.currentPassword, 
        newPassword: null 
      };

      await api.put(`/editar-vecino/${currentUserId}`, payload);

      setVecinoData((prev) => prev ? ({ ...prev, telefono: contactForm.telefono, email: contactForm.email }) : null);
      setSnackbar({ open: true, message: "Contacto actualizado", severity: "success" });
      handleClose();

    } catch (err: any) {
      const msg = getErrorMessage(err);
      setErrors((prev) => ({ ...prev, currentPassword: "Error al guardar (ver alerta)" }));
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 2. CAMBIAR CONTRASEÑA (CORREGIDO) ---
  const handleSavePassword = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = "Ingrese su contraseña actual";
    if (!passwordForm.newPassword) newErrors.newPassword = "Ingrese la nueva contraseña";
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) newErrors.confirmNewPassword = "Las contraseñas no coinciden";

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }
    if (!vecinoData) return;

    setIsSubmitting(true);
    try {
      // AQUÍ TAMBIÉN: Enviamos TODOS los campos requeridos
      const payload = {
        nombres: vecinoData.nombres,
        apellido_paterno: vecinoData.apellido_paterno,
        apellido_materno: vecinoData.apellido_materno || "",
        rut: vecinoData.rut,
        numero_socio: vecinoData.numero_socio,
        nombre_calle: vecinoData.nombre_calle || "",
        numero_casa: vecinoData.numero_casa || "",
        relacion_propiedad: vecinoData.relacion_propiedad || "",
        telefono: vecinoData.telefono, // Mantenemos el actual
        email: vecinoData.email,       // Mantenemos el actual

        // Seguridad
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };

      await api.put(`/editar-vecino/${currentUserId}`, payload);
      setSnackbar({ open: true, message: "Contraseña actualizada", severity: "success" });
      handleClose();

    } catch (err: any) {
      const msg = getErrorMessage(err);
      setErrors((prev) => ({ ...prev, currentPassword: "Error (ver alerta)" }));
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLERS UI ---
  const handleOpenContact = () => {
    if (vecinoData) {
      setContactForm({
        telefono: vecinoData.telefono || "",
        email: vecinoData.email || "",
        currentPassword: "",
      });
      setErrors({});
      setOpenContactDialog(true);
    }
  };

  const handleOpenPassword = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    setErrors({});
    setOpenPasswordDialog(true);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  // --- RENDER ---
  const renderRow = (label: string, value: string | number | undefined | null, isTitle = false) => (
    <TableRow hover={!isTitle} sx={{ backgroundColor: isTitle ? (theme) => theme.palette.mode === 'dark' ? "rgba(255, 255, 255, 0.08)" : "#f5f5f5" : "inherit" }}>
      <TableCell component="th" scope="row" sx={{ fontWeight: isTitle ? "bold" : "medium", width: "40%", color: isTitle ? "primary.main" : "text.secondary" }}>{label}</TableCell>
      <TableCell sx={{ fontWeight: isTitle ? "bold" : "regular" }}>{value || "-"}</TableCell>
    </TableRow>
  );

  if (isLoading) return <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;
  if (!vecinoData) return <Box p={3}><Alert severity="warning">Sin datos.</Alert></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: "0 auto" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
            <Typography variant="h4" gutterBottom>Mis Antecedentes</Typography>
            <Typography variant="body2" color="text.secondary">
                Sesión de: <b>{vecinoData.nombres} {vecinoData.apellido_paterno}</b>
            </Typography>
        </Box>
        <Box display="flex" gap={2}>
            <Button variant="outlined" color="primary" startIcon={<KeyIcon />} onClick={handleOpenPassword}>
                Cambiar Contraseña
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleOpenContact}>
                Modificar Contacto
            </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 350 }}>
          <TableBody>
            {renderRow("DATOS PERSONALES", "", true)}
            {renderRow("Nombre Completo", `${vecinoData.nombres} ${vecinoData.apellido_paterno} ${vecinoData.apellido_materno || ''}`)}
            {renderRow("RUT", formatearRutConPuntos(vecinoData.rut))}
            {renderRow("Número de Socio", vecinoData.numero_socio)}
            {renderRow("Fecha de Registro", new Date(vecinoData.fecha_registro).toLocaleDateString("es-ES"))}
            {renderRow("DIRECCIÓN", "", true)}
            {renderRow("Calle", vecinoData.nombre_calle)}
            {renderRow("Número de Casa", vecinoData.numero_casa)}
            {renderRow("Relación con Propiedad", vecinoData.relacion_propiedad)}
            {renderRow("CONTACTO Y SEGURIDAD", "", true)}
            {renderRow("Teléfono", vecinoData.telefono)}
            {renderRow("Correo Electrónico", vecinoData.email)}
            {renderRow("Contraseña", "********")}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- DIALOG MODIFICAR CONTACTO --- */}
      <Dialog open={openContactDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Actualizar Contacto</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
                Actualice su teléfono y correo. Requiere contraseña actual.
            </Typography>
            
            <TextField 
                fullWidth label="Teléfono" name="telefono" value={contactForm.telefono} onChange={handleContactChange} 
                error={!!errors.telefono} helperText={errors.telefono} 
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }} 
            />
            
            <TextField 
                fullWidth label="Correo Electrónico" name="email" value={contactForm.email} onChange={handleContactChange} 
                error={!!errors.email} helperText={errors.email} 
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }} 
            />

            <Box sx={{ mt: 1, p: 2, bgcolor: "warning.light", opacity: 0.9, borderRadius: 1 }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: "black" }}>
                     <LockIcon fontSize="inherit" /> Seguridad: Ingrese su contraseña para confirmar.
                </Typography>
            </Box>

            <TextField 
                fullWidth required label="Contraseña Actual" name="currentPassword" 
                type={showCurrentPass ? "text" : "password"} 
                value={contactForm.currentPassword} onChange={handleContactChange} 
                error={!!errors.currentPassword} helperText={errors.currentPassword}
                InputProps={{ 
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowCurrentPass(!showCurrentPass)} edge="end">
                                {showCurrentPass ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleSaveContact} variant="contained" startIcon={<SaveIcon />} disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Contacto"}
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG CAMBIAR CONTRASEÑA --- */}
      <Dialog open={openPasswordDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            <TextField 
                fullWidth required label="Contraseña Actual" name="currentPassword" 
                type={showCurrentPass ? "text" : "password"} 
                value={passwordForm.currentPassword} onChange={handlePasswordChange} 
                error={!!errors.currentPassword} helperText={errors.currentPassword}
                InputProps={{ 
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowCurrentPass(!showCurrentPass)} edge="end">
                                {showCurrentPass ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }} 
            />

            <Divider />

            <TextField 
                fullWidth required label="Nueva Contraseña" name="newPassword" 
                type={showNewPass ? "text" : "password"} 
                value={passwordForm.newPassword} onChange={handlePasswordChange} 
                error={!!errors.newPassword} helperText={errors.newPassword}
                InputProps={{ 
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end">
                                {showNewPass ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }} 
            />

            <TextField 
                fullWidth required label="Confirmar Nueva Contraseña" name="confirmNewPassword" 
                type={showNewPass ? "text" : "password"} 
                value={passwordForm.confirmNewPassword} onChange={handlePasswordChange} 
                error={!!errors.confirmNewPassword} helperText={errors.confirmNewPassword}
            />

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleSavePassword} variant="contained" color="warning" startIcon={<KeyIcon />} disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {typeof snackbar.message === 'string' ? snackbar.message : "Ocurrió un error"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AntecedentesVecino;