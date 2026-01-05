import type { EncoderRecommendation, ConnectorRecommendation } from '@/types/motor';

// Datos de encoders y conectores
const encoderConversionMap: Record<string, { recommended: string[]; bestMatch: string; notes: string }> = {
  'E1': {
    recommended: ['E3', 'E4'],
    bestMatch: 'E3',
    notes: 'El encoder E3 de FKM es el equivalente más cercano al E1 de FXM con 1024 ppt. Si se requiere menor resolución, usar E4 con 128 ppt.'
  },
  'A1': {
    recommended: ['A3', 'A4'],
    bestMatch: 'A3',
    notes: 'El encoder A3 de FKM es el equivalente directo al A1 de FXM, ambos con 1024 ppt y capacidad multivuelta absoluta.'
  },
  'I0': {
    recommended: ['I0'],
    bestMatch: 'I0',
    notes: 'El encoder I0 de FKM es compatible con el I0 de FXM, ambos son TTL incrementales de 2500 ppt.'
  }
};

// Conectores de poder correctos (MCxx/x format)
// Basado en especificaciones técnicas FAGOR
const fkmConnectorsByFamily: Record<string, { recommended: string; alternatives: string[]; wireGauge: string; cable: string; notes: string }> = {
  // FKM2 Series (2000/3000/4000/6000 rpm)
  'FKM21': {
    recommended: 'MC-20/6',
    alternatives: [],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'FKM21: Conector MC-20/6. Cable MPC-4x1.5.'
  },
  'FKM22': {
    recommended: 'MC-20/6',
    alternatives: [],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'FKM22: Conector MC-20/6. Cable MPC-4x1.5.'
  },

  // FKM4 Series (2000/3000/4000/4500/6000 rpm)
  'FKM42': {
    recommended: 'MC-20/6',
    alternatives: [],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'FKM42: Conector MC-20/6. Cable MPC-4x1.5.'
  },
  'FKM43': {
    recommended: 'MC-20/6',
    alternatives: [],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'FKM43: Conector MC-20/6. Cable MPC-4x1.5.'
  },
  'FKM44': {
    recommended: 'MC-20/6',
    alternatives: [],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'FKM44: Conector MC-20/6. Cable MPC-4x1.5.'
  },

  // FKM6 Series (2000/3000/4000/6000 rpm)
  'FKM62': {
    recommended: 'MC-20/6',
    alternatives: [],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'FKM62: Conector MC-20/6. Cable MPC-4x1.5.'
  },
  'FKM63': {
    recommended: 'MC-20/6',
    alternatives: [],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'FKM63: Conector MC-20/6. Cable MPC-4x1.5.'
  },
  'FKM64': {
    recommended: 'MC-20/6',
    alternatives: [],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'FKM64: Conector MC-20/6. Cable MPC-4x1.5.'
  },
  'FKM66': {
    recommended: 'MC-20/6',
    alternatives: ['MC-61/6'],
    wireGauge: '1.5 mm² / 4 mm²',
    cable: 'MPC-4x1.5 / MPC-4x4',
    notes: 'FKM66: Generalmente MC-20/6 (MPC-4x1.5). Para FKM66.20A con freno o FKM66.30A sin freno, usar MC-61/6 (MPC-4x4).'
  },

  // FKM8 Series (2000/3000/4000 rpm)
  'FKM82': {
    recommended: 'MC-20/6',
    alternatives: ['MC-61/6'],
    wireGauge: '1.5 mm² / 4 mm²',
    cable: 'MPC-4x1.5 / MPC-4x4',
    notes: 'FKM82: Generalmente MC-20/6 (MPC-4x1.5). Para FKM82.30A/40A, usar MC-61/6 (MPC-4x4).'
  },
  'FKM83': {
    recommended: 'MC-61/6',
    alternatives: [],
    wireGauge: '2.5 mm² / 4 mm²',
    cable: 'MPC-4x2.5 / MPC-4x4',
    notes: 'FKM83: Conector MC-61/6. Cable MPC-4x2.5 o MPC-4x4 según modelo.'
  },
  'FKM84': {
    recommended: 'MC-61/6',
    alternatives: [],
    wireGauge: '4 mm² / 10 mm²',
    cable: 'MPC-4x4 / MPC-4x10',
    notes: 'FKM84: Conector MC-61/6. Cable MPC-4x4 o MPC-4x10 según modelo.'
  },
  'FKM85': {
    recommended: 'MC-61/6',
    alternatives: [],
    wireGauge: '6 mm² / 10 mm²',
    cable: 'MPC-4x6 / MPC-4x10',
    notes: 'FKM85: Conector MC-61/6. Cable MPC-4x6 o MPC-4x10 según modelo.'
  },

  // FKM9 Series (2000 rpm)
  'FKM94': {
    recommended: 'MC-61/6',
    alternatives: [],
    wireGauge: '6 mm²',
    cable: 'MPC-4x6',
    notes: 'FKM94: Conector MC-61/6. Cable MPC-4x6.'
  },
  'FKM95': {
    recommended: 'MC-61/6',
    alternatives: [],
    wireGauge: '10 mm²',
    cable: 'MPC-4x10',
    notes: 'FKM95: Conector MC-61/6. Cable MPC-4x10.'
  },
  'FKM96': {
    recommended: 'MC-61/6',
    alternatives: [],
    wireGauge: '16 mm²',
    cable: 'MPC-4x16',
    notes: 'FKM96: Conector MC-61/6. Cable MPC-4x16.'
  }
};

// Función para detectar encoder del modelo FXM
function detectFXMEncoder(fxmModel: string): string {
  // Los encoders están en la posición del modelo: FXM##.##X.YY.ZZZ
  // Donde YY puede ser E1, A1, o I0
  const match = fxmModel.match(/\.(E1|E2|E3|A1|A2|A3|I0)\./i);
  if (match) {
    return match[1].toUpperCase();
  }
  return 'E1'; // Por defecto
}

// Función para detectar conector del modelo FXM
function detectFXMConnector(fxmModel: string): string {
  // Basado en la tabla del manual, detectar el conector según el modelo
  if (fxmModel.includes('MC 23')) return 'MC 23';
  if (fxmModel.includes('MC 46')) return 'MC 46';
  if (fxmModel.includes('MC 80')) return 'MC 80';
  
  // Por defecto, basado en el tamaño del motor
  const sizeMatch = fxmModel.match(/FXM\s*(\d+)/i);
  if (sizeMatch) {
    const size = parseInt(sizeMatch[1]);
    if (size >= 76) return 'MC 46';
    if (size >= 14) return 'MC 23';
    return 'MC 20';
  }
  
  return 'MC 23';
}

// Función para extraer familia del modelo FKM
function extractFKMFamily(fkmModel: string): string {
  const match = fkmModel.match(/FKM\s*(\d{2})/i);
  if (match) {
    return `FKM${match[1]}`;
  }
  return '';
}

export function getEncoderRecommendation(fxmModel: string, fkmModel: string, language: string = 'es'): EncoderRecommendation | undefined {
  const fxmEncoder = detectFXMEncoder(fxmModel);
  const conversion = encoderConversionMap[fxmEncoder];
  
  if (!conversion) return undefined;
  
  return {
    fxmEncoder,
    recommendedFkmEncoders: conversion.recommended,
    bestMatch: conversion.bestMatch,
    notes: conversion.notes
  };
}

export function getConnectorRecommendation(fxmModel: string, fkmModel: string, language: string = 'es'): ConnectorRecommendation | undefined {
  const fxmConnector = detectFXMConnector(fxmModel);
  const fkmFamily = extractFKMFamily(fkmModel);
  
  const connectorInfo = fkmConnectorsByFamily[fkmFamily];
  
  if (!connectorInfo) return undefined;
  
  return {
    fxmConnector,
    recommendedFkmConnector: connectorInfo.recommended,
    alternativeConnectors: connectorInfo.alternatives,
    wireGauge: connectorInfo.wireGauge,
    notes: connectorInfo.notes
  };
}
