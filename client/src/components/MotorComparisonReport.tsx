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
  const encoderRec = getEncoderRecommendation(comparison.fxm.model, comparison.fkm.model, language);
  const connectorRec = getConnectorRecommendation(comparison.fxm.model, comparison.fkm.model, language);
  
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await exportToPDF([comparison], language);
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
                      
                      {/* Mechanical Flange Differences Table */}
                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-fagor-red mb-2 border-b border-fagor-red/20 pb-1">
                        Flange Mechanical Differences / Diferencias Mecánicas de Brida
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-fagor-red text-white">
                              <th className="py-2 px-3 text-left font-semibold">Flange Dimension</th>
                              <th className="py-2 px-3 text-center font-semibold">FXM</th>
                              <th className="py-2 px-3 text-center font-semibold">FKM</th>
                              <th className="py-2 px-3 text-center font-semibold">Difference</th>
                              <th className="py-2 px-3 text-center font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="border border-slate-200">
                            {/* Flange Diameter (D) */}
                            <tr className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-2 px-3 font-medium text-slate-700">Flange Diameter (D)</td>
                              <td className="py-2 px-3 text-center">{comparison.fxm.dimensions.d ? `${comparison.fxm.dimensions.d} mm` : '-'}</td>
                              <td className="py-2 px-3 text-center">{comparison.fkm.dimensions.d ? `${comparison.fkm.dimensions.d} mm` : '-'}</td>
                              <td className="py-2 px-3 text-center font-bold">
                                {comparison.differences.dimensions.d.diff !== null 
                                  ? `${Math.abs(comparison.differences.dimensions.d.diff).toFixed(1)} mm` 
                                  : '-'}
                              </td>
                              <td className={`py-2 px-3 text-center font-bold ${Math.abs(comparison.differences.dimensions.d.diff || 0) > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                                {Math.abs(comparison.differences.dimensions.d.diff || 0) > 0.5 ? 'Different' : 'Compatible'}
                              </td>
                            </tr>
                            {/* Shaft Height (E) */}
                            <tr className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-2 px-3 font-medium text-slate-700">Shaft Height (E)</td>
                              <td className="py-2 px-3 text-center">{comparison.fxm.dimensions.e ? `${comparison.fxm.dimensions.e} mm` : '-'}</td>
                              <td className="py-2 px-3 text-center">{comparison.fkm.dimensions.e ? `${comparison.fkm.dimensions.e} mm` : '-'}</td>
                              <td className="py-2 px-3 text-center font-bold">
                                {comparison.differences.dimensions.e.diff !== null 
                                  ? `${Math.abs(comparison.differences.dimensions.e.diff).toFixed(1)} mm` 
                                  : '-'}
                              </td>
                              <td className={`py-2 px-3 text-center font-bold ${Math.abs(comparison.differences.dimensions.e.diff || 0) > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                                {Math.abs(comparison.differences.dimensions.e.diff || 0) > 0.5 ? 'Different' : 'Compatible'}
                              </td>
                            </tr>
                            {/* Shaft Diameter (N) - Note: Using 'n' from dimensions which usually maps to Shaft Diameter or Pilot */}
                            <tr className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-2 px-3 font-medium text-slate-700">Shaft Diameter (N)</td>
                              <td className="py-2 px-3 text-center">{comparison.fxm.dimensions.n ? `${comparison.fxm.dimensions.n} mm` : '-'}</td>
                              <td className="py-2 px-3 text-center">{comparison.fkm.dimensions.n ? `${comparison.fkm.dimensions.n} mm` : '-'}</td>
                              <td className="py-2 px-3 text-center font-bold">
                                {comparison.differences.dimensions.n.diff !== null 
                                  ? `${Math.abs(comparison.differences.dimensions.n.diff).toFixed(1)} mm` 
                                  : '-'}
                              </td>
                              <td className={`py-2 px-3 text-center font-bold ${Math.abs(comparison.differences.dimensions.n.diff || 0) > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                                {Math.abs(comparison.differences.dimensions.n.diff || 0) > 0.5 ? 'Different' : 'Compatible'}
                              </td>
                            </tr>
                            {/* Mounting Length (M) - Note: Using 'm' from dimensions which usually maps to Mounting Hole PCD or similar */}
                            <tr className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-2 px-3 font-medium text-slate-700">Mounting Length (M)</td>
                              <td className="py-2 px-3 text-center">{comparison.fxm.dimensions.m ? `${comparison.fxm.dimensions.m} mm` : '-'}</td>
                              <td className="py-2 px-3 text-center">{comparison.fkm.dimensions.m ? `${comparison.fkm.dimensions.m} mm` : '-'}</td>
                              <td className="py-2 px-3 text-center font-bold">
                                {comparison.differences.dimensions.m.diff !== null 
                                  ? `${Math.abs(comparison.differences.dimensions.m.diff).toFixed(1)} mm` 
                                  : '-'}
                              </td>
                              <td className={`py-2 px-3 text-center font-bold ${Math.abs(comparison.differences.dimensions.m.diff || 0) > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                                {Math.abs(comparison.differences.dimensions.m.diff || 0) > 0.5 ? 'Different' : 'Compatible'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      {(!isFullyCompatible) && (
                        <div className="mt-2 text-xs text-amber-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Different Flange - May Require Adapter / Brida diferente - Puede requerir adaptador
                        </div>
                      )}
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
          {/* Component Recommendations Section - Redesigned */}
          <div className="space-y-8">
            {/* Encoders Section */}
            {encoderRec && (
              <div>
                <h3 className="text-lg font-bold text-fagor-red mb-4 border-b-2 border-fagor-red pb-2">
                  Encoders
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Original FXM Encoder:</p>
                      <p className="text-lg text-slate-700">{encoderRec.fxmEncoder}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Recommended FKM Encoder:</p>
                      <p className="text-lg font-bold text-fagor-red">{encoderRec.bestMatch}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Alternative Options:</p>
                      <p className="text-base text-slate-700">{encoderRec.recommendedFkmEncoders.join(', ')}</p>
                    </div>
                    <div className="text-sm text-slate-600 italic mt-2">
                      {encoderRec.notes}
                    </div>
                  </div>
                  <div className="flex items-center justify-center bg-white p-2 rounded border border-slate-200">
                    {/* Placeholder for Encoder Image */}
                    <div className="text-center">
                      <img 
                        src="/images/fkm-encoder-generic.png" 
                        alt="FKM Encoder" 
                        className="max-h-32 mx-auto mb-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="h-32 w-32 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs">Encoder Image</div>';
                        }}
                      />
                      <p className="text-xs text-slate-500">FKM Encoder Series</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Power Connectors Section */}
            {connectorRec && (
              <div>
                <h3 className="text-lg font-bold text-fagor-red mb-4 border-b-2 border-fagor-red pb-2">
                  Power Connectors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Original FXM Connector:</p>
                      <p className="text-lg text-slate-700">{connectorRec.fxmConnector}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Recommended FKM Connector:</p>
                      <p className="text-lg font-bold text-fagor-red">{connectorRec.recommendedFkmConnector}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Wire Gauge:</p>
                      <p className="text-base text-slate-700">{connectorRec.wireGauge}</p>
                    </div>
                    {connectorRec.alternativeConnectors.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-slate-900">Alternative Connectors:</p>
                        <p className="text-base text-slate-700">{connectorRec.alternativeConnectors.join(', ')}</p>
                      </div>
                    )}
                    <div className="text-sm text-slate-600 italic mt-2">
                      {connectorRec.notes}
                    </div>
                  </div>
                  <div className="flex items-center justify-center bg-white p-2 rounded border border-slate-200">
                    {/* Placeholder for Connector Image */}
                    <div className="text-center">
                      <img 
                        src={`/images/connector-${connectorRec.recommendedFkmConnector.toLowerCase().replace(/[\/\s]/g, '-')}.png`}
                        alt="FKM Connector" 
                        className="max-h-32 mx-auto mb-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="h-32 w-32 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs">Connector Image</div>';
                        }}
                      />
                      <p className="text-xs text-slate-500">{connectorRec.recommendedFkmConnector}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
