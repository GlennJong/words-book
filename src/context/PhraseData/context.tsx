import React, { createContext, useContext } from 'react';
import { usePhraseData } from './hook';
import { useGlobalSettings } from '../GlobalSetting/context';

export const PhraseDataContext = createContext<ReturnType<typeof usePhraseData> | null>(null);

export const usePhraseDataContext = () => {
  const context = useContext(PhraseDataContext);
  if (!context) throw new Error('usePhraseDataContext must be used within a PhraseDataProvider');
  return context;
};

export const PhraseDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemo, endpoint, token, isOffline } = useGlobalSettings();
  const phraseData = usePhraseData({ isDemo, isOffline, endpoint, token });
  return (
    <PhraseDataContext.Provider value={phraseData}>
      {children}
    </PhraseDataContext.Provider>
  );
};
