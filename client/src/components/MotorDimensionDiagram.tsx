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
  
  // Fallback values if dimensions are 0 or missing to ensure diagram is always visible
  const fxmL_raw = fxm.dimensions.l || 200;
  const fxmAC_raw = fxm.dimensions.ac || 130;
  const fxmD_raw = fxm.dimensions.d || 24;
  const fxmE_raw = fxm.dimensions.e || 130;
  const fxmM_raw = fxm.dimensions.m || 165;
  const fxmN_raw = fxm.dimensions.n || 110;

  const fkmL_raw = fkm.dimensions.l || 200;
  const fkmAC_raw = fkm.dimensions.ac || 130;
  const fkmD_raw = fkm.dimensions.d || 24;
  const fkmE_raw = fkm.dimensions.e || 130;
  const fkmM_raw = fkm.dimensions.m || 165;
  const fkmN_raw = fkm.dimensions.n || 110;

  const fxmL = fxmL_raw / scale;
  const fxmAC = fxmAC_raw / scale;
  const fxmD = fxmD_raw / scale;
  
  const fkmL = fkmL_raw / scale;
  const fkmAC = fkmAC_raw / scale;
  const fkmD = fkmD_raw / scale;
  
  return (
    <div className="bg-white p-6 rounded-lg border-2 border-primary/20">
      <h3 className="text-lg font-bold text-primary mb-4">{t('diagram.title') || 'Dimensional Comparison'}</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Diagrama FXM */}
        <div>
          <h4 className="text-center font-bold text-blue-700 mb-2">FXM {fxm.model}</h4>
          
          {/* VISTA LATERAL */}
          <div className="mb-4">
            <h5 className="text-xs font-bold text-slate-500 text-center mb-1">SIDE VIEW</h5>
            <svg viewBox="0 0 400 250" className="w-full border border-slate-200 bg-slate-50 rounded">
              {/* Motor body */}
              <rect
                x={baseX}
                y={125 - fxmAC / 2}
                width={fxmL}
                height={fxmAC}
                fill="#E0F2FE"
                stroke="#2563EB"
                strokeWidth="2"
              />
              {/* Shaft */}
              <rect
                x={baseX + fxmL}
                y={125 - fxmD / 2}
                width={fxmD * 2}
                height={fxmD}
                fill="#94A3B8"
                stroke="#475569"
                strokeWidth="2"
              />
              {/* Dimension L */}
              <line x1={baseX} y1={125 + fxmAC/2 + 15} x2={baseX + fxmL} y2={125 + fxmAC/2 + 15} stroke="#DC1E26" strokeWidth="2" />
              <text x={baseX + fxmL/2} y={125 + fxmAC/2 + 30} textAnchor="middle" fill="#DC1E26" fontSize="12" fontWeight="bold">L={fxm.dimensions.l}</text>
              
              {/* Dimension AC */}
              <line x1={baseX - 15} y1={125 - fxmAC/2} x2={baseX - 15} y2={125 + fxmAC/2} stroke="#DC1E26" strokeWidth="2" />
              <text x={baseX - 25} y={125} textAnchor="middle" fill="#DC1E26" fontSize="12" fontWeight="bold" transform={`rotate(-90, ${baseX - 25}, 125)`}>AC={fxm.dimensions.ac}</text>
            </svg>
          </div>

          {/* VISTA FRONTAL (BRIDA) */}
          <div>
            <h5 className="text-xs font-bold text-slate-500 text-center mb-1">FLANGE VIEW (FRONT)</h5>
            <svg viewBox="0 0 200 200" className="w-full h-48 border border-slate-200 bg-slate-50 rounded mx-auto">
              {/* Center Point */}
              <circle cx="100" cy="100" r="2" fill="#94A3B8" />
              
              {/* Bolt Circle (M) */}
              <circle cx="100" cy="100" r={fxmM_raw / 2} fill="none" stroke="#94A3B8" strokeDasharray="4 4" />
              
              {/* Flange Square (E) */}
              <rect 
                x={100 - fxmE_raw/2} 
                y={100 - fxmE_raw/2} 
                width={fxmE_raw} 
                height={fxmE_raw} 
                fill="none" 
                stroke="#2563EB" 
                strokeWidth="2" 
              />
              
              {/* Pilot (N) */}
              <circle cx="100" cy="100" r={fxmN_raw / 2} fill="#E0F2FE" stroke="#2563EB" strokeWidth="1" />
              
              {/* Bolt Holes (4x) */}
              <circle cx={100 - fxmM_raw/2 * 0.707} cy={100 - fxmM_raw/2 * 0.707} r="4" fill="white" stroke="#2563EB" />
              <circle cx={100 + fxmM_raw/2 * 0.707} cy={100 - fxmM_raw/2 * 0.707} r="4" fill="white" stroke="#2563EB" />
              <circle cx={100 - fxmM_raw/2 * 0.707} cy={100 + fxmM_raw/2 * 0.707} r="4" fill="white" stroke="#2563EB" />
              <circle cx={100 + fxmM_raw/2 * 0.707} cy={100 + fxmM_raw/2 * 0.707} r="4" fill="white" stroke="#2563EB" />

              {/* Labels */}
              <text x="100" y="190" textAnchor="middle" fontSize="10" fill="#64748B">E = {fxm.dimensions.e}mm</text>
              <text x="100" y="104" textAnchor="middle" fontSize="10" fill="#2563EB">N={fxm.dimensions.n}</text>
            </svg>
          </div>
        </div>

        {/* Diagrama FKM */}
        <div>
          <h4 className="text-center font-bold text-primary mb-2">FKM {fkm.model}</h4>
          
          {/* VISTA LATERAL */}
          <div className="mb-4">
            <h5 className="text-xs font-bold text-slate-500 text-center mb-1">SIDE VIEW</h5>
            <svg viewBox="0 0 400 250" className="w-full border border-slate-200 bg-slate-50 rounded">
              {/* Motor body */}
              <rect
                x={baseX}
                y={125 - fkmAC / 2}
                width={fkmL}
                height={fkmAC}
                fill="#FEF2F2"
                stroke="#DC1E26"
                strokeWidth="2"
              />
              {/* Shaft */}
              <rect
                x={baseX + fkmL}
                y={125 - fkmD / 2}
                width={fkmD * 2}
                height={fkmD}
                fill="#94A3B8"
                stroke="#475569"
                strokeWidth="2"
              />
              {/* Dimension L */}
              <line x1={baseX} y1={125 + fkmAC/2 + 15} x2={baseX + fkmL} y2={125 + fkmAC/2 + 15} stroke="#DC1E26" strokeWidth="2" />
              <text x={baseX + fkmL/2} y={125 + fkmAC/2 + 30} textAnchor="middle" fill="#DC1E26" fontSize="12" fontWeight="bold">L={fkm.dimensions.l}</text>
              
              {/* Dimension AC */}
              <line x1={baseX - 15} y1={125 - fkmAC/2} x2={baseX - 15} y2={125 + fkmAC/2} stroke="#DC1E26" strokeWidth="2" />
              <text x={baseX - 25} y={125} textAnchor="middle" fill="#DC1E26" fontSize="12" fontWeight="bold" transform={`rotate(-90, ${baseX - 25}, 125)`}>AC={fkm.dimensions.ac}</text>
            </svg>
          </div>

          {/* VISTA FRONTAL (BRIDA) */}
          <div>
            <h5 className="text-xs font-bold text-slate-500 text-center mb-1">FLANGE VIEW (FRONT)</h5>
            <svg viewBox="0 0 200 200" className="w-full h-48 border border-slate-200 bg-slate-50 rounded mx-auto">
              {/* Center Point */}
              <circle cx="100" cy="100" r="2" fill="#94A3B8" />
              
              {/* Bolt Circle (M) */}
              <circle cx="100" cy="100" r={fkmM_raw / 2} fill="none" stroke="#94A3B8" strokeDasharray="4 4" />
              
              {/* Flange Square (E) */}
              <rect 
                x={100 - fkmE_raw/2} 
                y={100 - fkmE_raw/2} 
                width={fkmE_raw} 
                height={fkmE_raw} 
                fill="none" 
                stroke="#DC1E26" 
                strokeWidth="2" 
              />
              
              {/* Pilot (N) */}
              <circle cx="100" cy="100" r={fkmN_raw / 2} fill="#FEF2F2" stroke="#DC1E26" strokeWidth="1" />
              
              {/* Bolt Holes (4x) */}
              <circle cx={100 - fkmM_raw/2 * 0.707} cy={100 - fkmM_raw/2 * 0.707} r="4" fill="white" stroke="#DC1E26" />
              <circle cx={100 + fkmM_raw/2 * 0.707} cy={100 - fkmM_raw/2 * 0.707} r="4" fill="white" stroke="#DC1E26" />
              <circle cx={100 - fkmM_raw/2 * 0.707} cy={100 + fkmM_raw/2 * 0.707} r="4" fill="white" stroke="#DC1E26" />
              <circle cx={100 + fkmM_raw/2 * 0.707} cy={100 + fkmM_raw/2 * 0.707} r="4" fill="white" stroke="#DC1E26" />

              {/* Labels */}
              <text x="100" y="190" textAnchor="middle" fontSize="10" fill="#64748B">E = {fkm.dimensions.e}mm</text>
              <text x="100" y="104" textAnchor="middle" fontSize="10" fill="#DC1E26">N={fkm.dimensions.n}</text>
            </svg>
          </div>
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
