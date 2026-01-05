import type { MotorDatabase, Motor, ComparisonResult, DimensionComparison, ElectricalComparison } from "@/types/motor";

/**
 * Normaliza un modelo de motor para búsqueda flexible
 * Elimina espacios, puntos extras y convierte a mayúsculas
 */
function normalizeModel(model: string): string {
  // Simplificación radical: eliminar todo lo que no sea alfanumérico
  // Esto permite que "FXM32.40A.E1.000" coincida con "FXM 32.40A E1 000"
  return model.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Tabla de equivalencia de Encoders (FXM <-> FKM)
// Fuente: Manuales de usuario Fagor Automation (Ref.1603 y Ref.2403)
const ENCODER_MAPPING: Record<string, string> = {
  // FXM -> FKM
  'E1': 'E3', // Sinusoidal 1 Vpp 1024 ppt (FXM E1 -> FKM E3)
  'A1': 'A3', // Absoluto Multi-turn SinCos (FXM A1 -> FKM A3)
  'I0': 'I0', // Incremental TTL 2500 ppt (Igual en ambos)
  'S1': 'E3', // Variante sinusoidal antigua -> E3
  
  // FKM -> FXM (Bidireccional)
  'E3': 'E1',
  'A3': 'A1',
  // I0 se mapea a sí mismo, no es necesario duplicar si la lógica maneja identidad
};

// Función para extraer el encoder de un modelo completo
const extractEncoder = (model: string): string | null => {
  // Busca patrones comunes de encoder: punto + 2 caracteres + punto (ej: .E1. o .A1.)
  // O simplemente busca las claves conocidas
  for (const code of Object.keys(ENCODER_MAPPING)) {
    if (model.includes(`.${code}.`) || model.includes(` ${code} `) || model.endsWith(code)) {
      return code;
    }
  }
  return null;
};

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
    
    // Búsqueda flexible con soporte de comodines 'X'
    // Convertimos la clave de la BD en una expresión regular donde 'X' coincide con cualquier dígito/letra
    const regexPattern = normalizedKey.replace(/X/g, '[A-Z0-9]');
    const regex = new RegExp('^' + regexPattern); // Anclamos al inicio para mayor precisión
    
    // 1. Coincidencia exacta con comodines (ej: FXM3240AXX coincide con FXM3240AE1)
    // 2. Coincidencia parcial simple (ej: FXM32 coincide con FXM32...)
    // 3. Coincidencia inversa parcial (ej: FXM3240AE1000 coincide con FXM3240AXX...)
    if (regex.test(normalizedQuery) || normalizedKey.includes(normalizedQuery) || normalizedQuery.includes(normalizedKey.substring(0, 8))) {
      // Si encontramos un resultado genérico (con 'xx'), intentamos personalizarlo
      // con el encoder equivalente correcto
      const userEncoder = extractEncoder(query);
      if (userEncoder && motor.model.includes('xx')) {
        const equivalentEncoder = ENCODER_MAPPING[userEncoder];
        if (equivalentEncoder) {
          // Clonamos el motor para no modificar la BD original
          const customizedMotor = { ...motor };
          // Reemplazamos 'xx' por el encoder equivalente (ej: FKM...xx... -> FKM...A1...)
          // Asumimos que el primer 'xx' corresponde al encoder en la estructura estándar
          customizedMotor.model = customizedMotor.model.replace('xx', equivalentEncoder);
          results.push(customizedMotor);
          continue; // Pasamos al siguiente para no duplicar
        }
      }
      
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
    
    // Búsqueda flexible con soporte de comodines 'X'
    // Convertimos la clave de la BD en una expresión regular donde 'X' coincide con cualquier dígito/letra
    const regexPattern = normalizedKey.replace(/X/g, '[A-Z0-9]');
    const regex = new RegExp('^' + regexPattern); // Anclamos al inicio para mayor precisión
    
    // 1. Coincidencia exacta con comodines (ej: FXM3240AXX coincide con FXM3240AE1)
    // 2. Coincidencia parcial simple (ej: FXM32 coincide con FXM32...)
    // 3. Coincidencia inversa parcial (ej: FXM3240AE1000 coincide con FXM3240AXX...)
    if (regex.test(normalizedQuery) || normalizedKey.includes(normalizedQuery) || normalizedQuery.includes(normalizedKey.substring(0, 8))) {
      // Si encontramos un resultado genérico (con 'xx'), intentamos personalizarlo
      // con el encoder equivalente correcto
      const userEncoder = extractEncoder(query);
      if (userEncoder && motor.model.includes('xx')) {
        const equivalentEncoder = ENCODER_MAPPING[userEncoder];
        if (equivalentEncoder) {
          // Clonamos el motor para no modificar la BD original
          const customizedMotor = { ...motor };
          // Reemplazamos 'xx' por el encoder equivalente (ej: FKM...xx... -> FKM...A1...)
          // Asumimos que el primer 'xx' corresponde al encoder en la estructura estándar
          customizedMotor.model = customizedMotor.model.replace('xx', equivalentEncoder);
          results.push(customizedMotor);
          continue; // Pasamos al siguiente para no duplicar
        }
      }
      
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
