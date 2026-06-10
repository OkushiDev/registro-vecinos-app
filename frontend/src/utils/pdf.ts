/**
 * Descarga un blob como archivo PDF en el navegador.
 * Extrae el nombre del archivo del header Content-Disposition si está disponible.
 */
export const descargarPDF = (
  blob: Blob,
  contentDisposition: string | null,
  defaultName = "Certificado_Residencia.pdf"
): void => {
  let fileName = defaultName;
  if (contentDisposition) {
    const matches = contentDisposition.match(
      /filename[^;=\n]*=["']?([^"'\n;]+)["']?/
    );
    if (matches?.[1]) {
      fileName = matches[1].trim();
    }
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
