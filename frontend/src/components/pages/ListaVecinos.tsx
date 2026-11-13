import * as React from "react";
import Paper from "@mui/material/Paper";
import type { SelectChangeEvent } from "@mui/material/Select";

import { exportarAExcel } from "../../utils/excel";
import { usePagination } from "../../utils/pagination";
import { formatearRutConPuntos } from "../../utils/rut";
import { getErrorDetail } from "../../utils/error";

// Importación de la API
import api from "../../api";

// Componentes propios
import VecinosFilters from "./lista-vecinos/VecinosFilters";
import VecinosTable from "./lista-vecinos/VecinosTable";
import VecinosDialogs from "./lista-vecinos/VecinosDialogs";
import ConfirmEstadoDialog from "./lista-vecinos/ConfirmEstadoDialog";
import type { Data, VecinoToToggle } from "./lista-vecinos/types";

export default function ListaVecinos() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);

  // === ESTADO PARA EL ORDEN (ASC/DESC) ===
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");

  const { handleChangePage, handleChangeRowsPerPage } = usePagination(setPage, setRowsPerPage);

  const [items, setItems] = React.useState<Data[]>([]);

  const [vecinosConSolicitud, setVecinosConSolicitud] = React.useState<
    Set<number>
  >(new Set());

  // Función para obtener vecinos con solicitudes pendientes
  const fetchSolicitudesPendientes = React.useCallback(async () => {
    try {
      const response = await api.get("/api/solicitudes");
      const pendientes = response.data
        .filter((sol: { estado: string }) => sol.estado === "pendiente")
        .map((sol: { vecino_id: number }) => sol.vecino_id);

      setVecinosConSolicitud(new Set(pendientes));
    } catch {
      // Se conserva el último estado conocido; el próximo fetch reintenta.
    }
  }, []);

  const fetchItems = React.useCallback(async () => {
    try {
      const response = await api.get("/lista-vecinos/");
      setItems(response.data.vecinos || []);

      // Obtener solicitudes pendientes
      await fetchSolicitudesPendientes();
    } catch {
      setItems([]);
    }
  }, [fetchSolicitudesPendientes]);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterColumn, setFilterColumn] = React.useState("all");
  const [selectedCalles, setSelectedCalles] = React.useState<string[]>([]);
  const [selectedRelaciones, setSelectedRelaciones] = React.useState<string[]>(
    []
  );
  const [estadoFiltro, setEstadoFiltro] = React.useState<string>("todos");

  const handleCalleChange = (calle: string) => {
    setSelectedCalles((prev) =>
      prev.includes(calle) ? prev.filter((c) => c !== calle) : [...prev, calle]
    );
    setPage(0);
  };

  const handleRelacionChange = (relacion: string) => {
    setSelectedRelaciones((prev) =>
      prev.includes(relacion)
        ? prev.filter((r) => r !== relacion)
        : [...prev, relacion]
    );
    setPage(0);
  };

  const handleEstadoFiltroChange = (e: SelectChangeEvent) => {
    setEstadoFiltro(e.target.value);
    setPage(0);
  };

  // === FILTRADO ===
  const filteredRows = React.useMemo(() => {
    let filtered = items;
    if (searchTerm) {
      filtered = filtered.filter((item) => {
        if (filterColumn === "all") {
          return Object.values(item).some(
            (value) =>
              value != null &&
              value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          const columnValue = item[filterColumn as keyof Data];
          return (
            columnValue != null &&
            columnValue
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        }
      });
    }
    if (selectedCalles.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCalles.includes(item.nombre_calle)
      );
    }
    if (selectedRelaciones.length > 0) {
      filtered = filtered.filter((item) =>
        selectedRelaciones.includes(item.relacion_propiedad)
      );
    }
    if (estadoFiltro === "habilitados") {
      filtered = filtered.filter((item) => item.estado === 1);
    } else if (estadoFiltro === "deshabilitados") {
      filtered = filtered.filter((item) => item.estado === 0);
    }
    return filtered;
  }, [
    searchTerm,
    filterColumn,
    items,
    selectedCalles,
    selectedRelaciones,
    estadoFiltro,
  ]);

  // === ORDENAMIENTO (ID) ===
  const handleRequestSort = () => {
    setOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const sortedRows = React.useMemo(() => {
    const sorted = [...filteredRows];

    sorted.sort((a, b) => {
      if (order === "asc") {
        return a.id - b.id; // Menor a Mayor
      } else {
        return b.id - a.id; // Mayor a Menor
      }
    });

    return sorted;
  }, [filteredRows, order]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilterColumn(e.target.value);
    setPage(0);
  };

  // === EXPORTAR A EXCEL ===
  const handleExportToExcel = async () => {
    const dataToExport = sortedRows.map((row) => ({
      ID: row.id,
      Nombres: row.nombres,
      "Apellido Paterno": row.apellido_paterno,
      "Apellido Materno": row.apellido_materno,
      RUT: formatearRutConPuntos(row.rut),
      "N° Socio": row.numero_socio,
      Calle: row.nombre_calle,
      "N° Casa": row.numero_casa,
      Relación: row.relacion_propiedad,
      Teléfono: row.telefono,
      Email: row.email,
      "Fecha Registro": row.fecha_registro,
      Estado: row.estado === 1 ? "Habilitado" : "Deshabilitado",
    }));
    await exportarAExcel(dataToExport, "Vecinos", "Reporte_Vecinos");
  };

  const [modalOpen, setModalOpen] = React.useState(false);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleRegistroSuccess = () => {
    setModalOpen(false);
    fetchItems();
  };

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedVecinoId, setSelectedVecinoId] = React.useState<number | null>(
    null
  );

  const handleOpenEditModal = (vecinoId: number) => {
    setSelectedVecinoId(vecinoId);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedVecinoId(null);
  };
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedVecinoId(null);
    fetchItems();
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [vecinoToToggle, setVecinoToToggle] = React.useState<
    VecinoToToggle | null
  >(null);
  const [loadingToggle, setLoadingToggle] = React.useState(false);

  const handleToggleEstado = (
    vecinoId: number,
    estadoActual: number,
    nombreVecino: string
  ) => {
    setVecinoToToggle({
      id: vecinoId,
      nombre: nombreVecino,
      estadoActual: estadoActual,
    });
    setConfirmDialogOpen(true);
  };

  const handleConfirmToggleEstado = async () => {
    if (!vecinoToToggle) return;
    setLoadingToggle(true);
    try {
      const response = await api.patch(
        `/cambiar-estado-vecino/${vecinoToToggle.id}`
      );
      alert(
        `Vecino ${
          response.data.nuevo_estado === 1 ? "habilitado" : "deshabilitado"
        } exitosamente`
      );
      setConfirmDialogOpen(false);
      setVecinoToToggle(null);
      fetchItems();
    } catch (error) {
      alert(getErrorDetail(error) || "Error al cambiar el estado");
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleCancelToggleEstado = () => {
    setConfirmDialogOpen(false);
    setVecinoToToggle(null);
  };

  // === CREAR SOLICITUD DE CERTIFICADO ===
  const handleCrearSolicitud = async (
    vecinoId: number,
    nombreVecino: string
  ) => {
    if (
      !confirm(
        `¿Crear solicitud de certificado de residencia para ${nombreVecino}?\n\nEsta solicitud aparecerá en el panel de Solicitudes.`
      )
    ) {
      return;
    }

    try {
      const response = await api.post(
        "/api/solicitudes/crear-por-presidente",
        null,
        {
          params: { vecino_id: vecinoId },
        }
      );

      alert(response.data.mensaje || "Solicitud creada exitosamente");

      // Actualizar la lista para reflejar el cambio
      await fetchItems();
    } catch (error) {
      alert(
        getErrorDetail(error) ||
          "Error al crear la solicitud. Intenta nuevamente."
      );
    }
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
        backgroundImage: "none",
        transition: "background-color 0.3s ease",
      }}
      elevation={0}
    >
      <VecinosFilters
        searchTerm={searchTerm}
        filterColumn={filterColumn}
        estadoFiltro={estadoFiltro}
        selectedCalles={selectedCalles}
        selectedRelaciones={selectedRelaciones}
        filteredCount={filteredRows.length}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onEstadoChange={handleEstadoFiltroChange}
        onCalleChange={handleCalleChange}
        onRelacionChange={handleRelacionChange}
        onExportToExcel={handleExportToExcel}
        onOpenModal={handleOpenModal}
      />

      <VecinosTable
        rows={sortedRows}
        count={filteredRows.length}
        order={order}
        page={page}
        rowsPerPage={rowsPerPage}
        vecinosConSolicitud={vecinosConSolicitud}
        loadingToggle={loadingToggle}
        onRequestSort={handleRequestSort}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onCreateSolicitud={handleCrearSolicitud}
        onEdit={handleOpenEditModal}
        onToggleEstado={handleToggleEstado}
      />

      <VecinosDialogs
        createOpen={modalOpen}
        editOpen={editModalOpen}
        selectedVecinoId={selectedVecinoId}
        onCloseCreate={handleCloseModal}
        onCreateSuccess={handleRegistroSuccess}
        onCloseEdit={handleCloseEditModal}
        onEditSuccess={handleEditSuccess}
      />

      <ConfirmEstadoDialog
        open={confirmDialogOpen}
        vecino={vecinoToToggle}
        loading={loadingToggle}
        onCancel={handleCancelToggleEstado}
        onConfirm={handleConfirmToggleEstado}
      />
    </Paper>
  );
}
