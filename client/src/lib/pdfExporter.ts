import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ComparisonResult } from '@/types/motor';

const FAGOR_RED: [number, number, number] = [220, 30, 38]; // RGB para #DC1E26

export async function exportToPDF(comparison: ComparisonResult, language: string = 'es') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Cargar logo de FAGOR
  const logoImg = new Image();
  logoImg.src = '/Logo_claim_HOR_online.jpg';
  
  await new Promise((resolve) => {
    logoImg.onload = resolve;
    logoImg.onerror = resolve; // Continuar aunque falle la carga
  });
  
  // Header con membrete FAGOR
  try {
    doc.addImage(logoImg, 'JPEG', 15, 10, 60, 15);
  } catch (e) {
    console.warn('No se pudo cargar el logo');
  }
  
  // Información de contacto (derecha)
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('FAGOR Automation USA', pageWidth - 15, 12, { align: 'right' });
  doc.text('1755 Park Street, Naperville, IL 60563', pageWidth - 15, 16, { align: 'right' });
  doc.text('Tel: +1 (630) 851-3050', pageWidth - 15, 20, { align: 'right' });
  
  // Línea separadora roja
  doc.setDrawColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.setLineWidth(1.5);
  doc.line(15, 28, pageWidth - 15, 28);
  
  // Título principal
  doc.setFontSize(16);
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Motor Conversion Report: FXM to FKM', pageWidth / 2, 38, { align: 'center' });
  
  // Modelos de motores
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  let yPos = 50;
  doc.text(`FXM Model: ${comparison.fxm.model}`, 15, yPos);
  yPos += 8;
  doc.text(`FKM Equivalent: ${comparison.fkm.model}`, 15, yPos);
  yPos += 12;
  
  // Tabla de especificaciones eléctricas
  doc.setFontSize(12);
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Electrical Specifications', 15, yPos);
  yPos += 8;
  
  const electricalData = [
    ['Specification', 'FXM', 'FKM', 'Difference', '%'],
    [
      'Stall Torque (Mo)',
      `${comparison.differences.electrical.mo.fxm?.toFixed(2) || '-'} Nm`,
      `${comparison.differences.electrical.mo.fkm?.toFixed(2) || '-'} Nm`,
      `${comparison.differences.electrical.mo.diff?.toFixed(2) || '-'} Nm`,
      `${comparison.differences.electrical.mo.percent?.toFixed(1) || '-'}%`
    ],
    [
      'Rated Torque (Mn)',
      `${comparison.differences.electrical.mn.fxm?.toFixed(2) || '-'} Nm`,
      `${comparison.differences.electrical.mn.fkm?.toFixed(2) || '-'} Nm`,
      `${comparison.differences.electrical.mn.diff?.toFixed(2) || '-'} Nm`,
      `${comparison.differences.electrical.mn.percent?.toFixed(1) || '-'}%`
    ],
    [
      'Peak Torque (Mp)',
      `${comparison.differences.electrical.mp.fxm?.toFixed(2) || '-'} Nm`,
      `${comparison.differences.electrical.mp.fkm?.toFixed(2) || '-'} Nm`,
      `${comparison.differences.electrical.mp.diff?.toFixed(2) || '-'} Nm`,
      `${comparison.differences.electrical.mp.percent?.toFixed(1) || '-'}%`
    ],
    [
      'Stall Current (Io)',
      `${comparison.differences.electrical.io.fxm?.toFixed(2) || '-'} Arms`,
      `${comparison.differences.electrical.io.fkm?.toFixed(2) || '-'} Arms`,
      `${comparison.differences.electrical.io.diff?.toFixed(2) || '-'} Arms`,
      `${comparison.differences.electrical.io.percent?.toFixed(1) || '-'}%`
    ],
    [
      'Rated Speed (RPM)',
      `${comparison.differences.electrical.rpm.fxm?.toFixed(0) || '-'} rpm`,
      `${comparison.differences.electrical.rpm.fkm?.toFixed(0) || '-'} rpm`,
      `${comparison.differences.electrical.rpm.diff?.toFixed(0) || '-'} rpm`,
      `${comparison.differences.electrical.rpm.percent?.toFixed(1) || '-'}%`
    ],
    [
      'Inertia (J)',
      `${comparison.differences.electrical.j.fxm?.toFixed(2) || '-'} kg/cm²`,
      `${comparison.differences.electrical.j.fkm?.toFixed(2) || '-'} kg/cm²`,
      `${comparison.differences.electrical.j.diff?.toFixed(2) || '-'} kg/cm²`,
      `${comparison.differences.electrical.j.percent?.toFixed(1) || '-'}%`
    ],
    [
      'Calculated Power (Pcal)',
      `${comparison.differences.electrical.pcal.fxm?.toFixed(2) || '-'} kW`,
      `${comparison.differences.electrical.pcal.fkm?.toFixed(2) || '-'} kW`,
      `${comparison.differences.electrical.pcal.diff?.toFixed(2) || '-'} kW`,
      `${comparison.differences.electrical.pcal.percent?.toFixed(1) || '-'}%`
    ]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [electricalData[0]],
    body: electricalData.slice(1),
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
    columnStyles: {
      0: { cellWidth: 50 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });
  
  // Tabla de dimensiones mecánicas
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Mechanical Dimensions', 15, yPos);
  yPos += 8;
  
  const dimensionsData = [
    ['Dimension', 'FXM', 'FKM', 'Difference'],
    [
      'Total Length (L)',
      `${comparison.differences.dimensions.l.fxm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.l.fkm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.l.diff?.toFixed(1) || '-'} mm`
    ],
    [
      'Housing Width (AC)',
      `${comparison.differences.dimensions.ac.fxm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.ac.fkm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.ac.diff?.toFixed(1) || '-'} mm`
    ],
    [
      'Shaft Diameter (N)',
      `${comparison.differences.dimensions.n.fxm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.n.fkm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.n.diff?.toFixed(1) || '-'} mm`
    ],
    [
      'Flange Diameter (D)',
      `${comparison.differences.dimensions.d.fxm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.d.fkm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.d.diff?.toFixed(1) || '-'} mm`
    ],
    [
      'Shaft Height (E)',
      `${comparison.differences.dimensions.e.fxm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.e.fkm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.e.diff?.toFixed(1) || '-'} mm`
    ],
    [
      'Mounting Length (M)',
      `${comparison.differences.dimensions.m.fxm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.m.fkm?.toFixed(1) || '-'} mm`,
      `${comparison.differences.dimensions.m.diff?.toFixed(1) || '-'} mm`
    ]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [dimensionsData[0]],
    body: dimensionsData.slice(1),
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
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 60;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('© 2024 FAGOR Automation. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Open to your world', pageWidth / 2, pageHeight - 6, { align: 'center' });
  
  // Guardar PDF
  const fileName = `FXM_to_FKM_Conversion_${comparison.fxm.model.replace(/\s+/g, '_')}_to_${comparison.fkm.model.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
