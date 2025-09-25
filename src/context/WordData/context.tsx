import React, { createContext, useContext } from 'react';
import { useWordData } from './hook';
import { useGlobalSettings } from '../GlobalSetting/context';

// WordDataContext 型別可根據 useWordData 回傳內容自動推斷
export const WordDataContext = createContext<ReturnType<typeof useWordData> | null>(null);

export const useWordDataContext = () => {
  const context = useContext(WordDataContext);
  if (!context) throw new Error('useWordDataContext must be used within a WordDataProvider');
  return context;
};

export const WordDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemo, endpoint, token } = useGlobalSettings();
  // TODO: demo mode
  const wordData = useWordData(isDemo, endpoint, token);
  return (
    <WordDataContext.Provider value={wordData}>
      {children}
    </WordDataContext.Provider>
  );
};
