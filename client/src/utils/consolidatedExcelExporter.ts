import ExcelJS from 'exceljs';
import type { MultiCompareItem } from '@/contexts/MultiCompareContext';

const FAGOR_RED = 'FFDC2626';
const LOGO_PATH = '/fagor-logo.jpg';

export async function exportConsolidatedExcel(items: MultiCompareItem[], language: string = 'es') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Comparación Consolidada');

  // Cargar logo
  let logoImageId: number | undefined;
  try {
    const response = await fetch(LOGO_PATH);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    logoImageId = workbook.addImage({
      buffer: arrayBuffer,
      extension: 'jpeg',
    });
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Configurar anchos de columnas
  worksheet.columns = [
    { width: 5 },   // A - Número
    { width: 25 },  // B - Motor Origen
    { width: 25 },  // C - Motor Equivalente
    { width: 12 },  // D - Mo Origen
    { width: 12 },  // E - Mo Equiv
    { width: 12 },  // F - Diferencia Mo
    { width: 12 },  // G - Mn Origen
    { width: 12 },  // H - Mn Equiv
    { width: 12 },  // I - Diferencia Mn
    { width: 12 },  // J - RPM Origen
    { width: 12 },  // K - RPM Equiv
    { width: 12 },  // L - Diferencia RPM
    { width: 15 },  // M - Encoder Recomendado
    { width: 20 },  // N - Conector Recomendado
  ];

  let currentRow = 1;

  // Logo (si se cargó exitosamente)
  if (logoImageId !== undefined) {
    worksheet.addImage(logoImageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 150, height: 60 },
    });
  }

  // Información de FAGOR en la esquina superior derecha
  const headerInfoRow = 1;
  worksheet.mergeCells(`L${headerInfoRow}:N${headerInfoRow}`);
  const headerCell = worksheet.getCell(`L${headerInfoRow}`);
  headerCell.value = 'FAGOR Automation USA';
  headerCell.font = { name: 'Arial', size: 10, bold: true };
  headerCell.alignment = { horizontal: 'right', vertical: 'top' };

  worksheet.mergeCells(`L${headerInfoRow + 1}:N${headerInfoRow + 1}`);
  const addressCell = worksheet.getCell(`L${headerInfoRow + 1}`);
  addressCell.value = '1755 Park Street, Naperville, IL 60563';
  addressCell.font = { name: 'Arial', size: 9 };
  addressCell.alignment = { horizontal: 'right', vertical: 'top' };

  worksheet.mergeCells(`L${headerInfoRow + 2}:N${headerInfoRow + 2}`);
  const phoneCell = worksheet.getCell(`L${headerInfoRow + 2}`);
  phoneCell.value = 'Tel: +1 (630) 851-3050';
  phoneCell.font = { name: 'Arial', size: 9 };
  phoneCell.alignment = { horizontal: 'right', vertical: 'top' };

  currentRow = 5;

  // Título principal
  worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
  const titleCell = worksheet.getCell(`A${currentRow}`);
  titleCell.value = language === 'es' 
    ? 'REPORTE CONSOLIDADO DE CONVERSIÓN DE MOTORES' 
    : 'CONSOLIDATED MOTOR CONVERSION REPORT';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: FAGOR_RED },
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 25;

  currentRow += 2;

  // Encabezados de tabla
  const headers = language === 'es' 
    ? ['#', 'Motor Origen', 'Motor Equivalente', 'Mo Origen (Nm)', 'Mo Equiv (Nm)', 'Δ Mo (%)', 
       'Mn Origen (Nm)', 'Mn Equiv (Nm)', 'Δ Mn (%)', 'RPM Origen', 'RPM Equiv', 'Δ RPM (%)',
       'Encoder Recomendado', 'Conector Recomendado']
    : ['#', 'Source Motor', 'Equivalent Motor', 'Source Mo (Nm)', 'Equiv Mo (Nm)', 'Δ Mo (%)', 
       'Source Mn (Nm)', 'Equiv Mn (Nm)', 'Δ Mn (%)', 'Source RPM', 'Equiv RPM', 'Δ RPM (%)',
       'Recommended Encoder', 'Recommended Connector'];

  const headerRow = worksheet.getRow(currentRow);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: FAGOR_RED },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };
  });
  headerRow.height = 40;

  currentRow++;

  // Datos de cada motor
  items.forEach((item, index) => {
    const dataRow = worksheet.getRow(currentRow);
    
    // Calcular diferencias porcentuales
    const moDiff = item.motorA.mo && item.motorB.mo 
      ? (((item.motorB.mo - item.motorA.mo) / item.motorA.mo) * 100).toFixed(1) 
      : '0.0';
    const mnDiff = item.motorA.mn && item.motorB.mn 
      ? (((item.motorB.mn - item.motorA.mn) / item.motorA.mn) * 100).toFixed(1) 
      : '0.0';
    const rpmDiff = item.motorA.rpm && item.motorB.rpm 
      ? (((item.motorB.rpm - item.motorA.rpm) / item.motorA.rpm) * 100).toFixed(1) 
      : '0.0';

    // Encoder recomendado (simplificado)
    const encoderRec = item.comparison.encoderRecommendation?.bestMatch || 'N/A';
    
    // Conector recomendado (simplificado)
    const connectorRec = item.comparison.connectorRecommendation?.recommendedFkmConnector || 'N/A';

    const rowData = [
      index + 1,
      item.motorA.model,
      item.motorB.model,
      item.motorA.mo,
      item.motorB.mo,
      `${moDiff}%`,
      item.motorA.mn,
      item.motorB.mn,
      `${mnDiff}%`,
      item.motorA.rpm,
      item.motorB.rpm,
      `${rpmDiff}%`,
      encoderRec,
      connectorRec,
    ];

    rowData.forEach((value, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      cell.value = value;
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { 
        horizontal: colIndex === 0 ? 'center' : (colIndex <= 2 ? 'left' : 'center'), 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      };

      // Colorear diferencias porcentuales
      if ([5, 8, 11].includes(colIndex)) {
        const diffStr = colIndex === 5 ? moDiff : (colIndex === 8 ? mnDiff : rpmDiff);
        const diff = parseFloat(diffStr as string);
        if (Math.abs(diff) > 10) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF4E6' }, // Naranja claro
          };
        }
      }
    });

    dataRow.height = 20;
    currentRow++;
  });

  currentRow += 2;

  // Resumen
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  const summaryCell = worksheet.getCell(`A${currentRow}`);
  summaryCell.value = language === 'es' 
    ? `Total de conversiones: ${items.length}` 
    : `Total conversions: ${items.length}`;
  summaryCell.font = { name: 'Arial', size: 11, bold: true };
  summaryCell.alignment = { horizontal: 'left', vertical: 'middle' };

  currentRow += 2;

  // Nota al pie
  worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
  const noteCell = worksheet.getCell(`A${currentRow}`);
  noteCell.value = language === 'es'
    ? 'Nota: Las diferencias porcentuales resaltadas en naranja superan el 10%. Verifique las especificaciones antes de realizar el reemplazo.'
    : 'Note: Percentage differences highlighted in orange exceed 10%. Verify specifications before replacement.';
  noteCell.font = { name: 'Arial', size: 9, italic: true };
  noteCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  worksheet.getRow(currentRow).height = 30;

  // Generar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `FAGOR_Conversion_Consolidada_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}
