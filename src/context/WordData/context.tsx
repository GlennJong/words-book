import React, { createContext, useContext } from 'react';
import { useWordData } from './hook';
import { useGlobalSettings } from '../GlobalSetting/context';

// eslint-disable-next-line react-refresh/only-export-components
export const WordDataContext = createContext<ReturnType<typeof useWordData> | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useWordDataContext = () => {
  const context = useContext(WordDataContext);
  if (!context) throw new Error('useWordDataContext must be used within a WordDataProvider');
  return context;
};

export const WordDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemo, endpoint, token, isOffline } = useGlobalSettings();
  // TODO: demo mode
  const wordData = useWordData({isDemo, isOffline, endpoint, token});
  return (
    <WordDataContext.Provider value={wordData}>
      {children}
    </WordDataContext.Provider>
  );
};
