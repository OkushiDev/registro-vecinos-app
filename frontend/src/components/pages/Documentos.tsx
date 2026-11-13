import * as React from "react";
import Paper from "@mui/material/Paper";
import api from "../../api";
import { getErrorMessage } from "../../utils/error";
import { descargarPDF } from "../../utils/pdf";
import VecinosSearchPanel from "./documentos/VecinosSearchPanel";
import DocumentosTable from "./documentos/DocumentosTable";
import type { Documento, FiltroTipo, Vecino } from "./documentos/types";

export default function Documentos() {
  const [vecinos, setVecinos] = React.useState<Vecino[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filtroTipo, setFiltroTipo] = React.useState<FiltroTipo>("rut");
  const [selectedVecino, setSelectedVecino] = React.useState<Vecino | null>(
    null
  );
  const [documentos, setDocumentos] = React.useState<Documento[]>([]);
  const [loadingDocumentos, setLoadingDocumentos] = React.useState(false);

  // Cargar lista de vecinos
  const fetchVecinos = async () => {
    try {
      const response = await api.get("/lista-vecinos/");
      setVecinos(response.data.vecinos || []);
    } catch {
      setVecinos([]);
    }
  };

  React.useEffect(() => {
    fetchVecinos();
  }, []);

  // Filtrar vecinos según búsqueda Y tipo de filtro seleccionado
  const filteredVecinos = React.useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") return [];
    const term = searchTerm.toLowerCase().trim();

    return vecinos.filter((v) => {
      switch (filtroTipo) {
        case "rut":
          return v.rut.toLowerCase().includes(term);
        case "numero_socio":
          return v.numero_socio.toString().includes(term);
        case "nombres":
          return v.nombres.toLowerCase().includes(term);
        case "apellido_paterno":
          return v.apellido_paterno.toLowerCase().includes(term);
        case "apellido_materno":
          return v.apellido_materno.toLowerCase().includes(term);
        default:
          return false;
      }
    });
  }, [searchTerm, filtroTipo, vecinos]);

  // Cargar documentos del vecino seleccionado
  const fetchDocumentos = async (vecinoId: number) => {
    setLoadingDocumentos(true);
    setDocumentos([]); // Limpiar documentos anteriores

    try {
      const response = await api.get(`/api/documentos/vecino/${vecinoId}`);

      if (response.data.success && response.data.documentos) {
        setDocumentos(response.data.documentos);
      } else {
        setDocumentos([]);
      }
    } catch (error) {
      alert(`Error al cargar documentos: ${getErrorMessage(error)}`);
      setDocumentos([]);
    } finally {
      setLoadingDocumentos(false);
    }
  };

  const handleDescargarDocumento = async (
    documentoId: number,
    nombreArchivo: string
  ) => {
    try {
      const response = await api.get(`/api/documentos/descargar/${documentoId}`, {
        responseType: "blob",
      });

      const blob = response.data;
      const contentDisposition = response.headers["content-disposition"] as string | null;
      descargarPDF(blob, contentDisposition, nombreArchivo);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const handleSelectVecino = (vecino: Vecino) => {
    setSelectedVecino(vecino);
    fetchDocumentos(vecino.id);
  };

  const handleFiltroTipoChange = (filtro: FiltroTipo) => {
    setFiltroTipo(filtro);
    setSearchTerm("");
  };

  return (
    <Paper
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        backgroundColor: "background.default",
        color: "text.primary",
        borderRadius: 0,
        backgroundImage: "none",
        overflow: "hidden",
      }}
      elevation={0}
    >
      {/* PANEL IZQUIERDO - BUSCADOR (1/3) */}
      <VecinosSearchPanel
        filtroTipo={filtroTipo}
        searchTerm={searchTerm}
        filteredVecinos={filteredVecinos}
        selectedVecino={selectedVecino}
        onFiltroTipoChange={handleFiltroTipoChange}
        onSearchTermChange={setSearchTerm}
        onSelectVecino={handleSelectVecino}
      />

      {/* PANEL DERECHO - DOCUMENTOS (2/3) */}
      <DocumentosTable
        selectedVecino={selectedVecino}
        documentos={documentos}
        loadingDocumentos={loadingDocumentos}
        onDescargarDocumento={handleDescargarDocumento}
      />
    </Paper>
  );
}
