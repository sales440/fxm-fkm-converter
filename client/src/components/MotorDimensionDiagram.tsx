import type { Motor } from "@/types/motor";
import { useLanguage } from "@/contexts/LanguageContext";

interface MotorDimensionDiagramProps {
  fxm: Motor;
  fkm: Motor;
}

export default function MotorDimensionDiagram({ fxm, fkm }: MotorDimensionDiagramProps) {
  const { t } = useLanguage();
  
  // Escala para visualización
  const scale = 2;
  const baseX = 50;
  const baseY = 150;
  
  const fxmL = (fxm.dimensions.l || 200) / scale;
  const fxmAC = (fxm.dimensions.ac || 100) / scale;
  const fxmD = (fxm.dimensions.d || 20) / scale;
  
  const fkmL = (fkm.dimensions.l || 200) / scale;
  const fkmAC = (fkm.dimensions.ac || 100) / scale;
  const fkmD = (fkm.dimensions.d || 20) / scale;
  
  return (
    <div className="bg-white p-6 rounded-lg border-2 border-primary/20">
      <h3 className="text-lg font-bold text-primary mb-4">{t('diagram.title') || 'Dimensional Comparison'}</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Diagrama FXM */}
        <div>
          <h4 className="text-center font-bold text-blue-700 mb-2">FXM {fxm.model}</h4>
          <svg viewBox="0 0 400 300" className="w-full border border-slate-200 bg-slate-50">
            {/* Motor body */}
            <rect
              x={baseX}
              y={baseY - fxmAC / 2}
              width={fxmL}
              height={fxmAC}
              fill="#4A90E2"
              stroke="#2563EB"
              strokeWidth="2"
            />
            
            {/* Shaft */}
            <rect
              x={baseX + fxmL}
              y={baseY - fxmD / 2}
              width={fxmD * 2}
              height={fxmD}
              fill="#94A3B8"
              stroke="#475569"
              strokeWidth="2"
            />
            
            {/* Dimensiones */}
            {/* Longitud L */}
            <line
              x1={baseX}
              y1={baseY + fxmAC / 2 + 20}
              x2={baseX + fxmL}
              y2={baseY + fxmAC / 2 + 20}
              stroke="#DC1E26"
              strokeWidth="2"
              markerEnd="url(#arrowred)"
            />
            <line
              x1={baseX}
              y1={baseY + fxmAC / 2 + 15}
              x2={baseX}
              y2={baseY + fxmAC / 2 + 25}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <line
              x1={baseX + fxmL}
              y1={baseY + fxmAC / 2 + 15}
              x2={baseX + fxmL}
              y2={baseY + fxmAC / 2 + 25}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <text
              x={baseX + fxmL / 2}
              y={baseY + fxmAC / 2 + 40}
              textAnchor="middle"
              fill="#DC1E26"
              fontSize="12"
              fontWeight="bold"
            >
              L = {fxm.dimensions.l} mm
            </text>
            
            {/* Altura AC */}
            <line
              x1={baseX - 20}
              y1={baseY - fxmAC / 2}
              x2={baseX - 20}
              y2={baseY + fxmAC / 2}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <line
              x1={baseX - 25}
              y1={baseY - fxmAC / 2}
              x2={baseX - 15}
              y2={baseY - fxmAC / 2}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <line
              x1={baseX - 25}
              y1={baseY + fxmAC / 2}
              x2={baseX - 15}
              y2={baseY + fxmAC / 2}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <text
              x={baseX - 35}
              y={baseY}
              textAnchor="middle"
              fill="#DC1E26"
              fontSize="12"
              fontWeight="bold"
              transform={`rotate(-90, ${baseX - 35}, ${baseY})`}
            >
              AC = {fxm.dimensions.ac} mm
            </text>
            
            {/* Diámetro D */}
            <line
              x1={baseX + fxmL + fxmD * 2 + 10}
              y1={baseY - fxmD / 2}
              x2={baseX + fxmL + fxmD * 2 + 10}
              y2={baseY + fxmD / 2}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <text
              x={baseX + fxmL + fxmD * 2 + 25}
              y={baseY + 5}
              fill="#DC1E26"
              fontSize="12"
              fontWeight="bold"
            >
              D = {fxm.dimensions.d} mm
            </text>
          </svg>
        </div>
        
        {/* Diagrama FKM */}
        <div>
          <h4 className="text-center font-bold text-primary mb-2">FKM {fkm.model}</h4>
          <svg viewBox="0 0 400 300" className="w-full border border-slate-200 bg-slate-50">
            {/* Motor body */}
            <rect
              x={baseX}
              y={baseY - fkmAC / 2}
              width={fkmL}
              height={fkmAC}
              fill="#DC1E26"
              stroke="#B91C1C"
              strokeWidth="2"
            />
            
            {/* Shaft */}
            <rect
              x={baseX + fkmL}
              y={baseY - fkmD / 2}
              width={fkmD * 2}
              height={fkmD}
              fill="#94A3B8"
              stroke="#475569"
              strokeWidth="2"
            />
            
            {/* Dimensiones */}
            {/* Longitud L */}
            <line
              x1={baseX}
              y1={baseY + fkmAC / 2 + 20}
              x2={baseX + fkmL}
              y2={baseY + fkmAC / 2 + 20}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <line
              x1={baseX}
              y1={baseY + fkmAC / 2 + 15}
              x2={baseX}
              y2={baseY + fkmAC / 2 + 25}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <line
              x1={baseX + fkmL}
              y1={baseY + fkmAC / 2 + 15}
              x2={baseX + fkmL}
              y2={baseY + fkmAC / 2 + 25}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <text
              x={baseX + fkmL / 2}
              y={baseY + fkmAC / 2 + 40}
              textAnchor="middle"
              fill="#DC1E26"
              fontSize="12"
              fontWeight="bold"
            >
              L = {fkm.dimensions.l} mm
            </text>
            
            {/* Altura AC */}
            <line
              x1={baseX - 20}
              y1={baseY - fkmAC / 2}
              x2={baseX - 20}
              y2={baseY + fkmAC / 2}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <line
              x1={baseX - 25}
              y1={baseY - fkmAC / 2}
              x2={baseX - 15}
              y2={baseY - fkmAC / 2}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <line
              x1={baseX - 25}
              y1={baseY + fkmAC / 2}
              x2={baseX - 15}
              y2={baseY + fkmAC / 2}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <text
              x={baseX - 35}
              y={baseY}
              textAnchor="middle"
              fill="#DC1E26"
              fontSize="12"
              fontWeight="bold"
              transform={`rotate(-90, ${baseX - 35}, ${baseY})`}
            >
              AC = {fkm.dimensions.ac} mm
            </text>
            
            {/* Diámetro D */}
            <line
              x1={baseX + fkmL + fkmD * 2 + 10}
              y1={baseY - fkmD / 2}
              x2={baseX + fkmL + fkmD * 2 + 10}
              y2={baseY + fkmD / 2}
              stroke="#DC1E26"
              strokeWidth="2"
            />
            <text
              x={baseX + fkmL + fkmD * 2 + 25}
              y={baseY + 5}
              fill="#DC1E26"
              fontSize="12"
              fontWeight="bold"
            >
              D = {fkm.dimensions.d} mm
            </text>
          </svg>
        </div>
      </div>
      
      {/* Tabla de diferencias */}
      <div className="mt-6">
        <h4 className="font-bold text-slate-900 mb-3">Dimensional Differences</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="font-bold text-slate-700">Dimension</div>
          <div className="font-bold text-slate-700 text-right">Difference</div>
          <div className="font-bold text-slate-700 text-right">Status</div>
          
          <div className="text-slate-600">Length (L)</div>
          <div className="text-right font-medium">
            {fkm.dimensions.l && fxm.dimensions.l
              ? `${(fkm.dimensions.l - fxm.dimensions.l).toFixed(1)} mm`
              : '-'}
          </div>
          <div className="text-right">
            {fkm.dimensions.l && fxm.dimensions.l && fkm.dimensions.l === fxm.dimensions.l && (
              <span className="text-green-600">✓ Same</span>
            )}
            {fkm.dimensions.l && fxm.dimensions.l && fkm.dimensions.l !== fxm.dimensions.l && (
              <span className="text-amber-600">⚠ Different</span>
            )}
          </div>
          
          <div className="text-slate-600">Housing (AC)</div>
          <div className="text-right font-medium">
            {fkm.dimensions.ac && fxm.dimensions.ac
              ? `${(fkm.dimensions.ac - fxm.dimensions.ac).toFixed(1)} mm`
              : '-'}
          </div>
          <div className="text-right">
            {fkm.dimensions.ac && fxm.dimensions.ac && fkm.dimensions.ac === fxm.dimensions.ac && (
              <span className="text-green-600">✓ Same</span>
            )}
            {fkm.dimensions.ac && fxm.dimensions.ac && fkm.dimensions.ac !== fxm.dimensions.ac && (
              <span className="text-amber-600">⚠ Different</span>
            )}
          </div>
          
          <div className="text-slate-600">Shaft (D)</div>
          <div className="text-right font-medium">
            {fkm.dimensions.d && fxm.dimensions.d
              ? `${(fkm.dimensions.d - fxm.dimensions.d).toFixed(1)} mm`
              : '-'}
          </div>
          <div className="text-right">
            {fkm.dimensions.d && fxm.dimensions.d && fkm.dimensions.d === fxm.dimensions.d && (
              <span className="text-green-600">✓ Same</span>
            )}
            {fkm.dimensions.d && fxm.dimensions.d && fkm.dimensions.d !== fxm.dimensions.d && (
              <span className="text-amber-600">⚠ Different</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
