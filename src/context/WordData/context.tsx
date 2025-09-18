import React, { createContext, useContext } from 'react';
import { useWordData } from './hook';

// WordDataContext 型別可根據 useWordData 回傳內容自動推斷
export const WordDataContext = createContext<ReturnType<typeof useWordData> | null>(null);

export const useWordDataContext = () => {
  const context = useContext(WordDataContext);
  if (!context) throw new Error('useWordDataContext must be used within a WordDataProvider');
  return context;
};

export const WordDataProvider: React.FC<{ asId?: string; children: React.ReactNode }> = ({ asId, children }) => {
  const wordData = useWordData(asId);
  return (
    <WordDataContext.Provider value={wordData}>
      {children}
    </WordDataContext.Provider>
  );
};
