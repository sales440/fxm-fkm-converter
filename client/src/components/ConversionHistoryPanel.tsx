import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  X, 
  Trash2, 
  ArrowRight, 
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useConversionHistory } from '@/contexts/ConversionHistoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Motor } from '@/types/motor';

interface ConversionHistoryPanelProps {
  onSelectConversion: (motorA: Motor, motorB: Motor, direction: 'FXM_TO_FKM' | 'FKM_TO_FXM') => void;
}

export default function ConversionHistoryPanel({ onSelectConversion }: ConversionHistoryPanelProps) {
  const { history, removeFromHistory, clearHistory } = useConversionHistory();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;
    
    return date.toLocaleDateString();
  };

  const handleSelectItem = (item: any) => {
    onSelectConversion(item.motorA, item.motorB, item.direction);
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className="fixed right-4 top-24 z-40 shadow-lg bg-white hover:bg-gray-50"
        title={t('conversionHistory')}
      >
        {isOpen ? <ChevronRight className="h-5 w-5" /> : <History className="h-5 w-5" />}
      </Button>

      {/* Sliding Panel */}
      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-30 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '380px' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-red-600 text-white">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <h2 className="font-bold text-lg">{t('conversionHistory')}</h2>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-red-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <Clock className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">{t('noHistoryYet')}</p>
                <p className="text-xs mt-1">{t('historyDescription')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <Card 
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-red-600"
                    onClick={() => handleSelectItem(item)}
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-900">
                              {item.motorA.model}
                            </span>
                            <ArrowRight className="h-3 w-3 text-red-600" />
                            <span className="font-semibold text-gray-900">
                              {item.motorB.model}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(item.timestamp)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(item.id);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">{t('torque')}:</span>
                          <span className="ml-1 font-medium">{item.motorA.mo} Nm</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('speed')}:</span>
                          <span className="ml-1 font-medium">{item.motorA.rpm} rpm</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {history.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <Button
                onClick={clearHistory}
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('clearHistory')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
