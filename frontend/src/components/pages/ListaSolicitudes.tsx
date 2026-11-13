import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import type { SelectChangeEvent } from "@mui/material/Select";
import api from "../../api";
import { exportarAExcel } from "../../utils/excel";
import { descargarPDF } from "../../utils/pdf";
import { getErrorDetail } from "../../utils/error";
import { usePagination } from "../../utils/pagination";
import SolicitudesStats from "./solicitudes/SolicitudesStats";
import SolicitudesFilters from "./solicitudes/SolicitudesFilters";
import SolicitudesTable from "./solicitudes/SolicitudesTable";
import type { Data, Order } from "./solicitudes/types";

export default function ListaSolicitudes() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<Order>("desc");
  const [orderBy, setOrderBy] = React.useState<keyof Data>("id");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterColumn, setFilterColumn] = React.useState("all");
  const [estadoFiltro, setEstadoFiltro] = React.useState<string>("todos");

  const fetchSolicitudes = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/solicitudes");

      const solicitudesFormateadas = response.data.map((sol: Data) => ({
        ...sol,
        tipo_solicitud:
          sol.tipo_solicitud === "certificado_residencia"
            ? "Certificado de Residencia"
            : sol.tipo_solicitud,
      }));

      setRows(solicitudesFormateadas || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const handleActualizacion = () => {
      fetchSolicitudes();
    };

    window.addEventListener("actualizarSolicitudes", handleActualizacion);
    return () => {
      window.removeEventListener("actualizarSolicitudes", handleActualizacion);
    };
  }, [fetchSolicitudes]);

  React.useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const { handleChangePage, handleChangeRowsPerPage } = usePagination(setPage, setRowsPerPage);

  const handleRequestSort = (property: keyof Data) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilterColumn(e.target.value);
    setPage(0);
  };

  const handleEstadoFiltroChange = (e: SelectChangeEvent) => {
    setEstadoFiltro(e.target.value);
    setPage(0);
  };

  const handleGenerarCertificado = async (
    vecinoId: number,
    solicitudId: number,
    nombreVecino: string
  ) => {
    if (
      !confirm(
        `¿Generar certificado de residencia para ${nombreVecino}?\n\nEsto marcará automáticamente la solicitud como realizada.`
      )
    ) {
      return;
    }

    try {
      const response = await api.get(`/api/generar-certificado/${vecinoId}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      descargarPDF(blob, response.headers["content-disposition"]);

      await api.patch(`/api/solicitudes/${solicitudId}/marcar-realizada`);

      await fetchSolicitudes();
    } catch (error) {
      alert(
        getErrorDetail(error) ||
          "Error al generar certificado. Intenta nuevamente."
      );
    }
  };

  // Rechazar solicitud
  const handleRechazarSolicitud = async (
    solicitudId: number,
    nombreVecino: string
  ) => {
    if (
      !confirm(
        `¿Rechazar la solicitud de certificado para ${nombreVecino}?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.patch(`/api/solicitudes/${solicitudId}/rechazar`);

      await fetchSolicitudes();
    } catch (error) {
      alert(
        getErrorDetail(error) ||
          "Error al rechazar solicitud. Intenta nuevamente."
      );
    }
  };

  // Filtrado
  const filteredRows = React.useMemo(() => {
    let filtered = rows;

    if (searchTerm) {
      filtered = filtered.filter((row) => {
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
    }

    if (estadoFiltro === "pendiente") {
      filtered = filtered.filter((row) => row.estado === "pendiente");
    } else if (estadoFiltro === "realizado") {
      filtered = filtered.filter((row) => row.estado === "realizado");
    } else if (estadoFiltro === "rechazado") {
      filtered = filtered.filter((row) => row.estado === "rechazado");
    }

    return filtered;
  }, [searchTerm, filterColumn, rows, estadoFiltro]);

  // Ordenamiento
  const sortedRows = React.useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      return order === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [filteredRows, order, orderBy]);

  // Estadísticas
  const estadisticas = React.useMemo(() => {
    const total = filteredRows.length;
    const pendientes = filteredRows.filter(
      (r) => r.estado === "pendiente"
    ).length;
    const realizadas = filteredRows.filter(
      (r) => r.estado === "realizado"
    ).length;
    const rechazadas = filteredRows.filter(
      (r) => r.estado === "rechazado"
    ).length;

    return { total, pendientes, realizadas, rechazadas };
  }, [filteredRows]);

  // Exportar a Excel
  const handleExportToExcel = async () => {
    const dataToExport = sortedRows.map((row) => ({
      ID: row.id,
      Vecino: row.nombre_completo,
      RUT: row.rut,
      "N° Socio": row.numero_socio,
      Tipo: row.tipo_solicitud,
      Fecha: row.fecha_solicitud_formato,
      Estado: row.estado === "pendiente" ? "Pendiente" : row.estado === "realizado" ? "Realizado" : "Rechazado",
      Visibilidad: row.visibilidad === "mostrar" ? "Mostrar" : "No Mostrar",
    }));
    await exportarAExcel(dataToExport, "Solicitudes", "Solicitudes_Certificados");
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
          <SolicitudesFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            filterColumn={filterColumn}
            onFilterColumnChange={handleFilterChange}
            estadoFiltro={estadoFiltro}
            onEstadoFiltroChange={handleEstadoFiltroChange}
            onExport={handleExportToExcel}
          />

          {/* ESTADÍSTICAS */}
          <SolicitudesStats
            total={estadisticas.total}
            pendientes={estadisticas.pendientes}
            realizadas={estadisticas.realizadas}
            rechazadas={estadisticas.rechazadas}
          />
        </Grid>

        {/* Resumen de búsqueda */}
        {searchTerm && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Resultados: {filteredRows.length}
            </Typography>
          </Box>
        )}
      </Box>

      {/* TABLA */}
      <SolicitudesTable
        rows={sortedRows}
        loading={loading}
        order={order}
        orderBy={orderBy}
        onRequestSort={handleRequestSort}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onGenerarCertificado={handleGenerarCertificado}
        onRechazarSolicitud={handleRechazarSolicitud}
      />
    </Paper>
  );
}
