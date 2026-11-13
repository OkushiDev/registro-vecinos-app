import React, { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import api from "../../api";
import { getErrorMessage } from "../../utils/error";

interface TipoDocumento {
  value: string;
  label: string;
}

const SubirDocumento: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const response = await api.get("/api/documentos/tipos");
        setTiposDocumento(response.data.tipos);
      } catch {
        // Sin tipos disponibles el formulario queda vacío; no bloquea la página.
      }
    };
    fetchTipos();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setMessage({
          type: "error",
          text: "Solo se permiten archivos PNG, JPG, JPEG o PDF",
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setMessage({
          type: "error",
          text: "El archivo no debe superar 5MB",
        });
        return;
      }

      setSelectedFile(file);
      setMessage(null);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setMessage({ type: "error", text: "Por favor selecciona un archivo" });
      return;
    }

    if (!tipoDocumento) {
      setMessage({ type: "error", text: "Por favor selecciona el tipo de documento" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("tipo_documento", tipoDocumento);
      if (descripcion.trim()) {
        formData.append("descripcion", descripcion.trim());
      }

      const response = await api.post("/api/documentos/subir", formData);

      setMessage({
        type: "success",
        text: response.data.message,
      });

      setSelectedFile(null);
      setPreview(null);
      setTipoDocumento("");
      setDescripcion("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    } finally {
      setUploading(false);
    }
  };

  const isPDF = selectedFile?.type === "application/pdf";

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        <CloudUploadIcon sx={{ verticalAlign: "middle", mr: 1 }} />
        Subir Documento
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel>Tipo de Documento</InputLabel>
          <Select
            value={tipoDocumento}
            label="Tipo de Documento"
            onChange={(e) => setTipoDocumento(e.target.value)}
          >
            {tiposDocumento.map((tipo) => (
              <MenuItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Selecciona el tipo de documento *</FormHelperText>
        </FormControl>

        <TextField
          fullWidth
          label="Descripción (opcional)"
          multiline
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Agrega una descripción del documento..."
          sx={{ mb: 2 }}
        />

        <Button
          variant="outlined"
          component="label"
          fullWidth
          startIcon={<DescriptionIcon />}
          sx={{ mb: 2 }}
        >
          Seleccionar Archivo (PNG, JPG, PDF)
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            onChange={handleFileChange}
          />
        </Button>

        {selectedFile && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
            <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
              {isPDF ? (
                <PictureAsPdfIcon sx={{ mr: 1, color: "error.main" }} />
              ) : (
                <ImageIcon sx={{ mr: 1, color: "primary.main" }} />
              )}
              <strong>Archivo:</strong>&nbsp;{selectedFile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tamaño: {(selectedFile.size / 1024).toFixed(2)} KB
            </Typography>
          </Box>
        )}

        {preview && (
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "8px",
                border: "2px solid #ddd",
              }}
            />
          </Box>
        )}

        {isPDF && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Archivo PDF seleccionado. Vista previa no disponible.
          </Alert>
        )}

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={uploading || !selectedFile || !tipoDocumento}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {uploading ? "Subiendo..." : "Subir Documento"}
        </Button>
      </form>
    </Box>
  );
};

export default SubirDocumento;
