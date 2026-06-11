/**
 * Exporta un arreglo de objetos a un archivo Excel (.xlsx).
 * La función es asíncrona porque ExcelJS genera el buffer de forma asíncrona.
 * ExcelJS se importa dinámicamente (~1.2MB) solo al ejecutar la exportación.
 */
export const exportarAExcel = async <T extends Record<string, unknown>>(
  data: T[],
  sheetName: string,
  fileName: string
): Promise<void> => {
  if (data.length === 0) return;

  const ExcelJS = (await import("exceljs")).default;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Definir columnas a partir de las keys del primer objeto
  const keys = Object.keys(data[0]);
  worksheet.columns = keys.map((key) => ({
    header: key,
    key,
    width: Math.max(key.length * 2, 15),
  }));

  // Estilo del header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Agregar datos
  worksheet.addRows(data);

  // Generar buffer y descargar
  const buffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const date = new Date().toISOString().split("T")[0];
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}_${date}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
