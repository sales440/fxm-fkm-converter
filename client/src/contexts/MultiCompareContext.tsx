import { createContext, useContext, useState, ReactNode } from 'react';
import type { Motor, ComparisonResult } from '@/types/motor';

export interface MultiCompareItem {
  motorA: Motor; // Motor origen (FXM o FKM)
  motorB: Motor; // Motor equivalente seleccionado (FKM o FXM)
  comparison: ComparisonResult;
  direction: 'FXM_TO_FKM' | 'FKM_TO_FXM';
}

interface MultiCompareContextType {
  items: MultiCompareItem[];
  addItem: (item: MultiCompareItem) => void;
  removeItem: (motorAModel: string) => void;
  clearAll: () => void;
  hasItem: (motorAModel: string) => boolean;
  itemCount: number;
}

const MultiCompareContext = createContext<MultiCompareContextType | undefined>(undefined);

export function MultiCompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MultiCompareItem[]>([]);

  const addItem = (item: MultiCompareItem) => {
    setItems(prev => {
      // Verificar si ya existe
      const exists = prev.some(i => i.motorA.model === item.motorA.model);
      if (exists) {
        // Reemplazar el existente
        return prev.map(i => 
          i.motorA.model === item.motorA.model ? item : i
        );
      }
      // Agregar nuevo
      return [...prev, item];
    });
  };

  const removeItem = (motorAModel: string) => {
    setItems(prev => prev.filter(item => item.motorA.model !== motorAModel));
  };

  const clearAll = () => {
    setItems([]);
  };

  const hasItem = (motorAModel: string) => {
    return items.some(item => item.motorA.model === motorAModel);
  };

  return (
    <MultiCompareContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      clearAll,
      hasItem,
      itemCount: items.length
    }}>
      {children}
    </MultiCompareContext.Provider>
  );
}

export function useMultiCompare() {
  const context = useContext(MultiCompareContext);
  if (!context) {
    throw new Error('useMultiCompare must be used within MultiCompareProvider');
  }
  return context;
}
