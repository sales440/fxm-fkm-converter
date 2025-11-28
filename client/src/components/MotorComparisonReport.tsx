import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ComparisonResult } from "@/types/motor";
import { toast } from "sonner";
import { exportToPDF } from "@/lib/pdfExporter";
import { exportToExcel } from "@/lib/excelExporter";
import MotorDimensionDiagram from "@/components/MotorDimensionDiagram";
import { getEncoderRecommendation, getConnectorRecommendation } from "@/lib/encoderConnectorRecommendations";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface MotorComparisonReportProps {
  comparison: ComparisonResult;
  conversionDirection?: 'FXM_TO_FKM' | 'FKM_TO_FXM';
}

export default function MotorComparisonReport({ comparison, conversionDirection = 'FXM_TO_FKM' }: MotorComparisonReportProps) {
  const { t, language } = useLanguage();
  
  // Obtener recomendaciones de encoders y conectores
  const encoderRec = getEncoderRecommendation(comparison.fxm.model);
  const connectorRec = getConnectorRecommendation(comparison.fxm.model, comparison.fkm.model);
  
  const handleDownloadPDF = async () => {
    try {
      await exportToPDF(comparison, language);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error generating PDF');
    }
  };
  
  const handleDownloadExcel = () => {
    try {
      exportToExcel(comparison, language);
      toast.success('Excel downloaded successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Error generating Excel');
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
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="border-primary text-primary hover:bg-primary hover:text-white">
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadExcel} className="border-primary text-primary hover:bg-primary hover:text-white">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
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
    </>
  );
}
