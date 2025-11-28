import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CableLengthCalculatorProps {
  motorCurrent: number; // Corriente del motor en Amperios
  wireGauge: string; // Calibre del cable (ej: "4 - 10 mm²")
}

export default function CableLengthCalculator({ motorCurrent, wireGauge }: CableLengthCalculatorProps) {
  const { language } = useLanguage();
  const [voltageDrop, setVoltageDrop] = useState<number>(3); // % de caída de voltaje permitida (default 3%)
  const [voltage, setVoltage] = useState<number>(400); // Voltaje del sistema (default 400V trifásico)
  
  // Extraer el calibre mínimo del rango (ej: "4 - 10 mm²" -> 4)
  const minWireGauge = parseFloat(wireGauge.split('-')[0].trim());
  
  // Resistividad del cobre a 75°C (ohm·mm²/m)
  const copperResistivity = 0.0217;
  
  // Calcular longitud máxima del cable
  // Fórmula: L_max = (V_drop * V * A) / (√3 * I * ρ * 100)
  // Donde:
  // - V_drop: Porcentaje de caída de voltaje permitida
  // - V: Voltaje del sistema
  // - A: Área de la sección transversal del cable (mm²)
  // - I: Corriente del motor (A)
  // - ρ: Resistividad del cobre (ohm·mm²/m)
  // - √3: Factor para sistemas trifásicos
  
  const calculateMaxLength = () => {
    const maxLength = (voltageDrop * voltage * minWireGauge) / (Math.sqrt(3) * motorCurrent * copperResistivity * 100);
    return maxLength;
  };
  
  const maxLength = calculateMaxLength();
  const isWarning = maxLength < 10; // Advertencia si la longitud máxima es muy corta
  
  const texts = {
    es: {
      title: "Calculadora de Longitud de Cable",
      subtitle: "Calcula la longitud máxima recomendada del cable de potencia",
      motorCurrent: "Corriente del Motor (Io)",
      wireGauge: "Calibre del Cable",
      voltage: "Voltaje del Sistema",
      voltageDrop: "Caída de Voltaje Permitida",
      maxLength: "Longitud Máxima Recomendada",
      warning: "Advertencia: La longitud máxima es muy corta. Considere usar un cable de mayor calibre.",
      note: "Nota: Este cálculo asume cable de cobre a 75°C y sistema trifásico. Para instalaciones específicas, consulte con un ingeniero eléctrico.",
      formula: "Fórmula utilizada: L_max = (V_drop × V × A) / (√3 × I × ρ × 100)"
    },
    en: {
      title: "Cable Length Calculator",
      subtitle: "Calculate the maximum recommended power cable length",
      motorCurrent: "Motor Current (Io)",
      wireGauge: "Wire Gauge",
      voltage: "System Voltage",
      voltageDrop: "Allowed Voltage Drop",
      maxLength: "Maximum Recommended Length",
      warning: "Warning: Maximum length is very short. Consider using a larger wire gauge.",
      note: "Note: This calculation assumes copper cable at 75°C and three-phase system. For specific installations, consult with an electrical engineer.",
      formula: "Formula used: L_max = (V_drop × V × A) / (√3 × I × ρ × 100)"
    }
  };
  
  const t = texts[language as keyof typeof texts] || texts.en;
  
  return (
    <Card className="mt-6 border-2 border-blue-500">
      <CardHeader className="bg-blue-500">
        <CardTitle className="text-white font-bold text-xl flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          {t.title}
        </CardTitle>
        <p className="text-white text-sm mt-1">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Parámetros del motor (solo lectura) */}
          <div>
            <Label className="text-sm font-semibold text-slate-700">{t.motorCurrent}</Label>
            <Input 
              type="number" 
              value={motorCurrent.toFixed(2)} 
              disabled 
              className="mt-1 bg-slate-100 font-bold"
            />
            <p className="text-xs text-slate-500 mt-1">Arms</p>
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-slate-700">{t.wireGauge}</Label>
            <Input 
              type="text" 
              value={wireGauge} 
              disabled 
              className="mt-1 bg-slate-100 font-bold"
            />
            <p className="text-xs text-slate-500 mt-1">mm²</p>
          </div>
          
          {/* Parámetros ajustables */}
          <div>
            <Label className="text-sm font-semibold text-slate-700">{t.voltage}</Label>
            <Input 
              type="number" 
              value={voltage} 
              onChange={(e) => setVoltage(parseFloat(e.target.value) || 400)}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">V (trifásico)</p>
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-slate-700">{t.voltageDrop}</Label>
            <Input 
              type="number" 
              value={voltageDrop} 
              onChange={(e) => setVoltageDrop(parseFloat(e.target.value) || 3)}
              step="0.5"
              min="1"
              max="5"
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">% (típico: 3%)</p>
          </div>
        </div>
        
        {/* Resultado */}
        <div className={`p-6 rounded-lg border-2 ${isWarning ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'}`}>
          <div className="flex items-center gap-3 mb-3">
            {isWarning ? (
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-600">{t.maxLength}</p>
              <p className={`text-3xl font-bold ${isWarning ? 'text-amber-700' : 'text-green-700'}`}>
                {maxLength.toFixed(1)} m
              </p>
            </div>
          </div>
          
          {isWarning && (
            <div className="bg-amber-100 p-3 rounded border-l-4 border-amber-600 mb-3">
              <p className="text-sm text-amber-900 font-semibold">
                {t.warning}
              </p>
            </div>
          )}
          
          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500 mb-3">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">{t.note}</span>
            </p>
          </div>
          
          <div className="bg-slate-100 p-3 rounded">
            <p className="text-xs text-slate-700 font-mono">
              {t.formula}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
