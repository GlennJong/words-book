import { useState } from "react";

export type ThemeHook = {
  theme: string | undefined;
  setTheme: (value: string | undefined) => void;
};

export const useTheme = (): ThemeHook => {
  const [theme, setTheme] = useState<string | undefined>('');
  
  return {
    theme,
    setTheme
  };
};