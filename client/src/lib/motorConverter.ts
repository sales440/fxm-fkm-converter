import type { MotorDatabase, Motor, ComparisonResult, DimensionComparison, ElectricalComparison } from "@/types/motor";

/**
 * Normaliza un modelo de motor para búsqueda flexible
 * Elimina espacios, puntos extras y convierte a mayúsculas
 */
function normalizeModel(model: string): string {
  let normalized = model
    .toUpperCase()
    .replace(/\s+/g, '') // Eliminar espacios
    .replace(/-/g, '.') // Convertir guiones a puntos
    .replace(/\.+/g, '.') // Normalizar puntos múltiples
    .replace(/[xX]{2,}/g, 'XX'); // Normalizar xx, XX, etc.
  
  // Convertir formatos complejos como "FKM22.45A.E3.200.3-K10" a formato base
  // Extraer solo la parte base del modelo: FKM22.45A
  const complexMatch = normalized.match(/(F[XK]M\d+\.\d+[A-Z])/);
  if (complexMatch) {
    const baseModel = complexMatch[1];
    // Agregar el formato estándar .XX.X00
    normalized = baseModel + '.XX.X00';
    return normalized;
  }
  
  // Convertir formatos como E1, E2, etc. a XX
  normalized = normalized.replace(/\.E\d+/gi, '.XX');
  
  // Convertir sufijos numéricos finales a formato estándar
  // Ejemplos: -010 -> .x10, -000 -> .x00, .010 -> .x10
  normalized = normalized.replace(/\.(\d)(\d)(\d)$/,  (match, d1, d2, d3) => {
    return `.X${d2}${d3}`;
  });
  
  // Asegurar que el formato tenga espacios correctos: FXM##.##X.XX.X##
  normalized = normalized.replace(/(F[XK]M)(\d+)/, '$1 $2');
  
  return normalized;
}

/**
 * Detecta automáticamente el tipo de motor (FXM o FKM)
 */
export function detectMotorType(query: string): 'FXM' | 'FKM' | 'UNKNOWN' {
  const normalized = query.toUpperCase().replace(/[\s.-]/g, '');
  if (normalized.includes('FXM')) return 'FXM';
  if (normalized.includes('FKM')) return 'FKM';
  return 'UNKNOWN';
}

/**
 * Busca motores FXM que coincidan con la consulta
 */
export function searchFXMMotors(database: MotorDatabase, query: string): Motor[] {
  if (!query || query.trim().length < 3) return [];
  
  const normalizedQuery = normalizeModel(query);
  const results: Motor[] = [];
  
  for (const [key, motor] of Object.entries(database.fxm_motors)) {
    const normalizedKey = normalizeModel(key);
    
    // Búsqueda flexible: coincidencia parcial o exacta
    if (normalizedKey.includes(normalizedQuery) || normalizedQuery.includes(normalizedKey.substring(0, 10))) {
      results.push(motor);
    }
  }
  
  // Ordenar por similitud (los que empiezan igual primero)
  return results.sort((a, b) => {
    const aNorm = normalizeModel(a.model);
    const bNorm = normalizeModel(b.model);
    const aStarts = aNorm.startsWith(normalizedQuery.substring(0, 8));
    const bStarts = bNorm.startsWith(normalizedQuery.substring(0, 8));
    
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.model.localeCompare(b.model);
  });
}

/**
 * Busca motores FKM que coincidan con la consulta
 */
export function searchFKMMotors(database: MotorDatabase, query: string): Motor[] {
  if (!query || query.trim().length < 3) return [];
  
  const normalizedQuery = normalizeModel(query);
  const results: Motor[] = [];
  
  for (const [key, motor] of Object.entries(database.fkm_motors)) {
    const normalizedKey = normalizeModel(key);
    
    // Búsqueda flexible: coincidencia parcial o exacta
    if (normalizedKey.includes(normalizedQuery) || normalizedQuery.includes(normalizedKey.substring(0, 10))) {
      results.push(motor);
    }
  }
  
  // Ordenar por similitud
  return results.sort((a, b) => {
    const aNorm = normalizeModel(a.model);
    const bNorm = normalizeModel(b.model);
    const aStarts = aNorm.startsWith(normalizedQuery.substring(0, 8));
    const bStarts = bNorm.startsWith(normalizedQuery.substring(0, 8));
    
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.model.localeCompare(b.model);
  });
}

/**
 * Encuentra motores FKM equivalentes para un motor FXM dado
 * Criterios: RPM igual, Mo similar (±20%), dimensiones compatibles
 */
export function findEquivalentFKM(fxmMotor: Motor, database: MotorDatabase): Motor[] {
  const equivalents: Motor[] = [];
  const targetRpm = fxmMotor.rpm;
  const targetMo = fxmMotor.mo;
  const moTolerance = 0.25; // 25% tolerancia
  
  for (const fkmMotor of Object.values(database.fkm_motors)) {
    // Criterio 1: RPM debe ser igual
    if (fkmMotor.rpm !== targetRpm) continue;
    
    // Criterio 2: Mo debe estar dentro del rango (±25%)
    if (fkmMotor.mo === null || targetMo === null) continue;
    const moDiff = Math.abs(fkmMotor.mo - targetMo) / targetMo;
    if (moDiff > moTolerance) continue;
    
    equivalents.push(fkmMotor);
  }
  
  // Ordenar por similitud de Mo (más cercano primero)
  // Priorizar motores con longitud de eje (N) coincidente
  return equivalents.sort((a, b) => {
    // Verificar coincidencia de longitud de eje (N)
    const targetN = fxmMotor.dimensions.n;
    const aN = a.dimensions.n;
    const bN = b.dimensions.n;
    
    const aMatchesN = targetN !== null && aN !== null && Math.abs(aN - targetN) < 1; // Tolerancia de 1mm
    const bMatchesN = targetN !== null && bN !== null && Math.abs(bN - targetN) < 1;
    
    // Si uno coincide en N y el otro no, priorizar el que coincide
    if (aMatchesN && !bMatchesN) return -1;
    if (!aMatchesN && bMatchesN) return 1;
    
    // Si ambos coinciden o ninguno coincide, ordenar por similitud de Mo
    if (a.mo === null || b.mo === null || targetMo === null) return 0;
    const aDiff = Math.abs(a.mo - targetMo);
    const bDiff = Math.abs(b.mo - targetMo);
    return aDiff - bDiff;
  });
}

/**
 * Encuentra motores FXM equivalentes para un motor FKM dado
 * Criterios: RPM igual, Mo similar (±25%), dimensiones compatibles
 */
export function findEquivalentFXM(fkmMotor: Motor, database: MotorDatabase): Motor[] {
  const equivalents: Motor[] = [];
  const targetRpm = fkmMotor.rpm;
  const targetMo = fkmMotor.mo;
  const moTolerance = 0.25; // 25% tolerancia
  
  for (const fxmMotor of Object.values(database.fxm_motors)) {
    // Criterio 1: RPM debe ser igual
    if (fxmMotor.rpm !== targetRpm) continue;
    
    // Criterio 2: Mo debe estar dentro del rango (±25%)
    if (fxmMotor.mo === null || targetMo === null) continue;
    const moDiff = Math.abs(fxmMotor.mo - targetMo) / targetMo;
    if (moDiff > moTolerance) continue;
    
    equivalents.push(fxmMotor);
  }
  
  // Ordenar por similitud de Mo (más cercano primero)
  return equivalents.sort((a, b) => {
    if (a.mo === null || b.mo === null || targetMo === null) return 0;
    const aDiff = Math.abs(a.mo - targetMo);
    const bDiff = Math.abs(b.mo - targetMo);
    return aDiff - bDiff;
  });
}

/**
 * Compara dos motores y calcula las diferencias
 */
export function compareMotors(fxm: Motor, fkm: Motor): ComparisonResult {
  const calcDiff = (fxmVal: number | null, fkmVal: number | null): DimensionComparison => {
    if (fxmVal === null || fkmVal === null) {
      return { fxm: fxmVal, fkm: fkmVal, diff: null };
    }
    return {
      fxm: fxmVal,
      fkm: fkmVal,
      diff: fkmVal - fxmVal
    };
  };
  
  const calcElecDiff = (fxmVal: number | null, fkmVal: number | null): ElectricalComparison => {
    if (fxmVal === null || fkmVal === null) {
      return { fxm: fxmVal, fkm: fkmVal, diff: null, percent: null };
    }
    const diff = fkmVal - fxmVal;
    const percent = fxmVal !== 0 ? (diff / fxmVal) * 100 : null;
    return {
      fxm: fxmVal,
      fkm: fkmVal,
      diff,
      percent
    };
  };
  
  return {
    fxm,
    fkm,
    differences: {
      electrical: {
        mo: calcElecDiff(fxm.mo, fkm.mo),
        mn: calcElecDiff(fxm.mn, fkm.mn),
        mp: calcElecDiff(fxm.mp, fkm.mp),
        io: calcElecDiff(fxm.io, fkm.io),
        rpm: calcElecDiff(fxm.rpm, fkm.rpm),
        j: calcElecDiff(fxm.j, fkm.j),
        pcal: calcElecDiff(fxm.pcal, fkm.pcal)
      },
      dimensions: {
        l: calcDiff(fxm.dimensions.l, fkm.dimensions.l),
        ac: calcDiff(fxm.dimensions.ac, fkm.dimensions.ac),
        n: calcDiff(fxm.dimensions.n, fkm.dimensions.n),
        d: calcDiff(fxm.dimensions.d, fkm.dimensions.d),
        e: calcDiff(fxm.dimensions.e, fkm.dimensions.e),
        m: calcDiff(fxm.dimensions.m, fkm.dimensions.m)
      }
    }
  };
}

/**
 * Filtra motores por criterios avanzados
 */
export interface AdvancedFilters {
  moMin?: number;
  moMax?: number;
  rpmMin?: number;
  rpmMax?: number;
  lMax?: number;
  acMax?: number;
  nMin?: number;
  nMax?: number;
}

export function applyAdvancedFilters(motors: Motor[], filters: AdvancedFilters): Motor[] {
  return motors.filter(motor => {
    if (filters.moMin !== undefined && motor.mo !== null && motor.mo < filters.moMin) return false;
    if (filters.moMax !== undefined && motor.mo !== null && motor.mo > filters.moMax) return false;
    if (filters.rpmMin !== undefined && motor.rpm !== null && motor.rpm < filters.rpmMin) return false;
    if (filters.rpmMax !== undefined && motor.rpm !== null && motor.rpm > filters.rpmMax) return false;
    if (filters.lMax !== undefined && motor.dimensions.l && motor.dimensions.l > filters.lMax) return false;
    if (filters.acMax !== undefined && motor.dimensions.ac && motor.dimensions.ac > filters.acMax) return false;
    if (filters.nMin !== undefined && motor.dimensions.n && motor.dimensions.n < filters.nMin) return false;
    if (filters.nMax !== undefined && motor.dimensions.n && motor.dimensions.n > filters.nMax) return false;
    return true;
  });
}
