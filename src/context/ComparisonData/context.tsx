import React, { createContext, useContext } from 'react';
import { useComparisonData } from './hook';
import { useGlobalSettings } from '../GlobalSetting/context';

// eslint-disable-next-line react-refresh/only-export-components
export const ComparisonDataContext = createContext<ReturnType<typeof useComparisonData> | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useComparisonDataContext = () => {
  const context = useContext(ComparisonDataContext);
  if (!context) throw new Error('useComparisonDataContext must be used within a ComparisonProvider');
  return context;
};

export const ComparisonDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemo, endpoint, token, isOffline } = useGlobalSettings();
  const comparisonData = useComparisonData({ isDemo, isOffline, endpoint, token });
  return (
    <ComparisonDataContext.Provider value={comparisonData}>
      {children}
    </ComparisonDataContext.Provider>
  );
};
