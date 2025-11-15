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
  id: "id" | "descripcion_accion" | "tipo_accion" | "fecha_accion" | "usuario";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: any) => string;
}
// Definición de las columnas de la tabla de historial de acciones.
const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 170 },
  { id: "descripcion_accion", label: "Descripción", minWidth: 100 },
  {
    id: "tipo_accion",
    label: "Tipo de Acción",
    minWidth: 170,
    align: "right",
  },
  {
    id: "fecha_accion",
    label: "Fecha de Acción",
    minWidth: 170,
    align: "right",
  },
  {
    id: "usuario",
    label: "Usuario",
    minWidth: 170,
    align: "right",
  },
];
// Definición de la interfaz para los datos de cada fila en la tabla.
interface Data {
  id: number;
  descripcion_accion: string;
  tipo_accion: string;
  fecha_accion: string;
  usuario: string;
}

// Funcion para crear los datos de historial de acciones. Esta funcion manejara los datos de historial de acciones
function createData(
  id: number,
  descripcion_accion: string,
  tipo_accion: string,
  fecha_accion: Date,
  usuario: string
): Data {
  return {
    id,
    descripcion_accion,
    tipo_accion,
    fecha_accion: fecha_accion.toLocaleDateString("es-ES"),
    usuario,
  };
}

// Datos de ejemplo para el historial. Eventualmente, estos datos vendrán de una API o base de datos
const rows = [
  createData(1, "Descripción 1", "Tipo 1", new Date("2023-01-01"), "Usuario 1"),
  createData(2, "Descripción 2", "Tipo 2", new Date("2023-01-02"), "Usuario 2"),
  createData(3, "Descripción 3", "Tipo 3", new Date("2023-01-03"), "Usuario 3"),
  createData(4, "Descripción 4", "Tipo 4", new Date("2023-01-04"), "Usuario 4"),
  createData(5, "Descripción 5", "Tipo 5", new Date("2023-01-05"), "Usuario 5"),
  createData(6, "Descripción 6", "Tipo 6", new Date("2023-01-06"), "Usuario 6"),
  createData(7, "Descripción 7", "Tipo 7", new Date("2023-01-07"), "Usuario 7"),
  createData(8, "Descripción 8", "Tipo 8", new Date("2023-01-08"), "Usuario 8"),
  createData(9, "Descripción 9", "Tipo 9", new Date("2023-01-09"), "Usuario 9"),
  createData(
    10,
    "Descripción 10",
    "Tipo 10",
    new Date("2023-01-10"),
    "Usuario 10"
  ),
  createData(
    11,
    "Descripción 11",
    "Tipo 11",
    new Date("2023-01-11"),
    "Usuario 11"
  ),
  createData(
    12,
    "Descripción 12",
    "Tipo 12",
    new Date("2023-01-12"),
    "Usuario 12"
  ),
];

//// Componente principal para mostrar el historial de acciones
export default function Historial() {
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
  // Función para formatear los valores de las celdas, especialmente para fechas
  const formatCellValue = (column: Column, value: any): string | number => {
    if (column.format && value instanceof Date) {
      return column.format(value);
    }
    if (value instanceof Date) {
      return value.toLocaleDateString("es-ES");
    }
    return value;
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
              placeholder="Buscar en historial..."
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
                <MenuItem value="descripcion_accion">Descripción</MenuItem>
                <MenuItem value="tipo_accion">Tipo de Acción</MenuItem>
                <MenuItem value="usuario">Usuario</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {searchTerm && (
        <Box sx={{ mt: 1 }}>
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
              .map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];

                      return (
                        <TableCell key={column.id} align={column.align}>
                          {value}{" "}
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
      />
    </Paper>
  );
}
