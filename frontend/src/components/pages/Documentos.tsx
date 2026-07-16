import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../../api";
import { descargarPDF } from "../../utils/pdf";

import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download";
import Tooltip from "@mui/material/Tooltip";
import { formatearRutConPuntos } from "../../utils/rut";

interface Vecino {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  numero_socio: number;
  estado: number;
}

interface Documento {
  id: number;
  vecino_id: number;
  tipo_documento: string;
  tipo_documento_value: string;
  nombre_archivo: string;
  descripcion: string;
  fecha_subida: string;
  ruta_archivo: string;
  tipo_archivo?: string;
  tamanio?: number;
}

type FiltroTipo =
  | "rut"
  | "nombres"
  | "apellido_paterno"
  | "apellido_materno"
  | "numero_socio";

export default function Documentos() {
  const theme = useTheme();

  const [vecinos, setVecinos] = React.useState<Vecino[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filtroTipo, setFiltroTipo] = React.useState<FiltroTipo>("rut");
  const [selectedVecino, setSelectedVecino] = React.useState<Vecino | null>(
    null
  );
  const [documentos, setDocumentos] = React.useState<Documento[]>([]);
  const [loadingDocumentos, setLoadingDocumentos] = React.useState(false);

  // Cargar lista de vecinos
  const fetchVecinos = async () => {
    try {
      const response = await api.get("/lista-vecinos/");
      setVecinos(response.data.vecinos || []);
    } catch (error) {
      setVecinos([]);
    }
  };

  React.useEffect(() => {
    fetchVecinos();
  }, []);

  // Filtrar vecinos según búsqueda Y tipo de filtro seleccionado
  const filteredVecinos = React.useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") return [];
    const term = searchTerm.toLowerCase().trim();

    return vecinos.filter((v) => {
      switch (filtroTipo) {
        case "rut":
          return v.rut.toLowerCase().includes(term);
        case "numero_socio":
          return v.numero_socio.toString().includes(term);
        case "nombres":
          return v.nombres.toLowerCase().includes(term);
        case "apellido_paterno":
          return v.apellido_paterno.toLowerCase().includes(term);
        case "apellido_materno":
          return v.apellido_materno.toLowerCase().includes(term);
        default:
          return false;
      }
    });
  }, [searchTerm, filtroTipo, vecinos]);

  // Cargar documentos del vecino seleccionado
  const fetchDocumentos = async (vecinoId: number) => {
    setLoadingDocumentos(true);
    setDocumentos([]); // Limpiar documentos anteriores

    try {
      // Verificar token
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        return;
      }

      const response = await api.get(`/api/documentos/vecino/${vecinoId}`);

      if (response.data.success && response.data.documentos) {
        setDocumentos(response.data.documentos);
      } else {
        setDocumentos([]);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          localStorage.removeItem("access_token");
          window.location.href = "/login";
        } else if (error.response.status === 403) {
          alert("No tienes permiso para ver documentos de otros vecinos");
        } else {
          alert(
            `Error al cargar documentos: ${
              error.response.data.detail || "Error desconocido"
            }`
          );
        }
      } else if (error.request) {
        alert("No se pudo conectar con el servidor. Verifica tu conexión.");
      } else {
        alert("Error inesperado al cargar documentos");
      }

      setDocumentos([]);
    } finally {
      setLoadingDocumentos(false);
    }
  };

  const handleDescargarDocumento = async (
    documentoId: number,
    nombreArchivo: string
  ) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        return;
      }

      // Descargar documento
      const response = await api.get(`/api/documentos/descargar/${documentoId}`, {
        responseType: "blob",
      });

      if (response.status === 403) {
        alert("No tienes permiso para descargar este documento");
        return;
      }
      if (response.status === 404) {
        alert("Documento no encontrado");
        return;
      }

      const blob = response.data;
      const contentDisposition = response.headers["content-disposition"] as string | null;
      descargarPDF(blob, contentDisposition, nombreArchivo);
    } catch (error) {
      alert("Error al descargar el documento");
    }
  };

  const handleSelectVecino = (vecino: Vecino) => {
    setSelectedVecino(vecino);
    fetchDocumentos(vecino.id);
  };

  // Obtener placeholder dinámico según el filtro
  const getPlaceholder = () => {
    switch (filtroTipo) {
      case "rut":
        return "Ej: 12345678-9";
      case "nombres":
        return "Ej: Juan";
      case "apellido_paterno":
        return "Ej: Pérez";
      case "apellido_materno":
        return "Ej: González";
      case "numero_socio":
        return "Ej: 123";
      default:
        return "Buscar...";
    }
  };

  return (
    <Paper
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        backgroundColor: "background.default",
        color: "text.primary",
        borderRadius: 0,
        backgroundImage: "none",
        overflow: "hidden",
      }}
      elevation={0}
    >
      {/* PANEL IZQUIERDO - BUSCADOR (1/3) */}
      <Box
        sx={{
          width: "33.33%",
          height: "100%",
          borderRight: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.paper",
          overflow: "hidden",
        }}
      >
        {/* Header del buscador */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Buscar Vecino
          </Typography>

          {/* Selector de tipo de filtro */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel
              sx={{
                color: "text.secondary",
                "&.Mui-focused": { color: "#3b82f6" },
              }}
            >
              Buscar por
            </InputLabel>
            <Select
              value={filtroTipo}
              label="Buscar por"
              onChange={(e) => {
                setFiltroTipo(e.target.value as FiltroTipo);
                setSearchTerm("");
              }}
              sx={{
                color: "text.primary",
                backgroundColor: "transparent",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "4px",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:hover": {
                  borderColor: "text.primary",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                },
                "&.Mui-focused": {
                  borderColor: "#3b82f6",
                  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
                },
              }}
            >
              <MenuItem value="rut">RUT</MenuItem>
              <MenuItem value="nombres">Nombres</MenuItem>
              <MenuItem value="apellido_paterno">Apellido Paterno</MenuItem>
              <MenuItem value="apellido_materno">Apellido Materno</MenuItem>
              <MenuItem value="numero_socio">Número de Socio</MenuItem>
            </Select>
          </FormControl>

          {/* Campo de búsqueda */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder={getPlaceholder()}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                backgroundColor: "transparent",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "4px",
                "& fieldset": { border: "none" },
                "&:hover": {
                  borderColor: "text.primary",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                },
                "&.Mui-focused": {
                  borderColor: "#3b82f6",
                  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Lista de vecinos - CON SCROLL INTERNO */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 220px)",
          }}
        >
          {searchTerm.trim() === "" ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
              <Typography variant="body1">
                Escribe para buscar por{" "}
                {filtroTipo === "numero_socio"
                  ? "número de socio"
                  : filtroTipo.replace("_", " ")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                {getPlaceholder()}
              </Typography>
            </Box>
          ) : filteredVecinos.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="body2">
                No se encontraron resultados para "{searchTerm}"
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredVecinos.map((vecino) => (
                <React.Fragment key={vecino.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleSelectVecino(vecino)}
                      selected={selectedVecino?.id === vecino.id}
                      sx={{
                        py: 2,
                        "&.Mui-selected": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(59, 130, 246, 0.2)"
                              : "rgba(59, 130, 246, 0.1)",
                          borderLeft: "4px solid #3b82f6",
                          "&:hover": {
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "rgba(59, 130, 246, 0.3)"
                                : "rgba(59, 130, 246, 0.15)",
                          },
                        },
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="bold">
                            {vecino.nombres} {vecino.apellido_paterno}{" "}
                            {vecino.apellido_materno}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                display: "block",
                              }}
                            >
                              RUT: {formatearRutConPuntos(vecino.rut)}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              N° Socio: {vecino.numero_socio}
                            </Typography>
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* PANEL DERECHO - DOCUMENTOS (2/3) */}
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
                                handleDescargarDocumento(
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
    </Paper>
  );
}
