import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'md',
  fullWidth = true
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '200px'
        }
      }}
    >
      {/* Header del modal con título y botón de cerrar */}
      {title && (
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
              '&:hover': {
                backgroundColor: (theme) => theme.palette.grey[100]
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}

      {/* Contenido del modal */}
      <DialogContent>
        <Box sx={{ pt: title ? 1 : 2 }}>
          {children}
        </Box>
      </DialogContent>

      {/* Acciones del modal (botones) */}
      {actions && (
        <DialogActions sx={{ p: 2, pt: 1 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;