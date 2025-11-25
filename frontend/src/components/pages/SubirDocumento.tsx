import React, { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import axios from "axios";

const SubirDocumento: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
  const MAX_SIZE = 5 * 1024 * 1024;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Solo se permiten archivos PNG, JPG o JPEG");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("El archivo no puede superar los 5MB");
      return;
    }

    setError(null);
    setSuccess(false);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(
        "http://localhost:8000/api/documentos/subir",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            setProgress(percentCompleted);
          },
        }
      );

      setSuccess(true);
      setUploading(false);

      setTimeout(() => {
        handleClear();
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Error al subir el archivo"  // ✅ CORREGIDO
      );
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          Subir Documento
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Formatos permitidos: PNG, JPG, JPEG (máx. 5MB)
        </Typography>

        {!selectedFile && (
          <Box
            sx={{
              border: "2px dashed",
              borderColor: error ? "error.main" : "grey.400",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: "background.paper",
              transition: "all 0.3s",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <CloudUploadIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Haz clic o arrastra un archivo aquí
            </Typography>
            <Typography variant="body2" color="text.secondary">
              PNG, JPG o JPEG
            </Typography>
          </Box>
        )}

        {selectedFile && preview && (
          <Box sx={{ mt: 2 }}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: "grey.50" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <ImageIcon color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" noWrap>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
                {!uploading && (
                  <IconButton onClick={handleClear} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>

              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                  mt: 2,
                  borderRadius: 1,
                }}
              />
            </Paper>
          </Box>
        )}

        {uploading && (
          <Box sx={{ width: "100%", mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Subiendo: {progress}%
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            ¡Archivo subido exitosamente!
          </Alert>
        )}

        {selectedFile && !uploading && !success && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleUpload}
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2 }}
          >
            Subir Documento
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default SubirDocumento;
