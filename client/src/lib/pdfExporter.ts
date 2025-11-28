import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ComparisonResult } from '@/types/motor';
import { getEncoderRecommendation, getConnectorRecommendation } from './encoderConnectorRecommendations';
import { getLogoBase64 } from './logoBase64';

const FAGOR_RED: [number, number, number] = [220, 30, 38]; // RGB para #DC1E26

export async function exportToPDF(comparison: ComparisonResult, language: string = 'es') {
  // Obtener recomendaciones
  const encoderRec = getEncoderRecommendation(comparison.fxm.model);
  const connectorRec = getConnectorRecommendation(comparison.fxm.model, comparison.fkm.model);
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;
  
  // Cargar logo de FAGOR en base64
  const logoBase64 = await getLogoBase64();
  
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
  
  // ============= PÁGINA 2: RECOMENDACIONES CON IMÁGENES =============
  doc.addPage();
  yPos = 20;
  
  // Título de página 2
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.text(language === 'es' ? 'Recomendaciones de Componentes' : 'Component Recommendations', marginLeft, yPos);
  
  yPos += 12;
  
  // ========== SECCIÓN ENCODERS ==========
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.text(language === 'es' ? 'Encoders' : 'Encoders', marginLeft, yPos);
  
  yPos += 8;
  
  // Agregar imagen del encoder
  try {
    const encoderImg = '/encoder-industrial.png';
    doc.addImage(encoderImg, 'PNG', pageWidth - marginRight - 50, yPos, 45, 45);
  } catch (e) {
    console.warn('No se pudo cargar imagen de encoder:', e);
  }
  
  // Información del encoder (lado izquierdo)
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Encoder FXM Original:' : 'Original FXM Encoder:', marginLeft, yPos);
  doc.setFont('helvetica', 'normal');
  const fxmEncoderText = doc.splitTextToSize(encoderRec?.fxmEncoder || 'N/A', contentWidth - 60);
  doc.text(fxmEncoderText, marginLeft, yPos + 5);
  
  yPos += (fxmEncoderText.length * 5) + 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Encoder FKM Recomendado:' : 'Recommended FKM Encoder:', marginLeft, yPos);
  doc.setFont('helvetica', 'normal');
  const fkmEncoderText = doc.splitTextToSize(encoderRec?.bestMatch || 'N/A', contentWidth - 60);
  doc.text(fkmEncoderText, marginLeft, yPos + 5);
  
  yPos += (fkmEncoderText.length * 5) + 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Opciones Alternativas:' : 'Alternative Options:', marginLeft, yPos);
  doc.setFont('helvetica', 'normal');
  const altEncodersText = doc.splitTextToSize(encoderRec?.recommendedFkmEncoders.join(', ') || 'N/A', contentWidth - 60);
  doc.text(altEncodersText, marginLeft, yPos + 5);
  
  yPos += (altEncodersText.length * 5) + 8;
  
  // Nota del encoder
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const encoderNote = doc.splitTextToSize(encoderRec?.notes || '', contentWidth - 5);
  doc.text(encoderNote, marginLeft, yPos);
  yPos += encoderNote.length * 4;
  
  yPos += 15;
  
  // ========== SECCIÓN CONECTORES ==========
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.text(language === 'es' ? 'Conectores de Potencia' : 'Power Connectors', marginLeft, yPos);
  
  yPos += 8;
  
  // Agregar imagen del conector
  try {
    const connectorImg = '/connector-industrial.png';
    doc.addImage(connectorImg, 'PNG', pageWidth - marginRight - 50, yPos, 45, 45);
  } catch (e) {
    console.warn('No se pudo cargar imagen de conector:', e);
  }
  
  // Información del conector (lado izquierdo)
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Conector FXM Original:' : 'Original FXM Connector:', marginLeft, yPos);
  doc.setFont('helvetica', 'normal');
  const fxmConnectorText = doc.splitTextToSize(connectorRec?.fxmConnector || 'N/A', contentWidth - 60);
  doc.text(fxmConnectorText, marginLeft, yPos + 5);
  
  yPos += (fxmConnectorText.length * 5) + 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Conector FKM Recomendado:' : 'Recommended FKM Connector:', marginLeft, yPos);
  doc.setFont('helvetica', 'normal');
  const fkmConnectorText = doc.splitTextToSize(connectorRec?.recommendedFkmConnector || 'N/A', contentWidth - 60);
  doc.text(fkmConnectorText, marginLeft, yPos + 5);
  
  yPos += (fkmConnectorText.length * 5) + 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Calibre de Cable:' : 'Wire Gauge:', marginLeft, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(connectorRec?.wireGauge || 'N/A', marginLeft + 40, yPos);
  
  yPos += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Conectores Alternativos:' : 'Alternative Connectors:', marginLeft, yPos);
  doc.setFont('helvetica', 'normal');
  const altConnectorsText = doc.splitTextToSize(connectorRec?.alternativeConnectors.join(', ') || 'N/A', contentWidth - 60);
  doc.text(altConnectorsText, marginLeft, yPos + 5);
  
  yPos += (altConnectorsText.length * 5) + 8;
  
  // Nota del conector
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const connectorNote = doc.splitTextToSize(connectorRec?.notes || '', contentWidth - 5);
  doc.text(connectorNote, marginLeft, yPos);
  yPos += connectorNote.length * 4;
  
  // Footer en todas las páginas
  const totalPages = doc.getNumberOfPages();
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
  const fileName = `FXM_to_FKM_Conversion_${comparison.fxm.model.replace(/\s+/g, '_')}_to_${comparison.fkm.model.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
