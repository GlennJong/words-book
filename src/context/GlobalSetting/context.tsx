import React, { createContext, useContext } from 'react';
import { ThemeHook, useTheme } from './theme';
import { EndpointHook, useEndpoint } from './endpoint';
import { TokenHook, useToken } from './token';
import { OfflineHook, useOffline } from './offline';

const isDemo = import.meta.env.VITE_IS_DEMO;

type GlobalSettingsType = OfflineHook &ThemeHook & EndpointHook & TokenHook & { isDemo: boolean };

export const GlobalSettings = createContext<GlobalSettingsType | null>(null);

export const useGlobalSettings = () => {
  const context = useContext(GlobalSettings);
  if (!context) throw new Error('useGlobalSettings must be used within a WordDataProvider');
  return context;
};

export const GlobalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const offlineSettings = useOffline();
  const endpointSettings = useEndpoint();
  const tokenSettings = useToken();
  const themeSettings = useTheme();
  return (
    <GlobalSettings.Provider
      value={{
        isDemo,
        ...offlineSettings,
        ...themeSettings,
        ...endpointSettings,
        ...tokenSettings
      }}>
      {children}
    </GlobalSettings.Provider>
  );
};
