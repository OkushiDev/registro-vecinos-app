import * as React from "react";
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

// Importación de la API (Asegúrate de tener el endpoint creado en el backend)
import api from "../../api";

// Importaciones para búsqueda y filtrado
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

// === ESTILOS (Mismo tema Dark que ListaVecinos) ===
const MAIN_BG_COLOR = "#0b1121";
const SECONDARY_BG_COLOR = "#1e293b";
const BORDER_COLOR = "rgba(255, 255, 255, 0.1)";

const searchInputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    backgroundColor: "transparent",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "4px",
    "& fieldset": { border: "none" },
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    "&.Mui-focused": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
    },
  },
  "& .MuiSvgIcon-root": { color: "rgba(255, 255, 255, 0.5)" },
};

const filterComponentStyle = {
  backgroundColor: SECONDARY_BG_COLOR,
  color: "white",
  borderRadius: "4px",
  border: `1px solid ${BORDER_COLOR}`,
  "& .MuiSelect-icon": { color: "white" },
  "&:hover": {
    backgroundColor: "#2d3748",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  minHeight: "56px",
};

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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<Data[]>([]); // Estado para los datos reales
  const [loading, setLoading] = React.useState(true);

  // === 1. OBTENER DATOS DEL BACKEND ===
  const fetchHistorial = async () => {
    try {
      setLoading(true);
      // Asumimos que tu backend tiene este endpoint.
      // Si no lo tiene, avísame para darte el código de Python.
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
      Fecha: new Date(row.fecha_accion).toLocaleString("es-CL"), // Formato local
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Historial_Acciones_${date}.xlsx`);
  };

  // Función auxiliar para formatear fecha en la tabla visualmente
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("es-CL", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Paper
      sx={{
        width: "100%",
        minHeight: "100vh",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: MAIN_BG_COLOR,
        color: "white",
        borderRadius: 0,
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
              sx={searchInputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                  </InputAdornment>
                ),
                sx: { height: "56px" }
              }}
            />
          </Grid>

          {/* FILTRO COLUMNA */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Buscar en</InputLabel>
              <Select
                value={filterColumn}
                label="Buscar en"
                onChange={handleFilterChange}
                sx={{
                    ...filterComponentStyle,
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
                MenuProps={{
                    PaperProps: { sx: { bgcolor: SECONDARY_BG_COLOR, color: "white" } },
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
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
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
                    backgroundColor: SECONDARY_BG_COLOR,
                    color: "#90caf9",
                    fontWeight: "bold",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
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
                    <TableCell colSpan={5} align="center" sx={{ color: "white", py: 4 }}>
                        Cargando historial...
                    </TableCell>
                </TableRow>
            ) : filteredRows.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: "rgba(255,255,255,0.5)", py: 4 }}>
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
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.05) !important" },
                        }}
                    >
                        {columns.map((column) => {
                        const cellStyle = {
                            color: "rgba(255,255,255,0.9)",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                        };
                        
                        let value = row[column.id];

                        // Formatear fecha específicamente
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
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          backgroundColor: MAIN_BG_COLOR,
          color: "white",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          ".MuiTablePagination-selectIcon": { color: "white" },
          ".MuiIconButton-root": {
            color: "white",
            "&.Mui-disabled": { color: "rgba(255,255,255,0.3)" },
          },
        }}
      />
    </Paper>
  );
}