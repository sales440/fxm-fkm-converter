import ExcelJS from 'exceljs';
import type { ComparisonResult } from '@/types/motor';
import { getEncoderRecommendation, getConnectorRecommendation } from './encoderConnectorRecommendations';

const FAGOR_RED = 'FFDC1E26'; // Hex para #DC1E26

export async function exportToExcel(comparison: ComparisonResult, language: string = 'es') {
  // Obtener recomendaciones
  const encoderRec = getEncoderRecommendation(comparison.fxm.model);
  const connectorRec = getConnectorRecommendation(comparison.fxm.model, comparison.fkm.model);
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(language === 'es' ? 'Reporte de Conversión' : 'Conversion Report');
  
  // Configurar anchos de columnas
  worksheet.columns = [
    { width: 30 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 15 }
  ];
  
  let currentRow = 1;
  
  // Cargar logo de FAGOR
  try {
    const logoResponse = await fetch('/fagor-logo.jpg');
    const logoBlob = await logoResponse.blob();
    const logoArrayBuffer = await logoBlob.arrayBuffer();
    
    const logoId = workbook.addImage({
      buffer: logoArrayBuffer,
      extension: 'jpeg',
    });
    
    // Insertar logo en la esquina superior izquierda (A1:C3)
    worksheet.addImage(logoId, 'A1:C3');
  } catch (error) {
    console.error('Error loading logo:', error);
  }
  
  // Información de contacto (derecha) - Fusionar celdas D1:E3
  worksheet.mergeCells('D1:E1');
  worksheet.mergeCells('D2:E2');
  worksheet.mergeCells('D3:E3');
  
  const contactCell1 = worksheet.getCell('D1');
  contactCell1.value = 'FAGOR Automation USA';
  contactCell1.font = { name: 'Arial', size: 10, bold: true };
  contactCell1.alignment = { horizontal: 'right', vertical: 'middle' };
  
  const contactCell2 = worksheet.getCell('D2');
  contactCell2.value = '1755 Park Street, Naperville, IL 60563';
  contactCell2.font = { name: 'Arial', size: 9 };
  contactCell2.alignment = { horizontal: 'right', vertical: 'middle' };
  
  const contactCell3 = worksheet.getCell('D3');
  contactCell3.value = 'Tel: +1 (630) 851-3050';
  contactCell3.font = { name: 'Arial', size: 9 };
  contactCell3.alignment = { horizontal: 'right', vertical: 'middle' };
  
  currentRow = 4;
  
  // Línea separadora roja (fusionar A4:E4)
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const separatorCell = worksheet.getCell(`A${currentRow}`);
  separatorCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: FAGOR_RED }
  };
  worksheet.getRow(currentRow).height = 3;
  
  currentRow++;
  
  // Título principal (fusionar A5:E5)
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const titleCell = worksheet.getCell(`A${currentRow}`);
  titleCell.value = language === 'es' ? 'Reporte de Conversión de Motores: FXM a FKM' : 'Motor Conversion Report: FXM to FKM';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: FAGOR_RED } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 25;
  
  currentRow += 2;
  
  // Información de motores
  const fxmModelRow = worksheet.getRow(currentRow);
  fxmModelRow.getCell(1).value = language === 'es' ? 'Modelo FXM:' : 'FXM Model:';
  fxmModelRow.getCell(1).font = { name: 'Arial', size: 11, bold: true };
  fxmModelRow.getCell(2).value = comparison.fxm.model;
  fxmModelRow.getCell(2).font = { name: 'Arial', size: 11 };
  
  currentRow++;
  
  const fkmModelRow = worksheet.getRow(currentRow);
  fkmModelRow.getCell(1).value = language === 'es' ? 'Modelo FKM Equivalente:' : 'Equivalent FKM Model:';
  fkmModelRow.getCell(1).font = { name: 'Arial', size: 11, bold: true };
  fkmModelRow.getCell(2).value = comparison.fkm.model;
  fkmModelRow.getCell(2).font = { name: 'Arial', size: 11 };
  
  currentRow += 2;
  
  // Sección: Especificaciones Eléctricas
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const electricalTitleCell = worksheet.getCell(`A${currentRow}`);
  electricalTitleCell.value = language === 'es' ? 'Especificaciones Eléctricas' : 'Electrical Specifications';
  electricalTitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  electricalTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: FAGOR_RED }
  };
  electricalTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;
  
  currentRow++;
  
  // Encabezados de tabla eléctrica
  const electricalHeaders = worksheet.getRow(currentRow);
  const headers = [
    language === 'es' ? 'Especificación' : 'Specification',
    'FXM',
    'FKM',
    language === 'es' ? 'Diferencia' : 'Difference',
    language === 'es' ? 'Porcentaje' : 'Percentage'
  ];
  
  headers.forEach((header, index) => {
    const cell = electricalHeaders.getCell(index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: FAGOR_RED }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  currentRow++;
  
  // Datos eléctricos
  const electricalData = [
    [language === 'es' ? 'Par a Rótor Parado (Mo)' : 'Stall Torque (Mo)', 
     `${comparison.differences.electrical.mo.fxm} Nm`, 
     `${comparison.differences.electrical.mo.fkm} Nm`, 
     `${comparison.differences.electrical.mo.diff?.toFixed(2)} Nm`,
     `${comparison.differences.electrical.mo.percent?.toFixed(1)}%`],
    [language === 'es' ? 'Par Nominal (Mn)' : 'Rated Torque (Mn)', 
     `${comparison.differences.electrical.mn.fxm} Nm`, 
     `${comparison.differences.electrical.mn.fkm} Nm`, 
     `${comparison.differences.electrical.mn.diff?.toFixed(2)} Nm`,
     `${comparison.differences.electrical.mn.percent?.toFixed(1)}%`],
    [language === 'es' ? 'Par de Pico (Mp)' : 'Peak Torque (Mp)', 
     `${comparison.differences.electrical.mp.fxm} Nm`, 
     `${comparison.differences.electrical.mp.fkm} Nm`, 
     `${comparison.differences.electrical.mp.diff?.toFixed(2)} Nm`,
     `${comparison.differences.electrical.mp.percent?.toFixed(1)}%`],
    [language === 'es' ? 'Corriente en Reposo (Io)' : 'Stall Current (Io)', 
     `${comparison.differences.electrical.io.fxm} Arms`, 
     `${comparison.differences.electrical.io.fkm} Arms`, 
     `${comparison.differences.electrical.io.diff?.toFixed(2)} Arms`,
     `${comparison.differences.electrical.io.percent?.toFixed(1)}%`],
    [language === 'es' ? 'Velocidad Nominal (RPM)' : 'Rated Speed (RPM)', 
     `${comparison.differences.electrical.rpm.fxm}`, 
     `${comparison.differences.electrical.rpm.fkm}`, 
     `${comparison.differences.electrical.rpm.diff}`,
     `${comparison.differences.electrical.rpm.percent?.toFixed(1)}%`],
    [language === 'es' ? 'Inercia (J)' : 'Inertia (J)', 
     `${comparison.differences.electrical.j.fxm} kg/cm²`, 
     `${comparison.differences.electrical.j.fkm} kg/cm²`, 
     `${comparison.differences.electrical.j.diff?.toFixed(2)} kg/cm²`,
     `${comparison.differences.electrical.j.percent?.toFixed(1)}%`],
    [language === 'es' ? 'Potencia Calculada (Pcal)' : 'Calculated Power (Pcal)', 
     `${comparison.differences.electrical.pcal.fxm?.toFixed(2)} kW`, 
     `${comparison.differences.electrical.pcal.fkm?.toFixed(2)} kW`, 
     `${comparison.differences.electrical.pcal.diff?.toFixed(2)} kW`,
     `${comparison.differences.electrical.pcal.percent?.toFixed(1)}%`],
  ];
  
  electricalData.forEach((rowData) => {
    const row = worksheet.getRow(currentRow);
    rowData.forEach((value, index) => {
      const cell = row.getCell(index + 1);
      cell.value = value;
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = { horizontal: index === 0 ? 'left' : 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;
  });
  
  currentRow++;
  
  // Sección: Dimensiones Mecánicas
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const dimensionsTitleCell = worksheet.getCell(`A${currentRow}`);
  dimensionsTitleCell.value = language === 'es' ? 'Dimensiones Mecánicas' : 'Mechanical Dimensions';
  dimensionsTitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  dimensionsTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: FAGOR_RED }
  };
  dimensionsTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;
  
  currentRow++;
  
  // Encabezados de tabla dimensional
  const dimensionsHeaders = worksheet.getRow(currentRow);
  const dimHeaders = [
    language === 'es' ? 'Dimensión' : 'Dimension',
    'FXM',
    'FKM',
    language === 'es' ? 'Diferencia' : 'Difference',
    language === 'es' ? 'Estado' : 'Status'
  ];
  
  dimHeaders.forEach((header, index) => {
    const cell = dimensionsHeaders.getCell(index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: FAGOR_RED }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  currentRow++;
  
  // Datos dimensionales
  const dimensionsData = [
    [language === 'es' ? 'Longitud Total (L)' : 'Total Length (L)', 
     `${comparison.differences.dimensions.l.fxm} mm`, 
     `${comparison.differences.dimensions.l.fkm} mm`, 
     `${comparison.differences.dimensions.l.diff} mm`,
     comparison.differences.dimensions.l.diff === 0 ? 'Same' : 'Different'],
    [language === 'es' ? 'Ancho de Carcasa (AC)' : 'Housing Width (AC)', 
     `${comparison.differences.dimensions.ac.fxm} mm`, 
     `${comparison.differences.dimensions.ac.fkm} mm`, 
     `${comparison.differences.dimensions.ac.diff} mm`,
     comparison.differences.dimensions.ac.diff === 0 ? 'Same' : 'Different'],
    [language === 'es' ? 'Diámetro de Eje (N)' : 'Shaft Diameter (N)', 
     `${comparison.differences.dimensions.n.fxm} mm`, 
     `${comparison.differences.dimensions.n.fkm} mm`, 
     `${comparison.differences.dimensions.n.diff} mm`,
     comparison.differences.dimensions.n.diff === 0 ? 'Same' : 'Different'],
    [language === 'es' ? 'Diámetro de Brida (D)' : 'Flange Diameter (D)', 
     `${comparison.differences.dimensions.d.fxm} mm`, 
     `${comparison.differences.dimensions.d.fkm} mm`, 
     `${comparison.differences.dimensions.d.diff} mm`,
     comparison.differences.dimensions.d.diff === 0 ? 'Same' : 'Different'],
    [language === 'es' ? 'Altura de Eje (E)' : 'Shaft Height (E)', 
     `${comparison.differences.dimensions.e.fxm} mm`, 
     `${comparison.differences.dimensions.e.fkm} mm`, 
     `${comparison.differences.dimensions.e.diff} mm`,
     comparison.differences.dimensions.e.diff === 0 ? 'Same' : 'Different'],
    [language === 'es' ? 'Longitud de Montaje (M)' : 'Mounting Length (M)', 
     `${comparison.differences.dimensions.m.fxm} mm`, 
     `${comparison.differences.dimensions.m.fkm} mm`, 
     `${comparison.differences.dimensions.m.diff} mm`,
     comparison.differences.dimensions.m.diff === 0 ? 'Same' : 'Different'],
  ];
  
  dimensionsData.forEach((rowData) => {
    const row = worksheet.getRow(currentRow);
    rowData.forEach((value, index) => {
      const cell = row.getCell(index + 1);
      cell.value = value;
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = { horizontal: index === 0 ? 'left' : 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;
  });
  
  currentRow++;
  
  // Sección: Recomendaciones de Encoders
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const encoderTitleCell = worksheet.getCell(`A${currentRow}`);
  encoderTitleCell.value = language === 'es' ? 'Recomendaciones de Encoders' : 'Encoder Recommendations';
  encoderTitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  encoderTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: FAGOR_RED }
  };
  encoderTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;
  
  currentRow++;
  
  // Datos de encoders
  const encoderDataRows = [
    [language === 'es' ? 'Encoder FXM:' : 'FXM Encoder:', encoderRec?.fxmEncoder || 'N/A'],
    [language === 'es' ? 'Encoder FKM Recomendado:' : 'Recommended FKM Encoder:', encoderRec?.bestMatch || 'N/A'],
    [language === 'es' ? 'Opciones Alternativas:' : 'Alternative Options:', encoderRec?.recommendedFkmEncoders.join(', ') || 'N/A'],
    [language === 'es' ? 'Notas:' : 'Notes:', encoderRec?.notes || ''],
  ];
  
  encoderDataRows.forEach(([label, value]) => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
    row.getCell(2).value = value;
    row.getCell(2).font = { name: 'Arial', size: 9 };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    currentRow++;
  });
  
  currentRow++;
  
  // Sección: Recomendaciones de Conectores
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const connectorTitleCell = worksheet.getCell(`A${currentRow}`);
  connectorTitleCell.value = language === 'es' ? 'Recomendaciones de Conectores de Potencia' : 'Power Connector Recommendations';
  connectorTitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  connectorTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: FAGOR_RED }
  };
  connectorTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;
  
  currentRow++;
  
  // Datos de conectores
  const connectorDataRows = [
    [language === 'es' ? 'Conector FXM:' : 'FXM Connector:', connectorRec?.fxmConnector || 'N/A'],
    [language === 'es' ? 'Conector FKM Recomendado:' : 'Recommended FKM Connector:', connectorRec?.recommendedFkmConnector || 'N/A'],
    [language === 'es' ? 'Calibre de Cable:' : 'Wire Gauge:', connectorRec?.wireGauge || 'N/A'],
    [language === 'es' ? 'Conectores Alternativos:' : 'Alternative Connectors:', connectorRec?.alternativeConnectors.join(', ') || 'N/A'],
    [language === 'es' ? 'Notas:' : 'Notes:', connectorRec?.notes || ''],
  ];
  
  connectorDataRows.forEach(([label, value]) => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
    row.getCell(2).value = value;
    row.getCell(2).font = { name: 'Arial', size: 9 };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    currentRow++;
  });
  
  currentRow += 2;
  
  // Footer
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const footerCell = worksheet.getCell(`A${currentRow}`);
  footerCell.value = '© 2024 FAGOR Automation. All rights reserved. | Open to your world';
  footerCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF666666' } };
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Generar y descargar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `FXM_to_FKM_Conversion_${comparison.fxm.model.replace(/\s+/g, '_')}_to_${comparison.fkm.model.replace(/\s+/g, '_')}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}
