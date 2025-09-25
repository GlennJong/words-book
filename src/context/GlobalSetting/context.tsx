import React, { createContext, useContext } from 'react';
import { ThemeHook, useTheme } from './theme';
import { EndpointHook, useEndpoint } from './endpoint';
import { TokenHook, useToken } from './token';

export const GlobalSettings = createContext<ThemeHook & EndpointHook & TokenHook | null>(null);

export const useGlobalSettings = () => {
  const context = useContext(GlobalSettings);
  if (!context) throw new Error('useGlobalSettings must be used within a WordDataProvider');
  return context;
};

export const GlobalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const endpointSettings = useEndpoint();
  const tokenSettings = useToken();
  const themeSettings = useTheme();
  return (
    <GlobalSettings.Provider
      value={{
        ...themeSettings,
        ...endpointSettings,
        ...tokenSettings
      }}>
      {children}
    </GlobalSettings.Provider>
  );
};
