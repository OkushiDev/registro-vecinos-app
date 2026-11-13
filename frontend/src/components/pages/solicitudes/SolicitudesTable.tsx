import type { ChangeEvent } from "react";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { displayedRowsLabel } from "../../../utils/pagination";
import IconButton from "@mui/material/IconButton";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BlockIcon from "@mui/icons-material/Block";
import Chip from "@mui/material/Chip";
import type { Data, Order } from "./types";

interface Column {
  id:
    | "id"
    | "nombre_completo"
    | "rut"
    | "numero_socio"
    | "tipo_solicitud"
    | "fecha_solicitud_formato"
    | "estado"
    | "visibilidad"
    | "acciones";
  label: string;
  minWidth?: number;
  align?: "center" | "right" | "left";
  sortable?: boolean;
}

const columns: readonly Column[] = [
  { id: "id", label: "ID", minWidth: 50, sortable: true },
  { id: "nombre_completo", label: "Vecino", minWidth: 180, sortable: true },
  { id: "rut", label: "RUT", minWidth: 110, sortable: true },
  { id: "numero_socio", label: "N° Socio", minWidth: 85, align: "center", sortable: true },
  { id: "tipo_solicitud", label: "Tipo", minWidth: 140 },
  {
    id: "fecha_solicitud_formato",
    label: "Fecha",
    minWidth: 130,
    align: "right",
    sortable: true,
  },
  { id: "estado", label: "Estado", minWidth: 110, align: "center", sortable: true },
  { id: "visibilidad", label: "Visibilidad", minWidth: 120, align: "center" },
  { id: "acciones", label: "Acciones", minWidth: 100, align: "center" },
];

interface SolicitudesTableProps {
  rows: Data[];
  loading: boolean;
  order: Order;
  orderBy: keyof Data;
  onRequestSort: (property: keyof Data) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onGenerarCertificado: (
    vecinoId: number,
    solicitudId: number,
    nombreVecino: string
  ) => void;
  onRechazarSolicitud: (solicitudId: number, nombreVecino: string) => void;
}

export default function SolicitudesTable({
  rows,
  loading,
  order,
  orderBy,
  onRequestSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onGenerarCertificado,
  onRechazarSolicitud,
}: SolicitudesTableProps) {
  const theme = useTheme();

  return (
    <>
      <TableContainer sx={{ flex: 1, backgroundColor: "transparent" }}>
        <Table stickyHeader>
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
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => onRequestSort(column.id as keyof Data)}
                      sx={{
                        color: "text.primary !important",
                        "&.Mui-active": {
                          color: "text.primary !important",
                        },
                        "& .MuiTableSortLabel-icon": {
                          color: "text.primary !important",
                        },
                      }}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
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
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ color: "text.primary", py: 4 }}
                >
                  Cargando solicitudes...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ color: "text.secondary", py: 4 }}
                >
                  No hay solicitudes registradas.
                </TableCell>
              </TableRow>
            ) : (
              rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const cellStyle = {
                    color: "text.primary",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  };

                  // Determinar si los botones deben estar deshabilitados
                  const isDisabled =
                    row.estado === "realizado" || row.estado === "rechazado";

                  return (
                    <TableRow
                      hover
                      key={row.id}
                      sx={{
                        backgroundColor: "transparent",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.05) !important"
                              : "rgba(0,0,0,0.04) !important",
                        },
                      }}
                    >
                      <TableCell sx={cellStyle}>
                        <Typography variant="body2" fontWeight="bold">
                          {row.id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {row.nombre_completo}
                      </TableCell>
                      <TableCell sx={cellStyle}>{row.rut}</TableCell>
                      <TableCell align="center" sx={cellStyle}>
                        {row.numero_socio}
                      </TableCell>
                      <TableCell sx={cellStyle}>{row.tipo_solicitud}</TableCell>
                      <TableCell align="right" sx={cellStyle}>
                        {row.fecha_solicitud_formato}
                      </TableCell>
                      <TableCell align="center" sx={cellStyle}>
                        <Chip
                          label={
                            row.estado === "pendiente"
                              ? "Pendiente"
                              : row.estado === "realizado"
                              ? "Realizado"
                              : "Rechazado"
                          }
                          color={
                            row.estado === "pendiente"
                              ? "warning"
                              : row.estado === "realizado"
                              ? "success"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center" sx={cellStyle}>
                        <Chip
                          label={
                            row.visibilidad === "mostrar"
                              ? "Mostrar"
                              : "No Mostrar"
                          }
                          color={
                            row.visibilidad === "mostrar" ? "info" : "default"
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center" sx={cellStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          {/* BOTÓN GENERAR CERTIFICADO */}
                          <IconButton
                            onClick={() =>
                              onGenerarCertificado(
                                row.vecino_id,
                                row.id,
                                row.nombre_completo
                              )
                            }
                            size="small"
                            title={
                              isDisabled
                                ? "No disponible para solicitudes realizadas o rechazadas"
                                : "Generar Certificado PDF"
                            }
                            disabled={isDisabled}
                            sx={{
                              color: isDisabled ? "text.disabled" : "#ef4444",
                              "&:hover": {
                                backgroundColor: isDisabled
                                  ? "transparent"
                                  : "rgba(239, 68, 68, 0.1)",
                              },
                            }}
                          >
                            <PictureAsPdfIcon />
                          </IconButton>

                          {/* BOTÓN RECHAZAR */}
                          <IconButton
                            onClick={() =>
                              onRechazarSolicitud(
                                row.id,
                                row.nombre_completo
                              )
                            }
                            size="small"
                            title={
                              isDisabled
                                ? "No disponible para solicitudes realizadas o rechazadas"
                                : "Rechazar Solicitud"
                            }
                            disabled={isDisabled}
                            sx={{
                              color: isDisabled ? "text.disabled" : "#f59e0b",
                              "&:hover": {
                                backgroundColor: isDisabled
                                  ? "transparent"
                                  : "rgba(245, 158, 11, 0.1)",
                              },
                            }}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={rows.length}
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
