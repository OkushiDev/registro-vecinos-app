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
import api from "../../api";

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
  nombre_archivo: string;
  descripcion: string | null;
  fecha_subida: string;
  ruta_archivo: string;
}

const formatearRutConPuntos = (rut: string): string => {
  if (!rut) return "-";
  const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").trim();
  if (rutLimpio.length < 2) return rut;
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoFormateado}-${dv}`;
};

export default function Documentos() {
  const theme = useTheme();

  const [vecinos, setVecinos] = React.useState<Vecino[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
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
      console.error("Error al obtener vecinos:", error);
      setVecinos([]);
    }
  };

  React.useEffect(() => {
    fetchVecinos();
  }, []);

  // Filtrar vecinos según búsqueda
  const filteredVecinos = React.useMemo(() => {
    if (!searchTerm) return vecinos;
    const term = searchTerm.toLowerCase();
    return vecinos.filter(
      (v) =>
        v.nombres.toLowerCase().includes(term) ||
        v.apellido_paterno.toLowerCase().includes(term) ||
        v.apellido_materno.toLowerCase().includes(term) ||
        v.rut.toLowerCase().includes(term) ||
        v.numero_socio.toString().includes(term)
    );
  }, [searchTerm, vecinos]);

  // Cargar documentos del vecino seleccionado
  const fetchDocumentos = async (vecinoId: number) => {
    setLoadingDocumentos(true);
    try {
      const response = await api.get(`/documentos/vecino/${vecinoId}`);
      setDocumentos(response.data.documentos || []);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
      setDocumentos([]);
    } finally {
      setLoadingDocumentos(false);
    }
  };

  const handleSelectVecino = (vecino: Vecino) => {
    setSelectedVecino(vecino);
    fetchDocumentos(vecino.id);
  };

  return (
    <Paper
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "background.default",
        color: "text.primary",
        borderRadius: 0,
        backgroundImage: "none",
      }}
      elevation={0}
    >
      {/* PANEL IZQUIERDO - BUSCADOR (1/3) */}
      <Box
        sx={{
          width: "33.33%",
          borderRight: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.paper",
        }}
      >
        {/* Header del buscador */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Buscar Vecino
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre, apellido, RUT o N° socio..."
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

        {/* Lista de vecinos */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
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
                            sx={{ color: "text.secondary", display: "block" }}
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
          {filteredVecinos.length === 0 && (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="body2">
                {searchTerm
                  ? "No se encontraron vecinos"
                  : "No hay vecinos registrados"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* PANEL DERECHO - DOCUMENTOS (2/3) */}
      <Box
        sx={{
          width: "66.67%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.default",
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
            <TableContainer sx={{ flex: 1 }}>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingDocumentos ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography sx={{ py: 4, color: "text.secondary" }}>
                          Cargando documentos...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : documentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
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
