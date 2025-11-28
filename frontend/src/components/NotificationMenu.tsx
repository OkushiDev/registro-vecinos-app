import * as React from "react";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../api";

interface Notificacion {
  id: number;
  tipo_solicitud: string;
  rut: string;
  nombre_completo: string;
  fecha_solicitud: string;
  fecha_solicitud_formato: string;
  estado: string;
  visibilidad: string;
  vecino_id: number;
  numero_socio: number;
}

interface NotificationMenuProps {
  onViewChange?: (view: string) => void;
}

export default function NotificationMenu({
  onViewChange,
}: NotificationMenuProps) {
  const theme = useTheme();

  // Estados
  const [notificaciones, setNotificaciones] = React.useState<Notificacion[]>(
    []
  );
  const [cantidadPendientes, setCantidadPendientes] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [loadingActions, setLoadingActions] = React.useState<{
    [key: number | string]: string;
  }>({});
  const openNotifications = Boolean(anchorEl);

  // Cargar notificaciones
  const cargarNotificaciones = React.useCallback(async () => {
    try {
      const response = await api.get("/api/solicitudes/notificaciones");

      if (response.data.success) {
        setNotificaciones(response.data.notificaciones || []);
        setCantidadPendientes(response.data.pendientes || 0);

        console.log("Notificaciones cargadas:", {
          total: response.data.total,
          pendientes: response.data.pendientes,
        });
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  }, []);

  // Cargar notificaciones al montar y cada 30 segundos
  React.useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000);

    return () => clearInterval(interval);
  }, [cargarNotificaciones]);

  const handleClickNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    cargarNotificaciones();
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const formatearRut = (rut: string) => {
    if (!rut) return "-";
    const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").trim();
    if (rutLimpio.length < 2) return rut;
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${cuerpoFormateado}-${dv}`;
  };

  // === ACCIÓN: ELIMINAR (OCULTAR) ===
  const handleEliminarNotificacion = async (
    solicitudId: number,
    estado: string
  ) => {
    if (estado === "pendiente") {
      alert(
        "No puedes eliminar una solicitud pendiente. Márcala como realizada primero."
      );
      return;
    }

    if (!confirm("¿Estás seguro de que deseas ocultar esta notificación?")) {
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, [solicitudId]: "eliminando" }));

      const response = await api.patch(
        `/api/solicitudes/${solicitudId}/ocultar`
      );

      if (response.data.success) {
        console.log("Notificación ocultada exitosamente");
        await cargarNotificaciones();
      }
    } catch (error: any) {
      console.error("Error al ocultar notificación:", error);
      alert(error.response?.data?.detail || "Error al ocultar la notificación");
    } finally {
      setLoadingActions((prev) => {
        const newState = { ...prev };
        delete newState[solicitudId];
        return newState;
      });
    }
  };

  // === ACCIÓN: MARCAR REALIZADO ===
  const handleMarcarRealizado = async (
    solicitudId: number,
    nombreVecino: string
  ) => {
    if (
      !confirm(`¿Confirmas que ya procesaste la solicitud de ${nombreVecino}?`)
    ) {
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, [solicitudId]: "marcando" }));

      const response = await api.patch(
        `/api/solicitudes/${solicitudId}/marcar-realizada`
      );

      if (response.data.success) {
        console.log("Solicitud marcada como realizada");
        await cargarNotificaciones();
      }
    } catch (error: any) {
      console.error("Error al marcar como realizada:", error);
      alert(error.response?.data?.detail || "Error al marcar la solicitud");
    } finally {
      setLoadingActions((prev) => {
        const newState = { ...prev };
        delete newState[solicitudId];
        return newState;
      });
    }
  };

  // === ACCIÓN: GENERAR CERTIFICADO ===
  const handleGenerarCertificado = async (
    vecinoId: number,
    rutVecino: string,
    solicitudId: number,
    nombreVecino: string
  ) => {
    if (!confirm(`¿Generar certificado de residencia para ${nombreVecino}?`)) {
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, [solicitudId]: "generando" }));

      // 1. Generar el certificado
      const response = await api.get(`/api/generar-certificado/${vecinoId}`, {
        responseType: "blob",
      });

      // 2. Descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Certificado_Residencia_${rutVecino.replace(/-/g, "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("Certificado generado exitosamente");

      // 3. Marcar la solicitud como realizada
      await api.patch(`/api/solicitudes/${solicitudId}/marcar-realizada`);

      console.log("Solicitud marcada como realizada automáticamente");

      // 4. Recargar notificaciones
      await cargarNotificaciones();
    } catch (error: any) {
      console.error("Error al generar certificado:", error);
      alert(error.response?.data?.detail || "Error al generar el certificado");
    } finally {
      setLoadingActions((prev) => {
        const newState = { ...prev };
        delete newState[solicitudId];
        return newState;
      });
    }
  };

  // === ACCIÓN: ELIMINAR TODAS LAS REALIZADAS ===
  const handleEliminarTodasRealizadas = async () => {
    const notificacionesRealizadas = notificaciones.filter(
      (n) => n.estado === "realizado"
    );

    if (notificacionesRealizadas.length === 0) {
      alert("Quedan notificaciones pendientes");
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de que deseas ocultar ${notificacionesRealizadas.length} notificación(es) realizada(s)?`
      )
    ) {
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, eliminarTodas: "eliminando" }));

      console.log(
        `Eliminando ${notificacionesRealizadas.length} notificaciones realizadas...`
      );

      const promesas = notificacionesRealizadas.map((notif) =>
        api.patch(`/api/solicitudes/${notif.id}/ocultar`)
      );

      await Promise.all(promesas);

      console.log("Todas las notificaciones realizadas fueron ocultadas");

      await cargarNotificaciones();

      alert(
        `${notificacionesRealizadas.length} notificación(es) eliminada(s) exitosamente`
      );
    } catch (error: any) {
      console.error("Error al eliminar notificaciones:", error);
      alert("Error al eliminar las notificaciones");
    } finally {
      setLoadingActions((prev) => {
        const newState = { ...prev };
        delete newState.eliminarTodas;
        return newState;
      });
    }
  };

  return (
    <>
      {/* BOTÓN DE NOTIFICACIONES */}
      <Tooltip title={`${cantidadPendientes} solicitud(es) pendiente(s)`}>
        <IconButton
          color="inherit"
          onClick={handleClickNotifications}
          sx={{
            ml: 1,
            width: 40,
            height: 40,
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Badge
            badgeContent={cantidadPendientes}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                animation:
                  cantidadPendientes > 0
                    ? "pulse 2s ease-in-out infinite"
                    : "none",
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                  },
                  "50%": {
                    transform: "scale(1.15)",
                  },
                },
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* MENÚ DE NOTIFICACIONES */}
      <Menu
        anchorEl={anchorEl}
        open={openNotifications}
        onClose={handleCloseNotifications}
        disableScrollLock={true}
        slotProps={{
          paper: {
            sx: {
              width: 500,
              maxHeight: 600,
              mt: 1.5,
              boxShadow: theme.shadows[8],
              borderRadius: 2,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(18, 18, 18, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        disablePortal={false}
        keepMounted={false}
      >
        {/* Header del menú */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            position: "sticky",
            top: 0,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(18, 18, 18, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
            zIndex: 1,
            backdropFilter: "blur(20px)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Notificaciones
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {cantidadPendientes > 0
              ? `${cantidadPendientes} solicitud(es) pendiente(s)`
              : "No hay solicitudes pendientes"}
          </Typography>
        </Box>

        {/* Lista de notificaciones */}
        {notificaciones.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <NotificationsIcon
              sx={{
                fontSize: 64,
                color: "text.disabled",
                opacity: 0.3,
                mb: 2,
              }}
            />
            <Typography color="text.secondary">
              No hay notificaciones
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 450, overflow: "auto" }}>
            {notificaciones.map((notif) => {
              const isLoading = loadingActions[notif.id];

              return (
                <Box
                  key={notif.id}
                  sx={{
                    py: 2,
                    px: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor:
                          notif.estado === "pendiente"
                            ? "error.main"
                            : "success.main",
                        width: 40,
                        height: 40,
                      }}
                    >
                      {notif.nombre_completo.charAt(0)}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          {notif.nombre_completo}
                        </Typography>
                        <Chip
                          label={
                            notif.estado === "pendiente"
                              ? "Pendiente"
                              : "Realizado"
                          }
                          size="small"
                          color={
                            notif.estado === "pendiente" ? "error" : "success"
                          }
                          sx={{ ml: 1 }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        <strong>RUT:</strong> {formatearRut(notif.rut)} |{" "}
                        <strong>N° Socio:</strong> {notif.numero_socio}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        📄 Solicitud de Certificado de Residencia
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        🕒 {notif.fecha_solicitud_formato}
                      </Typography>
                    </Box>
                  </Box>

                  {/* BOTONES DE ACCIONES */}
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                  >
                    <Tooltip
                      title={
                        notif.estado === "pendiente"
                          ? "No puedes eliminar una solicitud pendiente"
                          : "Ocultar notificación"
                      }
                    >
                      <span>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() =>
                            handleEliminarNotificacion(notif.id, notif.estado)
                          }
                          disabled={
                            notif.estado === "pendiente" ||
                            isLoading === "eliminando"
                          }
                          sx={{
                            minWidth: 110,
                            textTransform: "none",
                            fontSize: "0.75rem",
                          }}
                        >
                          {isLoading === "eliminando"
                            ? "Ocultando..."
                            : "Eliminar"}
                        </Button>
                      </span>
                    </Tooltip>

                    {notif.estado === "pendiente" && (
                      <>
                        <Tooltip title="Marcar como realizado sin generar certificado">
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() =>
                              handleMarcarRealizado(
                                notif.id,
                                notif.nombre_completo
                              )
                            }
                            disabled={!!isLoading}
                            sx={{
                              minWidth: 140,
                              textTransform: "none",
                              fontSize: "0.75rem",
                            }}
                          >
                            {isLoading === "marcando"
                              ? "Marcando..."
                              : "Marcar Realizado"}
                          </Button>
                        </Tooltip>

                        <Tooltip title="Generar certificado y marcar como realizado">
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<DescriptionIcon />}
                            onClick={() =>
                              handleGenerarCertificado(
                                notif.vecino_id,
                                notif.rut,
                                notif.id,
                                notif.nombre_completo
                              )
                            }
                            disabled={!!isLoading}
                            sx={{
                              minWidth: 150,
                              textTransform: "none",
                              fontSize: "0.75rem",
                            }}
                          >
                            {isLoading === "generando"
                              ? "Generando..."
                              : "Generar Certificado"}
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Footer: ELIMINAR TODAS */}
        {notificaciones.length > 0 && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderTop: `1px solid ${theme.palette.divider}`,
              textAlign: "center",
              position: "sticky",
              bottom: 0,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(18, 18, 18, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Button
              variant="text"
              color="error"
              onClick={handleEliminarTodasRealizadas}
              disabled={loadingActions.eliminarTodas === "eliminando"}
              startIcon={<DeleteIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 0, 0, 0.1)"
                      : "rgba(255, 0, 0, 0.05)",
                },
              }}
            >
              {loadingActions.eliminarTodas === "eliminando"
                ? "Eliminando..."
                : "Eliminar todas las notificaciones"}
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
}
