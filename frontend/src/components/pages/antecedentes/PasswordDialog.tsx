import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { ChangeEvent } from "react";
import type { FormErrors, PasswordForm } from "./types";

interface PasswordDialogProps {
  open: boolean;
  form: PasswordForm;
  errors: FormErrors;
  isSubmitting: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  onClose: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleShowCurrentPassword: () => void;
  onToggleShowNewPassword: () => void;
  onSave: () => void;
}

const PasswordDialog = ({
  open,
  form,
  errors,
  isSubmitting,
  showCurrentPassword,
  showNewPassword,
  onClose,
  onChange,
  onToggleShowCurrentPassword,
  onToggleShowNewPassword,
  onSave,
}: PasswordDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
          type={showCurrentPassword ? "text" : "password"}
          value={form.currentPassword}
          onChange={onChange}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onToggleShowCurrentPassword}>
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
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
          type={showNewPassword ? "text" : "password"}
          value={form.newPassword}
          onChange={onChange}
          error={!!errors.newPassword}
          helperText={errors.newPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onToggleShowNewPassword}>
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
          type={showNewPassword ? "text" : "password"}
          value={form.confirmNewPassword}
          onChange={onChange}
          error={!!errors.confirmNewPassword}
          helperText={errors.confirmNewPassword}
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
        color="warning"
        startIcon={<KeyIcon />}
        disabled={isSubmitting}
      >
        Actualizar Contraseña
      </Button>
    </DialogActions>
  </Dialog>
);

export default PasswordDialog;
