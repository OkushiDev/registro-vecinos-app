import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { formatearRutConPuntos } from "../../../utils/rut";
import type { FiltroTipo, Vecino } from "./types";

interface VecinosSearchPanelProps {
  filtroTipo: FiltroTipo;
  searchTerm: string;
  filteredVecinos: Vecino[];
  selectedVecino: Vecino | null;
  onFiltroTipoChange: (filtro: FiltroTipo) => void;
  onSearchTermChange: (termino: string) => void;
  onSelectVecino: (vecino: Vecino) => void;
}

export default function VecinosSearchPanel({
  filtroTipo,
  searchTerm,
  filteredVecinos,
  selectedVecino,
  onFiltroTipoChange,
  onSearchTermChange,
  onSelectVecino,
}: VecinosSearchPanelProps) {
  const theme = useTheme();

  // Obtener placeholder dinámico según el filtro
  const getPlaceholder = () => {
    switch (filtroTipo) {
      case "rut":
        return "Ej: 12345678-9";
      case "nombres":
        return "Ej: Juan";
      case "apellido_paterno":
        return "Ej: Pérez";
      case "apellido_materno":
        return "Ej: González";
      case "numero_socio":
        return "Ej: 123";
      default:
        return "Buscar...";
    }
  };

  return (
    <Box
      sx={{
        width: "33.33%",
        height: "100%",
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
        overflow: "hidden",
      }}
    >
      {/* Header del buscador */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Buscar Vecino
        </Typography>

        {/* Selector de tipo de filtro */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel
            sx={{
              color: "text.secondary",
              "&.Mui-focused": { color: "#3b82f6" },
            }}
          >
            Buscar por
          </InputLabel>
          <Select
            value={filtroTipo}
            label="Buscar por"
            onChange={(e) => onFiltroTipoChange(e.target.value as FiltroTipo)}
            sx={{
              color: "text.primary",
              backgroundColor: "transparent",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "4px",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
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
            }}
          >
            <MenuItem value="rut">RUT</MenuItem>
            <MenuItem value="nombres">Nombres</MenuItem>
            <MenuItem value="apellido_paterno">Apellido Paterno</MenuItem>
            <MenuItem value="apellido_materno">Apellido Materno</MenuItem>
            <MenuItem value="numero_socio">Número de Socio</MenuItem>
          </Select>
        </FormControl>

        {/* Campo de búsqueda */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder={getPlaceholder()}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
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
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Lista de vecinos - CON SCROLL INTERNO */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          maxHeight: "calc(100vh - 220px)",
        }}
      >
        {searchTerm.trim() === "" ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="body1">
              Escribe para buscar por{" "}
              {filtroTipo === "numero_socio"
                ? "número de socio"
                : filtroTipo.replace("_", " ")}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
              {getPlaceholder()}
            </Typography>
          </Box>
        ) : filteredVecinos.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">
              No se encontraron resultados para "{searchTerm}"
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredVecinos.map((vecino) => (
              <React.Fragment key={vecino.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onSelectVecino(vecino)}
                    selected={selectedVecino?.id === vecino.id}
                    sx={{
                      py: 2,
                      "&.Mui-selected": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(59, 130, 246, 0.2)"
                            : "rgba(59, 130, 246, 0.1)",
                        borderLeft: "4px solid #3b82f6",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(59, 130, 246, 0.3)"
                              : "rgba(59, 130, 246, 0.15)",
                        },
                      },
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="bold">
                          {vecino.nombres} {vecino.apellido_paterno}{" "}
                          {vecino.apellido_materno}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              display: "block",
                            }}
                          >
                            RUT: {formatearRutConPuntos(vecino.rut)}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            N° Socio: {vecino.numero_socio}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
