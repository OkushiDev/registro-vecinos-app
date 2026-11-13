import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DescriptionIcon from "@mui/icons-material/Description";
import type { DocumentoBackend } from "./types";

const DOCUMENTOS_REQUERIDOS = [
  { label: "Cédula de Identidad", value: "cedula_identidad" },
  { label: "Registro Social de Hogares", value: "registro_social_hogares" },
  { label: "Avalúo Fiscal", value: "avaluo_fiscal" },
  { label: "Boleta de Agua", value: "boleta_agua" },
  { label: "Boleta de Luz", value: "boleta_luz" },
  { label: "Escritura de Casa", value: "escritura_casa" },
];

interface DocumentosAdjuntosProps {
  listaDocumentos: DocumentoBackend[];
  onDescargar: (documentoId: number, nombreArchivo: string) => void;
}

const DocumentosAdjuntos = ({
  listaDocumentos,
  onDescargar,
}: DocumentosAdjuntosProps) => (
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                        onDescargar(
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
);

export default DocumentosAdjuntos;
