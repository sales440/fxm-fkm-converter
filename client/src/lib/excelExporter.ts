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
    { width: 28 },
    { width: 35 },
    { width: 35 },
    { width: 20 },
    { width: 18 }
  ];
  
  // Configurar altura de las primeras filas para el logo
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  worksheet.getRow(3).height = 25;
  
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
    
    // Insertar logo en la esquina superior izquierda (A1:B2) - tamaño más pequeño y profesional
    worksheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 180, height: 60 }
    });
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
    [language === 'es' ? 'Drive Recomendado' : 'Recommended Drive',
     `${comparison.fxm.recommended_drive || '-'}`,
     `${comparison.fkm.recommended_drive || '-'}`,
     comparison.fxm.recommended_drive !== comparison.fkm.recommended_drive ? (language === 'es' ? 'Verificar' : 'Check') : '-',
     '-'],
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
  
  currentRow += 2;
  
  // ============= SECCIÓN: DIFERENCIAS MECÁNICAS DE BRIDAS =============
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const flangeTitleCell = worksheet.getCell(`A${currentRow}`);
  flangeTitleCell.value = language === 'es' ? 'Diferencias Mecánicas de Bridas' : 'Flange Mechanical Differences';
  flangeTitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  flangeTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: FAGOR_RED }
  };
  flangeTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;
  
  currentRow++;
  currentRow += 2; // Espacio antes de las imágenes
  
  // Guardar la fila donde empezarán las imágenes de bridas
  const flangeImageStartRow = currentRow;
  
  // Agregar imágenes de bridas lado a lado
  try {
    // Imagen FXM Flange (izquierda)
    const fxmFlangeResponse = await fetch('/flange-fxm.png');
    const fxmFlangeBlob = await fxmFlangeResponse.blob();
    const fxmFlangeArrayBuffer = await fxmFlangeBlob.arrayBuffer();
    
    const fxmFlangeId = workbook.addImage({
      buffer: fxmFlangeArrayBuffer,
      extension: 'png',
    });
    
    worksheet.addImage(fxmFlangeId, {
      tl: { col: 0, row: flangeImageStartRow - 1 },
      ext: { width: 150, height: 150 }
    });
    
    // Imagen FKM Flange (derecha)
    const fkmFlangeResponse = await fetch('/flange-fkm.png');
    const fkmFlangeBlob = await fkmFlangeResponse.blob();
    const fkmFlangeArrayBuffer = await fkmFlangeBlob.arrayBuffer();
    
    const fkmFlangeId = workbook.addImage({
      buffer: fkmFlangeArrayBuffer,
      extension: 'png',
    });
    
    worksheet.addImage(fkmFlangeId, {
      tl: { col: 2.5, row: flangeImageStartRow - 1 },
      ext: { width: 150, height: 150 }
    });
  } catch (error) {
    console.error('Error loading flange images:', error);
  }
  
  // Avanzar filas para dejar espacio a las imágenes (aprox 10 filas para 150px de altura)
  currentRow += 10;
  
  // Encabezados de tabla de bridas
  const flangeHeaders = worksheet.getRow(currentRow);
  const flangeHeaderLabels = [
    language === 'es' ? 'Dimensión de Brida' : 'Flange Dimension',
    'FXM',
    'FKM',
    language === 'es' ? 'Diferencia' : 'Difference',
    language === 'es' ? 'Estado' : 'Status'
  ];
  
  flangeHeaderLabels.forEach((header, index) => {
    const cell = flangeHeaders.getCell(index + 1);
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
  
  // Datos de bridas
  const flangeData = [
    [
      language === 'es' ? 'Diámetro de Brida (D)' : 'Flange Diameter (D)',
      `${comparison.fxm.dimensions.d} mm`,
      `${comparison.fkm.dimensions.d} mm`,
      `${comparison.differences.dimensions.d.diff} mm`,
      comparison.differences.dimensions.d.diff === 0 ? (language === 'es' ? 'Compatible' : 'Compatible') : (language === 'es' ? 'Diferente' : 'Different')
    ],
    [
      language === 'es' ? 'Altura de Eje (E)' : 'Shaft Height (E)',
      `${comparison.fxm.dimensions.e} mm`,
      `${comparison.fkm.dimensions.e} mm`,
      `${comparison.differences.dimensions.e.diff} mm`,
      comparison.differences.dimensions.e.diff === 0 ? (language === 'es' ? 'Compatible' : 'Compatible') : (language === 'es' ? 'Diferente' : 'Different')
    ],
    [
      language === 'es' ? 'Diámetro de Eje (N)' : 'Shaft Diameter (N)',
      `${comparison.fxm.dimensions.n} mm`,
      `${comparison.fkm.dimensions.n} mm`,
      `${comparison.differences.dimensions.n.diff} mm`,
      comparison.differences.dimensions.n.diff === 0 ? (language === 'es' ? 'Compatible' : 'Compatible') : (language === 'es' ? 'Diferente' : 'Different')
    ],
    [
      language === 'es' ? 'Longitud de Montaje (M)' : 'Mounting Length (M)',
      `${comparison.fxm.dimensions.m} mm`,
      `${comparison.fkm.dimensions.m} mm`,
      `${comparison.differences.dimensions.m.diff} mm`,
      comparison.differences.dimensions.m.diff === 0 ? (language === 'es' ? 'Compatible' : 'Compatible') : (language === 'es' ? 'Diferente' : 'Different')
    ]
  ];
  
  flangeData.forEach((rowData) => {
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
      
      // Colorear estado según compatibilidad
      if (index === 4) {
        if (value === 'Compatible' || value === 'Compatible') {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF008000' } };
        } else {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFF8C00' } };
        }
      }
    });
    currentRow++;
  });
  
  // Nota de compatibilidad de brida
  currentRow++;
  const allDimensionsMatch = 
    comparison.differences.dimensions.d.diff === 0 &&
    comparison.differences.dimensions.e.diff === 0 &&
    comparison.differences.dimensions.n.diff === 0 &&
    comparison.differences.dimensions.m.diff === 0;
  
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const compatibilityCell = worksheet.getCell(`A${currentRow}`);
  compatibilityCell.value = allDimensionsMatch
    ? (language === 'es' ? '✓ Brida 100% Compatible - Montaje Directo' : '✓ 100% Compatible Flange - Direct Mount')
    : (language === 'es' ? '⚠ Brida Diferente - Puede Requerir Adaptador' : '⚠ Different Flange - May Require Adapter');
  compatibilityCell.font = { 
    name: 'Arial', 
    size: 10, 
    bold: true, 
    color: { argb: allDimensionsMatch ? 'FF008000' : 'FFFF8C00' } 
  };
  compatibilityCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 25;
  
  currentRow += 2;
  
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
  
  // Agregar 2 filas vacías de separación antes de la imagen
  currentRow += 2;
  
  // Guardar la fila donde empezará la imagen del encoder
  const encoderImageStartRow = currentRow;
  
  // Agregar imagen del encoder
  try {
    const encoderImgResponse = await fetch('/encoder-industrial.png');
    const encoderImgBlob = await encoderImgResponse.blob();
    const encoderImgArrayBuffer = await encoderImgBlob.arrayBuffer();
    
    const encoderImgId = workbook.addImage({
      buffer: encoderImgArrayBuffer,
      extension: 'png',
    });
    
    // Insertar imagen del encoder en la columna D-E con suficiente espacio
    worksheet.addImage(encoderImgId, {
      tl: { col: 3.5, row: encoderImageStartRow - 1 },
      ext: { width: 120, height: 120 }
    });
  } catch (error) {
    console.error('Error loading encoder image:', error);
  }
  
  // Datos de encoders (lado izquierdo)
  const encoderDataRows = [
    [language === 'es' ? 'Encoder FXM:' : 'FXM Encoder:', encoderRec?.fxmEncoder || 'N/A'],
    [language === 'es' ? 'Encoder FKM Recomendado:' : 'Recommended FKM Encoder:', encoderRec?.bestMatch || 'N/A'],
    [language === 'es' ? 'Opciones Alternativas:' : 'Alternative Options:', encoderRec?.recommendedFkmEncoders.join(', ') || 'N/A'],
    [language === 'es' ? 'Notas:' : 'Notes:', encoderRec?.notes || ''],
  ];
  
  encoderDataRows.forEach(([label, value], index) => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
    row.getCell(2).value = value;
    row.getCell(2).font = { name: 'Arial', size: 9 };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
    // Altura mayor para la fila de Notas (index 3)
    row.height = index === 3 ? 60 : 22;
    currentRow++;
  });
  
  currentRow += 2;
  
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
  
  // Agregar 2 filas vacías de separación antes de la imagen
  currentRow += 2;
  
  // Guardar la fila donde empezará la imagen del conector
  const connectorImageStartRow = currentRow;
  
  // Agregar imagen del conector
  try {
    const connectorImgResponse = await fetch('/connector-industrial.png');
    const connectorImgBlob = await connectorImgResponse.blob();
    const connectorImgArrayBuffer = await connectorImgBlob.arrayBuffer();
    
    const connectorImgId = workbook.addImage({
      buffer: connectorImgArrayBuffer,
      extension: 'png',
    });
    
    // Insertar imagen del conector en la columna D-E con suficiente espacio
    worksheet.addImage(connectorImgId, {
      tl: { col: 3.5, row: connectorImageStartRow - 1 },
      ext: { width: 120, height: 120 }
    });
  } catch (error) {
    console.error('Error loading connector image:', error);
  }
  
  // Datos de conectores (lado izquierdo)
  const connectorDataRows = [
    [language === 'es' ? 'Conector FXM:' : 'FXM Connector:', connectorRec?.fxmConnector || 'N/A'],
    [language === 'es' ? 'Conector FKM Recomendado:' : 'Recommended FKM Connector:', connectorRec?.recommendedFkmConnector || 'N/A'],
    [language === 'es' ? 'Calibre de Cable:' : 'Wire Gauge:', connectorRec?.wireGauge || 'N/A'],
    [language === 'es' ? 'Conectores Alternativos:' : 'Alternative Connectors:', connectorRec?.alternativeConnectors.join(', ') || 'N/A'],
    [language === 'es' ? 'Notas:' : 'Notes:', connectorRec?.notes || ''],
  ];
  
  connectorDataRows.forEach(([label, value], index) => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
    row.getCell(2).value = value;
    row.getCell(2).font = { name: 'Arial', size: 9 };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
    // Altura mayor para la fila de Notas (index 4)
    row.height = index === 4 ? 60 : 22;
    currentRow++;
  });
  
  currentRow += 2;
  
  // Footer
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const footerCell = worksheet.getCell(`A${currentRow}`);
  footerCell.value = '© 2024 FAGOR Automation. All rights reserved. | Open to your world';
  footerCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF666666' } };
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // ============= NUEVA HOJA: GUÍA DE NOMENCLATURA =============
  const nomenclatureSheet = workbook.addWorksheet(language === 'es' ? 'Guía de Nomenclatura' : 'Nomenclature Guide');
  
  // Configurar anchos de columnas
  nomenclatureSheet.columns = [
    { width: 20 },
    { width: 30 },
    { width: 60 }
  ];
  
  let nomRow = 1;
  
  // Título
  nomenclatureSheet.mergeCells(`A${nomRow}:C${nomRow}`);
  const nomTitleCell = nomenclatureSheet.getCell(`A${nomRow}`);
  nomTitleCell.value = language === 'es' ? 'Guía de Nomenclatura de Motores FAGOR' : 'FAGOR Motor Nomenclature Guide';
  nomTitleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: FAGOR_RED } };
  nomTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  nomenclatureSheet.getRow(nomRow).height = 30;
  
  nomRow += 2;
  
  // Introducción
  nomenclatureSheet.mergeCells(`A${nomRow}:C${nomRow}`);
  const introCell = nomenclatureSheet.getCell(`A${nomRow}`);
  introCell.value = language === 'es'
    ? 'Cada motor FAGOR tiene un código de modelo que describe sus características técnicas. Entender este código le ayudará a seleccionar el motor correcto para su aplicación.'
    : 'Each FAGOR motor has a model code that describes its technical characteristics. Understanding this code will help you select the correct motor for your application.';
  introCell.font = { name: 'Arial', size: 10 };
  introCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  nomenclatureSheet.getRow(nomRow).height = 40;
  
  nomRow += 2;
  
  // Ejemplo
  nomenclatureSheet.mergeCells(`A${nomRow}:C${nomRow}`);
  const exampleCell = nomenclatureSheet.getCell(`A${nomRow}`);
  exampleCell.value = language === 'es' ? 'Ejemplo: FXM 75.30A.E1.010' : 'Example: FXM 75.30A.E1.010';
  exampleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: FAGOR_RED } };
  exampleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  nomenclatureSheet.getRow(nomRow).height = 25;
  
  nomRow += 2;
  
  // Encabezados de tabla
  const nomHeaders = nomenclatureSheet.getRow(nomRow);
  const nomHeaderLabels = [
    language === 'es' ? 'Código' : 'Code',
    language === 'es' ? 'Descripción' : 'Description',
    language === 'es' ? 'Valores Posibles' : 'Possible Values'
  ];
  
  nomHeaderLabels.forEach((header, index) => {
    const cell = nomHeaders.getCell(index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
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
  nomenclatureSheet.getRow(nomRow).height = 25;
  
  nomRow++;
  
  // Datos de nomenclatura
  const nomenclatureData = [
    [
      'FXM / FKM',
      language === 'es' ? 'Serie del Motor' : 'Motor Series',
      language === 'es' ? 'FXM = Serie antigua\nFKM = Serie nueva' : 'FXM = Old series\nFKM = New series'
    ],
    [
      '75',
      language === 'es' ? 'Tamaño de Brida' : 'Flange Size',
      language === 'es' ? 'Diámetro de brida en mm\n(11, 14, 21, 22, 31, 32, 41, 42, 62, 63, 64, 66, 75, 78, 82, 83, 84, 85, 94, 95, 96)' : 'Flange diameter in mm\n(11, 14, 21, 22, 31, 32, 41, 42, 62, 63, 64, 66, 75, 78, 82, 83, 84, 85, 94, 95, 96)'
    ],
    [
      '30',
      language === 'es' ? 'Velocidad Nominal' : 'Rated Speed',
      language === 'es' ? '20 = 2000 rpm\n30 = 3000 rpm\n40 = 4000 rpm\n45 = 4500 rpm\n50 = 5000 rpm\n60 = 6000 rpm' : '20 = 2000 rpm\n30 = 3000 rpm\n40 = 4000 rpm\n45 = 4500 rpm\n50 = 5000 rpm\n60 = 6000 rpm'
    ],
    [
      'A',
      language === 'es' ? 'Tipo de Devanado' : 'Winding Type',
      language === 'es' ? 'A = Devanado estándar\nB = Devanado especial\nC = Devanado de alta velocidad' : 'A = Standard winding\nB = Special winding\nC = High-speed winding'
    ],
    [
      'E1',
      language === 'es' ? 'Tipo de Encoder' : 'Encoder Type',
      language === 'es' ? 'E1 = Incremental 1024 ppt\nE2 = Incremental 2048 ppt\nE3 = Incremental 128 ppt\nE4 = Absoluto\nxx = Sin encoder' : 'E1 = Incremental 1024 ppt\nE2 = Incremental 2048 ppt\nE3 = Incremental 128 ppt\nE4 = Absolute\nxx = No encoder'
    ],
    [
      '010',
      language === 'es' ? 'Configuración' : 'Configuration',
      language === 'es' ? 'x00 = Configuración estándar\nx01 = Par alto\nx10 = Eje largo\nx11 = Par alto + Eje largo\n200.3 = Configuración especial' : 'x00 = Standard configuration\nx01 = High torque\nx10 = Long shaft\nx11 = High torque + Long shaft\n200.3 = Special configuration'
    ]
  ];
  
  nomenclatureData.forEach((rowData) => {
    const row = nomenclatureSheet.getRow(nomRow);
    rowData.forEach((value, index) => {
      const cell = row.getCell(index + 1);
      cell.value = value;
      cell.font = { name: 'Arial', size: 10, bold: index === 0 };
      cell.alignment = { horizontal: index === 0 ? 'center' : 'left', vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    row.height = 60; // Altura mayor para permitir múltiples líneas
    nomRow++;
  });
  
  nomRow += 2;
  
  // Nota importante
  nomenclatureSheet.mergeCells(`A${nomRow}:C${nomRow}`);
  const nomNoteCell = nomenclatureSheet.getCell(`A${nomRow}`);
  nomNoteCell.value = language === 'es'
    ? 'Nota Importante: Al convertir de FXM a FKM, verifique siempre las dimensiones mecánicas de la brida y las especificaciones eléctricas. Algunos modelos pueden requerir adaptadores mecánicos o cambios en el cableado. Consulte con el departamento técnico de FAGOR para aplicaciones críticas.'
    : 'Important Note: When converting from FXM to FKM, always verify the mechanical flange dimensions and electrical specifications. Some models may require mechanical adapters or wiring changes. Consult with FAGOR technical department for critical applications.';
  nomNoteCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: FAGOR_RED } };
  nomNoteCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  nomenclatureSheet.getRow(nomRow).height = 60;
  
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
