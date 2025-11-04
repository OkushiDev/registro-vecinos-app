import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";

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

// Definición de la interfaz para las columnas de la tabla.
interface Column {
  id:
    | "nombres"
    | "apellido_paterno"
    | "apellido_materno"
    | "rut"
    | "numero_socio"
    | "direccion"
    | "fecha_registro"
    | "fecha_ultima_edicion"
    | "telefono"
    | "correo";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: any) => string;
}

// Definición de las columnas de la tabla de vecinos.
const columns: readonly Column[] = [
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
    id: "fecha_ultima_edicion",
    label: "Última Edición",
    minWidth: 120,
    align: "right",
  },
  { id: "telefono", label: "Teléfono", minWidth: 120 },
  { id: "correo", label: "Correo", minWidth: 200 },
];

// Definición de la interfaz para los datos de cada vecino.
interface Data {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  numero_socio: number;
  direccion: string;
  fecha_registro: string;
  fecha_ultima_edicion: string;
  telefono: string;
  correo: string;
}

// Función para crear los datos de vecinos.
function createData(
  nombres: string,
  apellido_paterno: string,
  apellido_materno: string,
  rut: string,
  numero_socio: number,
  direccion: string,
  fecha_registro: Date,
  fecha_ultima_edicion: Date,
  telefono: string = "",
  correo: string = ""
): Data {
  return {
    nombres,
    apellido_paterno,
    apellido_materno,
    rut,
    numero_socio,
    direccion,
    fecha_registro: fecha_registro.toLocaleDateString("es-ES"),
    fecha_ultima_edicion: fecha_ultima_edicion.toLocaleDateString("es-ES"),
    telefono,
    correo,
  };
}

// Datos de ejemplo para los vecinos. Eventualmente, estos datos vendrán de una API o base de datos
const rows = [
  createData(
    "Juan Carlos",
    "González",
    "Pérez",
    "12.345.678-9",
    1001,
    "Av. Principal 123",
    new Date("2023-01-15"),
    new Date("2023-01-15"),
    "9 8765 4321",
    "juan.gonzalez@email.com"
  ),
  createData(
    "María Elena",
    "Rodríguez",
    "Silva",
    "98.765.432-1",
    1002,
    "Calle Secundaria 456",
    new Date("2023-02-20"),
    new Date("2023-03-10"),
    "9 1234 5678",
    "maria.rodriguez@email.com"
  ),
  createData(
    "Pedro Antonio",
    "Martínez",
    "López",
    "11.222.333-4",
    1003,
    "Pasaje Los Aromos 789",
    new Date("2023-03-05"),
    new Date("2023-03-05"),
    "",
    "pedro.martinez@email.com"
  ),
  createData(
    "Ana Sofía",
    "Fernández",
    "García",
    "55.666.777-8",
    1004,
    "Av. Las Flores 321",
    new Date("2023-03-12"),
    new Date("2023-04-01"),
    "9 9876 5432",
    ""
  ),
  createData(
    "Luis Miguel",
    "Vargas",
    "Muñoz",
    "33.444.555-6",
    1005,
    "Calle Los Pinos 654",
    new Date("2023-04-08"),
    new Date("2023-04-08"),
    "9 5555 6666",
    "luis.vargas@email.com"
  ),
  createData(
    "Carmen Rosa",
    "Jiménez",
    "Torres",
    "77.888.999-0",
    1006,
    "Av. Central 987",
    new Date("2023-04-15"),
    new Date("2023-05-02"),
    "",
    "carmen.jimenez@email.com"
  ),
  createData(
    "Roberto Carlos",
    "Herrera",
    "Campos",
    "22.333.444-5",
    1007,
    "Pasaje San Juan 147",
    new Date("2023-05-01"),
    new Date("2023-05-01"),
    "9 7777 8888",
    ""
  ),
  createData(
    "Patricia Isabel",
    "Morales",
    "Vega",
    "66.777.888-9",
    1008,
    "Calle Norte 258",
    new Date("2023-05-10"),
    new Date("2023-06-15"),
    "9 3333 4444",
    "patricia.morales@email.com"
  ),
  createData(
    "Diego Alejandro",
    "Castro",
    "Rojas",
    "44.555.666-7",
    1009,
    "Av. Sur 369",
    new Date("2023-05-20"),
    new Date("2023-05-20"),
    "9 2222 3333",
    "diego.castro@email.com"
  ),
  createData(
    "Gabriela Antonia",
    "Mendoza",
    "Flores",
    "88.999.000-1",
    1010,
    "Calle Oriente 741",
    new Date("2023-06-01"),
    new Date("2023-07-08"),
    "",
    ""
  ),
  createData(
    "Andrés Felipe",
    "Sánchez",
    "Guerrero",
    "00.111.222-3",
    1011,
    "Pasaje Poniente 852",
    new Date("2023-06-15"),
    new Date("2023-06-15"),
    "9 6666 7777",
    "andres.sanchez@email.com"
  ),
  createData(
    "Valentina Esperanza",
    "Ramírez",
    "Contreras",
    "99.000.111-2",
    1012,
    "Av. Libertad 963",
    new Date("2023-07-01"),
    new Date("2023-08-12"),
    "9 4444 5555",
    "valentina.ramirez@email.com"
  ),
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

  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = React.useState("");
  // Estado para la columna por la cual se filtrará
  const [filterColumn, setFilterColumn] = React.useState("all");

  // Filtrar filas basado en el término de búsqueda y columna seleccionada
  const filteredRows = React.useMemo(() => {
    if (!searchTerm) return rows;

    return rows.filter((row) => {
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
  }, [searchTerm, filterColumn]);

  //Función para resetear página cuando se busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0); // Resetear a primera página al buscar
  };

  const handleFilterChange = (e: any) => {
    setFilterColumn(e.target.value);
    setPage(0); // Resetear a primera página al cambiar filtro
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
        </Grid>
      </Box>

      {searchTerm && (
        <Box sx={{ mt: 1, px: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {filteredRows.length} de {rows.length} registros
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
    </Paper>
  );
}
