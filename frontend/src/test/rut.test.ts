import { describe, it, expect } from "vitest";
import {
  limpiarRut,
  formatearRut,
  formatearRutConPuntos,
  validarFormatoRut,
} from "../utils/rut";

describe("limpiarRut", () => {
  it("elimina puntos y guion", () => {
    expect(limpiarRut("12.345.678-9")).toBe("123456789");
  });

  it("maneja RUT sin formato", () => {
    expect(limpiarRut("123456789")).toBe("123456789");
  });

  it("maneja RUT con dv K", () => {
    expect(limpiarRut("15.678.901-k")).toBe("15678901k");
  });

  it("maneja string vacio", () => {
    expect(limpiarRut("")).toBe("");
  });
});

describe("formatearRut", () => {
  it("formatea RUT sin puntos ni guion", () => {
    expect(formatearRut("123456789")).toBe("12345678-9");
  });

  it("maneja RUT con K", () => {
    expect(formatearRut("15678901k")).toBe("15678901-K");
  });

  it("devuelve vacio para string vacio", () => {
    expect(formatearRut("")).toBe("");
  });

  it("devuelve original si el cuerpo no tiene largo valido", () => {
    expect(formatearRut("12-3")).toBe("12-3");
  });
});

describe("formatearRutConPuntos", () => {
  it("formatea RUT con puntos y guion", () => {
    expect(formatearRutConPuntos("12345678-9")).toBe("12.345.678-9");
  });

  it("maneja RUT sin guion", () => {
    expect(formatearRutConPuntos("123456789")).toBe("12.345.678-9");
  });

  it("devuelve guion para string vacio", () => {
    expect(formatearRutConPuntos("")).toBe("-");
  });
});

describe("validarFormatoRut", () => {
  it("valida RUT correcto", () => {
    expect(validarFormatoRut("12345678-9")).toBe(true);
  });

  it("valida RUT con K", () => {
    expect(validarFormatoRut("15678901-k")).toBe(true);
  });

  it("rechaza RUT muy corto", () => {
    expect(validarFormatoRut("123-4")).toBe(false);
  });

  it("rechaga RUT con letras en el cuerpo", () => {
    expect(validarFormatoRut("12A45678-9")).toBe(false);
  });

  it("rechaza string vacio", () => {
    expect(validarFormatoRut("")).toBe(false);
  });
});
