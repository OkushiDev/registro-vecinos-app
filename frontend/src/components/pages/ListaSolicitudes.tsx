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
import * as XLSX from "xlsx";
import api from "../../api";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { visuallyHidden } from "@mui/utils";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Chip from "@mui/material/Chip";

interface Column {
  id:
    | "id"
    | "nombre_completo"
    | "rut"
    | "numero_socio"
    | "tipo_solicitud"
    | "fecha_solicitud_formato"
    | "estado"
    | "acciones";
  label: string;
  minWidth?: number;
  align?: "center" | "right" | "left";
  sortable?: boolean;
}

const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 50, sortable: true },
  { id: "nombre_completo", label: "Vecino", minWidth: 200 },
  { id: "rut", label: "RUT", minWidth: 120 },
  { id: "numero_socio", label: "N° Socio", minWidth: 95, align: "center" },
  { id: "tipo_solicitud", label: "Tipo", minWidth: 150 },
  {
    id: "fecha_solicitud_formato",
    label: "Fecha",
    minWidth: 150,
    align: "right",
  },
  { id: "estado", label: "Estado", minWidth: 120, align: "center" },
  { id: "acciones", label: "Acciones", minWidth: 150, align: "center" },
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

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/solicitudes/notificaciones");

      // Formatear datos
      const solicitudesFormateadas = response.data.notificaciones.map(
        (sol: any) => ({
          ...sol,
          tipo_solicitud:
            sol.tipo_solicitud === "certificado_residencia"
              ? "Certificado de Residencia"
              : sol.tipo_solicitud,
        })
      );

      setRows(solicitudesFormateadas || []);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRequestSort = (property: keyof Data) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (e: any) => {
    setFilterColumn(e.target.value);
    setPage(0);
  };

  const handleEstadoFiltroChange = (e: any) => {
    setEstadoFiltro(e.target.value);
    setPage(0);
  };

  // Marcar como realizada
  const handleMarcarRealizada = async (solicitudId: number) => {
    try {
      await api.patch(`/api/solicitudes/${solicitudId}/marcar-realizada`);
      alert("Solicitud marcada como realizada");
      fetchSolicitudes();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Error al marcar solicitud");
    }
  };

  // Ocultar solicitud
  const handleOcultar = async (solicitudId: number) => {
    try {
      await api.patch(`/api/solicitudes/${solicitudId}/ocultar`);
      fetchSolicitudes();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Error al ocultar solicitud");
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
    }

    return filtered;
  }, [searchTerm, filterColumn, rows, estadoFiltro]);

  // Ordenamiento
  const sortedRows = React.useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      if (orderBy === "id") {
        return order === "asc" ? a.id - b.id : b.id - a.id;
      }
      return 0;
    });
    return sorted;
  }, [filteredRows, order, orderBy]);

  // Exportar a Excel
  const handleExportToExcel = () => {
    const dataToExport = sortedRows.map((row) => ({
      ID: row.id,
      Vecino: row.nombre_completo,
      RUT: row.rut,
      "N° Socio": row.numero_socio,
      Tipo: row.tipo_solicitud,
      Fecha: row.fecha_solicitud_formato,
      Estado: row.estado === "pendiente" ? "Pendiente" : "Realizado",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitudes");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Solicitudes_Certificados_${date}.xlsx`);
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
          <Grid item xs={12} md={4}>
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
          <Grid item xs={6} md={2}>
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
          <Grid item xs={6} md={2}>
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
          <Grid item xs={6} md={2}>
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

          {/* BOTÓN ACTUALIZAR */}
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchSolicitudes}
              sx={{
                height: "56px",
                background: "linear-gradient(to right, #2563eb, #3b82f6)",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.3)",
                "&:hover": {
                  background: "linear-gradient(to right, #1d4ed8, #2563eb)",
                },
              }}
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>

        {/* Resumen */}
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
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleRequestSort(column.id)}
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
                  colSpan={8}
                  align="center"
                  sx={{ color: "text.primary", py: 4 }}
                >
                  Cargando solicitudes...
                </TableCell>
              </TableRow>
            ) : sortedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
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
                              : "Realizado"
                          }
                          color={
                            row.estado === "pendiente" ? "warning" : "success"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center" sx={cellStyle}>
                        <IconButton
                          onClick={() => handleMarcarRealizada(row.id)}
                          size="small"
                          title="Marcar como realizada"
                          disabled={row.estado === "realizado"}
                          sx={{ color: "#10b981", mr: 1 }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOcultar(row.id)}
                          size="small"
                          title="Ocultar de notificaciones"
                          sx={{ color: "#64748b" }}
                        >
                          <VisibilityOffIcon />
                        </IconButton>
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
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
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
