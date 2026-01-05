import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComparisonResult } from '../types/motor';
import { getEncoderRecommendation, getConnectorRecommendation } from './encoderConnectorRecommendations';

// Colores corporativos FAGOR
const FAGOR_RED: [number, number, number] = [220, 30, 38];
const FAGOR_GREY = [80, 80, 80];
const LIGHT_GREY = [240, 240, 240];

export const exportToPDF = async (comparisons: ComparisonResult[], language: string = 'es') => {
  const doc = new jsPDF();
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
  
  // Cargar logo
  let logoBase64: string | null = null;
  try {
    const response = await fetch('/logo.svg');
    const svgText = await response.text();
    
    // Convertir SVG a canvas para obtener base64 (simplificado para este entorno)
    // En un entorno real, usaríamos una librería o un logo PNG pre-cargado
    // Por ahora, usaremos un placeholder o intentaremos cargar un PNG si existe
    // Asumimos que existe un logo.png para el reporte
    const pngResponse = await fetch('/logo.png').catch(() => null);
    if (pngResponse && pngResponse.ok) {
      const blob = await pngResponse.blob();
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.warn('No se pudo cargar el logo para el PDF', error);
  }

  // Iterar sobre cada comparación para generar el reporte
  for (let i = 0; i < comparisons.length; i++) {
    const comparison = comparisons[i];
    const encoderRec = getEncoderRecommendation(comparison.fxm.model, comparison.fkm.model, language);
    const connectorRec = getConnectorRecommendation(comparison.fxm.model, comparison.fkm.model, language);
    
    if (i > 0) {
      doc.addPage();
    }
    
    let yPos = 20;

    // Header
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', marginLeft, yPos, 40, 10); // Ajustar dimensiones según logo
      } catch (e) {
        doc.setFontSize(20);
        doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('FAGOR', marginLeft, yPos + 8);
      }
    } else {
      doc.setFontSize(20);
      doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('FAGOR', marginLeft, yPos + 8);
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(language === 'es' ? 'Informe de Conversión de Motores' : 'Motor Conversion Report', doc.internal.pageSize.getWidth() - marginRight, yPos + 5, { align: 'right' });
    doc.text(new Date().toLocaleDateString(), doc.internal.pageSize.getWidth() - marginRight, yPos + 10, { align: 'right' });
    
    yPos += 25;
    
    // Título Principal
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(language === 'es' ? 'Conversión FXM a FKM' : 'FXM to FKM Conversion', marginLeft, yPos);
    
    yPos += 15;
    
    // Resumen de Modelos
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(marginLeft, yPos, contentWidth, 25, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(language === 'es' ? 'Motor Original (FXM)' : 'Original Motor (FXM)', marginLeft + 5, yPos + 8);
    doc.text(language === 'es' ? 'Motor Equivalente (FKM)' : 'Equivalent Motor (FKM)', marginLeft + contentWidth / 2 + 5, yPos + 8);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(comparison.fxm.model, marginLeft + 5, yPos + 18);
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(comparison.fkm.model, marginLeft + contentWidth / 2 + 5, yPos + 18);
    
    yPos += 35;
    
    // Sección: Especificaciones Técnicas
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Especificaciones Técnicas' : 'Technical Specifications', marginLeft, yPos);
    
    yPos += 8;
    
    const specsData = [
      [language === 'es' ? 'Par a Rotor Parado (Mo)' : 'Stall Torque (Mo)', `${comparison.fxm.mo} Nm`, `${comparison.fkm.mo} Nm`, `${comparison.differences.electrical.mo.diff} Nm`],
      [language === 'es' ? 'Par Nominal (Mn)' : 'Rated Torque (Mn)', `${comparison.fxm.mn} Nm`, `${comparison.fkm.mn} Nm`, `${comparison.differences.electrical.mn.diff} Nm`],
      [language === 'es' ? 'Velocidad Nominal' : 'Rated Speed', `${comparison.fxm.rpm} rpm`, `${comparison.fkm.rpm} rpm`, `${comparison.differences.electrical.rpm.diff} rpm`],
      [language === 'es' ? 'Potencia Calculada' : 'Calculated Power', `${comparison.fxm.pcal} kW`, `${comparison.fkm.pcal} kW`, `${comparison.differences.electrical.pcal.diff} kW`],
      [language === 'es' ? 'Corriente a Rotor Parado (Io)' : 'Stall Current (Io)', `${comparison.fxm.io} A`, `${comparison.fkm.io} A`, `${comparison.differences.electrical.io.diff} A`],
      [language === 'es' ? 'Inercia (J)' : 'Inertia (J)', `${comparison.fxm.j} kg·cm²`, `${comparison.fkm.j} kg·cm²`, `${comparison.differences.electrical.j.diff} kg·cm²`],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [[language === 'es' ? 'Parámetro' : 'Parameter', 'FXM', 'FKM', language === 'es' ? 'Diferencia' : 'Difference']],
      body: specsData,
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
        1: { halign: 'center', cellWidth: 35 },
        2: { halign: 'center', cellWidth: 35 },
        3: { halign: 'center', cellWidth: 35 }
      },
      margin: { left: marginLeft, right: marginRight },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Sección: Dimensiones Mecánicas
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Dimensiones Mecánicas' : 'Mechanical Dimensions', marginLeft, yPos);
    
    yPos += 8;
    
    // Tabla de dimensiones generales
    const dimensionsData = [
      [language === 'es' ? 'Longitud Total (L)' : 'Total Length (L)', 
       `${comparison.differences.dimensions.l.fxm} mm`, 
       `${comparison.differences.dimensions.l.fkm} mm`, 
       `${comparison.differences.dimensions.l.diff} mm`],
      [language === 'es' ? 'Ancho de Carcasa (AC)' : 'Housing Width (AC)', 
       `${comparison.differences.dimensions.ac.fxm} mm`, 
       `${comparison.differences.dimensions.ac.fkm} mm`, 
       `${comparison.differences.dimensions.ac.diff} mm`],
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
        0: { cellWidth: 60 },
        1: { halign: 'center', cellWidth: 35 },
        2: { halign: 'center', cellWidth: 35 },
        3: { halign: 'center', cellWidth: 35 }
      },
      margin: { left: marginLeft, right: marginRight },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Nueva Tabla: Diferencias Mecánicas de Brida (Flange Mechanical Differences)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Diferencias Mecánicas de Brida' : 'Flange Mechanical Differences', marginLeft, yPos);
    
    yPos += 6;

    const flangeData = [
      [
        language === 'es' ? 'Diámetro de Brida (D)' : 'Flange Diameter (D)',
        comparison.fxm.dimensions.d ? `${comparison.fxm.dimensions.d} mm` : '-',
        comparison.fkm.dimensions.d ? `${comparison.fkm.dimensions.d} mm` : '-',
        comparison.differences.dimensions.d.diff !== null ? `${Math.abs(comparison.differences.dimensions.d.diff).toFixed(1)} mm` : '-',
        Math.abs(comparison.differences.dimensions.d.diff || 0) > 0.5 ? (language === 'es' ? 'Diferente' : 'Different') : (language === 'es' ? 'Compatible' : 'Compatible')
      ],
      [
        language === 'es' ? 'Altura de Eje (E)' : 'Shaft Height (E)',
        comparison.fxm.dimensions.e ? `${comparison.fxm.dimensions.e} mm` : '-',
        comparison.fkm.dimensions.e ? `${comparison.fkm.dimensions.e} mm` : '-',
        comparison.differences.dimensions.e.diff !== null ? `${Math.abs(comparison.differences.dimensions.e.diff).toFixed(1)} mm` : '-',
        Math.abs(comparison.differences.dimensions.e.diff || 0) > 0.5 ? (language === 'es' ? 'Diferente' : 'Different') : (language === 'es' ? 'Compatible' : 'Compatible')
      ],
      [
        language === 'es' ? 'Diámetro de Eje (N)' : 'Shaft Diameter (N)',
        comparison.fxm.dimensions.n ? `${comparison.fxm.dimensions.n} mm` : '-',
        comparison.fkm.dimensions.n ? `${comparison.fkm.dimensions.n} mm` : '-',
        comparison.differences.dimensions.n.diff !== null ? `${Math.abs(comparison.differences.dimensions.n.diff).toFixed(1)} mm` : '-',
        Math.abs(comparison.differences.dimensions.n.diff || 0) > 0.5 ? (language === 'es' ? 'Diferente' : 'Different') : (language === 'es' ? 'Compatible' : 'Compatible')
      ],
      [
        language === 'es' ? 'Longitud de Montaje (M)' : 'Mounting Length (M)',
        comparison.fxm.dimensions.m ? `${comparison.fxm.dimensions.m} mm` : '-',
        comparison.fkm.dimensions.m ? `${comparison.fkm.dimensions.m} mm` : '-',
        comparison.differences.dimensions.m.diff !== null ? `${Math.abs(comparison.differences.dimensions.m.diff).toFixed(1)} mm` : '-',
        Math.abs(comparison.differences.dimensions.m.diff || 0) > 0.5 ? (language === 'es' ? 'Diferente' : 'Different') : (language === 'es' ? 'Compatible' : 'Compatible')
      ]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [[
        language === 'es' ? 'Dimensión de Brida' : 'Flange Dimension', 
        'FXM', 
        'FKM', 
        language === 'es' ? 'Diferencia' : 'Difference',
        language === 'es' ? 'Estado' : 'Status'
      ]],
      body: flangeData,
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
        0: { cellWidth: 50 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 30, fontStyle: 'bold' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 4) {
          const text = data.cell.raw as string;
          if (text === 'Diferente' || text === 'Different') {
            data.cell.styles.textColor = [220, 30, 38]; // Rojo
          } else {
            data.cell.styles.textColor = [0, 128, 0]; // Verde
          }
        }
      },
      margin: { left: marginLeft, right: marginRight },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Imágenes de Bridas (Placeholder)
    // En una implementación real, aquí irían las imágenes de las bridas
    // Como no tenemos las imágenes reales cargadas, dejaremos un espacio reservado
    
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
    
    // Sección: Recomendaciones de Componentes
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(FAGOR_RED[0], FAGOR_RED[1], FAGOR_RED[2]);
    doc.text(language === 'es' ? 'Recomendaciones de Componentes' : 'Component Recommendations', marginLeft, yPos);
    yPos += 10;
    
    // Tabla de Encoders (Formato Mejorado)
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(language === 'es' ? 'Encoders' : 'Encoders', marginLeft, yPos);
    yPos += 6;
    
    const encoderData = [
      [language === 'es' ? 'Encoder FXM Original' : 'Original FXM Encoder', encoderRec?.fxmEncoder || '-'],
      [language === 'es' ? 'Encoder FKM Recomendado' : 'Recommended FKM Encoder', encoderRec?.bestMatch || '-'],
      [language === 'es' ? 'Opciones Alternativas' : 'Alternative Options', encoderRec?.recommendedFkmEncoders?.join(', ') || '-'],
      [language === 'es' ? 'Notas' : 'Notes', encoderRec?.notes || '-']
    ];
    
    autoTable(doc, {
      startY: yPos,
      body: encoderData,
      theme: 'grid',
      headStyles: { fillColor: FAGOR_RED },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', fillColor: [245, 245, 245] },
        1: { cellWidth: 'auto' }
      },
      margin: { left: marginLeft, right: marginRight },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Tabla de Conectores (Formato Mejorado)
    doc.setFontSize(11);
    doc.text(language === 'es' ? 'Conectores de Potencia' : 'Power Connectors', marginLeft, yPos);
    yPos += 6;
    
    const connectorData = [
      [language === 'es' ? 'Conector FXM Original' : 'Original FXM Connector', connectorRec?.fxmConnector || '-'],
      [language === 'es' ? 'Conector FKM Recomendado' : 'Recommended FKM Connector', connectorRec?.recommendedFkmConnector || '-'],
      [language === 'es' ? 'Calibre de Cable' : 'Wire Gauge', connectorRec?.wireGauge || '-'],
      [language === 'es' ? 'Conectores Alternativos' : 'Alternative Connectors', connectorRec?.alternativeConnectors?.join(', ') || '-'],
      [language === 'es' ? 'Notas' : 'Notes', connectorRec?.notes || '-']
    ];
    
    autoTable(doc, {
      startY: yPos,
      body: connectorData,
      theme: 'grid',
      headStyles: { fillColor: FAGOR_RED },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', fillColor: [245, 245, 245] },
        1: { cellWidth: 'auto' }
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
