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
import Modal from '../Modal';
import RegistroVecinoForm from '../RegistroVecinoForm';

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
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

// Definición de la interfaz para las columnas de la tabla.
interface Column {
  id:
    | "id"
    | "nombres"
    | "apellido_paterno"
    | "apellido_materno"
    | "rut"
    | "numero_socio"
    | "direccion"
    | "fecha_registro"
    | "fecha_edicion"
    | "telefono"
    | "correo"
    | "acciones_editar"
    | "acciones_estado";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: any) => string;
}

// Definición de las columnas de la tabla de vecinos.
const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 50},   
  { id: "nombres", label: "Nombres", minWidth: 150 },
  { id: "apellido_paterno", label: "Apellido Paterno", minWidth: 120 },
  { id: "apellido_materno", label: "Apellido Materno", minWidth: 120 },
  { id: "rut", label: "RUT", minWidth: 100 },
  { id: "numero_socio", label: "N° Socio", minWidth: 80, align: "right" },
  { id: "direccion", label: "Dirección", minWidth: 200 },
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
  { id: "correo", label: "Correo", minWidth: 200 },
  { id: "acciones_editar", label: "Editar", minWidth: 80},
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
  direccion: string;
  fecha_registro: string;
  fecha_edicion: string;
  telefono: string;
  correo: string;
  estado: number;
}

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
      console.log('Respuesta completa:', response);
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

  // Filtrar filas basado en el término de búsqueda y columna seleccionada
  const filteredRows = React.useMemo(() => {
    if (!searchTerm) return items;

    return items.filter((item) => {
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
  }, [searchTerm, filterColumn, items]);

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

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {/* Barra de búsqueda con filtros */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
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
          <Grid item xs={12} md={4}>
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
                <MenuItem value="direccion">Dirección</MenuItem>
                <MenuItem value="telefono">Teléfono</MenuItem>
                <MenuItem value="correo">Correo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
              sx={{ height: '56px' }} // Mismo alto que los otros campos
            >
              Registrar Vecino
            </Button>
          </Grid>

        </Grid>
      </Box>

      {searchTerm && (
        <Box sx={{ mt: 1, px: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {filteredRows.length} de {items.length} registros
            {filterColumn !== "all" &&
              ` (filtrado por ${
                columns.find((col) => col.id === filterColumn)?.label
              })`}
          </Typography>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: 440 }}>
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
                    key={`${row.rut}-${index}`}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    {columns.map((column) => {
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
    </Paper>
  );
}
