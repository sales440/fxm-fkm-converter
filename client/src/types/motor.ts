export interface MotorDimensions {
  l: number | null;  // Longitud total
  ac: number | null; // Ancho de carcasa
  n: number | null;  // Diámetro de eje
  d: number | null;  // Diámetro de brida
  e: number | null;  // Altura de eje
  m: number | null;  // Longitud de montaje
}

export interface Motor {
  model: string;
  mo: number | null;   // Par a rótor parado (Nm)
  mn: number | null;   // Par nominal (Nm)
  mp: number | null;   // Par de pico a rótor bloqueado (Nm)
  io: number | null;   // Corriente a rótor parado (Arms)
  rpm: number | null;  // Velocidad nominal
  j: number | null;    // Inercia (kg/cm2)
  pcal: number | null; // Potencia de cálculo (kW)
  dimensions: MotorDimensions;
  recommended_drive?: string; // Drive recomendado (AXD/ACSD)
}

export interface MotorDatabase {
  fxm_motors: Record<string, Motor>;
  fkm_motors: Record<string, Motor>;
  conversions: any[];
}

export interface DimensionComparison {
  fxm: number | null;
  fkm: number | null;
  diff: number | null;
}

export interface ElectricalComparison {
  fxm: number | null;
  fkm: number | null;
  diff: number | null;
  percent: number | null;
}

export interface EncoderRecommendation {
  fxmEncoder: string;
  recommendedFkmEncoders: string[];
  bestMatch: string;
  notes: string;
}

export interface ConnectorRecommendation {
  fxmConnector: string;
  recommendedFkmConnector: string;
  alternativeConnectors: string[];
  wireGauge: string;
  notes: string;
}

export interface ComparisonResult {
  fxm: Motor;
  fkm: Motor;
  differences: {
    electrical: {
      mo: { fxm: number | null; fkm: number | null; diff: number | null; percent: number | null };
      mn: { fxm: number | null; fkm: number | null; diff: number | null; percent: number | null };
      mp: { fxm: number | null; fkm: number | null; diff: number | null; percent: number | null };
      io: { fxm: number | null; fkm: number | null; diff: number | null; percent: number | null };
      rpm: { fxm: number | null; fkm: number | null; diff: number | null; percent: number | null };
      j: { fxm: number | null; fkm: number | null; diff: number | null; percent: number | null };
      pcal: { fxm: number | null; fkm: number | null; diff: number | null; percent: number | null };
    };
    dimensions: {
      l: { fxm: number | null; fkm: number | null; diff: number | null };
      ac: { fxm: number | null; fkm: number | null; diff: number | null };
      n: { fxm: number | null; fkm: number | null; diff: number | null };
      d: { fxm: number | null; fkm: number | null; diff: number | null };
      e: { fxm: number | null; fkm: number | null; diff: number | null };
      m: { fxm: number | null; fkm: number | null; diff: number | null };
    };
  };
  encoderRecommendation?: EncoderRecommendation;
  connectorRecommendation?: ConnectorRecommendation;
}
