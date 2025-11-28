import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Motor, ComparisonResult } from '@/types/motor';

export interface ConversionHistoryItem {
  id: string;
  timestamp: Date;
  motorA: Motor;
  motorB: Motor;
  comparison: ComparisonResult;
  direction: 'FXM_TO_FKM' | 'FKM_TO_FXM';
}

interface ConversionHistoryContextType {
  history: ConversionHistoryItem[];
  addToHistory: (item: Omit<ConversionHistoryItem, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getHistoryItem: (id: string) => ConversionHistoryItem | undefined;
}

const ConversionHistoryContext = createContext<ConversionHistoryContextType | undefined>(undefined);

const MAX_HISTORY_ITEMS = 15;
const STORAGE_KEY = 'fagor_conversion_history';

export function ConversionHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);

  // Cargar historial desde localStorage al inicio
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir timestamps de string a Date
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Error loading conversion history:', error);
    }
  }, []);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving conversion history:', error);
    }
  }, [history]);

  const addToHistory = (item: Omit<ConversionHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: ConversionHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setHistory(prev => {
      // Verificar si ya existe una conversión idéntica reciente (mismo motorA y motorB)
      const isDuplicate = prev.some(
        h => h.motorA.model === item.motorA.model && 
             h.motorB.model === item.motorB.model &&
             Date.now() - h.timestamp.getTime() < 60000 // Menos de 1 minuto
      );

      if (isDuplicate) {
        return prev; // No agregar duplicados recientes
      }

      // Agregar al inicio y mantener solo los últimos MAX_HISTORY_ITEMS
      const updated = [newItem, ...prev];
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getHistoryItem = (id: string) => {
    return history.find(item => item.id === id);
  };

  return (
    <ConversionHistoryContext.Provider value={{ 
      history, 
      addToHistory, 
      removeFromHistory, 
      clearHistory,
      getHistoryItem 
    }}>
      {children}
    </ConversionHistoryContext.Provider>
  );
}

export function useConversionHistory() {
  const context = useContext(ConversionHistoryContext);
  if (!context) {
    throw new Error('useConversionHistory must be used within ConversionHistoryProvider');
  }
  return context;
}
