import React, { createContext, useContext } from 'react';
import { useAsId, AsIdHook } from './asId';
import { ThemeHook, useTheme } from './theme';

export const GlobalSettings = createContext<AsIdHook & ThemeHook | null>(null);

export const useGlobalSettings = () => {
  const context = useContext(GlobalSettings);
  if (!context) throw new Error('useGlobalSettings must be used within a WordDataProvider');
  return context;
};

export const GlobalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const asIdSettings = useAsId();
  const themeSettings = useTheme();
  return (
    <GlobalSettings.Provider value={{...asIdSettings, ...themeSettings}}>
      {children}
    </GlobalSettings.Provider>
  );
};
