import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download";
import Tooltip from "@mui/material/Tooltip";
import { formatearRutConPuntos } from "../../../utils/rut";
import type { Documento, Vecino } from "./types";

interface DocumentosTableProps {
  selectedVecino: Vecino | null;
  documentos: Documento[];
  loadingDocumentos: boolean;
  onDescargarDocumento: (
    documentoId: number,
    nombreArchivo: string
  ) => void;
}

export default function DocumentosTable({
  selectedVecino,
  documentos,
  loadingDocumentos,
  onDescargarDocumento,
}: DocumentosTableProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "66.67%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      {selectedVecino ? (
        <>
          {/* Header con info del vecino */}
          <Box
            sx={{
              p: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: "background.paper",
              flexShrink: 0,
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              Documentos de {selectedVecino.nombres}{" "}
              {selectedVecino.apellido_paterno}{" "}
              {selectedVecino.apellido_materno}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              RUT: {formatearRutConPuntos(selectedVecino.rut)} | N° Socio:{" "}
              {selectedVecino.numero_socio}
            </Typography>
          </Box>

          {/* Tabla de documentos */}
          <TableContainer
            sx={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    Tipo Documento
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    Nombre Archivo
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    Descripción
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    Fecha Subida
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingDocumentos ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 4,
                        }}
                      >
                        <CircularProgress size={40} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : documentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography sx={{ py: 4, color: "text.secondary" }}>
                        No hay documentos registrados para este vecino
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  documentos.map((doc) => (
                    <TableRow
                      key={doc.id}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "text.primary",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {doc.id}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {doc.tipo_documento}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {doc.nombre_archivo}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {doc.descripcion || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {doc.fecha_subida}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color: "text.primary",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Tooltip title="Descargar documento">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() =>
                              onDescargarDocumento(
                                doc.id,
                                doc.nombre_archivo
                              )
                            }
                            sx={{
                              "&:hover": {
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                              },
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "text.secondary" }}>
            Selecciona un vecino para ver sus documentos
          </Typography>
        </Box>
      )}
    </Box>
  );
}
