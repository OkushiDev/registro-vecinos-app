import * as React from "react";
import { useTheme } from "@mui/material/styles"; // Hook para el tema
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";

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

// Definición de Columnas
interface Column {
  id: "id" | "descripcion_accion" | "tipo_accion" | "fecha_accion" | "usuario";
  label: string;
  minWidth?: number;
  align?: "right";
}

const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 50 },
  { id: "descripcion_accion", label: "Descripción", minWidth: 200 },
  { id: "tipo_accion", label: "Tipo Acción", minWidth: 120 },
  { id: "usuario", label: "Usuario", minWidth: 120 },
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

export default function Historial() {
  const theme = useTheme(); // Acceso al tema actual
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [loading, setLoading] = React.useState(true);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (e: any) => {
    setFilterColumn(e.target.value);
    setPage(0);
  };

  // === EXPORTAR A EXCEL ===
  const handleExportToExcel = () => {
    const dataToExport = filteredRows.map((row) => ({
      ID: row.id,
      Descripción: row.descripcion_accion,
      "Tipo Acción": row.tipo_accion,
      Usuario: row.usuario,
      Fecha: new Date(row.fecha_accion).toLocaleString("es-CL"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Historial_Acciones_${date}.xlsx`);
  };

  // Formateo visual de fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("es-CL", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  // Estilo común para selects (adaptable al tema)
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
        backgroundColor: "background.default", // Fondo dinámico
        color: "text.primary", // Texto dinámico
        borderRadius: 0,
        transition: "background-color 0.3s ease",
      }}
      elevation={0}
    >
      {/* Barra superior */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* BUSCADOR */}
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
                    backgroundColor: theme.palette.mode === "dark" 
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
                sx: { height: "56px" }
              }}
            />
          </Grid>

          {/* FILTRO COLUMNA */}
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
                      sx: { 
                          bgcolor: "background.paper", 
                          color: "text.primary",
                          backgroundImage: "none" 
                        } 
                    },
                }}
              >
                <MenuItem value="all">Todo</MenuItem>
                <MenuItem value="descripcion_accion">Descripción</MenuItem>
                <MenuItem value="tipo_accion">Tipo</MenuItem>
                <MenuItem value="usuario">Usuario</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* BOTON EXCEL */}
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

      {/* Resumen de resultados */}
      {searchTerm && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Registros encontrados: {filteredRows.length}
          </Typography>
        </Box>
      )}

      {/* TABLA */}
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
                    backgroundColor: "background.paper", // Cabecera dinámica
                    color: "text.primary",
                    fontWeight: "bold",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {column.label}
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
                filteredRows
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
      
      {/* PAGINACIÓN (Traducida al español como en ListaVecinos) */}
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
    </Paper>
  );
}