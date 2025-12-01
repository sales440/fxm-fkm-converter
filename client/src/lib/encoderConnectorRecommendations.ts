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
  'FKM21': {
    recommended: 'MC-20/6',
    alternatives: ['MC-23/6'],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'Motor pequeño FKM21. Conector MC-20/6, cable MPC-4x1.5-xxM'
  },
  'FKM22': {
    recommended: 'MC-20/6',
    alternatives: ['MC-23/6'],
    wireGauge: '1.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'Motor pequeño FKM22 - Reemplazo de FXM14. Requiere conector MC-20/6 (84080060), cable encoder EEC-SP-xx y cable alimentación MPC-4x1.5-xxM (longitud según cliente)'
  },
  'FKM31': {
    recommended: 'MC-23/6',
    alternatives: ['MC-46/6'],
    wireGauge: '2.5 mm²',
    cable: 'MPC-4x2.5',
    notes: 'Motor mediano FKM31. Conector MC-23/6, cable MPC-4x2.5-xxM'
  },
  'FKM32': {
    recommended: 'MC-23/6',
    alternatives: ['MC-46/6'],
    wireGauge: '2.5 mm²',
    cable: 'MPC-4x2.5',
    notes: 'Motor mediano FKM32. Conector MC-23/6, cable MPC-4x2.5-xxM'
  },
  'FKM41': {
    recommended: 'MC-46/6',
    alternatives: ['MC-80/6'],
    wireGauge: '4 mm²',
    cable: 'MPC-4x4',
    notes: 'Motor grande FKM41. Conector MC-46/6, cable MPC-4x4-xxM'
  },
  'FKM42': {
    recommended: 'MC-46/6',
    alternatives: ['MC-80/6'],
    wireGauge: '4 mm²',
    cable: 'MPC-4x4',
    notes: 'Motor grande FKM42. Conector MC-46/6, cable MPC-4x4-xxM'
  },
  'FKM43': {
    recommended: 'MC-23/6',
    alternatives: ['MC-46/6'],
    wireGauge: '1.5 - 2.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'Motor compacto FKM43. Conector MC-23/6, cable MPC-4x1.5-xxM'
  },
  'FKM44': {
    recommended: 'MC-23/6',
    alternatives: ['MC-46/6'],
    wireGauge: '1.5 - 2.5 mm²',
    cable: 'MPC-4x1.5',
    notes: 'Motor compacto FKM44. Conector MC-23/6, cable MPC-4x1.5-xxM'
  },
  'FKM62': {
    recommended: 'MC-46/6',
    alternatives: ['MC-80/6'],
    wireGauge: '2.5 - 4 mm²',
    cable: 'MPC-4x2.5',
    notes: 'Motor mediano FKM62. Conector MC-46/6, cable MPC-4x2.5-xxM'
  },
  'FKM63': {
    recommended: 'MC-46/6',
    alternatives: ['MC-80/6'],
    wireGauge: '2.5 - 4 mm²',
    cable: 'MPC-4x2.5',
    notes: 'Motor mediano FKM63. Conector MC-46/6, cable MPC-4x2.5-xxM'
  },
  'FKM64': {
    recommended: 'MC-46/6',
    alternatives: ['MC-80/6'],
    wireGauge: '4 mm²',
    cable: 'MPC-4x4',
    notes: 'Motor mediano FKM64. Conector MC-46/6, cable MPC-4x4-xxM'
  },
  'FKM66': {
    recommended: 'MC-46/6',
    alternatives: ['MC-80/6'],
    wireGauge: '4 - 6 mm²',
    cable: 'MPC-4x4',
    notes: 'Motor mediano-grande FKM66. Conector MC-46/6, cable MPC-4x4-xxM'
  },
  'FKM82': {
    recommended: 'MC-80/6',
    alternatives: ['MC-46/6'],
    wireGauge: '4 - 10 mm²',
    cable: 'MPC-4x4',
    notes: 'Motor grande FKM82. Conector MC-80/6, cable MPC-4x4-xxM o MPC-4x6-xxM'
  },
  'FKM83': {
    recommended: 'MC-80/6',
    alternatives: [],
    wireGauge: '6 - 16 mm²',
    cable: 'MPC-4x6',
    notes: 'Motor grande FKM83. Conector MC-80/6, cable MPC-4x6-xxM o MPC-4x10-xxM'
  },
  'FKM84': {
    recommended: 'MC-80/6',
    alternatives: [],
    wireGauge: '10 - 16 mm²',
    cable: 'MPC-4x10',
    notes: 'Motor grande FKM84. Conector MC-80/6, cable MPC-4x10-xxM o MPC-4x16-xxM'
  },
  'FKM85': {
    recommended: 'MC-80/6',
    alternatives: [],
    wireGauge: '10 - 16 mm²',
    cable: 'MPC-4x10',
    notes: 'Motor grande FKM85. Conector MC-80/6, cable MPC-4x10-xxM o MPC-4x16-xxM'
  },
  'FKM94': {
    recommended: 'MC-80/6',
    alternatives: [],
    wireGauge: '16 - 25 mm²',
    cable: 'MPC-4x16',
    notes: 'Motor extra grande FKM94. Conector MC-80/6, cable MPC-4x16-xxM o MPC-4x25-xxM'
  },
  'FKM95': {
    recommended: 'MC-80/6',
    alternatives: [],
    wireGauge: '16 - 25 mm²',
    cable: 'MPC-4x16',
    notes: 'Motor extra grande FKM95. Conector MC-80/6, cable MPC-4x16-xxM o MPC-4x25-xxM'
  },
  'FKM96': {
    recommended: 'MC-80/6',
    alternatives: [],
    wireGauge: '25 mm²',
    cable: 'MPC-4x25',
    notes: 'Motor extra grande FKM96. Conector MC-80/6, cable MPC-4x25-xxM'
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

export function getEncoderRecommendation(fxmModel: string): EncoderRecommendation | undefined {
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

export function getConnectorRecommendation(fxmModel: string, fkmModel: string): ConnectorRecommendation | undefined {
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
