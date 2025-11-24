import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";

// Importación de la API configurada
import api from "../../api";

// Importaciones para el modal y formulario de registro
import Modal from "../Modal";
import RegistroVecinoForm from "../RegistroVecinoForm";

// Importaciones adicionales para búsqueda y filtrado
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

// Importaciones para el botón de registrar vecino
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

// Importaciones para los íconos de acciones (editar, activar/desactivar)
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

// Agregar esta importación al inicio del archivo
import EditarVecinoForm from "../EditarVecinoForm";

// Agregar esta importación al inicio del archivo
import ConfirmDialog from "../ConfirmDialog";

// Importaciones para los checkboxes de filtrado
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ForkRight } from "@mui/icons-material";

// Definición de la interfaz para las columnas de la tabla.
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
    | "acciones_editar"
    | "acciones_estado";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: any) => string;
}

// Definición de las columnas de la tabla de vecinos.
const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 50 },
  { id: "nombres", label: "Nombres", minWidth: 150 },
  { id: "apellido_paterno", label: "Apellido Paterno", minWidth: 120 },
  { id: "apellido_materno", label: "Apellido Materno", minWidth: 120 },
  { id: "rut", label: "RUT", minWidth: 120 },
  { id: "numero_socio", label: "N° Socio", minWidth: 80, align: "right" },
  { id: "nombre_calle", label: "Calle", minWidth: 150 },
  { id: "numero_casa", label: "N° Casa", minWidth: 80 },
  { id: "relacion_propiedad", label: "Relación Propiedad", minWidth: 120 },
  {
    id: "fecha_registro",
    label: "Fecha Registro",
    minWidth: 120,
    align: "right",
  },
  {
    id: "fecha_edicion",
    label: "Última Edición",
    minWidth: 120,
    align: "right",
  },
  { id: "telefono", label: "Teléfono", minWidth: 120 },
  { id: "email", label: "Email", minWidth: 200 },
  { id: "acciones_editar", label: "Editar", minWidth: 80 },
  { id: "acciones_estado", label: "Estado", minWidth: 100 },
];

// Definición de la interfaz para los datos de cada vecino.
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

// Función para formatear RUT con puntos y guión
const formatearRutConPuntos = (rut: string): string => {
  if (!rut) return "-";

  // Limpiar el RUT (quitar puntos y guiones)
  const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").trim();

  if (rutLimpio.length < 2) return rut;

  // Separar número y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Formatear el cuerpo con puntos
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpoFormateado}-${dv}`;
};

// Listas para los filtros
const CALLES = [
  "Boticelli",
  "Giovanni Bocaccio",
  "Leonardo da Vinci",
  "Lourdes",
  "Miguel Angel",
  "Rio Loco",
  "Tizano",
];

const RELACIONES_PROPIEDAD = [
  "Propietario",
  "Arrendatario",
  "Residente",
  "Otro",
];

// Componente principal para mostrar la lista de vecinos
export default function ListaVecinos() {
  // Con esto se manejara la paginación de la tabla (Pagina 1, Pagina 2, etc). Se define para iniciar en la pagina 0
  const [page, setPage] = React.useState(0);
  // Con esto se manejara la cantidad de filas por página. Se define para iniciar con 10 filas por página
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // Función para manejar el cambio de página (Ejemplo, al dar click en "Pagina siguiente" o "Pagina anterior")
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  // Función para manejar el cambio de filas por página (Ejemplo, al seleccionar 10, 25 o 100 filas por página)
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [items, setItems] = React.useState<Data[]>([]);
  // Función para obtener los datos de la API
  const fetchItems = async () => {
    try {
      console.log("Intentando conectar con API...");
      const response = await api.get("/lista-vecinos/");
      setItems(response.data.vecinos || []); //Extae el array de vecinos
      console.log("Respuesta completa:", response);
      console.log("datos recibidos:", response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setItems([]); // Establece items como un array vacío en caso de error
    }
  };

  React.useEffect(() => {
    fetchItems();
  }, []);

  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = React.useState("");
  // Estado para la columna por la cual se filtrará
  const [filterColumn, setFilterColumn] = React.useState("all");

  // Estados para filtros por checkboxes
  const [selectedCalles, setSelectedCalles] = React.useState<string[]>([]);
  const [selectedRelaciones, setSelectedRelaciones] = React.useState<string[]>(
    []
  );

  // Estado para filtro de estado (habilitado/deshabilitado/todos)
  const [estadoFiltro, setEstadoFiltro] = React.useState<string>("todos");

  // Función para manejar cambios en checkboxes de calles
  const handleCalleChange = (calle: string) => {
    setSelectedCalles((prev) =>
      prev.includes(calle) ? prev.filter((c) => c !== calle) : [...prev, calle]
    );
    setPage(0);
  };

  // Función para manejar cambios en checkboxes de relaciones
  const handleRelacionChange = (relacion: string) => {
    setSelectedRelaciones((prev) =>
      prev.includes(relacion)
        ? prev.filter((r) => r !== relacion)
        : [...prev, relacion]
    );
    setPage(0);
  };

  // Función para manejar cambios en el filtro de estado
  const handleEstadoFiltroChange = (e: any) => {
    setEstadoFiltro(e.target.value);
    setPage(0);
  };

  // Filtrar filas basado en el término de búsqueda, columna seleccionada y checkboxes
  const filteredRows = React.useMemo(() => {
    let filtered = items;

    // Filtrar por búsqueda de texto
    if (searchTerm) {
      filtered = filtered.filter((item) => {
        if (filterColumn === "all") {
          return Object.values(item).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          return item[filterColumn as keyof Data]
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        }
      });
    }

    // Filtrar por calles seleccionadas
    if (selectedCalles.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCalles.includes(item.nombre_calle)
      );
    }

    // Filtrar por relaciones seleccionadas
    if (selectedRelaciones.length > 0) {
      filtered = filtered.filter((item) =>
        selectedRelaciones.includes(item.relacion_propiedad)
      );
    }

    // Filtrar por estado
    if (estadoFiltro === "habilitados") {
      filtered = filtered.filter((item) => item.estado === 1);
    } else if (estadoFiltro === "deshabilitados") {
      filtered = filtered.filter((item) => item.estado === 0);
    }
    // Si es "todos", no se filtra por estado

    return filtered;
  }, [
    searchTerm,
    filterColumn,
    items,
    selectedCalles,
    selectedRelaciones,
    estadoFiltro,
  ]);

  //Función para resetear página cuando se busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0); // Resetear a primera página al buscar
  };

  const handleFilterChange = (e: any) => {
    setFilterColumn(e.target.value);
    setPage(0); // Resetear a primera página al cambiar filtro
  };

  // Estado para manejar la apertura del modal de registro
  const [modalOpen, setModalOpen] = React.useState(false);

  // Función para abrir el modal
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Función para manejar el éxito del registro
  const handleRegistroSuccess = () => {
    setModalOpen(false);
    fetchItems(); // Recargar la lista de vecinos
  };

  // Estados y funciones para manejar la edición de vecinos
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedVecinoId, setSelectedVecinoId] = React.useState<number | null>(
    null
  );

  // Funciones para manejar la edición
  const handleOpenEditModal = (vecinoId: number) => {
    console.log("Abriendo modal de edición para vecino ID:", vecinoId);
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
    fetchItems(); // Recargar la lista de vecinos
  };

  // Agregar estos estados después de los existentes
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [vecinoToToggle, setVecinoToToggle] = React.useState<{
    id: number;
    nombre: string;
    estadoActual: number;
  } | null>(null);
  const [loadingToggle, setLoadingToggle] = React.useState(false);

  // Reemplazar la función handleToggleEstado existente con esta nueva:
  const handleToggleEstado = (
    vecinoId: number,
    estadoActual: number,
    nombreVecino: string
  ) => {
    console.log(`Preparando cambio de estado para vecino ${vecinoId}`);
    setVecinoToToggle({
      id: vecinoId,
      nombre: nombreVecino,
      estadoActual: estadoActual,
    });
    setConfirmDialogOpen(true);
  };

  // Agregar estas nuevas funciones:
  const handleConfirmToggleEstado = async () => {
    if (!vecinoToToggle) return;

    setLoadingToggle(true);

    try {
      console.log(`Cambiando estado del vecino ${vecinoToToggle.id}`);

      const response = await api.patch(
        `/cambiar-estado-vecino/${vecinoToToggle.id}`
      );
      console.log("Estado cambiado exitosamente:", response.data);

      // Mostrar mensaje de éxito
      const nuevoEstado = response.data.nuevo_estado;
      const estadoTexto = nuevoEstado === 1 ? "habilitado" : "deshabilitado";
      alert(`Vecino ${estadoTexto} exitosamente`);

      // Cerrar el diálogo y limpiar estados
      setConfirmDialogOpen(false);
      setVecinoToToggle(null);

      // Recargar la lista para mostrar los cambios
      fetchItems();
    } catch (error: any) {
      console.error("Error al cambiar estado del vecino:", error);

      let errorMessage = "Error al cambiar el estado del vecino";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      alert(errorMessage);
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleCancelToggleEstado = () => {
    setConfirmDialogOpen(false);
    setVecinoToToggle(null);
  };

  return (
    <Paper
      sx={{
        width: "100%",
        height: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Barra de búsqueda con filtros */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="flex-start">
          {/* Primera fila: Búsqueda, Filtro de columna y Botón Registrar */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar vecinos..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Buscar en</InputLabel>
              <Select
                value={filterColumn}
                label="Buscar en"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">Todas las columnas</MenuItem>
                <MenuItem value="nombres">Nombres</MenuItem>
                <MenuItem value="apellido_paterno">Apellido Paterno</MenuItem>
                <MenuItem value="apellido_materno">Apellido Materno</MenuItem>
                <MenuItem value="rut">RUT</MenuItem>
                <MenuItem value="numero_socio">N° Socio</MenuItem>
                <MenuItem value="numero_casa">N° Casa</MenuItem>
                <MenuItem value="telefono">Teléfono</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFiltro}
                label="Estado"
                onChange={handleEstadoFiltroChange}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="habilitados">Habilitados</MenuItem>
                <MenuItem value="deshabilitados">Deshabilitados</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Segunda fila: Filtros por checkboxes */}
          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Filtrar por Calle
                  {selectedCalles.length > 0 && ` (${selectedCalles.length})`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  boxShadow: 3,
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 1001,
                  border: "1px solid",
                  borderColor: "divider",
                  borderTop: "none",
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
                        />
                      }
                      label={calle}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Filtrar por Relación con Propiedad
                  {selectedRelaciones.length > 0 &&
                    ` (${selectedRelaciones.length})`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  boxShadow: 3,
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 1000,
                  border: "1px solid",
                  borderColor: "divider",
                  borderTop: "none",
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
                        />
                      }
                      label={relacion}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
              sx={{ height: "56px" }}
            >
              Registrar Vecino
            </Button>
          </Grid>
        </Grid>

        {(searchTerm ||
          selectedCalles.length > 0 ||
          selectedRelaciones.length > 0 ||
          estadoFiltro !== "todos") && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {filteredRows.length} de {items.length} registros
              {filterColumn !== "all" &&
                searchTerm &&
                ` (búsqueda en ${
                  columns.find((col) => col.id === filterColumn)?.label
                })`}
              {selectedCalles.length > 0 &&
                ` • Calles: ${selectedCalles.join(", ")}`}
              {selectedRelaciones.length > 0 &&
                ` • Relaciones: ${selectedRelaciones.join(", ")}`}
              {estadoFiltro !== "todos" &&
                ` • Estado: ${
                  estadoFiltro === "habilitados"
                    ? "Habilitados"
                    : "Deshabilitados"
                }`}
            </Typography>
          </Box>
        )}
      </Box>

      <TableContainer sx={{ flex: 1 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={`${row.id}-${index}`}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    {columns.map((column) => {
                      // Columna de ID
                      if (column.id === "id") {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            <Typography variant="body2" fontWeight="bold">
                              {row.id}
                            </Typography>
                          </TableCell>
                        );
                      }

                      // Columna de RUT - formatear con puntos
                      if (column.id === "rut") {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {formatearRutConPuntos(row.rut)}
                          </TableCell>
                        );
                      }

                      // Columna de botón Editar
                      if (column.id === "acciones_editar") {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenEditModal(row.id)}
                              size="small"
                              title="Editar vecino"
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        );
                      }

                      // Columna de botón Estado (Habilitar/Deshabilitar)
                      if (column.id === "acciones_estado") {
                        return (
                          <TableCell key={column.id} align={column.align}>
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

                      // Para las demás columnas, mostrar el valor normal
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
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
      />
      {/* Modal para registro de vecino */}
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
