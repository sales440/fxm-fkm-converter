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
  
  // Cargar logo de FAGOR en base64
  const logoBase64 = await getLogoBase64();
  
  let yPos = 10;
  
  // Header con membrete FAGOR
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 15, yPos, 60, 15);
    } catch (e) {
      console.warn('No se pudo cargar el logo:', e);
    }
  }
  
  // Información de contacto (derecha)
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('FAGOR Automation USA', pageWidth - 15, yPos + 2, { align: 'right' });
  doc.text('1755 Park Street, Naperville, IL 60563', pageWidth - 15, yPos + 6, { align: 'right' });
  doc.text('Tel: +1 (630) 851-3050', pageWidth - 15, yPos + 10, { align: 'right' });
  
  yPos += 18;
  
  // Línea separadora roja
  doc.setDrawColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.setLineWidth(1.5);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  yPos += 10;
  
  // Título principal
  doc.setFontSize(16);
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.setFont('helvetica', 'bold');
  const title = language === 'es' ? 'Reporte de Conversión de Motores: FXM a FKM' : 'Motor Conversion Report: FXM to FKM';
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  
  // Información de motores
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Modelo FXM:' : 'FXM Model:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(comparison.fxm.model, 50, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Modelo FKM Equivalente:' : 'Equivalent FKM Model:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(comparison.fkm.model, 50, yPos);
  
  yPos += 10;
  
  // Sección: Especificaciones Eléctricas
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.text(language === 'es' ? 'Especificaciones Eléctricas' : 'Electrical Specifications', 15, yPos);
  
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
      language === 'es' ? 'Porcentaje' : 'Percentage'
    ]],
    body: electricalData,
    theme: 'grid',
    headStyles: {
      fillColor: FAGOR_RED,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8
    },
    margin: { left: 15, right: 15 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Sección: Dimensiones Mecánicas
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.text(language === 'es' ? 'Dimensiones Mecánicas' : 'Mechanical Dimensions', 15, yPos);
  
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
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8
    },
    margin: { left: 15, right: 15 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Nueva página si es necesario
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  // Sección: Recomendaciones de Encoders
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.text(language === 'es' ? 'Recomendaciones de Encoders' : 'Encoder Recommendations', 15, yPos);
  
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Encoder FXM:' : 'FXM Encoder:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(encoderRec?.fxmEncoder || 'N/A', 50, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Encoder FKM Recomendado:' : 'Recommended FKM Encoder:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(encoderRec?.bestMatch || 'N/A', 70, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Opciones Alternativas:' : 'Alternative Options:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(encoderRec?.recommendedFkmEncoders.join(', ') || 'N/A', 60, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  const encoderNote = doc.splitTextToSize(encoderRec?.notes || '', pageWidth - 30);
  doc.text(encoderNote, 15, yPos);
  yPos += encoderNote.length * 4;
  
  yPos += 10;
  
  // Sección: Recomendaciones de Conectores
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.text(language === 'es' ? 'Recomendaciones de Conectores de Potencia' : 'Power Connector Recommendations', 15, yPos);
  
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Conector FXM:' : 'FXM Connector:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(connectorRec?.fxmConnector || 'N/A', 50, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Conector FKM Recomendado:' : 'Recommended FKM Connector:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(connectorRec?.recommendedFkmConnector || 'N/A', 75, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Calibre de Cable:' : 'Wire Gauge:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(connectorRec?.wireGauge || 'N/A', 50, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'es' ? 'Conectores Alternativos:' : 'Alternative Connectors:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(connectorRec?.alternativeConnectors.join(', ') || 'N/A', 70, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  const connectorNote = doc.splitTextToSize(connectorRec?.notes || '', pageWidth - 30);
  doc.text(connectorNote, 15, yPos);
  yPos += connectorNote.length * 4;
  
  yPos += 15;
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2024 FAGOR Automation. All rights reserved.', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('Open to your world', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Descargar PDF
  const fileName = `FXM_to_FKM_Conversion_${comparison.fxm.model.replace(/\s+/g, '_')}_to_${comparison.fkm.model.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
