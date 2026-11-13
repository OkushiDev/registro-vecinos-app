import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import type { ReactNode } from "react";
import { formatearRutConPuntos } from "../../../utils/rut";
import type { VecinoData } from "./types";

interface DatosPersonalesProps {
  vecinoData: VecinoData;
}

const renderRow = (label: string, value: ReactNode, isTitle = false) => (
  <TableRow
    hover={!isTitle}
    sx={{
      backgroundColor: isTitle
        ? (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "#f5f5f5"
        : "inherit",
    }}
  >
    <TableCell
      component="th"
      scope="row"
      sx={{
        fontWeight: isTitle ? "bold" : "medium",
        width: "40%",
        color: isTitle ? "primary.main" : "text.secondary",
      }}
    >
      {label}
    </TableCell>
    <TableCell sx={{ fontWeight: isTitle ? "bold" : "regular" }}>
      {value || "-"}
    </TableCell>
  </TableRow>
);

const DatosPersonales = ({ vecinoData }: DatosPersonalesProps) => (
  <TableContainer
    component={Paper}
    elevation={3}
    sx={{ borderRadius: 2, overflow: "hidden", mb: 4 }}
  >
    <Table sx={{ minWidth: 350 }}>
      <TableBody>
        {renderRow("DATOS PERSONALES", "", true)}
        {renderRow(
          "Nombre Completo",
          `${vecinoData.nombres} ${vecinoData.apellido_paterno} ${
            vecinoData.apellido_materno || ""
          }`
        )}
        {renderRow("RUT", formatearRutConPuntos(vecinoData.rut))}
        {renderRow("Número de Socio", vecinoData.numero_socio)}
        {renderRow("Fecha de Registro", vecinoData.fecha_registro)}
        {renderRow("DIRECCIÓN", "", true)}
        {renderRow("Calle", vecinoData.nombre_calle)}
        {renderRow("Número de Casa", vecinoData.numero_casa)}
        {renderRow("Relación con Propiedad", vecinoData.relacion_propiedad)}
        {renderRow("CONTACTO Y SEGURIDAD", "", true)}
        {renderRow("Teléfono", vecinoData.telefono)}
        {renderRow("Correo Electrónico", vecinoData.email)}
        {renderRow("Contraseña", "********")}
      </TableBody>
    </Table>
  </TableContainer>
);

export default DatosPersonales;
