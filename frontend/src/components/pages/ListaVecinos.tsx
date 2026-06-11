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
import TableSortLabel from "@mui/material/TableSortLabel"; // Importación para ordenar
import { visuallyHidden } from "@mui/utils"; // Utilidad para accesibilidad

// Importar utilerías compartidas
import { exportarAExcel } from "../../utils/excel";
import { formatearRutConPuntos } from "../../utils/rut";
import { CALLES, RELACIONES_PROPIEDAD } from "../../constants/calles";

// Importación de la API
import api from "../../api";

// Componentes propios
import Modal from "../Modal";
import RegistroVecinoForm from "../RegistroVecinoForm";
import EditarVecinoForm from "../EditarVecinoForm";
import ConfirmDialog from "../ConfirmDialog";

// Material UI Components
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
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

// Iconos
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";

// Definición de Columnas
interface Column {
  id:
    | "id"
    | "nombres"
    | "apellido_paterno"
    | "apellido_materno"
    | "rut"
    | "numero_socio"
    | "nombre_calle"
    | "numero_casa"
    | "relacion_propiedad"
    | "fecha_registro"
    | "fecha_edicion"
    | "telefono"
    | "email"
    | "acciones_certificado"
    | "acciones_editar"
    | "acciones_estado";
  label: string;
  minWidth?: number;
  align?: "center" | "right" | "left";
  format?: (value: any) => string;
}

const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 50 },
  { id: "nombres", label: "Nombres", minWidth: 150 },
  { id: "apellido_paterno", label: "Ap. Paterno", minWidth: 120 },
  { id: "apellido_materno", label: "Ap. Materno", minWidth: 120 },
  { id: "rut", label: "RUT", minWidth: 120 },
  { id: "numero_socio", label: "N° Socio", minWidth: 95, align: "center" },
  { id: "nombre_calle", label: "Calle", minWidth: 150 },
  { id: "numero_casa", label: "N° Casa", minWidth: 80 },
  { id: "relacion_propiedad", label: "Relación", minWidth: 120 },
  { id: "fecha_registro", label: "F. Registro", minWidth: 120, align: "right" },
  { id: "fecha_edicion", label: "F. Edición", minWidth: 120, align: "right" },
  { id: "telefono", label: "Teléfono", minWidth: 120 },
  { id: "email", label: "Email", minWidth: 200 },
  { id: "acciones_certificado", label: "Solicitud", minWidth: 100 },
  { id: "acciones_editar", label: "Editar", minWidth: 80 },
  { id: "acciones_estado", label: "Estado", minWidth: 100 },
];

interface Data {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  numero_socio: number;
  nombre_calle: string;
  numero_casa: string;
  relacion_propiedad: string;
  fecha_registro: string;
  fecha_edicion: string;
  telefono: string;
  email: string;
  estado: number;
}

export default function ListaVecinos() {
  const theme = useTheme();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);

  // === ESTADO PARA EL ORDEN (ASC/DESC) ===
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [items, setItems] = React.useState<Data[]>([]);

  const [vecinosConSolicitud, setVecinosConSolicitud] = React.useState<
    Set<number>
  >(new Set());

  const fetchItems = async () => {
    try {
      const response = await api.get("/lista-vecinos/");
      setItems(response.data.vecinos || []);

      // Obtener solicitudes pendientes
      await fetchSolicitudesPendientes();
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setItems([]);
    }
  };

  // Función para obtener vecinos con solicitudes pendientes
  const fetchSolicitudesPendientes = async () => {
    try {
      const response = await api.get("/api/solicitudes");
      const pendientes = response.data
        .filter((sol: any) => sol.estado === "pendiente")
        .map((sol: any) => sol.vecino_id);

      setVecinosConSolicitud(new Set(pendientes));
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  };

  React.useEffect(() => {
    fetchItems();
  }, []);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterColumn, setFilterColumn] = React.useState("all");
  const [selectedCalles, setSelectedCalles] = React.useState<string[]>([]);
  const [selectedRelaciones, setSelectedRelaciones] = React.useState<string[]>(
    []
  );
  const [estadoFiltro, setEstadoFiltro] = React.useState<string>("todos");

  const handleCalleChange = (calle: string) => {
    setSelectedCalles((prev) =>
      prev.includes(calle) ? prev.filter((c) => c !== calle) : [...prev, calle]
    );
    setPage(0);
  };

  const handleRelacionChange = (relacion: string) => {
    setSelectedRelaciones((prev) =>
      prev.includes(relacion)
        ? prev.filter((r) => r !== relacion)
        : [...prev, relacion]
    );
    setPage(0);
  };

  const handleEstadoFiltroChange = (e: any) => {
    setEstadoFiltro(e.target.value);
    setPage(0);
  };

  // === FILTRADO ===
  const filteredRows = React.useMemo(() => {
    let filtered = items;
    if (searchTerm) {
      filtered = filtered.filter((item) => {
        if (filterColumn === "all") {
          return Object.values(item).some(
            (value) =>
              value != null &&
              value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          const columnValue = item[filterColumn as keyof Data];
          return (
            columnValue != null &&
            columnValue
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        }
      });
    }
    if (selectedCalles.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCalles.includes(item.nombre_calle)
      );
    }
    if (selectedRelaciones.length > 0) {
      filtered = filtered.filter((item) =>
        selectedRelaciones.includes(item.relacion_propiedad)
      );
    }
    if (estadoFiltro === "habilitados") {
      filtered = filtered.filter((item) => item.estado === 1);
    } else if (estadoFiltro === "deshabilitados") {
      filtered = filtered.filter((item) => item.estado === 0);
    }
    return filtered;
  }, [
    searchTerm,
    filterColumn,
    items,
    selectedCalles,
    selectedRelaciones,
    estadoFiltro,
  ]);

  // === ORDENAMIENTO (ID) ===
  const handleRequestSort = () => {
    setOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const sortedRows = React.useMemo(() => {
    const sorted = [...filteredRows];

    sorted.sort((a, b) => {
      if (order === "asc") {
        return a.id - b.id; // Menor a Mayor
      } else {
        return b.id - a.id; // Mayor a Menor
      }
    });

    return sorted;
  }, [filteredRows, order]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (e: any) => {
    setFilterColumn(e.target.value);
    setPage(0);
  };

  // === EXPORTAR A EXCEL ===
  const handleExportToExcel = async () => {
    const dataToExport = sortedRows.map((row) => ({
      ID: row.id,
      Nombres: row.nombres,
      "Apellido Paterno": row.apellido_paterno,
      "Apellido Materno": row.apellido_materno,
      RUT: formatearRutConPuntos(row.rut),
      "N° Socio": row.numero_socio,
      Calle: row.nombre_calle,
      "N° Casa": row.numero_casa,
      Relación: row.relacion_propiedad,
      Teléfono: row.telefono,
      Email: row.email,
      "Fecha Registro": row.fecha_registro,
      Estado: row.estado === 1 ? "Habilitado" : "Deshabilitado",
    }));
    await exportarAExcel(dataToExport, "Vecinos", "Reporte_Vecinos");
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
      borderColor: theme.palette.text.primary,
    },
    minHeight: "56px",
    display: "flex",
    alignItems: "center",
    "& .MuiSelect-icon, & .MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root":
      {
        color: "text.primary",
      },
    "&:before": { display: "none" },
  };

  const [modalOpen, setModalOpen] = React.useState(false);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleRegistroSuccess = () => {
    setModalOpen(false);
    fetchItems();
  };

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedVecinoId, setSelectedVecinoId] = React.useState<number | null>(
    null
  );

  const handleOpenEditModal = (vecinoId: number) => {
    setSelectedVecinoId(vecinoId);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedVecinoId(null);
  };
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedVecinoId(null);
    fetchItems();
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [vecinoToToggle, setVecinoToToggle] = React.useState<{
    id: number;
    nombre: string;
    estadoActual: number;
  } | null>(null);
  const [loadingToggle, setLoadingToggle] = React.useState(false);

  const handleToggleEstado = (
    vecinoId: number,
    estadoActual: number,
    nombreVecino: string
  ) => {
    setVecinoToToggle({
      id: vecinoId,
      nombre: nombreVecino,
      estadoActual: estadoActual,
    });
    setConfirmDialogOpen(true);
  };

  const handleConfirmToggleEstado = async () => {
    if (!vecinoToToggle) return;
    setLoadingToggle(true);
    try {
      const response = await api.patch(
        `/cambiar-estado-vecino/${vecinoToToggle.id}`
      );
      alert(
        `Vecino ${
          response.data.nuevo_estado === 1 ? "habilitado" : "deshabilitado"
        } exitosamente`
      );
      setConfirmDialogOpen(false);
      setVecinoToToggle(null);
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Error al cambiar el estado");
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleCancelToggleEstado = () => {
    setConfirmDialogOpen(false);
    setVecinoToToggle(null);
  };

  // === CREAR SOLICITUD DE CERTIFICADO ===
  const handleCrearSolicitud = async (
    vecinoId: number,
    nombreVecino: string
  ) => {
    if (
      !confirm(
        `¿Crear solicitud de certificado de residencia para ${nombreVecino}?\n\nEsta solicitud aparecerá en el panel de Solicitudes.`
      )
    ) {
      return;
    }

    try {
      const response = await api.post(
        "/api/solicitudes/crear-por-presidente",
        null,
        {
          params: { vecino_id: vecinoId },
        }
      );

      alert(response.data.mensaje || "Solicitud creada exitosamente");

      // Registrar en el historial
      try {
        await api.post("/historial/", {
          usuario: "Presidente",
          tipo_accion: "Crear Solicitud",
          descripcion_accion: `Se creó solicitud de certificado para ${nombreVecino}`,
        });
      } catch (historialError) {
        console.error("Error al registrar en historial:", historialError);
      }

      // Actualizar la lista para reflejar el cambio
      await fetchItems();
    } catch (error: any) {
      console.error("Error al crear solicitud:", error);
      alert(
        error.response?.data?.detail ||
          "Error al crear la solicitud. Intenta nuevamente."
      );
    }
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
        backgroundImage: "none",
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
              placeholder="Buscar vecinos..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  backgroundColor: "transparent",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "4px",
                  transition: "all 0.2s",
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
                displayEmpty
                variant="outlined"
                sx={{
                  ...commonFilterStyle,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  width: "100%",
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
                <MenuItem value="nombres">Nombres</MenuItem>
                <MenuItem value="apellido_paterno">Ap. Paterno</MenuItem>
                <MenuItem value="rut">RUT</MenuItem>
                <MenuItem value="nombre_calle">Calle</MenuItem>
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
                displayEmpty
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
                <MenuItem value="habilitados">Activos</MenuItem>
                <MenuItem value="deshabilitados">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* FILTRO CALLE */}
          <Grid size={{ xs: 6, md: 1.5 }}>
            <Accordion sx={commonFilterStyle} disableGutters elevation={0}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  minHeight: "56px",
                  width: "100%",
                  "& .MuiAccordionSummary-content": { marginRight: 5 },
                }}
              >
                <Typography noWrap sx={{ fontSize: "0.9rem" }}>
                  Calle
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  backgroundColor: "background.paper",
                  color: "text.primary",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 10,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[4],
                  borderRadius: "0 0 4px 4px",
                  padding: 1,
                }}
              >
                <FormGroup>
                  {CALLES.map((calle) => (
                    <FormControlLabel
                      key={calle}
                      control={
                        <Checkbox
                          checked={selectedCalles.includes(calle)}
                          onChange={() => handleCalleChange(calle)}
                          sx={{
                            color: "text.secondary",
                            "&.Mui-checked": { color: "#3b82f6" },
                          }}
                        />
                      }
                      label={<Typography variant="body2">{calle}</Typography>}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* FILTRO RELACIÓN */}
          <Grid size={{ xs: 6, md: 1.5 }}>
            <Accordion sx={commonFilterStyle} disableGutters elevation={0}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  minHeight: "56px",
                  width: "100%",
                  "& .MuiAccordionSummary-content": { margin: 2 },
                }}
              >
                <Typography noWrap sx={{ fontSize: "0.9rem" }}>
                  Relación
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  backgroundColor: "background.paper",
                  color: "text.primary",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 10,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[4],
                  borderRadius: "0 0 4px 4px",
                  padding: 1,
                }}
              >
                <FormGroup>
                  {RELACIONES_PROPIEDAD.map((relacion) => (
                    <FormControlLabel
                      key={relacion}
                      control={
                        <Checkbox
                          checked={selectedRelaciones.includes(relacion)}
                          onChange={() => handleRelacionChange(relacion)}
                          sx={{
                            color: "text.secondary",
                            "&.Mui-checked": { color: "#3b82f6" },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2">{relacion}</Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
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

          {/* BOTÓN REGISTRAR */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
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
              Nuevo
            </Button>
          </Grid>
        </Grid>

        {/* Resumen de Filtros */}
        {(searchTerm ||
          selectedCalles.length > 0 ||
          selectedRelaciones.length > 0 ||
          estadoFiltro !== "todos") && (
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Resultados: {filteredRows.length}
            </Typography>
          </Box>
        )}
      </Box>

      {/* TABLA */}
      <TableContainer
        sx={{
          flex: 1,
          backgroundColor: "transparent",
          boxShadow: "none",
          border: "none",
        }}
      >
        <Table stickyHeader aria-label="sticky table">
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
                  sortDirection={column.id === "id" ? order : false}
                >
                  {column.id === "id" ? (
                    <TableSortLabel
                      active={true}
                      direction={order}
                      onClick={handleRequestSort}
                    >
                      {column.label}
                      <Box component="span" sx={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </Box>
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                // Verificar si el vecino tiene solicitud pendiente
                const tieneSolicitudPendiente = vecinosConSolicitud.has(row.id);

                return (
                  <TableRow
                    hover
                    key={row.id}
                    sx={{
                      backgroundColor: "transparent",
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05) !important"
                            : "rgba(0,0,0,0.04) !important",
                      },
                    }}
                  >
                    {columns.map((column) => {
                      const cellStyle = {
                        color: "text.primary",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      };

                      if (column.id === "id") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {row.id}
                            </Typography>
                          </TableCell>
                        );
                      }
                      if (column.id === "rut") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            {formatearRutConPuntos(row.rut)}
                          </TableCell>
                        );
                      }

                      if (column.id === "acciones_certificado") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            <IconButton
                              onClick={() =>
                                handleCrearSolicitud(
                                  row.id,
                                  `${row.nombres} ${row.apellido_paterno}`
                                )
                              }
                              size="small"
                              title={
                                row.estado !== 1
                                  ? "Vecino inactivo"
                                  : tieneSolicitudPendiente
                                  ? "Ya tiene una solicitud pendiente"
                                  : "Crear solicitud de certificado"
                              }
                              sx={{ color: "#9c27b0" }}
                              disabled={
                                row.estado !== 1 || tieneSolicitudPendiente
                              }
                            >
                              <AssignmentIcon />
                            </IconButton>
                          </TableCell>
                        );
                      }
                      if (column.id === "acciones_editar") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            <IconButton
                              onClick={() => handleOpenEditModal(row.id)}
                              size="small"
                              title="Editar vecino"
                              sx={{ color: "#64b5f6" }}
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        );
                      }
                      if (column.id === "acciones_estado") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            <IconButton
                              color={row.estado === 1 ? "success" : "error"}
                              onClick={() =>
                                handleToggleEstado(
                                  row.id,
                                  row.estado,
                                  row.nombres
                                )
                              }
                              size="small"
                              title={
                                row.estado === 1
                                  ? "Deshabilitar vecino"
                                  : "Habilitar vecino"
                              }
                              disabled={loadingToggle}
                            >
                              {row.estado === 1 ? (
                                <ToggleOnIcon />
                              ) : (
                                <ToggleOffIcon />
                              )}
                            </IconButton>
                          </TableCell>
                        );
                      }
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={cellStyle}
                        >
                          {value || "-"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
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

      {/* Modales y Diálogos */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title="Registrar Nuevo Vecino"
        maxWidth="md"
      >
        <RegistroVecinoForm
          onSuccess={handleRegistroSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>
      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        title="Editar Vecino"
        maxWidth="md"
      >
        {selectedVecinoId && (
          <EditarVecinoForm
            vecinoId={selectedVecinoId}
            onSuccess={handleEditSuccess}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirmar cambio de estado"
        message={
          vecinoToToggle
            ? `¿Estás seguro de que deseas ${
                vecinoToToggle.estadoActual === 1 ? "deshabilitar" : "habilitar"
              } al vecino "${vecinoToToggle.nombre}"?`
            : ""
        }
        confirmText={
          vecinoToToggle?.estadoActual === 1 ? "Deshabilitar" : "Habilitar"
        }
        cancelText="Cancelar"
        onConfirm={handleConfirmToggleEstado}
        onCancel={handleCancelToggleEstado}
        loading={loadingToggle}
      />
    </Paper>
  );
}
