import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import PostAddIcon from "@mui/icons-material/PostAdd";
import api from "../../api";
import { getErrorMessage } from "../../utils/error";
import { descargarPDF } from "../../utils/pdf";
import ContactoDialog from "./antecedentes/ContactoDialog";
import DatosPersonales from "./antecedentes/DatosPersonales";
import DocumentosAdjuntos from "./antecedentes/DocumentosAdjuntos";
import PasswordDialog from "./antecedentes/PasswordDialog";
import type {
  ContactForm,
  DocumentoBackend,
  FormErrors,
  PasswordForm,
  VecinoData,
} from "./antecedentes/types";

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
  const [contactForm, setContactForm] = useState<ContactForm>({
    telefono: "",
    email: "",
    currentPassword: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
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
    const newErrors: FormErrors = {};
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
      <DatosPersonales vecinoData={vecinoData} />

      {/* --- DOCUMENTACIÓN ADJUNTA --- */}
      <DocumentosAdjuntos
        listaDocumentos={listaDocumentos}
        onDescargar={handleDescargarDocumento}
      />

      {/* --- DIALOGS --- */}
      <ContactoDialog
        open={openContactDialog}
        form={contactForm}
        errors={errors}
        isSubmitting={isSubmitting}
        showPassword={showCurrentPass}
        onClose={handleClose}
        onChange={handleContactChange}
        onToggleShowPassword={() => setShowCurrentPass(!showCurrentPass)}
        onSave={handleSaveContact}
      />

      <PasswordDialog
        open={openPasswordDialog}
        form={passwordForm}
        errors={errors}
        isSubmitting={isSubmitting}
        showCurrentPassword={showCurrentPass}
        showNewPassword={showNewPass}
        onClose={handleClose}
        onChange={handlePasswordChange}
        onToggleShowCurrentPassword={() =>
          setShowCurrentPass(!showCurrentPass)
        }
        onToggleShowNewPassword={() => setShowNewPass(!showNewPass)}
        onSave={handleSavePassword}
      />

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
