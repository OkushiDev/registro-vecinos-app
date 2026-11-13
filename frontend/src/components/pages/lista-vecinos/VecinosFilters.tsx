import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { ChangeEvent } from "react";

import { CALLES, RELACIONES_PROPIEDAD } from "../../../constants/calles";

interface VecinosFiltersProps {
  searchTerm: string;
  filterColumn: string;
  estadoFiltro: string;
  selectedCalles: string[];
  selectedRelaciones: string[];
  filteredCount: number;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFilterChange: (e: SelectChangeEvent) => void;
  onEstadoChange: (e: SelectChangeEvent) => void;
  onCalleChange: (calle: string) => void;
  onRelacionChange: (relacion: string) => void;
  onExportToExcel: () => void;
  onOpenModal: () => void;
}

export default function VecinosFilters({
  searchTerm,
  filterColumn,
  estadoFiltro,
  selectedCalles,
  selectedRelaciones,
  filteredCount,
  onSearchChange,
  onFilterChange,
  onEstadoChange,
  onCalleChange,
  onRelacionChange,
  onExportToExcel,
  onOpenModal,
}: VecinosFiltersProps) {
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

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* BUSCADOR */}
        <Grid size={{ xs: 12, md: 2.5 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar vecinos..."
            value={searchTerm}
            onChange={onSearchChange}
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
            <InputLabel sx={{ color: "text.secondary" }}>Buscar en</InputLabel>
            <Select
              value={filterColumn}
              label="Buscar en"
              onChange={onFilterChange}
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
              onChange={onEstadoChange}
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
                        onChange={() => onCalleChange(calle)}
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
                        onChange={() => onRelacionChange(relacion)}
                        sx={{
                          color: "text.secondary",
                          "&.Mui-checked": { color: "#3b82f6" },
                        }}
                      />
                    }
                    label={<Typography variant="body2">{relacion}</Typography>}
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
            onClick={onExportToExcel}
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
            onClick={onOpenModal}
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
            Resultados: {filteredCount}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
