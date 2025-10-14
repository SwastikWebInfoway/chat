import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
}

const defaultTheme: Theme = {
  primary: '#FF3B8B', // Vibrant pink - fun and social
  secondary: '#A855F7', // Purple magic
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#1F1F1F',
  textSecondary: '#666666',
  border: '#EEEEEE',
  error: '#FF5252',
  success: '#00E676',
};

interface ThemeContextType {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme) {
        setTheme({...defaultTheme, ...JSON.parse(savedTheme)});
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const updateTheme = async (newTheme: Partial<Theme>) => {
    const updatedTheme = {...theme, ...newTheme};
    setTheme(updatedTheme);
    try {
      await AsyncStorage.setItem('app_theme', JSON.stringify(updatedTheme));
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const resetTheme = async () => {
    setTheme(defaultTheme);
    try {
      await AsyncStorage.removeItem('app_theme');
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{theme, updateTheme, resetTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};