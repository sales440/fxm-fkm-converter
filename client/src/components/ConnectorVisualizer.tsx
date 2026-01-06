import { useLanguage } from "@/contexts/LanguageContext";

interface ConnectorVisualizerProps {
  fxmModel: string;
  fkmModel: string;
}

export default function ConnectorVisualizer({ fxmModel, fkmModel }: ConnectorVisualizerProps) {
  const { t, language } = useLanguage();

  // Lógica simple para determinar el tipo de conector basado en el modelo
  // FXM antiguos suelen tener conectores circulares grandes o caja de bornas
  // FKM modernos suelen tener conectores circulares compactos (M23/M40) o rotables
  
  return (
    <div className="bg-white p-6 rounded-lg border-2 border-slate-200 mt-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        {language === 'es' ? 'Visualización de Conectores' : 'Connector Visualization'}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* FXM Connector */}
        <div className="flex flex-col items-center">
          <h4 className="font-bold text-blue-700 mb-3">FXM (Original)</h4>
          <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200 mb-2">
            {/* Representación abstracta de conector circular antiguo */}
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-blue-600">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
              <circle cx="35" cy="35" r="4" fill="currentColor" />
              <circle cx="65" cy="35" r="4" fill="currentColor" />
              <circle cx="35" cy="65" r="4" fill="currentColor" />
              <circle cx="65" cy="65" r="4" fill="currentColor" />
              <rect x="45" y="45" width="10" height="10" fill="currentColor" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 text-center">
            {language === 'es' ? 'Conector Circular / Bornas' : 'Circular Connector / Terminal Box'}
          </p>
        </div>

        {/* FKM Connector */}
        <div className="flex flex-col items-center">
          <h4 className="font-bold text-primary mb-3">FKM (New)</h4>
          <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-200 mb-2">
            {/* Representación abstracta de conector moderno rotable */}
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-primary">
              <rect x="30" y="30" width="40" height="40" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M 50 35 L 50 20" stroke="currentColor" strokeWidth="2" />
              <path d="M 65 50 L 80 50" stroke="currentColor" strokeWidth="2" />
              <path d="M 50 65 L 50 80" stroke="currentColor" strokeWidth="2" />
              <path d="M 35 50 L 20 50" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="5" fill="currentColor" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 text-center">
            {language === 'es' ? 'Conector Rotable (SpeedTec)' : 'Rotatable Connector (SpeedTec)'}
          </p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-600 italic text-center">
        {language === 'es' 
          ? '* Las imágenes son representaciones genéricas. Verifique el plano específico del motor para detalles exactos de pinout.' 
          : '* Images are generic representations. Check specific motor drawings for exact pinout details.'}
      </div>
    </div>
  );
}
