import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, getTheme, applyTheme } from '../utils/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'dark' 
}) => {
  const [currentThemeName, setCurrentThemeName] = useState<string>(defaultTheme);
  const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme(defaultTheme));

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('slangsupport-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeName(savedTheme);
      setCurrentTheme(getTheme(savedTheme));
    }
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(currentThemeName);
    localStorage.setItem('slangsupport-theme', currentThemeName);
  }, [currentThemeName]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
      setCurrentTheme(getTheme(themeName));
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: Object.values(themes),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
