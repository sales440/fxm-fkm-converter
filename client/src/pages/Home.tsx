import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Search, ArrowLeftRight, QrCode } from "lucide-react";
import { APP_LOGO } from "@/const";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import type { MotorDatabase, Motor, ComparisonResult } from "@/types/motor";
import { 
  searchFXMMotors, 
  searchFKMMotors,
  findEquivalentFKM, 
  findEquivalentFXM,
  compareMotors, 
  applyAdvancedFilters, 
  detectMotorType,
  type AdvancedFilters 
} from "@/lib/motorConverter";
import MotorComparisonReport from "@/components/MotorComparisonReport";
import AdvancedFiltersComponent from "@/components/AdvancedFilters";
import ConversionHistoryPanel from "@/components/ConversionHistoryPanel";
import { useConversionHistory } from "@/contexts/ConversionHistoryContext";
import MultiComparePanel from "@/components/MultiComparePanel";
import { useMultiCompare } from "@/contexts/MultiCompareContext";
import { QRScanner } from "@/components/QRScanner";
import { exportConsolidatedExcel } from "@/utils/consolidatedExcelExporter";
import { motorDatabase } from "@/data/motor_database";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const { addToHistory } = useConversionHistory();
  const { addItem: addToMultiCompare, hasItem: hasInMultiCompare, items: multiCompareItems } = useMultiCompare();
  const [database] = useState<MotorDatabase>(motorDatabase);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'FXM' | 'FKM' | 'AUTO'>('AUTO');
  const [selectedMotorA, setSelectedMotorA] = useState<Motor | null>(null); // Motor origen
  const [equivalentMotorsB, setEquivalentMotorsB] = useState<Motor[]>([]); // Motores equivalentes
  const [selectedMotorB, setSelectedMotorB] = useState<Motor | null>(null); // Motor equivalente seleccionado
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [searchResults, setSearchResults] = useState<Motor[]>([]);
  const [activeFilters, setActiveFilters] = useState<AdvancedFilters>({});
  const [hasFilters, setHasFilters] = useState(false);
  const [conversionDirection, setConversionDirection] = useState<'FXM_TO_FKM' | 'FKM_TO_FXM'>('FXM_TO_FKM');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  

  
  const handleSearch = () => {
    if (!database) return;
    
    // Detectar tipo de motor automáticamente
    const detectedType = detectMotorType(searchQuery);
    let results: Motor[] = [];
    let direction: 'FXM_TO_FKM' | 'FKM_TO_FXM' = 'FXM_TO_FKM';
    
    if (searchType === 'AUTO') {
      if (detectedType === 'FXM') {
        results = searchFXMMotors(database, searchQuery);
        direction = 'FXM_TO_FKM';
      } else if (detectedType === 'FKM') {
        results = searchFKMMotors(database, searchQuery);
        direction = 'FKM_TO_FXM';
      } else {
        // Si no se detecta, buscar en ambos
        results = [
          ...searchFXMMotors(database, searchQuery),
          ...searchFKMMotors(database, searchQuery)
        ];
      }
    } else if (searchType === 'FXM') {
      results = searchFXMMotors(database, searchQuery);
      direction = 'FXM_TO_FKM';
    } else {
      results = searchFKMMotors(database, searchQuery);
      direction = 'FKM_TO_FXM';
    }
    
    // Aplicar filtros si existen
    if (hasFilters) {
      results = applyAdvancedFilters(results, activeFilters);
    }
    
    setConversionDirection(direction);
    setSearchResults(results);
    setHasSearched(true);
    setSelectedMotorA(null);
    setEquivalentMotorsB([]);
    setSelectedMotorB(null);
    setComparison(null);
  };
  
  const handleSelectMotorA = (motor: Motor) => {
    if (!database) return;
    setSelectedMotorA(motor);
    
    // Determinar dirección de conversión
    const motorType = detectMotorType(motor.model);
    let equivalents: Motor[] = [];
    let direction: 'FXM_TO_FKM' | 'FKM_TO_FXM';
    
    if (motorType === 'FXM') {
      equivalents = findEquivalentFKM(motor, database);
      direction = 'FXM_TO_FKM';
    } else {
      equivalents = findEquivalentFXM(motor, database);
      direction = 'FKM_TO_FXM';
    }
    
    setConversionDirection(direction);
    setEquivalentMotorsB(equivalents);
    
    if (equivalents.length > 0) {
      setSelectedMotorB(equivalents[0]);
      setComparison(compareMotors(motor, equivalents[0]));
    } else {
      setSelectedMotorB(null);
      setComparison(null);
    }
  };
  
  const handleSelectMotorB = (motor: Motor) => {
    if (!selectedMotorA) return;
    setSelectedMotorB(motor);
    const newComparison = compareMotors(selectedMotorA, motor);
    setComparison(newComparison);
    
    // Agregar al historial
    addToHistory({
      motorA: selectedMotorA,
      motorB: motor,
      comparison: newComparison,
      direction: conversionDirection
    });
  };
  
  const handleApplyFilters = (filters: AdvancedFilters) => {
    setActiveFilters(filters);
    setHasFilters(true);
    // Reaplicar búsqueda con filtros
    if (searchQuery && database) {
      let results: Motor[] = [];
      if (conversionDirection === 'FXM_TO_FKM') {
        results = searchFXMMotors(database, searchQuery);
      } else {
        results = searchFKMMotors(database, searchQuery);
      }
      results = applyAdvancedFilters(results, filters);
      setSearchResults(results);
    }
  };
  
  const handleClearFilters = () => {
    setActiveFilters({});
    setHasFilters(false);
    // Reaplicar búsqueda sin filtros
    if (searchQuery && database) {
      if (conversionDirection === 'FXM_TO_FKM') {
        setSearchResults(searchFXMMotors(database, searchQuery));
      } else {
        setSearchResults(searchFKMMotors(database, searchQuery));
      }
    }
  };
  
  // Textos según dirección de conversión
  const getDirectionalText = (key: string) => {
    if (conversionDirection === 'FXM_TO_FKM') {
      return t(key);
    } else {
      // Invertir textos para FKM→FXM
      const inversions: Record<string, string> = {
        'title': 'fkmToFxmTitle',
        'subtitle': 'fkmToFxmSubtitle',
        'searchPlaceholder': 'searchFKMPlaceholder',
        'originalMotor': 'fkmOriginalMotor',
        'equivalentMotors': 'fxmEquivalentMotors',
      };
      return t(inversions[key] || key);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Profesional FAGOR */}
      <header className="bg-white border-b-4 border-primary shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo FAGOR - Izquierda */}
            <div className="flex items-center">
              <img src={APP_LOGO} alt="FAGOR Automation" className="h-16" />
            </div>
            
            {/* Selector de idioma - Centro */}
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <SelectTrigger className="w-32 border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="eu">Euskara</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Información de contacto - Derecha (texto rojo) */}
            <div className="hidden md:flex flex-col items-end text-sm">
              <p className="font-bold text-primary">FAGOR Automation USA</p>
              <p className="text-primary">1755 Park Street, Naperville, IL 60563</p>
              <p className="text-primary">Tel: +1 (630) 851-3050</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-6 py-8">
        {/* Título Principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
            {t('title')}
            <ArrowLeftRight className="w-8 h-8" />
          </h1>
          <p className="text-slate-600 text-lg">{t('subtitle')}</p>
          <p className="text-sm text-slate-500 mt-2">
            {t('bidirectionalSearch')}
          </p>
          {/* Debug Indicator (Forced Rebuild) */}
          <div className="text-xs text-gray-400 mt-2">
            System Status: {database ? "Ready ✅" : "Error ❌"} | v1.4 (Wildcard Search)
          </div>
        </div>

        {/* Sección de Búsqueda */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          {hasSearched && searchResults.length === 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 mx-6 mt-6 rounded-r">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    No se encontraron resultados para "{searchQuery}".
                    <br/>
                    <span className="text-xs text-red-500">Intenta verificar el modelo o usar menos caracteres.</span>
                  </p>
                </div>
              </div>
            </div>
          )}
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('search')}
            </CardTitle>
            <CardDescription>{t('searchDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-primary/30 focus:border-primary"
              />
              <Button 
                onClick={handleSearch} 
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                <Search className="w-4 h-4 mr-2" />
                {t('searchButton')}
              </Button>
              <Button
                onClick={() => setShowQRScanner(true)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                title={t('scanQR')}
              >
                <QrCode className="w-5 h-5" />
              </Button>
            </div>
            
            <AdvancedFiltersComponent 
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasFilters}
            />
            
            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="mt-6 grid gap-3">
                <h3 className="font-semibold text-slate-700">
                  {t('searchResults')}: {searchResults.length} {t('motorsFound')}
                </h3>
                <div className="grid gap-2 max-h-96 overflow-y-auto">
                  {searchResults.map((motor, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 border-2 hover:border-primary hover:bg-primary/5"
                      onClick={() => handleSelectMotorA(motor)}
                    >
                      <div className="flex flex-col w-full">
                        <span className="font-bold text-primary">{motor.model}</span>
                        <span className="text-sm text-slate-600">
                          Mo: {motor.mo} Nm | RPM: {motor.rpm} | J: {motor.j} kg/cm²
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Motores Seleccionados y Equivalentes */}
        {selectedMotorA && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Motor Original */}
            <Card className="border-2 border-blue-500 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700">
                  {conversionDirection === 'FXM_TO_FKM' ? t('originalMotor') : t('fkmOriginalMotor')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-blue-700 mb-4">{selectedMotorA.model}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('mo')}:</span>
                    <span className="font-semibold">{selectedMotorA.mo} Nm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('mn')}:</span>
                    <span className="font-semibold">{selectedMotorA.mn} Nm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('mp')}:</span>
                    <span className="font-semibold">{selectedMotorA.mp} Nm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('rpm')}:</span>
                    <span className="font-semibold">{selectedMotorA.rpm} rpm</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motores Equivalentes */}
            <Card className="border-2 border-primary shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-primary">
                  {conversionDirection === 'FXM_TO_FKM' ? t('equivalentMotors') : t('fxmEquivalentMotors')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {equivalentMotorsB.length > 0 ? (
                  <div className="space-y-2">
                    {equivalentMotorsB.map((motor, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Button
                          variant={selectedMotorB?.model === motor.model ? "default" : "outline"}
                          className="flex-1 justify-start text-left h-auto py-3"
                          onClick={() => handleSelectMotorB(motor)}
                        >
                          <div className="flex flex-col w-full">
                            <span className="font-bold">{motor.model}</span>
                            <span className="text-sm opacity-90">
                              {t('mo')}: {motor.mo} Nm | {t('rpm')}: {motor.rpm} rpm
                            </span>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={hasInMultiCompare(selectedMotorA!.model) ? "bg-green-50 border-green-600 text-green-700" : ""}
                          onClick={() => {
                            if (selectedMotorA) {
                              const newComparison = compareMotors(selectedMotorA, motor);
                              addToMultiCompare({
                                motorA: selectedMotorA,
                                motorB: motor,
                                comparison: newComparison,
                                direction: conversionDirection
                              });
                            }
                          }}
                          title={t('addToCompare')}
                        >
                          +
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">{t('noEquivalents')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reporte Comparativo */}
        {comparison && selectedMotorA && selectedMotorB && (
          <MotorComparisonReport 
            comparison={comparison}
            conversionDirection={conversionDirection}
          />
        )}
      </main>

      {/* Panel de Comparación Múltiple */}
      <MultiComparePanel 
        onExportConsolidated={() => {
          exportConsolidatedExcel(multiCompareItems, language);
        }}
      />

      {/* Panel de Historial */}
      <ConversionHistoryPanel 
        onSelectConversion={(motorA, motorB, direction) => {
          setSelectedMotorA(motorA);
          setSelectedMotorB(motorB);
          setConversionDirection(direction);
          setComparison(compareMotors(motorA, motorB));
          setEquivalentMotorsB([motorB]);
        }}
      />

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={(decodedText) => {
            setSearchQuery(decodedText);
            setShowQRScanner(false);
            // Trigger search automatically
            setTimeout(() => handleSearch(), 100);
          }}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">© 2024 FAGOR Automation. All rights reserved.</p>
          <p className="text-xs text-slate-400 mt-1">Open to your world</p>
        </div>
      </footer>
    </div>
  );
}
