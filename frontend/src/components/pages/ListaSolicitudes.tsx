import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import api from "../../api";
import { exportarAExcel } from "../../utils/excel";
import { descargarPDF } from "../../utils/pdf";
import { getErrorDetail } from "../../utils/error";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { visuallyHidden } from "@mui/utils";
import { displayedRowsLabel, usePagination } from "../../utils/pagination";
import IconButton from "@mui/material/IconButton";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BlockIcon from "@mui/icons-material/Block";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

interface Column {
  id:
    | "id"
    | "nombre_completo"
    | "rut"
    | "numero_socio"
    | "tipo_solicitud"
    | "fecha_solicitud_formato"
    | "estado"
    | "visibilidad"
    | "acciones";
  label: string;
  minWidth?: number;
  align?: "center" | "right" | "left";
  sortable?: boolean;
}

const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 50, sortable: true },
  { id: "nombre_completo", label: "Vecino", minWidth: 180, sortable: true },
  { id: "rut", label: "RUT", minWidth: 110, sortable: true },
  { id: "numero_socio", label: "N° Socio", minWidth: 85, align: "center", sortable: true },
  { id: "tipo_solicitud", label: "Tipo", minWidth: 140 },
  {
    id: "fecha_solicitud_formato",
    label: "Fecha",
    minWidth: 130,
    align: "right",
    sortable: true,
  },
  { id: "estado", label: "Estado", minWidth: 110, align: "center", sortable: true },
  { id: "visibilidad", label: "Visibilidad", minWidth: 120, align: "center" },
  { id: "acciones", label: "Acciones", minWidth: 100, align: "center" },
];

interface Data {
  id: number;
  nombre_completo: string;
  rut: string;
  numero_socio: number;
  tipo_solicitud: string;
  fecha_solicitud: string;
  fecha_solicitud_formato: string;
  estado: string;
  visibilidad: string;
  vecino_id: number;
}

type Order = "asc" | "desc";

export default function ListaSolicitudes() {
  const theme = useTheme();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<Order>("desc");
  const [orderBy, setOrderBy] = React.useState<keyof Data>("id");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterColumn, setFilterColumn] = React.useState("all");
  const [estadoFiltro, setEstadoFiltro] = React.useState<string>("todos");

  const fetchSolicitudes = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/solicitudes");

      const solicitudesFormateadas = response.data.map((sol: Data) => ({
        ...sol,
        tipo_solicitud:
          sol.tipo_solicitud === "certificado_residencia"
            ? "Certificado de Residencia"
            : sol.tipo_solicitud,
      }));

      setRows(solicitudesFormateadas || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const handleActualizacion = () => {
      fetchSolicitudes();
    };

    window.addEventListener("actualizarSolicitudes", handleActualizacion);
    return () => {
      window.removeEventListener("actualizarSolicitudes", handleActualizacion);
    };
  }, [fetchSolicitudes]);

  React.useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const { handleChangePage, handleChangeRowsPerPage } = usePagination(setPage, setRowsPerPage);

  const handleRequestSort = (property: keyof Data) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilterColumn(e.target.value);
    setPage(0);
  };

  const handleEstadoFiltroChange = (e: SelectChangeEvent) => {
    setEstadoFiltro(e.target.value);
    setPage(0);
  };

  const handleGenerarCertificado = async (
    vecinoId: number,
    solicitudId: number,
    nombreVecino: string
  ) => {
    if (
      !confirm(
        `¿Generar certificado de residencia para ${nombreVecino}?\n\nEsto marcará automáticamente la solicitud como realizada.`
      )
    ) {
      return;
    }

    try {
      const response = await api.get(`/api/generar-certificado/${vecinoId}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      descargarPDF(blob, response.headers["content-disposition"]);

      await api.patch(`/api/solicitudes/${solicitudId}/marcar-realizada`);

      await fetchSolicitudes();
    } catch (error) {
      alert(
        getErrorDetail(error) ||
          "Error al generar certificado. Intenta nuevamente."
      );
    }
  };

  // Rechazar solicitud
  const handleRechazarSolicitud = async (
    solicitudId: number,
    nombreVecino: string
  ) => {
    if (
      !confirm(
        `¿Rechazar la solicitud de certificado para ${nombreVecino}?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.patch(`/api/solicitudes/${solicitudId}/rechazar`);

      await fetchSolicitudes();
    } catch (error) {
      alert(
        getErrorDetail(error) ||
          "Error al rechazar solicitud. Intenta nuevamente."
      );
    }
  };

  // Filtrado
  const filteredRows = React.useMemo(() => {
    let filtered = rows;

    if (searchTerm) {
      filtered = filtered.filter((row) => {
        if (filterColumn === "all") {
          return Object.values(row).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          return row[filterColumn as keyof Data]
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        }
      });
    }

    if (estadoFiltro === "pendiente") {
      filtered = filtered.filter((row) => row.estado === "pendiente");
    } else if (estadoFiltro === "realizado") {
      filtered = filtered.filter((row) => row.estado === "realizado");
    } else if (estadoFiltro === "rechazado") {
      filtered = filtered.filter((row) => row.estado === "rechazado");
    }

    return filtered;
  }, [searchTerm, filterColumn, rows, estadoFiltro]);

  // Ordenamiento
  const sortedRows = React.useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      return order === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [filteredRows, order, orderBy]);

  // Estadísticas
  const estadisticas = React.useMemo(() => {
    const total = filteredRows.length;
    const pendientes = filteredRows.filter(
      (r) => r.estado === "pendiente"
    ).length;
    const realizadas = filteredRows.filter(
      (r) => r.estado === "realizado"
    ).length;
    const rechazadas = filteredRows.filter(
      (r) => r.estado === "rechazado"
    ).length;

    return { total, pendientes, realizadas, rechazadas };
  }, [filteredRows]);

  // Exportar a Excel
  const handleExportToExcel = async () => {
    const dataToExport = sortedRows.map((row) => ({
      ID: row.id,
      Vecino: row.nombre_completo,
      RUT: row.rut,
      "N° Socio": row.numero_socio,
      Tipo: row.tipo_solicitud,
      Fecha: row.fecha_solicitud_formato,
      Estado: row.estado === "pendiente" ? "Pendiente" : row.estado === "realizado" ? "Realizado" : "Rechazado",
      Visibilidad: row.visibilidad === "mostrar" ? "Mostrar" : "No Mostrar",
    }));
    await exportarAExcel(dataToExport, "Solicitudes", "Solicitudes_Certificados");
  };

  const commonFilterStyle = {
    backgroundColor: "background.paper",
    color: "text.primary",
    borderRadius: "4px",
    border: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.04)",
      borderColor: "text.primary",
    },
    minHeight: "56px",
    display: "flex",
    alignItems: "center",
    "& .MuiSelect-icon": { color: "text.primary" },
  };

  return (
    <Paper
      sx={{
        width: "100%",
        minHeight: "100vh",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        color: "text.primary",
        borderRadius: 0,
        transition: "background-color 0.3s ease",
      }}
      elevation={0}
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* BUSCADOR */}
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar solicitudes..."
              value={searchTerm}
              onChange={handleSearchChange}
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
                "& .MuiSvgIcon-root": { color: "text.secondary" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { height: "56px" },
              }}
            />
          </Grid>

          {/* FILTRO COLUMNA */}
          <Grid size={{ xs: 6, md: 1.5 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "text.secondary" }}>
                Buscar en
              </InputLabel>
              <Select
                value={filterColumn}
                label="Buscar en"
                onChange={handleFilterChange}
                sx={{
                  ...commonFilterStyle,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "background.paper",
                      color: "text.primary",
                      backgroundImage: "none",
                    },
                  },
                }}
              >
                <MenuItem value="all">Todo</MenuItem>
                <MenuItem value="nombre_completo">Vecino</MenuItem>
                <MenuItem value="rut">RUT</MenuItem>
                <MenuItem value="tipo_solicitud">Tipo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* FILTRO ESTADO */}
          <Grid size={{ xs: 6, md: 1.5 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "text.secondary" }}>Estado</InputLabel>
              <Select
                value={estadoFiltro}
                label="Estado"
                onChange={handleEstadoFiltroChange}
                sx={{
                  ...commonFilterStyle,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "background.paper",
                      color: "text.primary",
                      backgroundImage: "none",
                    },
                  },
                }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="pendiente">Pendientes</MenuItem>
                <MenuItem value="realizado">Realizadas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* BOTÓN EXCEL */}
          <Grid size={{ xs: 6, md: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              sx={{
                height: "56px",
                background: "linear-gradient(to right, #059669, #10b981)",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 4px 6px -1px rgba(5, 150, 105, 0.3)",
                "&:hover": {
                  background: "linear-gradient(to right, #047857, #059669)",
                },
              }}
            >
              Excel
            </Button>
          </Grid>

          {/* ESTADÍSTICAS */}
          {[
            ["Total", estadisticas.total, "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"],
            ["Pendientes", estadisticas.pendientes, "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"],
            ["Realizadas", estadisticas.realizadas, "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"],
            ["Rechazadas", estadisticas.rechazadas, "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"],
          ].map(([label, value, gradient]) => (
            <Card key={label as string} sx={{ height: "56px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", color: "white", background: gradient as string }}>
              <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" fontWeight="600">{label as string}:</Typography>
                  <Typography variant="h6" fontWeight="bold">{value as number}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Resumen de búsqueda */}
        {searchTerm && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Resultados: {filteredRows.length}
            </Typography>
          </Box>
        )}
      </Box>

      {/* TABLA */}
      <TableContainer sx={{ flex: 1, backgroundColor: "transparent" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    backgroundColor: "background.paper",
                    color: "text.primary",
                    fontWeight: "bold",
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleRequestSort(column.id as keyof Data)}
                      sx={{
                        color: "text.primary !important",
                        "&.Mui-active": {
                          color: "text.primary !important",
                        },
                        "& .MuiTableSortLabel-icon": {
                          color: "text.primary !important",
                        },
                      }}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ color: "text.primary", py: 4 }}
                >
                  Cargando solicitudes...
                </TableCell>
              </TableRow>
            ) : sortedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ color: "text.secondary", py: 4 }}
                >
                  No hay solicitudes registradas.
                </TableCell>
              </TableRow>
            ) : (
              sortedRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const cellStyle = {
                    color: "text.primary",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  };

                  // Determinar si los botones deben estar deshabilitados
                  const isDisabled =
                    row.estado === "realizado" || row.estado === "rechazado";

                  return (
                    <TableRow
                      hover
                      key={row.id}
                      sx={{
                        backgroundColor: "transparent",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.05) !important"
                              : "rgba(0,0,0,0.04) !important",
                        },
                      }}
                    >
                      <TableCell sx={cellStyle}>
                        <Typography variant="body2" fontWeight="bold">
                          {row.id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {row.nombre_completo}
                      </TableCell>
                      <TableCell sx={cellStyle}>{row.rut}</TableCell>
                      <TableCell align="center" sx={cellStyle}>
                        {row.numero_socio}
                      </TableCell>
                      <TableCell sx={cellStyle}>{row.tipo_solicitud}</TableCell>
                      <TableCell align="right" sx={cellStyle}>
                        {row.fecha_solicitud_formato}
                      </TableCell>
                      <TableCell align="center" sx={cellStyle}>
                        <Chip
                          label={
                            row.estado === "pendiente"
                              ? "Pendiente"
                              : row.estado === "realizado"
                              ? "Realizado"
                              : "Rechazado"
                          }
                          color={
                            row.estado === "pendiente"
                              ? "warning"
                              : row.estado === "realizado"
                              ? "success"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center" sx={cellStyle}>
                        <Chip
                          label={
                            row.visibilidad === "mostrar"
                              ? "Mostrar"
                              : "No Mostrar"
                          }
                          color={
                            row.visibilidad === "mostrar" ? "info" : "default"
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center" sx={cellStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          {/* BOTÓN GENERAR CERTIFICADO */}
                          <IconButton
                            onClick={() =>
                              handleGenerarCertificado(
                                row.vecino_id,
                                row.id,
                                row.nombre_completo
                              )
                            }
                            size="small"
                            title={
                              isDisabled
                                ? "No disponible para solicitudes realizadas o rechazadas"
                                : "Generar Certificado PDF"
                            }
                            disabled={isDisabled}
                            sx={{
                              color: isDisabled ? "text.disabled" : "#ef4444",
                              "&:hover": {
                                backgroundColor: isDisabled
                                  ? "transparent"
                                  : "rgba(239, 68, 68, 0.1)",
                              },
                            }}
                          >
                            <PictureAsPdfIcon />
                          </IconButton>

                          {/* BOTÓN RECHAZAR */}
                          <IconButton
                            onClick={() =>
                              handleRechazarSolicitud(
                                row.id,
                                row.nombre_completo
                              )
                            }
                            size="small"
                            title={
                              isDisabled
                                ? "No disponible para solicitudes realizadas o rechazadas"
                                : "Rechazar Solicitud"
                            }
                            disabled={isDisabled}
                            sx={{
                              color: isDisabled ? "text.disabled" : "#f59e0b",
                              "&:hover": {
                                backgroundColor: isDisabled
                                  ? "transparent"
                                  : "rgba(245, 158, 11, 0.1)",
                              },
                            }}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={displayedRowsLabel}
        sx={{
          backgroundColor: "background.default",
          color: "text.primary",
          borderTop: `1px solid ${theme.palette.divider}`,
          ".MuiTablePagination-selectIcon": { color: "text.primary" },
          ".MuiIconButton-root": {
            color: "text.primary",
            "&.Mui-disabled": { color: "text.disabled" },
          },
        }}
      />
    </Paper>
  );
}
