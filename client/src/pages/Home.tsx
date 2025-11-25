import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Search } from "lucide-react";
import { APP_LOGO } from "@/const";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import type { MotorDatabase, Motor, ComparisonResult } from "@/types/motor";
import { searchFXMMotors, findEquivalentFKM, compareMotors } from "@/lib/motorConverter";
import MotorComparisonReport from "@/components/MotorComparisonReport";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [database, setDatabase] = useState<MotorDatabase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFXM, setSelectedFXM] = useState<Motor | null>(null);
  const [equivalentFKMs, setEquivalentFKMs] = useState<Motor[]>([]);
  const [selectedFKM, setSelectedFKM] = useState<Motor | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [searchResults, setSearchResults] = useState<Motor[]>([]);
  
  // Cargar base de datos
  useEffect(() => {
    fetch('/motor_database.json')
      .then(res => res.json())
      .then(data => {
        setDatabase(data);
      })
      .catch(err => console.error('Error loading database:', err));
  }, []);
  
  const handleSearch = () => {
    if (!database) return;
    const results = searchFXMMotors(database, searchQuery);
    setSearchResults(results);
    setSelectedFXM(null);
    setEquivalentFKMs([]);
    setSelectedFKM(null);
    setComparison(null);
  };
  
  const handleSelectFXM = (motor: Motor) => {
    if (!database) return;
    setSelectedFXM(motor);
    const equivalents = findEquivalentFKM(motor, database);
    setEquivalentFKMs(equivalents);
    if (equivalents.length > 0) {
      setSelectedFKM(equivalents[0]);
      setComparison(compareMotors(motor, equivalents[0]));
    } else {
      setSelectedFKM(null);
      setComparison(null);
    }
  };
  
  const handleSelectFKM = (motor: Motor) => {
    if (!selectedFXM) return;
    setSelectedFKM(motor);
    setComparison(compareMotors(selectedFXM, motor));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Profesional FAGOR */}
      <header className="bg-white border-b-4 border-primary shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo FAGOR */}
            <div className="flex items-center">
              {APP_LOGO && <img src={APP_LOGO} alt="FAGOR Automation" className="h-16" />}
            </div>
            
            {/* Dirección y Selector de Idioma */}
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <div className="font-bold text-sm text-slate-900">FAGOR Automation USA</div>
                <div className="text-xs text-slate-600">1755 Park Street, Naperville, IL 60563</div>
                <div className="text-xs text-slate-600">Tel: +1 (630) 851-3050</div>
              </div>
              
              <div className="flex items-center gap-2 border-l pl-6">
                <Globe className="h-5 w-5 text-slate-600" />
                <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                  <SelectTrigger className="w-[120px]">
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
            </div>
          </div>
          
          {/* Título Principal */}
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold text-primary">{t('app.title')}</h1>
            <p className="text-sm text-slate-600 mt-2">{t('app.subtitle')}</p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8 border-t-4 border-t-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary">{t('search.button')}</CardTitle>
            <CardDescription>{t('search.placeholder')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={!database} className="bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4 mr-2" />
                {t('search.button')}
              </Button>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg">
                {searchResults.map((motor) => (
                  <button
                    key={motor.model}
                    onClick={() => handleSelectFXM(motor)}
                    className="w-full text-left px-4 py-2 hover:bg-primary/10 border-b last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-slate-900">{motor.model}</div>
                    <div className="text-sm text-slate-600">
                      Mo: {motor.mo} Nm | RPM: {motor.rpm} | J: {motor.j} kg/cm²
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Results Section */}
        {selectedFXM && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* FXM Motor Card */}
            <Card className="border-t-4 border-t-blue-600">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">{t('results.fxm')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4 text-slate-900">{selectedFXM.model}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('specs.mo')}:</span>
                    <span className="font-medium">{selectedFXM.mo} {t('unit.nm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('specs.mn')}:</span>
                    <span className="font-medium">{selectedFXM.mn} {t('unit.nm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('specs.mp')}:</span>
                    <span className="font-medium">{selectedFXM.mp} {t('unit.nm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('specs.rpm')}:</span>
                    <span className="font-medium">{selectedFXM.rpm} {t('unit.rpm')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* FKM Equivalents Card */}
            <Card className="border-t-4 border-t-primary">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-primary">{t('results.fkm')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {equivalentFKMs.length > 0 ? (
                  <div className="space-y-4">
                    {equivalentFKMs.map((motor) => (
                      <button
                        key={motor.model}
                        onClick={() => handleSelectFKM(motor)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedFKM?.model === motor.model
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-200 hover:border-primary/50'
                        }`}
                      >
                        <h4 className="font-bold mb-2 text-slate-900">{motor.model}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">{t('specs.mo')}:</span>
                            <span className="font-medium">{motor.mo} {t('unit.nm')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">{t('specs.rpm')}:</span>
                            <span className="font-medium">{motor.rpm} {t('unit.rpm')}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">{t('results.noResults')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Comparison Report */}
        {comparison && selectedFKM && (
          <MotorComparisonReport comparison={comparison} />
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-16 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2024 FAGOR Automation. All rights reserved.</p>
          <p className="text-xs text-slate-400 mt-2">Open to your world</p>
        </div>
      </footer>
    </div>
  );
}
