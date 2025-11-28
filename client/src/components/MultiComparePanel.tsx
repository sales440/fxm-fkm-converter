import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Download,
  Layers,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useMultiCompare } from '@/contexts/MultiCompareContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface MultiComparePanelProps {
  onExportConsolidated: () => void;
}

export default function MultiComparePanel({ onExportConsolidated }: MultiComparePanelProps) {
  const { items, removeItem, clearAll, itemCount } = useMultiCompare();
  const { t } = useLanguage();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-4xl px-4">
      <Card className="shadow-2xl border-2 border-red-600 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-lg text-gray-900">
                  {t('multiCompare')}
                </h3>
              </div>
              <Badge variant="secondary" className="bg-red-600 text-white">
                {itemCount} {t('motorsSelected')}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={onExportConsolidated}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('exportConsolidated')}
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('clearAll')}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {items.map((item) => (
                <div
                  key={item.motorA.model}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs flex-1 min-w-0">
                      <span className="font-semibold text-gray-900 truncate">
                        {item.motorA.model}
                      </span>
                      <ArrowRight className="h-3 w-3 text-red-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-900 truncate">
                        {item.motorB.model}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeItem(item.motorA.model)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-red-600 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
