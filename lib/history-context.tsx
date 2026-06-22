"use client";

import React, { createContext, useContext, useState } from "react";

export interface CalcRecord {
  id: string;
  expression: string;
  result: string;
  created_at: string;
  ai_note?: string;
}

interface HistoryContextType {
  records: CalcRecord[];
  addRecord: (expression: string, result: string) => void;
  deleteRecord: (id: string) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<CalcRecord[]>([]);

  const addRecord = (expression: string, result: string) => {
    const newRecord: CalcRecord = {
      id: Math.random().toString(36).substr(2, 9),
      expression,
      result,
      created_at: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const clearHistory = () => {
    setRecords([]);
  };

  return (
    <HistoryContext.Provider value={{ records, addRecord, deleteRecord, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
