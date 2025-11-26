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

// Importación de XLSX para descargar historial
import * as XLSX from 'xlsx';

// Importación de la API
import api from "../../api";

// Componentes UI
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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { visuallyHidden } from "@mui/utils";

// Definición de Columnas (ORDEN ACTUALIZADO)
interface Column {
  id: "id" | "usuario" | "tipo_accion" | "descripcion_accion" | "fecha_accion";
  label: string;
  minWidth?: number;
  align?: "right";
  sortable?: boolean;
}

const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 50, sortable: true },
  { id: "usuario", label: "Usuario", minWidth: 120 }, // Movidó aquí
  { id: "tipo_accion", label: "Acción", minWidth: 120 }, // Movidó aquí
  { id: "descripcion_accion", label: "Descripción", minWidth: 250 }, // Movidó aquí y aumentado ancho
  { id: "fecha_accion", label: "Fecha y Hora", minWidth: 170, align: "right" },
];

// Interfaz de Datos
interface Data {
  id: number;
  descripcion_accion: string;
  tipo_accion: string;
  fecha_accion: string;
  usuario: string;
}

// Tipos para el ordenamiento
type Order = 'asc' | 'desc';

export default function Historial() {
  const theme = useTheme();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [loading, setLoading] = React.useState(true);

  // === ESTADOS PARA ORDENAMIENTO ===
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('id');

  // === OBTENER DATOS ===
  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const response = await api.get("/historial/"); 
      setRows(response.data || []);
    } catch (error) {
      console.error("Error al obtener el historial:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistorial();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // === MANEJO DEL ORDENAMIENTO ===
  const handleRequestSort = (property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // === BUSCADOR Y FILTROS ===
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterColumn, setFilterColumn] = React.useState("all");

  const filteredRows = React.useMemo(() => {
    if (!searchTerm) return rows;

    return rows.filter((row) => {
      if (filterColumn === "all") {
        return Object.values(row).some((value) =>
          value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
        );
      } else {
        const val = row[filterColumn as keyof Data];
        return val ? val.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false;
      }
    });
  }, [searchTerm, filterColumn, rows]);

  // === APLICAR ORDENAMIENTO ===
  const sortedRows = React.useMemo(() => {
    const sorted = [...filteredRows];
    
    sorted.sort((a, b) => {
        if (orderBy === 'id') {
            return order === 'asc' ? a.id - b.id : b.id - a.id;
        }
        return 0;
    });

    return sorted;
  }, [filteredRows, order, orderBy]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (e: any) => {
    setFilterColumn(e.target.value);
    setPage(0);
  };

  // === EXPORTAR A EXCEL (Orden actualizado también aquí) ===
  const handleExportToExcel = () => {
    const dataToExport = sortedRows.map((row) => ({
      ID: row.id,
      Usuario: row.usuario,        // <--- Actualizado orden
      Acción: row.tipo_accion,     // <--- Actualizado orden
      Descripción: row.descripcion_accion,
      Fecha: new Date(row.fecha_accion).toLocaleString("es-CL"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Historial_Acciones_${date}.xlsx`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("es-CL", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  const commonFilterStyle = {
    backgroundColor: "background.paper",
    color: "text.primary",
    borderRadius: "4px",
    border: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar en historial..."
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
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
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
                sx: { height: "56px" }
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "text.secondary" }}>Buscar en</InputLabel>
              <Select
                value={filterColumn}
                label="Buscar en"
                onChange={handleFilterChange}
                displayEmpty
                variant="outlined"
                sx={{
                    ...commonFilterStyle,
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    width: "100%"
                }}
                MenuProps={{
                  PaperProps: { 
                      sx: { bgcolor: "background.paper", color: "text.primary", backgroundImage: "none" } 
                    },
                }}
              >
                <MenuItem value="all">Todo</MenuItem>
                <MenuItem value="usuario">Usuario</MenuItem>
                <MenuItem value="tipo_accion">Acción</MenuItem>
                <MenuItem value="descripcion_accion">Descripción</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
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
              Descargar Reporte
            </Button>
          </Grid>
        </Grid>
      </Box>

      {searchTerm && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Registros encontrados: {filteredRows.length}
          </Typography>
        </Box>
      )}

      <TableContainer sx={{ flex: 1, backgroundColor: "transparent" }}>
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
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
                    <TableCell colSpan={5} align="center" sx={{ color: "text.primary", py: 4 }}>
                        Cargando historial...
                    </TableCell>
                </TableRow>
            ) : filteredRows.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", py: 4 }}>
                        No hay registros de acciones.
                    </TableCell>
                </TableRow>
            ) : (
                sortedRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                    return (
                    <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.id}
                        sx={{
                            backgroundColor: "transparent",
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:hover": { 
                                backgroundColor: theme.palette.mode === 'dark' 
                                ? "rgba(255,255,255,0.05) !important"
                                : "rgba(0,0,0,0.04) !important" 
                            },
                        }}
                    >
                        {columns.map((column) => {
                        const cellStyle = {
                            color: "text.primary",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        };
                        
                        let value = row[column.id];
                        if (column.id === 'fecha_accion') {
                            value = formatDate(row.fecha_accion);
                        }

                        return (
                            <TableCell key={column.id} align={column.align} sx={cellStyle}>
                            {value}
                            </TableCell>
                        );
                        })}
                    </TableRow>
                    );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
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