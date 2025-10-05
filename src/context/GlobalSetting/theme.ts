import { useState } from "react";

type ThemeColor = {
  base: string;
  colors: string[];
}

export type ThemeHook = {
  theme: ThemeColor;
  setTheme: (value: keyof typeof themes) => void;
};

const themes = {
  level_default: {
    base: '#390096',
    colors: ['#cc3567', '#00b4ff', '#ff7800']
  },
  level_1: {
    base: '#318053',
    colors: ['#318053', '#3514B1', '#C1E57A']
  },
  level_2: {
    base: '#E57AD7',
    colors: ['#E57AD7', '#2C285B', '#14B177']
  },
  level_3: {
    base: '#FE8C9E',
    colors: ['#FE8C9E', '#7A72D2', '#41274C']
  },
  level_4: {
    base: '#28BBD2',
    colors: ['#28BBD2', '#282064', '#FEBCFE']
  },
  level_5: {
    base: '#2C285B',
    colors: ['#2C285B', '#7AE5DA', '#B16A14']
  },
  level_6: {
    base: '#BDF2C1',
    colors: ['#BDF2C1', '#A797FC', '#3A35B4']
  },
}


export const useTheme = (): ThemeHook => {
  const [themeColor, setThemeColor] = useState<ThemeColor>(themes['level_default']);


  const setTheme = (value: string) => {
    if (value) {
      setThemeColor(themes[value as keyof typeof themes]);
    }
  }
  
  return {
    theme: themeColor,
    setTheme
  };
};