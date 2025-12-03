import React, { useState, useRef, useEffect } from "react";
import {
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fab,
  Collapse,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import api from "../api";

interface Message {
  id: number;
  texto: string;
  esUsuario: boolean;
  intent?: string;
  confianza?: number;
  timestamp: Date;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [mensajes, setMensajes] = useState<Message[]>([
    {
      id: 0,
      texto:
        "¡Hola! Soy el asistente virtual de la Junta de Vecinos. ¿En qué puedo ayudarte?",
      esUsuario: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [enviando, setEnviando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const handleEnviarMensaje = async () => {
    if (!inputValue.trim() || enviando) return;

    const mensajeUsuario: Message = {
      id: Date.now(),
      texto: inputValue,
      esUsuario: true,
      timestamp: new Date(),
    };

    setMensajes((prev) => [...prev, mensajeUsuario]);
    setInputValue("");
    setEnviando(true);

    try {
      const response = await api.post("/api/chatbot/mensaje", {
        mensaje: inputValue,
      });

      const mensajeBot: Message = {
        id: Date.now() + 1,
        texto: response.data.respuesta,
        esUsuario: false,
        intent: response.data.intent,
        confianza: response.data.confianza,
        timestamp: new Date(),
      };

      setMensajes((prev) => [...prev, mensajeBot]);
    } catch (error: any) {
      console.error("Error al enviar mensaje:", error);

      const mensajeError: Message = {
        id: Date.now() + 1,
        texto:
          "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.",
        esUsuario: false,
        timestamp: new Date(),
      };

      setMensajes((prev) => [...prev, mensajeError]);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <Fab
        color="primary"
        aria-label="chatbot"
        onClick={() => setOpen(!open)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "linear-gradient(to right, #2563eb, #3b82f6)",
          "&:hover": {
            background: "linear-gradient(to right, #1d4ed8, #2563eb)",
          },
        }}
      >
        {open ? <CloseIcon /> : <SmartToyIcon />}
      </Fab>

      {/* Ventana del chat */}
      <Collapse in={open}>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 380,
            height: 500,
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(to right, #2563eb, #3b82f6)",
              color: "white",
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <SmartToyIcon />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Asistente Virtual
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Mensajes */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              backgroundColor: "background.default",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {mensajes.map((mensaje) => (
              <Box
                key={mensaje.id}
                sx={{
                  display: "flex",
                  justifyContent: mensaje.esUsuario ? "flex-end" : "flex-start",
                  gap: 1,
                }}
              >
                {!mensaje.esUsuario && (
                  <Avatar
                    sx={{
                      bgcolor: "#3b82f6",
                      width: 32,
                      height: 32,
                    }}
                  >
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                )}

                <Box
                  sx={{
                    maxWidth: "75%",
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      backgroundColor: mensaje.esUsuario
                        ? "#3b82f6"
                        : "background.paper",
                      color: mensaje.esUsuario ? "white" : "text.primary",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2">{mensaje.texto}</Typography>
                  </Paper>

                  {/* Mostrar intent y confianza (solo para debugging) */}
                  {!mensaje.esUsuario && mensaje.intent && (
                    <Box sx={{ mt: 0.5, display: "flex", gap: 0.5 }}>
                      <Chip
                        label={mensaje.intent}
                        size="small"
                        sx={{ fontSize: "0.65rem", height: 20 }}
                      />
                      <Chip
                        label={`${(mensaje.confianza! * 100).toFixed(0)}%`}
                        size="small"
                        color={mensaje.confianza! > 0.7 ? "success" : "warning"}
                        sx={{ fontSize: "0.65rem", height: 20 }}
                      />
                    </Box>
                  )}
                </Box>

                {mensaje.esUsuario && (
                  <Avatar
                    sx={{
                      bgcolor: "#10b981",
                      width: 32,
                      height: 32,
                    }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}
              </Box>
            ))}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 2,
              backgroundColor: "background.paper",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Escribe tu mensaje..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={enviando}
                multiline
                maxRows={3}
              />
              <IconButton
                color="primary"
                onClick={handleEnviarMensaje}
                disabled={!inputValue.trim() || enviando}
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "action.disabledBackground",
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>
    </>
  );
}
