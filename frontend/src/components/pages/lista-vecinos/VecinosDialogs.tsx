import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import RegistroVecinoForm from "../../RegistroVecinoForm";

interface VecinosDialogsProps {
  createOpen: boolean;
  editOpen: boolean;
  selectedVecinoId: number | null;
  onCloseCreate: () => void;
  onCreateSuccess: () => void;
  onCloseEdit: () => void;
  onEditSuccess: () => void;
}

export default function VecinosDialogs({
  createOpen,
  editOpen,
  selectedVecinoId,
  onCloseCreate,
  onCreateSuccess,
  onCloseEdit,
  onEditSuccess,
}: VecinosDialogsProps) {
  return (
    <>
      <Dialog open={createOpen} onClose={onCloseCreate} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 2, minHeight: "200px" } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>Registrar Nuevo Vecino</Typography>
          <IconButton aria-label="close" onClick={onCloseCreate} sx={{ color: theme => theme.palette.grey[500], "&:hover": { backgroundColor: theme => theme.palette.grey[100] } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <RegistroVecinoForm onSuccess={onCreateSuccess} onCancel={onCloseCreate} />
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={editOpen} onClose={onCloseEdit} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 2, minHeight: "200px" } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>Editar Vecino</Typography>
          <IconButton aria-label="close" onClick={onCloseEdit} sx={{ color: theme => theme.palette.grey[500], "&:hover": { backgroundColor: theme => theme.palette.grey[100] } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {selectedVecinoId && (
              <RegistroVecinoForm mode="edit" vecinoId={selectedVecinoId} onSuccess={onEditSuccess} onCancel={onCloseEdit} />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
