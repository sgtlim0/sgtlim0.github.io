'use client';

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { aggregateAll, type AggregatedData } from './aggregateData';

export interface ParsedRecord {
  [key: string]: string | number | boolean | null;
}

interface ROIDataContextValue {
  records: ParsedRecord[];
  setRecords: (records: ParsedRecord[]) => void;
  clearRecords: () => void;
  hasData: boolean;
  aggregated: AggregatedData | null;
}

const ROIDataContext = createContext<ROIDataContextValue>({
  records: [],
  setRecords: () => {},
  clearRecords: () => {},
  hasData: false,
  aggregated: null,
});

export function ROIDataProvider({ children }: { children: ReactNode }) {
  const [records, setRecordsState] = useState<ParsedRecord[]>([]);

  const setRecords = useCallback((newRecords: ParsedRecord[]) => {
    setRecordsState(newRecords);
  }, []);

  const clearRecords = useCallback(() => {
    setRecordsState([]);
  }, []);

  const aggregated = useMemo(() => {
    if (records.length === 0) return null;
    return aggregateAll(records);
  }, [records]);

  const value = useMemo(() => ({
    records,
    setRecords,
    clearRecords,
    hasData: records.length > 0,
    aggregated,
  }), [records, setRecords, clearRecords, aggregated]);

  return (
    <ROIDataContext.Provider value={value}>
      {children}
    </ROIDataContext.Provider>
  );
}

export function useROIData() {
  return useContext(ROIDataContext);
}
