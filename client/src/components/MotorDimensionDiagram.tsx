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
              <circle cx="100" cy="100" r={(fxm.dimensions.m || 100) / 2} fill="none" stroke="#94A3B8" strokeDasharray="4 4" />
              
              {/* Flange Square (E) */}
              <rect 
                x={100 - (fxm.dimensions.e || 100)/2} 
                y={100 - (fxm.dimensions.e || 100)/2} 
                width={fxm.dimensions.e || 100} 
                height={fxm.dimensions.e || 100} 
                fill="none" 
                stroke="#2563EB" 
                strokeWidth="2" 
              />
              
              {/* Pilot (N) */}
              <circle cx="100" cy="100" r={(fxm.dimensions.n || 80) / 2} fill="#E0F2FE" stroke="#2563EB" strokeWidth="1" />
              
              {/* Bolt Holes (4x) */}
              <circle cx={100 - (fxm.dimensions.m || 100)/2 * 0.707} cy={100 - (fxm.dimensions.m || 100)/2 * 0.707} r="4" fill="white" stroke="#2563EB" />
              <circle cx={100 + (fxm.dimensions.m || 100)/2 * 0.707} cy={100 - (fxm.dimensions.m || 100)/2 * 0.707} r="4" fill="white" stroke="#2563EB" />
              <circle cx={100 - (fxm.dimensions.m || 100)/2 * 0.707} cy={100 + (fxm.dimensions.m || 100)/2 * 0.707} r="4" fill="white" stroke="#2563EB" />
              <circle cx={100 + (fxm.dimensions.m || 100)/2 * 0.707} cy={100 + (fxm.dimensions.m || 100)/2 * 0.707} r="4" fill="white" stroke="#2563EB" />

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
              <circle cx="100" cy="100" r={(fkm.dimensions.m || 100) / 2} fill="none" stroke="#94A3B8" strokeDasharray="4 4" />
              
              {/* Flange Square (E) */}
              <rect 
                x={100 - (fkm.dimensions.e || 100)/2} 
                y={100 - (fkm.dimensions.e || 100)/2} 
                width={fkm.dimensions.e || 100} 
                height={fkm.dimensions.e || 100} 
                fill="none" 
                stroke="#DC1E26" 
                strokeWidth="2" 
              />
              
              {/* Pilot (N) */}
              <circle cx="100" cy="100" r={(fkm.dimensions.n || 80) / 2} fill="#FEF2F2" stroke="#DC1E26" strokeWidth="1" />
              
              {/* Bolt Holes (4x) */}
              <circle cx={100 - (fkm.dimensions.m || 100)/2 * 0.707} cy={100 - (fkm.dimensions.m || 100)/2 * 0.707} r="4" fill="white" stroke="#DC1E26" />
              <circle cx={100 + (fkm.dimensions.m || 100)/2 * 0.707} cy={100 - (fkm.dimensions.m || 100)/2 * 0.707} r="4" fill="white" stroke="#DC1E26" />
              <circle cx={100 - (fkm.dimensions.m || 100)/2 * 0.707} cy={100 + (fkm.dimensions.m || 100)/2 * 0.707} r="4" fill="white" stroke="#DC1E26" />
              <circle cx={100 + (fkm.dimensions.m || 100)/2 * 0.707} cy={100 + (fkm.dimensions.m || 100)/2 * 0.707} r="4" fill="white" stroke="#DC1E26" />

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
