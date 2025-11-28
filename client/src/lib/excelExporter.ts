import * as XLSX from 'xlsx-js-style';
import type { ComparisonResult } from '@/types/motor';
import { getEncoderRecommendation, getConnectorRecommendation } from './encoderConnectorRecommendations';

export async function exportToExcel(comparison: ComparisonResult, language: string = 'es') {
  // Obtener recomendaciones
  const encoderRec = getEncoderRecommendation(comparison.fxm.model);
  const connectorRec = getConnectorRecommendation(comparison.fxm.model, comparison.fkm.model);
  
  // Crear workbook
  const wb = XLSX.utils.book_new();
  
  // Preparar datos
  const data: any[][] = [];
  
  // Fila 1-3: Header con logo (izquierda) y dirección (derecha)
  data.push(['FAGOR Automation', '', '', '', '', '', 'FAGOR Automation USA']);
  data.push(['', '', '', '', '', '', '1755 Park Street, Naperville, IL 60563']);
  data.push(['', '', '', '', '', '', 'Tel: +1 (630) 851-3050']);
  data.push(['']); // Espacio (fila 4)
  
  // Título principal (fila 5)
  data.push(['Motor Conversion Report: FXM to FKM']);
  data.push(['']); // Espacio (fila 6)
  
  // Información de motores (filas 7-8)
  data.push(['FXM Model:', comparison.fxm.model]);
  data.push(['FKM Equivalent:', comparison.fkm.model]);
  data.push(['']); // Espacio (fila 9)
  
  // Título: Especificaciones Eléctricas (fila 10)
  data.push(['Electrical Specifications']);
  data.push(['']); // Espacio (fila 11)
  
  // Header de tabla eléctrica (fila 12)
  data.push(['Specification', 'FXM', 'FKM', 'Difference', 'Percentage']);
  
  // Datos eléctricos (filas 13-19)
  const electricalStartRow = data.length;
  data.push([
    'Stall Torque (Mo)',
    comparison.differences.electrical.mo.fxm,
    comparison.differences.electrical.mo.fkm,
    comparison.differences.electrical.mo.diff,
    comparison.differences.electrical.mo.percent ? `${comparison.differences.electrical.mo.percent.toFixed(1)}%` : '-'
  ]);
  data.push([
    'Rated Torque (Mn)',
    comparison.differences.electrical.mn.fxm,
    comparison.differences.electrical.mn.fkm,
    comparison.differences.electrical.mn.diff,
    comparison.differences.electrical.mn.percent ? `${comparison.differences.electrical.mn.percent.toFixed(1)}%` : '-'
  ]);
  data.push([
    'Peak Torque (Mp)',
    comparison.differences.electrical.mp.fxm,
    comparison.differences.electrical.mp.fkm,
    comparison.differences.electrical.mp.diff,
    comparison.differences.electrical.mp.percent ? `${comparison.differences.electrical.mp.percent.toFixed(1)}%` : '-'
  ]);
  data.push([
    'Stall Current (Io)',
    comparison.differences.electrical.io.fxm,
    comparison.differences.electrical.io.fkm,
    comparison.differences.electrical.io.diff,
    comparison.differences.electrical.io.percent ? `${comparison.differences.electrical.io.percent.toFixed(1)}%` : '-'
  ]);
  data.push([
    'Rated Speed (RPM)',
    comparison.differences.electrical.rpm.fxm,
    comparison.differences.electrical.rpm.fkm,
    comparison.differences.electrical.rpm.diff,
    comparison.differences.electrical.rpm.percent ? `${comparison.differences.electrical.rpm.percent.toFixed(1)}%` : '-'
  ]);
  data.push([
    'Inertia (J)',
    comparison.differences.electrical.j.fxm,
    comparison.differences.electrical.j.fkm,
    comparison.differences.electrical.j.diff,
    comparison.differences.electrical.j.percent ? `${comparison.differences.electrical.j.percent.toFixed(1)}%` : '-'
  ]);
  data.push([
    'Calculated Power (Pcal)',
    comparison.differences.electrical.pcal.fxm,
    comparison.differences.electrical.pcal.fkm,
    comparison.differences.electrical.pcal.diff,
    comparison.differences.electrical.pcal.percent ? `${comparison.differences.electrical.pcal.percent.toFixed(1)}%` : '-'
  ]);
  data.push(['']); // Espacio
  
  // Título: Dimensiones Mecánicas
  const mechanicalTitleRow = data.length;
  data.push(['Mechanical Dimensions']);
  data.push(['']); // Espacio
  
  // Header de tabla dimensional
  const dimensionsHeaderRow = data.length;
  data.push(['Dimension', 'FXM (mm)', 'FKM (mm)', 'Difference (mm)']);
  
  // Datos dimensionales
  const dimensionsStartRow = data.length;
  data.push([
    'Total Length (L)',
    comparison.differences.dimensions.l.fxm,
    comparison.differences.dimensions.l.fkm,
    comparison.differences.dimensions.l.diff
  ]);
  data.push([
    'Housing Width (AC)',
    comparison.differences.dimensions.ac.fxm,
    comparison.differences.dimensions.ac.fkm,
    comparison.differences.dimensions.ac.diff
  ]);
  data.push([
    'Shaft Diameter (N)',
    comparison.differences.dimensions.n.fxm,
    comparison.differences.dimensions.n.fkm,
    comparison.differences.dimensions.n.diff
  ]);
  data.push([
    'Flange Diameter (D)',
    comparison.differences.dimensions.d.fxm,
    comparison.differences.dimensions.d.fkm,
    comparison.differences.dimensions.d.diff
  ]);
  data.push([
    'Shaft Height (E)',
    comparison.differences.dimensions.e.fxm,
    comparison.differences.dimensions.e.fkm,
    comparison.differences.dimensions.e.diff
  ]);
  data.push([
    'Mounting Length (M)',
    comparison.differences.dimensions.m.fxm,
    comparison.differences.dimensions.m.fkm,
    comparison.differences.dimensions.m.diff
  ]);
  data.push(['']); // Espacio
  
  // Sección de Recomendaciones Técnicas
  if (encoderRec || connectorRec) {
    data.push(['']); // Espacio adicional
    data.push(['Technical Recommendations']);
    data.push(['']); // Espacio
    
    // Recomendaciones de Encoders
    if (encoderRec) {
      data.push(['ENCODERS']);
      data.push(['']); // Espacio
      data.push(['FXM Encoder:', encoderRec.fxmEncoder]);
      data.push(['Recommended FKM Encoder:', encoderRec.bestMatch]);
      data.push(['Alternative Options:', encoderRec.recommendedFkmEncoders.join(', ')]);
      data.push(['Note:', encoderRec.notes]);
      data.push(['']); // Espacio
    }
    
    // Recomendaciones de Conectores
    if (connectorRec) {
      data.push(['POWER CONNECTORS']);
      data.push(['']); // Espacio
      data.push(['FXM Connector:', connectorRec.fxmConnector]);
      data.push(['Recommended FKM Connector:', connectorRec.recommendedFkmConnector]);
      data.push(['Wire Gauge:', connectorRec.wireGauge]);
      if (connectorRec.alternativeConnectors.length > 0) {
        data.push(['Alternative Connectors:', connectorRec.alternativeConnectors.join(', ')]);
      }
      data.push(['Note:', connectorRec.notes]);
      data.push(['']); // Espacio
    }
  }
  data.push(['']); // Espacio
  data.push(['']); // Espacio
  
  // Footer
  data.push(['© 2024 FAGOR Automation. All rights reserved.']);
  data.push(['Open to your world']);
  
  // Crear hoja de trabajo
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Estilos FAGOR
  const fagorRed = 'DC2626'; // Color rojo corporativo FAGOR
  const white = 'FFFFFF';
  
  // Estilo para títulos (fondo rojo, texto blanco, Arial Bold)
  const titleStyle = {
    fill: { fgColor: { rgb: fagorRed } },
    font: { name: 'Arial', bold: true, color: { rgb: white }, sz: 12 },
    alignment: { vertical: 'center', horizontal: 'left' }
  };
  
  // Estilo para headers de tabla (fondo rojo, texto blanco, Arial Bold)
  const headerStyle = {
    fill: { fgColor: { rgb: fagorRed } },
    font: { name: 'Arial', bold: true, color: { rgb: white }, sz: 11 },
    alignment: { vertical: 'center', horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };
  
  // Estilo para datos de tabla
  const dataStyle = {
    font: { name: 'Arial', sz: 10 },
    alignment: { vertical: 'center', horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'CCCCCC' } },
      bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
      left: { style: 'thin', color: { rgb: 'CCCCCC' } },
      right: { style: 'thin', color: { rgb: 'CCCCCC' } }
    }
  };
  
  // Estilo para header (logo y dirección)
  const headerInfoStyle = {
    font: { name: 'Arial', bold: true, sz: 11 },
    alignment: { vertical: 'center', horizontal: 'left' }
  };
  
  // Aplicar estilos
  
  // Header (filas 1-3)
  if (ws['A1']) ws['A1'].s = headerInfoStyle;
  if (ws['G1']) ws['G1'].s = headerInfoStyle;
  if (ws['G2']) ws['G2'].s = { ...headerInfoStyle, font: { name: 'Arial', sz: 10 } };
  if (ws['G3']) ws['G3'].s = { ...headerInfoStyle, font: { name: 'Arial', sz: 10 } };
  
  // Título principal (fila 5)
  if (ws['A5']) ws['A5'].s = titleStyle;
  
  // Título "Electrical Specifications" (fila 10)
  if (ws['A10']) ws['A10'].s = titleStyle;
  
  // Header de tabla eléctrica (fila 12)
  ['A12', 'B12', 'C12', 'D12', 'E12'].forEach(cell => {
    if (ws[cell]) ws[cell].s = headerStyle;
  });
  
  // Datos eléctricos (filas 13-19)
  for (let row = 13; row <= 19; row++) {
    ['A', 'B', 'C', 'D', 'E'].forEach(col => {
      const cell = `${col}${row}`;
      if (ws[cell]) {
        ws[cell].s = col === 'A' ? 
          { ...dataStyle, alignment: { vertical: 'center', horizontal: 'left' } } : 
          dataStyle;
      }
    });
  }
  
  // Título "Mechanical Dimensions"
  const mechanicalRow = 21; // Ajustar si cambia
  if (ws[`A${mechanicalRow}`]) ws[`A${mechanicalRow}`].s = titleStyle;
  
  // Título "Technical Recommendations" (dinámico)
  let recommendationsRow = 31; // Aproximado, ajustar dinámicamente
  if (ws[`A${recommendationsRow}`]) ws[`A${recommendationsRow}`].s = titleStyle;
  
  // Subtítulos "ENCODERS" y "POWER CONNECTORS"
  const encodersRow = recommendationsRow + 2;
  const connectorsRow = encodersRow + 6; // Aproximado
  if (ws[`A${encodersRow}`]) ws[`A${encodersRow}`].s = { ...titleStyle, fill: { fgColor: { rgb: '4A5568' } } };
  if (ws[`A${connectorsRow}`]) ws[`A${connectorsRow}`].s = { ...titleStyle, fill: { fgColor: { rgb: '4A5568' } } };
  
  // Header de tabla dimensional (fila 23)
  ['A23', 'B23', 'C23', 'D23'].forEach(cell => {
    if (ws[cell]) ws[cell].s = headerStyle;
  });
  
  // Datos dimensionales (filas 24-29)
  for (let row = 24; row <= 29; row++) {
    ['A', 'B', 'C', 'D'].forEach(col => {
      const cell = `${col}${row}`;
      if (ws[cell]) {
        ws[cell].s = col === 'A' ? 
          { ...dataStyle, alignment: { vertical: 'center', horizontal: 'left' } } : 
          dataStyle;
      }
    });
  }
  
  // Ajustar anchos de columna
  ws['!cols'] = [
    { wch: 30 }, // Columna A
    { wch: 15 }, // Columna B
    { wch: 15 }, // Columna C
    { wch: 15 }, // Columna D
    { wch: 15 }, // Columna E
    { wch: 5 },  // Columna F (espacio)
    { wch: 40 }  // Columna G (dirección)
  ];
  
  // Agregar hoja al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Conversion Report');
  
  // Guardar archivo
  const fileName = `FXM_to_FKM_Conversion_${comparison.fxm.model.replace(/\s+/g, '_')}_to_${comparison.fkm.model.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
