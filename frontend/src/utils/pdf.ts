import { descargarBlob } from "./download";

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
  descargarBlob(blob, fileName);
};
