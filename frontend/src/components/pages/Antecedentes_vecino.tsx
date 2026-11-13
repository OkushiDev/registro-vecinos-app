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
  TableHead,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import KeyIcon from "@mui/icons-material/Key";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PostAddIcon from "@mui/icons-material/PostAdd";
import api from "../../api";
import { formatearRutConPuntos } from "../../utils/rut";
import { getErrorMessage } from "../../utils/error";
import { descargarPDF } from "../../utils/pdf";

// --- INTERFACES ---
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

interface DocumentoBackend {
  id: number;
  vecino_id: number;
  tipo_documento: string;
  tipo_documento_value: string;
  nombre_archivo: string;
  fecha_subida: string;
}

// CONFIGURACIÓN
const DOCUMENTOS_REQUERIDOS = [
  { label: "Cédula de Identidad", value: "cedula_identidad" },
  { label: "Registro Social de Hogares", value: "registro_social_hogares" },
  { label: "Avalúo Fiscal", value: "avaluo_fiscal" },
  { label: "Boleta de Agua", value: "boleta_agua" },
  { label: "Boleta de Luz", value: "boleta_luz" },
  { label: "Escritura de Casa", value: "escritura_casa" },
];

const AntecedentesVecino: React.FC = () => {
  const [vecinoData, setVecinoData] = useState<VecinoData | null>(null);
  const [listaDocumentos, setListaDocumentos] = useState<DocumentoBackend[]>(
    []
  );
  const [tieneSolicitudPendiente, setTieneSolicitudPendiente] = useState(false);

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const vecinoId = Number(localStorage.getItem("vecino_id"));

        if (!vecinoId) throw new Error("No hay sesión activa.");

        setCurrentUserId(vecinoId);

        // 1. CARGAR DATOS DEL VECINO
        const responseVecino = await api.get(`/vecino/${vecinoId}`);
        setVecinoData(responseVecino.data);

        // 2. CARGAR DOCUMENTOS DEL VECINO
        try {
          const responseDocs = await api.get(
            `/api/documentos/vecino/${vecinoId}`
          );
          if (
            responseDocs.data &&
            Array.isArray(responseDocs.data.documentos)
          ) {
            setListaDocumentos(responseDocs.data.documentos);
          }
        } catch {
          // Los documentos son opcionales; el perfil se muestra igual.
        }

        // 3. VERIFICAR SI TIENE SOLICITUD PENDIENTE
        try {
          const response = await api.get("/api/solicitudes/mi-pendiente");
          setTieneSolicitudPendiente(response.data.tiene_pendiente);
        } catch {
          // Si falla esta consulta, el botón de solicitud queda deshabilitado.
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleClose = () => {
    if (isSubmitting) return;
    setOpenContactDialog(false);
    setOpenPasswordDialog(false);
    setErrors({});
    setShowCurrentPass(false);
    setShowNewPass(false);
  };

  const handleSolicitarCertificado = async () => {
    // CONFIRMACIÓN ANTES DE SOLICITAR
    if (
      !confirm(
        "¿Está seguro de solicitar un certificado de residencia?\n\nEl presidente será notificado de su solicitud."
      )
    ) {
      return;
    }

    try {
      const response = await api.post("/api/solicitudes/crear");

      if (response.data.success) {
        setSnackbar({
          open: true,
          message:
            response.data.mensaje ||
            "Solicitud enviada exitosamente. El presidente será notificado.",
          severity: "success",
        });

        // Actualizar estado para deshabilitar el botón
        setTieneSolicitudPendiente(true);

      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error),
        severity: "error",
      });
    }
  };

  // --- HANDLERS ---
  const handleSaveContact = async () => {
    setErrors({});
    if (!contactForm.currentPassword) {
      setErrors({ currentPassword: "Debe ingresar su contraseña" });
      return;
    }
    if (!vecinoData) return;
    setIsSubmitting(true);
    try {
      const payload = {
        nombres: vecinoData.nombres,
        apellido_paterno: vecinoData.apellido_paterno,
        apellido_materno: vecinoData.apellido_materno || "",
        rut: vecinoData.rut,
        numero_socio: vecinoData.numero_socio,
        nombre_calle: vecinoData.nombre_calle || "",
        numero_casa: vecinoData.numero_casa || "",
        relacion_propiedad: vecinoData.relacion_propiedad || "",
        telefono: contactForm.telefono,
        email: contactForm.email,
        currentPassword: contactForm.currentPassword,
        newPassword: null,
      };
      await api.put(`/editar-vecino/${currentUserId}`, payload);
      setVecinoData((prev) =>
        prev
          ? {
              ...prev,
              telefono: contactForm.telefono,
              email: contactForm.email,
            }
          : null
      );
      setSnackbar({
        open: true,
        message: "Contacto actualizado",
        severity: "success",
      });
      handleClose();
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrors((prev) => ({ ...prev, currentPassword: "Error al guardar" }));
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePassword = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!passwordForm.currentPassword)
      newErrors.currentPassword = "Ingrese contraseña actual";
    if (!passwordForm.newPassword)
      newErrors.newPassword = "Ingrese nueva contraseña";
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword)
      newErrors.confirmNewPassword = "No coinciden";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!vecinoData) return;
    setIsSubmitting(true);
    try {
      const payload = {
        nombres: vecinoData.nombres,
        apellido_paterno: vecinoData.apellido_paterno,
        apellido_materno: vecinoData.apellido_materno || "",
        rut: vecinoData.rut,
        numero_socio: vecinoData.numero_socio,
        nombre_calle: vecinoData.nombre_calle || "",
        numero_casa: vecinoData.numero_casa || "",
        relacion_propiedad: vecinoData.relacion_propiedad || "",
        telefono: vecinoData.telefono,
        email: vecinoData.email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };
      await api.put(`/editar-vecino/${currentUserId}`, payload);
      setSnackbar({
        open: true,
        message: "Contraseña actualizada",
        severity: "success",
      });
      handleClose();
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrors((prev) => ({
        ...prev,
        currentPassword: "Error al actualizar",
      }));
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenContact = () => {
    if (vecinoData) {
      setContactForm({
        telefono: vecinoData.telefono || "",
        email: vecinoData.email || "",
        currentPassword: "",
      });
      setOpenContactDialog(true);
    }
  };
  const handleOpenPassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setOpenPasswordDialog(true);
  };
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const renderRow = (label: string, value: React.ReactNode, isTitle = false) => (
    <TableRow
      hover={!isTitle}
      sx={{
        backgroundColor: isTitle
          ? (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "#f5f5f5"
          : "inherit",
      }}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{
          fontWeight: isTitle ? "bold" : "medium",
          width: "40%",
          color: isTitle ? "primary.main" : "text.secondary",
        }}
      >
        {label}
      </TableCell>
      <TableCell sx={{ fontWeight: isTitle ? "bold" : "regular" }}>
        {value || "-"}
      </TableCell>
    </TableRow>
  );

  const handleDescargarDocumento = async (
    documentoId: number,
    nombreArchivo: string
  ) => {
    try {
      const response = await api.get(
        `/api/documentos/descargar/${documentoId}`,
        { responseType: "blob" }
      );
      descargarPDF(
        response.data,
        response.headers["content-disposition"] ?? null,
        nombreArchivo
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error),
        severity: "error",
      });
    }
  };

  if (isLoading)
    return (
      <Box p={3} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  if (!vecinoData)
    return (
      <Box p={3}>
        <Alert severity="warning">Sin datos.</Alert>
      </Box>
    );

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: "0 auto" }}>
      {/* --- ENCABEZADO --- */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        gap={3}
        flexWrap="wrap"
      >
        {/* TÍTULO */}
        <Box>
          <Typography variant="h4" gutterBottom>
            Mis Antecedentes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sesión de:{" "}
            <b>
              {vecinoData.nombres} {vecinoData.apellido_paterno}
            </b>
          </Typography>
        </Box>

        {/* BOTONES */}
        <Box
          display="flex"
          gap={2}
          sx={{
            flexGrow: 1,
            minWidth: "250px",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<PostAddIcon />}
            onClick={handleSolicitarCertificado}
            disabled={tieneSolicitudPendiente} // DESHABILITAR SI YA TIENE SOLICITUD
            sx={{ flex: 1, whiteSpace: "nowrap" }}
          >
            {tieneSolicitudPendiente
              ? "Solicitud Pendiente"
              : "Solicitar Certificado"}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<KeyIcon />}
            onClick={handleOpenPassword}
            sx={{ flex: 1, whiteSpace: "nowrap" }}
          >
            Cambiar Contraseña
          </Button>

          <Button
            fullWidth
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleOpenContact}
            sx={{ flex: 1, whiteSpace: "nowrap" }}
          >
            Modificar Contacto
          </Button>
        </Box>
      </Box>

      {/* Mostrar alerta si tiene solicitud pendiente */}
      {tieneSolicitudPendiente && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Ya tienes una solicitud de certificado pendiente. Espera a que el
          presidente la procese.
        </Alert>
      )}

      {/* --- DATOS PERSONALES --- */}
      <TableContainer
        component={Paper}
        elevation={3}
        sx={{ borderRadius: 2, overflow: "hidden", mb: 4 }}
      >
        <Table sx={{ minWidth: 350 }}>
          <TableBody>
            {renderRow("DATOS PERSONALES", "", true)}
            {renderRow(
              "Nombre Completo",
              `${vecinoData.nombres} ${vecinoData.apellido_paterno} ${
                vecinoData.apellido_materno || ""
              }`
            )}
            {renderRow("RUT", formatearRutConPuntos(vecinoData.rut))}
            {renderRow("Número de Socio", vecinoData.numero_socio)}
            {renderRow("Fecha de Registro", vecinoData.fecha_registro)}
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

      {/* --- DOCUMENTACIÓN ADJUNTA --- */}
      <Box mb={4}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <DescriptionIcon /> Documentación Adjunta
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Listado de documentos requeridos y su estado actual en el sistema.
        </Typography>

        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "#f5f5f5",
                }}
              >
                <TableCell>
                  <strong>Tipo de Documento</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Estado</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DOCUMENTOS_REQUERIDOS.map((docConfig) => {
                const docEncontrado = listaDocumentos.find(
                  (d) =>
                    d.tipo_documento_value === docConfig.value ||
                    d.tipo_documento === docConfig.value
                );
                const existe = !!docEncontrado;

                return (
                  <TableRow key={docConfig.value} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <DescriptionIcon
                          color={existe ? "primary" : "action"}
                          fontSize="small"
                        />
                        {docConfig.label}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={existe ? "Cargado" : "Pendiente"}
                        color={existe ? "success" : "default"}
                        size="small"
                        variant={existe ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {existe && docEncontrado ? (
                        <Button
                          size="small"
                          startIcon={<CloudDownloadIcon />}
                          variant="text"
                          onClick={() =>
                            handleDescargarDocumento(
                              docEncontrado.id,
                              docEncontrado.nombre_archivo
                            )
                          }
                        >
                          Descargar
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          startIcon={<CloudDownloadIcon />}
                          disabled
                          variant="text"
                        >
                          Descargar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* --- DIALOGS --- */}
      <Dialog
        open={openContactDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Actualizar Contacto</DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              Actualice su teléfono y correo. Requiere contraseña actual.
            </Typography>
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={contactForm.telefono}
              onChange={handleContactChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="email"
              value={contactForm.email}
              onChange={handleContactChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Box
              sx={{
                mt: 1,
                p: 2,
                bgcolor: "warning.light",
                opacity: 0.9,
                borderRadius: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "black",
                }}
              >
                <LockIcon fontSize="inherit" /> Seguridad: Ingrese su contraseña
                para confirmar.
              </Typography>
            </Box>
            <TextField
              fullWidth
              required
              label="Contraseña Actual"
              name="currentPassword"
              type={showCurrentPass ? "text" : "password"}
              value={contactForm.currentPassword}
              onChange={handleContactChange}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveContact}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSubmitting}
          >
            Guardar Contacto
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPasswordDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              fullWidth
              required
              label="Contraseña Actual"
              name="currentPassword"
              type={showCurrentPass ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Divider />
            <TextField
              fullWidth
              required
              label="Nueva Contraseña"
              name="newPassword"
              type={showNewPass ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPass(!showNewPass)}>
                      {showNewPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              required
              label="Confirmar Nueva Contraseña"
              name="confirmNewPassword"
              type={showNewPass ? "text" : "password"}
              value={passwordForm.confirmNewPassword}
              onChange={handlePasswordChange}
              error={!!errors.confirmNewPassword}
              helperText={errors.confirmNewPassword}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSavePassword}
            variant="contained"
            color="warning"
            startIcon={<KeyIcon />}
            disabled={isSubmitting}
          >
            Actualizar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {typeof snackbar.message === "string"
            ? snackbar.message
            : "Ocurrió un error"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AntecedentesVecino;
