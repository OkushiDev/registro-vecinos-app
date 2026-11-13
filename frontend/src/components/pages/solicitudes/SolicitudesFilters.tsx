import type { ChangeEvent } from "react";
import { useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

interface SolicitudesFiltersProps {
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  filterColumn: string;
  onFilterColumnChange: (e: SelectChangeEvent) => void;
  estadoFiltro: string;
  onEstadoFiltroChange: (e: SelectChangeEvent) => void;
  onExport: () => void;
}

export default function SolicitudesFilters({
  searchTerm,
  onSearchChange,
  filterColumn,
  onFilterColumnChange,
  estadoFiltro,
  onEstadoFiltroChange,
  onExport,
}: SolicitudesFiltersProps) {
  const theme = useTheme();

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
    <>
      {/* BUSCADOR */}
      <Grid size={{ xs: 12, md: 2.5 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar solicitudes..."
          value={searchTerm}
          onChange={onSearchChange}
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
          <InputLabel sx={{ color: "text.secondary" }}>Buscar en</InputLabel>
          <Select
            value={filterColumn}
            label="Buscar en"
            onChange={onFilterColumnChange}
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
            onChange={onEstadoFiltroChange}
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
          onClick={onExport}
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
    </>
  );
}
