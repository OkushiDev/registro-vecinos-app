import React, { useState, useRef, type ChangeEvent, type FormEvent } from "react";
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

  // Cargar tipos de documentos al montar el componente
  React.useEffect(() => {
    const fetchTipos = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/documentos/tipos");
        const data = await response.json();
        setTiposDocumento(data.tipos);
      } catch (error) {
        console.error("Error al cargar tipos de documentos:", error);
      }
    };
    fetchTipos();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setMessage({
          type: "error",
          text: "Solo se permiten archivos PNG, JPG, JPEG o PDF",
        });
        return;
      }

      // Validar tamaño (5MB)
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

      // Generar preview solo para imágenes
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("tipo_documento", tipoDocumento);
      if (descripcion.trim()) {
        formData.append("descripcion", descripcion.trim());
      }

      const response = await fetch("http://localhost:8000/api/documentos/subir", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al subir el documento");
      }

      const data = await response.json();
      setMessage({
        type: "success",
        text:data.message,
      });

      // Limpiar formulario
      setSelectedFile(null);
      setPreview(null);
      setTipoDocumento("");
      setDescripcion("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Error al subir el documento",
      });
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
        {/* Tipo de Documento */}
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

        {/* Descripción (Opcional) */}
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

        {/* Seleccionar archivo */}
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

        {/* Nombre del archivo seleccionado */}
        {selectedFile && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
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

        {/* Preview de imagen */}
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

        {/* Indicador PDF */}
        {isPDF && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Archivo PDF seleccionado. Vista previa no disponible.
          </Alert>
        )}

        {/* Mensajes */}
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* Botón subir */}
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
