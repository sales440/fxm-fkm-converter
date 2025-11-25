import type { Motor, ComparisonResult, MotorDatabase } from '@/types/motor';

export function findEquivalentFKM(fxmMotor: Motor, database: MotorDatabase): Motor[] {
  const fkmMotors = Object.values(database.fkm_motors);
  
  // Criterios de equivalencia:
  // 1. RPM debe ser igual o superior
  // 2. Mo (par a rótor parado) debe ser similar (±20%)
  // 3. Preferir motores con dimensiones similares
  
  const candidates = fkmMotors.filter(fkm => {
    if (!fkm.rpm || !fxmMotor.rpm) return false;
    if (fkm.rpm < fxmMotor.rpm) return false;
    
    if (!fkm.mo || !fxmMotor.mo) return false;
    const moRatio = fkm.mo / fxmMotor.mo;
    // Aceptar FKM con Mo entre 80% y 150% del FXM
    if (moRatio < 0.8 || moRatio > 1.5) return false;
    
    return true;
  });
  
  // Ordenar por similitud (primero por RPM igual, luego por Mo más cercano)
  candidates.sort((a, b) => {
    // Prioridad 1: Mismo RPM
    if (a.rpm === fxmMotor.rpm && b.rpm !== fxmMotor.rpm) return -1;
    if (b.rpm === fxmMotor.rpm && a.rpm !== fxmMotor.rpm) return 1;
    
    // Prioridad 2: Mo más cercano
    const aDiff = Math.abs((a.mo || 0) - (fxmMotor.mo || 0));
    const bDiff = Math.abs((b.mo || 0) - (fxmMotor.mo || 0));
    return aDiff - bDiff;
  });
  
  // Retornar los 3 mejores candidatos
  return candidates.slice(0, 3);
}

export function compareMotors(fxm: Motor, fkm: Motor): ComparisonResult {
  const calcDiff = (fxmVal: number | null, fkmVal: number | null) => {
    if (fxmVal === null || fkmVal === null) return { fxm: fxmVal, fkm: fkmVal, diff: null, percent: null };
    const diff = fkmVal - fxmVal;
    const percent = fxmVal !== 0 ? (diff / fxmVal) * 100 : null;
    return { fxm: fxmVal, fkm: fkmVal, diff, percent };
  };
  
  const calcDimDiff = (fxmVal: number | null, fkmVal: number | null) => {
    if (fxmVal === null || fkmVal === null) return { fxm: fxmVal, fkm: fkmVal, diff: null };
    return { fxm: fxmVal, fkm: fkmVal, diff: fkmVal - fxmVal };
  };
  
  return {
    fxm,
    fkm,
    differences: {
      electrical: {
        mo: calcDiff(fxm.mo, fkm.mo),
        mn: calcDiff(fxm.mn, fkm.mn),
        mp: calcDiff(fxm.mp, fkm.mp),
        io: calcDiff(fxm.io, fkm.io),
        rpm: calcDiff(fxm.rpm, fkm.rpm),
        j: calcDiff(fxm.j, fkm.j),
        pcal: calcDiff(fxm.pcal, fkm.pcal),
      },
      dimensions: {
        l: calcDimDiff(fxm.dimensions.l, fkm.dimensions.l),
        ac: calcDimDiff(fxm.dimensions.ac, fkm.dimensions.ac),
        n: calcDimDiff(fxm.dimensions.n, fkm.dimensions.n),
        d: calcDimDiff(fxm.dimensions.d, fkm.dimensions.d),
        e: calcDimDiff(fxm.dimensions.e, fkm.dimensions.e),
        m: calcDimDiff(fxm.dimensions.m, fkm.dimensions.m),
      },
    },
  };
}

export function searchFXMMotors(database: MotorDatabase, query: string): Motor[] {
  const motors = Object.values(database.fxm_motors);
  
  if (!query.trim()) {
    return motors.slice(0, 50); // Retornar primeros 50 si no hay búsqueda
  }
  
  const lowerQuery = query.toLowerCase();
  
  return motors.filter(motor => {
    return motor.model.toLowerCase().includes(lowerQuery);
  }).slice(0, 50);
}
