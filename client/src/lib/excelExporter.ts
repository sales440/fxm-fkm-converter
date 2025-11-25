import * as XLSX from 'xlsx';
import type { ComparisonResult } from '@/types/motor';

export function exportToExcel(comparison: ComparisonResult, language: string = 'es') {
  // Crear workbook
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Información general
  const infoData = [
    ['FAGOR Automation USA'],
    ['1755 Park Street, Naperville, IL 60563'],
    ['Tel: +1 (630) 851-3050'],
    [''],
    ['Motor Conversion Report: FXM to FKM'],
    [''],
    ['FXM Model:', comparison.fxm.model],
    ['FKM Equivalent:', comparison.fkm.model],
    [''],
  ];
  
  // Especificaciones eléctricas
  const electricalData = [
    ['Electrical Specifications'],
    [''],
    ['Specification', 'FXM', 'FKM', 'Difference', 'Percentage'],
    [
      'Stall Torque (Mo)',
      comparison.differences.electrical.mo.fxm,
      comparison.differences.electrical.mo.fkm,
      comparison.differences.electrical.mo.diff,
      comparison.differences.electrical.mo.percent ? `${comparison.differences.electrical.mo.percent.toFixed(1)}%` : '-'
    ],
    [
      'Rated Torque (Mn)',
      comparison.differences.electrical.mn.fxm,
      comparison.differences.electrical.mn.fkm,
      comparison.differences.electrical.mn.diff,
      comparison.differences.electrical.mn.percent ? `${comparison.differences.electrical.mn.percent.toFixed(1)}%` : '-'
    ],
    [
      'Peak Torque (Mp)',
      comparison.differences.electrical.mp.fxm,
      comparison.differences.electrical.mp.fkm,
      comparison.differences.electrical.mp.diff,
      comparison.differences.electrical.mp.percent ? `${comparison.differences.electrical.mp.percent.toFixed(1)}%` : '-'
    ],
    [
      'Stall Current (Io)',
      comparison.differences.electrical.io.fxm,
      comparison.differences.electrical.io.fkm,
      comparison.differences.electrical.io.diff,
      comparison.differences.electrical.io.percent ? `${comparison.differences.electrical.io.percent.toFixed(1)}%` : '-'
    ],
    [
      'Rated Speed (RPM)',
      comparison.differences.electrical.rpm.fxm,
      comparison.differences.electrical.rpm.fkm,
      comparison.differences.electrical.rpm.diff,
      comparison.differences.electrical.rpm.percent ? `${comparison.differences.electrical.rpm.percent.toFixed(1)}%` : '-'
    ],
    [
      'Inertia (J)',
      comparison.differences.electrical.j.fxm,
      comparison.differences.electrical.j.fkm,
      comparison.differences.electrical.j.diff,
      comparison.differences.electrical.j.percent ? `${comparison.differences.electrical.j.percent.toFixed(1)}%` : '-'
    ],
    [
      'Calculated Power (Pcal)',
      comparison.differences.electrical.pcal.fxm,
      comparison.differences.electrical.pcal.fkm,
      comparison.differences.electrical.pcal.diff,
      comparison.differences.electrical.pcal.percent ? `${comparison.differences.electrical.pcal.percent.toFixed(1)}%` : '-'
    ],
    [''],
  ];
  
  // Dimensiones mecánicas
  const dimensionsData = [
    ['Mechanical Dimensions'],
    [''],
    ['Dimension', 'FXM (mm)', 'FKM (mm)', 'Difference (mm)'],
    [
      'Total Length (L)',
      comparison.differences.dimensions.l.fxm,
      comparison.differences.dimensions.l.fkm,
      comparison.differences.dimensions.l.diff
    ],
    [
      'Housing Width (AC)',
      comparison.differences.dimensions.ac.fxm,
      comparison.differences.dimensions.ac.fkm,
      comparison.differences.dimensions.ac.diff
    ],
    [
      'Shaft Diameter (N)',
      comparison.differences.dimensions.n.fxm,
      comparison.differences.dimensions.n.fkm,
      comparison.differences.dimensions.n.diff
    ],
    [
      'Flange Diameter (D)',
      comparison.differences.dimensions.d.fxm,
      comparison.differences.dimensions.d.fkm,
      comparison.differences.dimensions.d.diff
    ],
    [
      'Shaft Height (E)',
      comparison.differences.dimensions.e.fxm,
      comparison.differences.dimensions.e.fkm,
      comparison.differences.dimensions.e.diff
    ],
    [
      'Mounting Length (M)',
      comparison.differences.dimensions.m.fxm,
      comparison.differences.dimensions.m.fkm,
      comparison.differences.dimensions.m.diff
    ],
    [''],
    [''],
    ['© 2024 FAGOR Automation. All rights reserved.'],
    ['Open to your world']
  ];
  
  // Combinar todos los datos
  const allData = [...infoData, ...electricalData, ...dimensionsData];
  
  // Crear hoja de trabajo
  const ws = XLSX.utils.aoa_to_sheet(allData);
  
  // Ajustar anchos de columna
  ws['!cols'] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 }
  ];
  
  // Agregar hoja al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Conversion Report');
  
  // Guardar archivo
  const fileName = `FXM_to_FKM_Conversion_${comparison.fxm.model.replace(/\s+/g, '_')}_to_${comparison.fkm.model.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
