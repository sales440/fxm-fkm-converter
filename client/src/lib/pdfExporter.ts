import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ComparisonResult } from '@/types/motor';
import { getEncoderRecommendation, getConnectorRecommendation } from './encoderConnectorRecommendations';
import { getLogoBase64 } from './logoBase64';

const FAGOR_RED: [number, number, number] = [220, 30, 38]; // RGB para #DC1E26

// Helper para cargar imágenes como Base64
const loadImageBase64 = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

export async function exportToPDF(
  input: ComparisonResult | ComparisonResult[], 
  language: string = 'es'
) {
  const comparisons = Array.isArray(input) ? input : [input];
  const doc = new jsPDF();
  
  // Cargar imágenes globales una sola vez
  const logoBase64 = await getLogoBase64();
  const [fxmFlange, fkmFlange] = await Promise.all([
    loadImageBase64('/flange-fxm.png'),
    loadImageBase64('/flange-fkm.png')
  ]);

  for (let i = 0; i < comparisons.length; i++) {
    const comparison = comparisons[i];
    if (i > 0) doc.addPage();

    // Obtener recomendaciones para este motor
    const encoderRec = getEncoderRecommendation(comparison.fxm.model) || {
      fxmEncoder: '-',
      recommendedFkmEncoders: [],
      bestMatch: '-',
      notes: '-'
    };
    const connectorRec = getConnectorRecommendation(comparison.fxm.model, comparison.fkm.model) || {
      fxmConnector: '-',
      recommendedFkmConnector: '-',
      alternativeConnectors: [],
      wireGauge: '-',
      notes: '-'
    };
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;
    
    let yPos = 10;
    
    // ============= PÁGINA 1: HEADER Y ESPECIFICACIONES =============
    
    // Header con membrete FAGOR
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', marginLeft, yPos, 60, 15);
      } catch (e) {
        console.warn('No se pudo cargar el logo:', e);
      }
    }
    
    // Información de contacto (derecha)
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('FAGOR Automation USA', pageWidth - marginRight, yPos + 2, { align: 'right' });
    doc.text('1755 Park Street, Naperville, IL 60563', pageWidth - marginRight, yPos + 6, { align: 'right' });
    doc.text('Tel: +1 (630) 851-3050', pageWidth - marginRight, yPos + 10, { align: 'right' });
    
    yPos += 20;
    
    // Línea separadora roja
    doc.setDrawColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.setLineWidth(1.5);
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    
    yPos += 10;
    
    // Título principal
    doc.setFontSize(16);
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.setFont('helvetica', 'bold');
    const title = language === 'es' ? 'Reporte de Conversión de Motores: FXM a FKM' : 'Motor Conversion Report: FXM to FKM';
    doc.text(title, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 12;
    
    // Información de motores en cajas
    doc.setFillColor(240, 240, 240);
    doc.rect(marginLeft, yPos, contentWidth / 2 - 2, 20, 'F');
    doc.rect(marginLeft + contentWidth / 2 + 2, yPos, contentWidth / 2 - 2, 20, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(language === 'es' ? 'Motor FXM Original' : 'Original FXM Motor', marginLeft + 5, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(comparison.fxm.model, marginLeft + 5, yPos + 14);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(language === 'es' ? 'Motor FKM Equivalente' : 'Equivalent FKM Motor', marginLeft + contentWidth / 2 + 7, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(comparison.fkm.model, marginLeft + contentWidth / 2 + 7, yPos + 14);
    
    yPos += 28;
    
    // Sección: Especificaciones Eléctricas
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Especificaciones Eléctricas' : 'Electrical Specifications', marginLeft, yPos);
    
    yPos += 8;
    
    // Tabla de especificaciones eléctricas
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
    
    autoTable(doc, {
      startY: yPos,
      head: [[
        language === 'es' ? 'Especificación' : 'Specification', 
        'FXM', 
        'FKM', 
        language === 'es' ? 'Diferencia' : 'Difference',
        language === 'es' ? 'Cambio %' : 'Change %'
      ]],
      body: electricalData,
      theme: 'grid',
      headStyles: {
        fillColor: FAGOR_RED,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 30 },
        4: { halign: 'center', cellWidth: 25 }
      },
      margin: { left: marginLeft, right: marginRight },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Sección: Dimensiones Mecánicas
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Dimensiones Mecánicas' : 'Mechanical Dimensions', marginLeft, yPos);
    
    yPos += 8;
    
    // Tabla de dimensiones
    const dimensionsData = [
      [language === 'es' ? 'Longitud Total (L)' : 'Total Length (L)', 
       `${comparison.differences.dimensions.l.fxm} mm`, 
       `${comparison.differences.dimensions.l.fkm} mm`, 
       `${comparison.differences.dimensions.l.diff} mm`],
      [language === 'es' ? 'Ancho de Carcasa (AC)' : 'Housing Width (AC)', 
       `${comparison.differences.dimensions.ac.fxm} mm`, 
       `${comparison.differences.dimensions.ac.fkm} mm`, 
       `${comparison.differences.dimensions.ac.diff} mm`],
      [language === 'es' ? 'Diámetro de Eje (N)' : 'Shaft Diameter (N)', 
       `${comparison.differences.dimensions.n.fxm} mm`, 
       `${comparison.differences.dimensions.n.fkm} mm`, 
       `${comparison.differences.dimensions.n.diff} mm`],
      [language === 'es' ? 'Diámetro de Brida (D)' : 'Flange Diameter (D)', 
       `${comparison.differences.dimensions.d.fxm} mm`, 
       `${comparison.differences.dimensions.d.fkm} mm`, 
       `${comparison.differences.dimensions.d.diff} mm`],
      [language === 'es' ? 'Altura de Eje (E)' : 'Shaft Height (E)', 
       `${comparison.differences.dimensions.e.fxm} mm`, 
       `${comparison.differences.dimensions.e.fkm} mm`, 
       `${comparison.differences.dimensions.e.diff} mm`],
      [language === 'es' ? 'Longitud de Montaje (M)' : 'Mounting Length (M)', 
       `${comparison.differences.dimensions.m.fxm} mm`, 
       `${comparison.differences.dimensions.m.fkm} mm`, 
       `${comparison.differences.dimensions.m.diff} mm`],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [[
        language === 'es' ? 'Dimensión' : 'Dimension', 
        'FXM', 
        'FKM', 
        language === 'es' ? 'Diferencia' : 'Difference'
      ]],
      body: dimensionsData,
      theme: 'grid',
      headStyles: {
        fillColor: FAGOR_RED,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center', cellWidth: 35 },
        2: { halign: 'center', cellWidth: 35 },
        3: { halign: 'center', cellWidth: 35 }
      },
      margin: { left: marginLeft, right: marginRight },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // ============= SECCIÓN: DIFERENCIAS MECÁNICAS DE BRIDAS =============
    
    // Verificar si necesitamos nueva página
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }
    
    // Título de sección de bridas
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Comparativa Visual de Bridas' : 'Flange Visual Comparison', marginLeft, yPos);
    
    yPos += 10;
    
    // Usar imágenes de bridas precargadas
    const flangeImageWidth = 80;
    const flangeImageHeight = 80;
    const imageSpacing = 10;
    
    if (fxmFlange) doc.addImage(fxmFlange, 'PNG', marginLeft, yPos, flangeImageWidth, flangeImageHeight);
    if (fkmFlange) doc.addImage(fkmFlange, 'PNG', marginLeft + flangeImageWidth + imageSpacing, yPos, flangeImageWidth, flangeImageHeight);
    
    // Etiquetas debajo de las imágenes
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('FXM', marginLeft + flangeImageWidth / 2, yPos + flangeImageHeight + 5, { align: 'center' });
    doc.text('FKM', marginLeft + flangeImageWidth + imageSpacing + flangeImageWidth / 2, yPos + flangeImageHeight + 5, { align: 'center' });
    
    yPos += flangeImageHeight + 15;
    
    // ============= PÁGINA 2: RECOMENDACIONES Y CONECTORES =============
    doc.addPage();
    yPos = 20;
    
    // Header en página 2
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', marginLeft, yPos, 40, 10);
      } catch (e) {
        // Ignorar error
      }
    }
    yPos += 20;
    
    // Sección: Recomendaciones de Encoder
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Recomendaciones de Encoder' : 'Encoder Recommendations', marginLeft, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const encoderText = language === 'es' 
      ? `El motor FXM seleccionado tiene un encoder tipo "${encoderRec.fxmEncoder}". Se recomienda configurar el drive FKM con los parámetros correspondientes a este encoder. ${encoderRec.notes}`
      : `The selected FXM motor has an encoder type "${encoderRec.fxmEncoder}". It is recommended to configure the FKM drive with the parameters corresponding to this encoder. ${encoderRec.notes}`;
      
    const encoderLines = doc.splitTextToSize(encoderText, contentWidth);
    doc.text(encoderLines, marginLeft, yPos);
    yPos += encoderLines.length * 5 + 10;
    
    // Sección: Conectores y Cables
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Conectores y Cables' : 'Connectors and Cables', marginLeft, yPos);
    yPos += 8;
    
    // Tabla de conectores simplificada
    const connectorData = [
      [language === 'es' ? 'Parámetro' : 'Parameter', 'Detalle / Detail'],
      [language === 'es' ? 'Conector FXM (Original)' : 'FXM Connector (Original)', connectorRec.fxmConnector || '-'],
      [language === 'es' ? 'Conector FKM (Recomendado)' : 'FKM Connector (Recommended)', connectorRec.recommendedFkmConnector || '-'],
      [language === 'es' ? 'Cable / Calibre' : 'Cable / Gauge', connectorRec.wireGauge || '-'],
      [language === 'es' ? 'Notas' : 'Notes', connectorRec.notes || '-']
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [[language === 'es' ? 'Especificación' : 'Specification', language === 'es' ? 'Valor' : 'Value']],
      body: connectorData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: FAGOR_RED,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3
      },
      margin: { left: marginLeft, right: marginRight },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Sección: Nomenclatura
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Guía de Nomenclatura' : 'Nomenclature Guide', marginLeft, yPos);
    yPos += 8;
    
    const nomenclatureData = [
      [
        'FXM',
        language === 'es' ? 'Serie de Motor' : 'Motor Series',
        language === 'es' ? 'Motores síncronos de imanes permanentes (AC Brushless)' : 'Permanent magnet synchronous motors (AC Brushless)'
      ],
      [
        '5',
        language === 'es' ? 'Tamaño de Brida' : 'Flange Size',
        language === 'es' ? '1 = 70mm\n3 = 92mm\n5 = 115mm\n7 = 142mm' : '1 = 70mm\n3 = 92mm\n5 = 115mm\n7 = 142mm'
      ],
      [
        '4',
        language === 'es' ? 'Longitud de Paquete' : 'Stack Length',
        language === 'es' ? 'Longitud del estator (1-8)' : 'Stator length (1-8)'
      ],
      [
        '40',
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
    
    autoTable(doc, {
      startY: yPos,
      head: [[
        language === 'es' ? 'Código' : 'Code',
        language === 'es' ? 'Descripción' : 'Description',
        language === 'es' ? 'Valores Posibles' : 'Possible Values'
      ]],
      body: nomenclatureData,
      theme: 'grid',
      headStyles: {
        fillColor: FAGOR_RED,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 40 },
        2: { cellWidth: 95 }
      },
      margin: { left: marginLeft, right: marginRight },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Nota importante
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Nota Importante:' : 'Important Note:', marginLeft, yPos);
    yPos += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const noteText = language === 'es'
      ? 'Al convertir de FXM a FKM, verifique siempre las dimensiones mecánicas de la brida y las especificaciones eléctricas. Algunos modelos pueden requerir adaptadores mecánicos o cambios en el cableado. Consulte con el departamento técnico de FAGOR para aplicaciones críticas.'
      : 'When converting from FXM to FKM, always verify the mechanical flange dimensions and electrical specifications. Some models may require mechanical adapters or wiring changes. Consult with FAGOR technical department for critical applications.';
    const noteLines = doc.splitTextToSize(noteText, contentWidth);
    doc.text(noteLines, marginLeft, yPos);
    
  } // Fin del loop for

  // Footer en todas las páginas (global)
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginRight = 15;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('© 2024 FAGOR Automation. All rights reserved.', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('Open to your world', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`${language === 'es' ? 'Página' : 'Page'} ${i} ${language === 'es' ? 'de' : 'of'} ${totalPages}`, pageWidth - marginRight, pageHeight - 10, { align: 'right' });
  }

  // Descargar PDF
  const fileName = comparisons.length > 1 
    ? `FAGOR_Batch_Conversion_Report_${new Date().toISOString().slice(0,10)}.pdf`
    : `FXM_to_FKM_Conversion_${comparisons[0].fxm.model.replace(/\s+/g, '_')}_to_${comparisons[0].fkm.model.replace(/\s+/g, '_')}.pdf`;
    
  doc.save(fileName);
}
