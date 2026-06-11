import { describe, it, expect, vi, beforeEach } from "vitest";
import { descargarPDF } from "../utils/pdf";

describe("descargarPDF", () => {
  beforeEach(() => {
    // Mock de funciones del DOM
    vi.spyOn(document.body, "appendChild").mockImplementation(
      (node: Node) => node
    );
    vi.spyOn(document.body, "removeChild").mockImplementation(
      (node: Node) => node
    );
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();
  });

  it("descarga con nombre por defecto", () => {
    const blob = new Blob(["test"], { type: "application/pdf" });
    descargarPDF(blob, null);

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("extrae nombre del Content-Disposition", () => {
    const blob = new Blob(["test"], { type: "application/pdf" });
    descargarPDF(blob, 'attachment; filename="test.pdf"');

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  it("usa nombre por defecto si no hay Content-Disposition", () => {
    const blob = new Blob(["test"], { type: "application/pdf" });
    descargarPDF(blob, null, "MiArchivo.pdf");

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
  });
});
