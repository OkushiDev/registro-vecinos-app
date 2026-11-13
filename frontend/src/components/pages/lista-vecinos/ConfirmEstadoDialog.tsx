import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import WarningIcon from "@mui/icons-material/Warning";
import type { VecinoToToggle } from "./types";

interface ConfirmEstadoDialogProps {
  open: boolean;
  vecino: VecinoToToggle | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmEstadoDialog({
  open,
  vecino,
  loading,
  onCancel,
  onConfirm,
}: ConfirmEstadoDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <WarningIcon color="warning" />
        <Typography variant="h6" component="div">Confirmar cambio de estado</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "text.primary", fontSize: "1rem" }}>
          {vecino
            ? `¿Estás seguro de que deseas ${vecino.estadoActual === 1 ? "deshabilitar" : "habilitar"} al vecino "${vecino.nombre}"?`
            : ""}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onCancel} variant="outlined" disabled={loading}>Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="warning" disabled={loading} autoFocus>
          {loading ? "Procesando..." : (vecino?.estadoActual === 1 ? "Deshabilitar" : "Habilitar")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
