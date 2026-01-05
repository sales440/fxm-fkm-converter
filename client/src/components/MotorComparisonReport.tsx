import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ComparisonResult } from "@/types/motor";
import { toast } from "sonner";
import { exportToPDF } from "@/lib/pdfExporter";
import { exportToExcel } from "@/lib/excelExporter";
import { useState } from "react";
import MotorDimensionDiagram from "@/components/MotorDimensionDiagram";
import { getEncoderRecommendation, getConnectorRecommendation } from "@/lib/encoderConnectorRecommendations";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import CableLengthCalculator from "@/components/CableLengthCalculator";

interface MotorComparisonReportProps {
  comparison: ComparisonResult;
  conversionDirection?: 'FXM_TO_FKM' | 'FKM_TO_FXM';
  onAddToBatch?: () => void;
}

export default function MotorComparisonReport({ comparison, conversionDirection = 'FXM_TO_FKM', onAddToBatch }: MotorComparisonReportProps) {
  const { t, language } = useLanguage();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  
  // Obtener recomendaciones de encoders y conectores
  const encoderRec = getEncoderRecommendation(comparison.fxm.model);
  const connectorRec = getConnectorRecommendation(comparison.fxm.model, comparison.fkm.model);
  
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await exportToPDF(comparison, language);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error generating PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  const handleDownloadExcel = async () => {
    setIsGeneratingExcel(true);
    try {
      await exportToExcel(comparison, language);
      toast.success('Excel downloaded successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Error generating Excel');
    } finally {
      setIsGeneratingExcel(false);
    }
  };
  
  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return '-';
    return `${value.toFixed(2)} ${unit}`;
  };
  
  const formatDiff = (diff: number | null, unit: string = '') => {
    if (diff === null) return '-';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(2)} ${unit}`;
  };
  
  const formatPercent = (percent: number | null) => {
    if (percent === null) return '-';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };
  
  const getDiffColor = (diff: number | null) => {
    if (diff === null) return 'text-slate-600';
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-primary';
    return 'text-slate-600';
  };
  
  return (
    <>
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-primary">{t('report.title')}</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              {isGeneratingPDF ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              {isGeneratingPDF ? 'Generando...' : 'PDF'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadExcel} 
              disabled={isGeneratingExcel}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              {isGeneratingExcel ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              {isGeneratingExcel ? 'Generando...' : 'Excel'}
            </Button>
            {onAddToBatch && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={onAddToBatch}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {language === 'es' ? '+ Agregar a Reporte' : '+ Add to Report'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Motor Models */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-600">
            <div className="text-sm text-blue-600 font-bold mb-1">FXM</div>
            <div className="text-xl font-bold text-blue-900">{comparison.fxm.model}</div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-l-primary">
            <div className="text-sm text-primary font-bold mb-1">FKM</div>
            <div className="text-xl font-bold text-slate-900">{comparison.fkm.model}</div>
          </div>
        </div>
        
        {/* Electrical Specifications */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 text-primary bg-primary/10 px-4 py-2 rounded">{t('specs.electrical')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary bg-primary/5">
                  <th className="text-left py-3 px-4 font-bold text-slate-900">Especificación</th>
                  <th className="text-right py-3 px-4 font-bold text-blue-700">FXM</th>
                  <th className="text-right py-3 px-4 font-bold text-primary">FKM</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-700">{t('diff.label')}</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-700">{t('diff.percent')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.mo')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.mo.fxm, t('unit.nm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.mo.fkm, t('unit.nm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.mo.diff)}`}>
                    {formatDiff(comparison.differences.electrical.mo.diff, t('unit.nm'))}
                  </td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.mo.diff)}`}>
                    {formatPercent(comparison.differences.electrical.mo.percent)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.mn')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.mn.fxm, t('unit.nm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.mn.fkm, t('unit.nm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.mn.diff)}`}>
                    {formatDiff(comparison.differences.electrical.mn.diff, t('unit.nm'))}
                  </td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.mn.diff)}`}>
                    {formatPercent(comparison.differences.electrical.mn.percent)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.mp')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.mp.fxm, t('unit.nm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.mp.fkm, t('unit.nm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.mp.diff)}`}>
                    {formatDiff(comparison.differences.electrical.mp.diff, t('unit.nm'))}
                  </td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.mp.diff)}`}>
                    {formatPercent(comparison.differences.electrical.mp.percent)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.io')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.io.fxm, t('unit.arms'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.io.fkm, t('unit.arms'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.io.diff)}`}>
                    {formatDiff(comparison.differences.electrical.io.diff, t('unit.arms'))}
                  </td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.io.diff)}`}>
                    {formatPercent(comparison.differences.electrical.io.percent)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.rpm')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.rpm.fxm, t('unit.rpm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.rpm.fkm, t('unit.rpm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.rpm.diff)}`}>
                    {formatDiff(comparison.differences.electrical.rpm.diff, t('unit.rpm'))}
                  </td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.rpm.diff)}`}>
                    {formatPercent(comparison.differences.electrical.rpm.percent)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.j')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.j.fxm, t('unit.kgcm2'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.j.fkm, t('unit.kgcm2'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.j.diff)}`}>
                    {formatDiff(comparison.differences.electrical.j.diff, t('unit.kgcm2'))}
                  </td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.j.diff)}`}>
                    {formatPercent(comparison.differences.electrical.j.percent)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.pcal')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.pcal.fxm, t('unit.kw'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.electrical.pcal.fkm, t('unit.kw'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.pcal.diff)}`}>
                    {formatDiff(comparison.differences.electrical.pcal.diff, t('unit.kw'))}
                  </td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.electrical.pcal.diff)}`}>
                    {formatPercent(comparison.differences.electrical.pcal.percent)}
                  </td>
                </tr>
                {/* Recommended Drive Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50 bg-blue-50/30">
                  <td className="py-3 px-4 text-slate-700 font-bold">Recommended Drive</td>
                  <td className="text-right py-3 px-4 font-bold text-blue-700">{comparison.fxm.recommended_drive || '-'}</td>
                  <td className="text-right py-3 px-4 font-bold text-primary">{comparison.fkm.recommended_drive || '-'}</td>
                  <td className="text-right py-3 px-4 text-slate-500 italic" colSpan={2}>
                    {comparison.fxm.recommended_drive !== comparison.fkm.recommended_drive ? 
                      (comparison.fkm.recommended_drive ? 'Check Drive Compatibility' : '-') : 
                      'Compatible'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Mechanical Dimensions */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-primary bg-primary/10 px-4 py-2 rounded">{t('specs.dimensions')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary bg-primary/5">
                  <th className="text-left py-3 px-4 font-bold text-slate-900">Dimensión</th>
                  <th className="text-right py-3 px-4 font-bold text-blue-700">FXM</th>
                  <th className="text-right py-3 px-4 font-bold text-primary">FKM</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-700">{t('diff.label')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.l')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.l.fxm, t('unit.mm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.l.fkm, t('unit.mm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.dimensions.l.diff)}`}>
                    {formatDiff(comparison.differences.dimensions.l.diff, t('unit.mm'))}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.ac')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.ac.fxm, t('unit.mm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.ac.fkm, t('unit.mm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.dimensions.ac.diff)}`}>
                    {formatDiff(comparison.differences.dimensions.ac.diff, t('unit.mm'))}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.n')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.n.fxm, t('unit.mm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.n.fkm, t('unit.mm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.dimensions.n.diff)}`}>
                    {formatDiff(comparison.differences.dimensions.n.diff, t('unit.mm'))}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.d')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.d.fxm, t('unit.mm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.d.fkm, t('unit.mm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.dimensions.d.diff)}`}>
                    {formatDiff(comparison.differences.dimensions.d.diff, t('unit.mm'))}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.e')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.e.fxm, t('unit.mm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.e.fkm, t('unit.mm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.dimensions.e.diff)}`}>
                    {formatDiff(comparison.differences.dimensions.e.diff, t('unit.mm'))}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">{t('specs.m')}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.m.fxm, t('unit.mm'))}</td>
                  <td className="text-right py-3 px-4 font-medium">{formatValue(comparison.differences.dimensions.m.fkm, t('unit.mm'))}</td>
                  <td className={`text-right py-3 px-4 font-bold ${getDiffColor(comparison.differences.dimensions.m.diff)}`}>
                    {formatDiff(comparison.differences.dimensions.m.diff, t('unit.mm'))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Diferencias Mecánicas de Bridas */}
        <div className="mt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            {t('flange.title') || 'Diferencias Mecánicas de Bridas / Flange Mechanical Differences'}
          </h3>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-lg border-2 border-slate-200">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dimensiones de Brida */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h4 className="font-bold text-primary mb-3">Flange Dimensions / Dimensiones de Brida</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Flange Diameter (D):</span>
                    <span className="font-bold">{formatDiff(comparison.differences.dimensions.d.diff, t('unit.mm'))}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Shaft Height (E):</span>
                    <span className="font-bold">{formatDiff(comparison.differences.dimensions.e.diff, t('unit.mm'))}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Mounting Holes (M):</span>
                    <span className="font-bold">{formatDiff(comparison.differences.dimensions.m.diff, t('unit.mm'))}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Hole Centers (N):</span>
                    <span className="font-bold">{formatDiff(comparison.differences.dimensions.n.diff, t('unit.mm'))}</span>
                  </div>
                </div>
              </div>
              
              {/* Compatibilidad de Brida */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h4 className="font-bold text-primary mb-3">Flange Compatibility / Compatibilidad de Brida</h4>
                {(() => {
                  const dDiff = comparison.differences.dimensions.d.diff || 0;
                  const eDiff = comparison.differences.dimensions.e.diff || 0;
                  const mDiff = comparison.differences.dimensions.m.diff || 0;
                  const nDiff = comparison.differences.dimensions.n.diff || 0;
                  const totalDiff = Math.abs(dDiff) + Math.abs(eDiff) + Math.abs(mDiff) + Math.abs(nDiff);
                  const isFullyCompatible = totalDiff === 0;
                  const isHighlyCompatible = totalDiff < 2;
                  
                  return (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border-2 ${
                        isFullyCompatible 
                          ? 'bg-green-50 border-green-500' 
                          : isHighlyCompatible 
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-amber-50 border-amber-500'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className={`h-5 w-5 ${
                            isFullyCompatible 
                              ? 'text-green-600' 
                              : isHighlyCompatible 
                              ? 'text-blue-600'
                              : 'text-amber-600'
                          }`} />
                          <span className={`font-bold ${
                            isFullyCompatible 
                              ? 'text-green-900' 
                              : isHighlyCompatible 
                              ? 'text-blue-900'
                              : 'text-amber-900'
                          }`}>
                            {isFullyCompatible 
                              ? '100% Compatible' 
                              : isHighlyCompatible 
                              ? 'Highly Compatible / Altamente Compatible'
                              : 'Requires Adapter / Requiere Adaptador'
                            }
                          </span>
                        </div>
                        <p className={`text-sm ${
                          isFullyCompatible 
                            ? 'text-green-800' 
                            : isHighlyCompatible 
                            ? 'text-blue-800'
                            : 'text-amber-800'
                        }`}>
                          {isFullyCompatible 
                            ? 'Las bridas son idénticas. Instalación directa sin modificaciones.'
                            : isHighlyCompatible 
                            ? `Diferencias menores (${totalDiff.toFixed(1)}mm total). Instalación directa posible con ajustes mínimos.`
                            : `Diferencias significativas (${totalDiff.toFixed(1)}mm total). Se recomienda usar placa adaptadora.`
                          }
                        </p>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="text-xs text-slate-600 font-semibold mb-1">Installation Notes / Notas de Instalación:</p>
                        <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                          {Math.abs(dDiff) > 0 && (
                            <li>Flange diameter difference: {Math.abs(dDiff).toFixed(2)}mm</li>
                          )}
                          {Math.abs(eDiff) > 0 && (
                            <li>Shaft height difference: {Math.abs(eDiff).toFixed(2)}mm</li>
                          )}
                          {Math.abs(mDiff) > 0 && (
                            <li>Mounting hole difference: {Math.abs(mDiff).toFixed(2)}mm</li>
                          )}
                          {Math.abs(nDiff) > 0 && (
                            <li>Hole center distance difference: {Math.abs(nDiff).toFixed(2)}mm</li>
                          )}
                          {isFullyCompatible && (
                            <li className="text-green-700 font-semibold">Perfect mechanical match - Direct replacement</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Recomendaciones de Encoders y Conectores */}
    {(encoderRec || connectorRec) && (
      <Card className="mt-6 border-2 border-fagor-red">
        <CardHeader className="bg-fagor-red">
          <CardTitle className="text-white font-bold text-xl flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Recomendaciones Técnicas / Technical Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {encoderRec && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-fagor-red mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Encoders
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">FXM Encoder:</p>
                    <p className="text-base font-bold text-slate-800">{encoderRec.fxmEncoder}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">Recommended FKM Encoder:</p>
                    <p className="text-base font-bold text-fagor-red">{encoderRec.bestMatch}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-slate-600 font-semibold">Alternative Options:</p>
                  <p className="text-base text-slate-700">{encoderRec.recommendedFkmEncoders.join(', ')}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Note:</span> {encoderRec.notes}
                  </p>
                </div>
                {/* Diagrama comparativo de encoders */}
                <div className="mt-4">
                  <img 
                    src="/encoder-comparison.png" 
                    alt="Encoder Comparison Diagram" 
                    className="w-full rounded-lg border border-slate-300 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}
          
          {connectorRec && (
            <div>
              <h3 className="text-lg font-bold text-fagor-red mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Power Connectors / Conectores de Potencia
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">FXM Connector:</p>
                    <p className="text-base font-bold text-slate-800">{connectorRec.fxmConnector}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">Recommended FKM Connector:</p>
                    <p className="text-base font-bold text-fagor-red">{connectorRec.recommendedFkmConnector}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-slate-600 font-semibold">Wire Gauge / Calibre de Cable:</p>
                  <p className="text-base text-slate-700 font-medium">{connectorRec.wireGauge}</p>
                </div>
                {connectorRec.alternativeConnectors.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-slate-600 font-semibold">Alternative Connectors:</p>
                    <p className="text-base text-slate-700">{connectorRec.alternativeConnectors.join(', ')}</p>
                  </div>
                )}
                <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
                  <p className="text-sm text-amber-900">
                    <span className="font-semibold">Note:</span> {connectorRec.notes}
                  </p>
                </div>
                {/* Imágenes de conectores */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">FXM Connector (MC Series):</p>
                    <img 
                      src="/connector-mc-series.png" 
                      alt="MC Series Connector" 
                      className="w-full rounded-lg border border-slate-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">FKM Connector ({connectorRec.recommendedFkmConnector}):</p>
                    <img 
                      src={`/connector-${connectorRec.recommendedFkmConnector.toLowerCase().replace(/\s+/g, '-')}.png`}
                      alt={`${connectorRec.recommendedFkmConnector} Connector`}
                      className="w-full rounded-lg border border-slate-300 shadow-sm"
                      onError={(e) => {
                        // Fallback si la imagen específica no existe
                        const target = e.target as HTMLImageElement;
                        if (connectorRec.recommendedFkmConnector.includes('4x1.5')) {
                          target.src = '/connector-mpc-4x1.5.png';
                        } else if (connectorRec.recommendedFkmConnector.includes('4x2.5')) {
                          target.src = '/connector-mpc-4x2.5.png';
                        } else {
                          target.src = '/connector-mpc-4x4.png';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )}
    
    {/* Diagrama dimensional */}
    <div className="mt-6">
      <MotorDimensionDiagram fxm={comparison.fxm} fkm={comparison.fkm} />
    </div>
    
    {/* Calculadora de longitud de cables */}
    {connectorRec && comparison.fxm.io && (
      <CableLengthCalculator 
        motorCurrent={comparison.fxm.io} 
        wireGauge={connectorRec.wireGauge}
      />
    )}
    </>
  );
}
