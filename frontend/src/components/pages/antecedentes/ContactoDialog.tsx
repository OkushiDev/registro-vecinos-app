import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import SaveIcon from "@mui/icons-material/Save";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { ChangeEvent } from "react";
import type { ContactForm, FormErrors } from "./types";

interface ContactoDialogProps {
  open: boolean;
  form: ContactForm;
  errors: FormErrors;
  isSubmitting: boolean;
  showPassword: boolean;
  onClose: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleShowPassword: () => void;
  onSave: () => void;
}

const ContactoDialog = ({
  open,
  form,
  errors,
  isSubmitting,
  showPassword,
  onClose,
  onChange,
  onToggleShowPassword,
  onSave,
}: ContactoDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
          value={form.telefono}
          onChange={onChange}
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
          value={form.email}
          onChange={onChange}
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
          type={showPassword ? "text" : "password"}
          value={form.currentPassword}
          onChange={onChange}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onToggleShowPassword}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button
        onClick={onSave}
        variant="contained"
        startIcon={<SaveIcon />}
        disabled={isSubmitting}
      >
        Guardar Contacto
      </Button>
    </DialogActions>
  </Dialog>
);

export default ContactoDialog;
