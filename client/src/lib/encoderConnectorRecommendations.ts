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

const fkmConnectorsByFamily: Record<string, { recommended: string; alternatives: string[]; wireGauge: string; notes: string }> = {
  'FKM22': {
    recommended: 'MC-20/6 (84080060)',
    alternatives: ['MPC-4x1.5'],
    wireGauge: '1.5 mm²',
    notes: 'Motor pequeño FKM22 - Reemplazo de FXM14. Requiere enchufe MC-20/6 (84080060), cable encoder EEC-SP-xx y cable alimentación MPC-4X1.5-xxM (longitud según cliente)'
  },
  'FKM43': {
    recommended: 'MPC-4x1.5',
    alternatives: ['MPC-4x2.5'],
    wireGauge: '1.5 - 2.5 mm²',
    notes: 'Motor compacto de baja potencia'
  },
  'FKM44': {
    recommended: 'MPC-4x1.5',
    alternatives: ['MPC-4x2.5'],
    wireGauge: '1.5 - 2.5 mm²',
    notes: 'Motor compacto de baja potencia'
  },
  'FKM62': {
    recommended: 'MPC-4x2.5',
    alternatives: ['MPC-4x4'],
    wireGauge: '2.5 - 4 mm²',
    notes: 'Motor mediano de potencia estándar'
  },
  'FKM63': {
    recommended: 'MPC-4x2.5',
    alternatives: ['MPC-4x4'],
    wireGauge: '2.5 - 4 mm²',
    notes: 'Motor mediano de potencia estándar'
  },
  'FKM64': {
    recommended: 'MPC-4x2.5',
    alternatives: ['MPC-4x4'],
    wireGauge: '2.5 - 4 mm²',
    notes: 'Motor mediano de potencia estándar'
  },
  'FKM66': {
    recommended: 'MPC-4x4',
    alternatives: ['MPC-4x6'],
    wireGauge: '4 - 6 mm²',
    notes: 'Motor mediano-grande de potencia media-alta'
  },
  'FKM82': {
    recommended: 'MPC-4x4',
    alternatives: ['MPC-4x6', 'MPC-4x10'],
    wireGauge: '4 - 10 mm²',
    notes: 'Motor grande de potencia media-alta'
  },
  'FKM83': {
    recommended: 'MPC-4x6',
    alternatives: ['MPC-4x10', 'MPC-4x16'],
    wireGauge: '6 - 16 mm²',
    notes: 'Motor grande de alta potencia'
  },
  'FKM84': {
    recommended: 'MPC-4x10',
    alternatives: ['MPC-4x16'],
    wireGauge: '10 - 16 mm²',
    notes: 'Motor grande de muy alta potencia'
  },
  'FKM85': {
    recommended: 'MPC-4x10',
    alternatives: ['MPC-4x16'],
    wireGauge: '10 - 16 mm²',
    notes: 'Motor grande de muy alta potencia'
  },
  'FKM94': {
    recommended: 'MPC-4x16',
    alternatives: ['MPC-4x25'],
    wireGauge: '16 - 25 mm²',
    notes: 'Motor extra grande de muy alta potencia'
  },
  'FKM95': {
    recommended: 'MPC-4x16',
    alternatives: ['MPC-4x25'],
    wireGauge: '16 - 25 mm²',
    notes: 'Motor extra grande de muy alta potencia'
  },
  'FKM96': {
    recommended: 'MPC-4x25',
    alternatives: [],
    wireGauge: '25 mm²',
    notes: 'Motor extra grande de potencia industrial máxima'
  }
};

// Función para detectar encoder del modelo FXM
function detectFXMEncoder(fxmModel: string): string {
  // Los encoders están en la posición del modelo: FXM##.##X.YY.ZZZ
  // Donde YY puede ser E1, A1, o I0
  const match = fxmModel.match(/\.(E1|A1|I0)\./i);
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
  const sizeMatch = fxmModel.match(/FXM(\d+)/i);
  if (sizeMatch) {
    const size = parseInt(sizeMatch[1]);
    if (size >= 76) return 'MC 46';
    return 'MC 23';
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
