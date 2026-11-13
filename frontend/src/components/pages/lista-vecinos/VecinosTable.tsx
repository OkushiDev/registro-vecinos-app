import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import type { ChangeEvent, MouseEvent } from "react";

import { displayedRowsLabel } from "../../../utils/pagination";
import { formatearRutConPuntos } from "../../../utils/rut";
import type { Column, Data } from "./types";

const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 50 },
  { id: "nombres", label: "Nombres", minWidth: 150 },
  { id: "apellido_paterno", label: "Ap. Paterno", minWidth: 120 },
  { id: "apellido_materno", label: "Ap. Materno", minWidth: 120 },
  { id: "rut", label: "RUT", minWidth: 120 },
  { id: "numero_socio", label: "N° Socio", minWidth: 95, align: "center" },
  { id: "nombre_calle", label: "Calle", minWidth: 150 },
  { id: "numero_casa", label: "N° Casa", minWidth: 80 },
  { id: "relacion_propiedad", label: "Relación", minWidth: 120 },
  { id: "fecha_registro", label: "F. Registro", minWidth: 120, align: "right" },
  { id: "fecha_edicion", label: "F. Edición", minWidth: 120, align: "right" },
  { id: "telefono", label: "Teléfono", minWidth: 120 },
  { id: "email", label: "Email", minWidth: 200 },
  { id: "acciones_certificado", label: "Solicitud", minWidth: 100 },
  { id: "acciones_editar", label: "Editar", minWidth: 80 },
  { id: "acciones_estado", label: "Estado", minWidth: 100 },
];

interface VecinosTableProps {
  rows: Data[];
  count: number;
  order: "asc" | "desc";
  page: number;
  rowsPerPage: number;
  vecinosConSolicitud: Set<number>;
  loadingToggle: boolean;
  onRequestSort: () => void;
  onPageChange: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCreateSolicitud: (vecinoId: number, nombreVecino: string) => void;
  onEdit: (vecinoId: number) => void;
  onToggleEstado: (
    vecinoId: number,
    estadoActual: number,
    nombreVecino: string
  ) => void;
}

export default function VecinosTable({
  rows,
  count,
  order,
  page,
  rowsPerPage,
  vecinosConSolicitud,
  loadingToggle,
  onRequestSort,
  onPageChange,
  onRowsPerPageChange,
  onCreateSolicitud,
  onEdit,
  onToggleEstado,
}: VecinosTableProps) {
  const theme = useTheme();

  return (
    <>
      <TableContainer
        sx={{
          flex: 1,
          backgroundColor: "transparent",
          boxShadow: "none",
          border: "none",
        }}
      >
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
                  sortDirection={column.id === "id" ? order : false}
                >
                  {column.id === "id" ? (
                    <TableSortLabel
                      active={true}
                      direction={order}
                      onClick={onRequestSort}
                    >
                      {column.label}
                      <Box component="span" sx={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </Box>
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                // Verificar si el vecino tiene solicitud pendiente
                const tieneSolicitudPendiente = vecinosConSolicitud.has(row.id);

                return (
                  <TableRow
                    hover
                    key={row.id}
                    sx={{
                      backgroundColor: "transparent",
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05) !important"
                            : "rgba(0,0,0,0.04) !important",
                      },
                    }}
                  >
                    {columns.map((column) => {
                      const cellStyle = {
                        color: "text.primary",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      };

                      if (column.id === "id") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {row.id}
                            </Typography>
                          </TableCell>
                        );
                      }
                      if (column.id === "rut") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            {formatearRutConPuntos(row.rut)}
                          </TableCell>
                        );
                      }

                      if (column.id === "acciones_certificado") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            <IconButton
                              onClick={() =>
                                onCreateSolicitud(
                                  row.id,
                                  `${row.nombres} ${row.apellido_paterno}`
                                )
                              }
                              size="small"
                              title={
                                row.estado !== 1
                                  ? "Vecino inactivo"
                                  : tieneSolicitudPendiente
                                  ? "Ya tiene una solicitud pendiente"
                                  : "Crear solicitud de certificado"
                              }
                              sx={{ color: "#9c27b0" }}
                              disabled={
                                row.estado !== 1 || tieneSolicitudPendiente
                              }
                            >
                              <AssignmentIcon />
                            </IconButton>
                          </TableCell>
                        );
                      }
                      if (column.id === "acciones_editar") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            <IconButton
                              onClick={() => onEdit(row.id)}
                              size="small"
                              title="Editar vecino"
                              sx={{ color: "#64b5f6" }}
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        );
                      }
                      if (column.id === "acciones_estado") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={cellStyle}
                          >
                            <IconButton
                              color={row.estado === 1 ? "success" : "error"}
                              onClick={() =>
                                onToggleEstado(row.id, row.estado, row.nombres)
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
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={cellStyle}
                        >
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
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={displayedRowsLabel}
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
    </>
  );
}
