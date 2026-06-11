import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportarAExcel } from "../utils/excel";

describe("exportarAExcel", () => {
  beforeEach(() => {
    vi.spyOn(document.body, "appendChild").mockImplementation(
      (node: Node) => node
    );
    vi.spyOn(document.body, "removeChild").mockImplementation(
      (node: Node) => node
    );
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();
  });

  it("no hace nada con datos vacios", async () => {
    // Deberia retornar sin errores si el array esta vacio
    await exportarAExcel([], "Hoja1", "test");
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("exporta datos a Excel", async () => {
    const data = [
      { nombre: "Juan", edad: 30 },
      { nombre: "Maria", edad: 25 },
    ];

    await exportarAExcel(data, "Personas", "test");

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });
});
