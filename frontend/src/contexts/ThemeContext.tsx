import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '../types/common';

// 默认主题
const defaultTheme: Theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
};

// 暗色主题
const darkTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
  },
};

// 亮色主题
const lightTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: '#F8FAFC',
    surface: '#F1F5F9',
    text: '#0F172A',
  },
};

// 高对比度主题
const highContrastTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '#0066CC',
    secondary: '#595959',
    success: '#008000',
    danger: '#CC0000',
    warning: '#CC6600',
    info: '#0066CC',
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FFFFFF',
  },
};

// 主题类型
export type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'system';

// 主题上下文类型
interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    return savedMode || 'system';
  });

  // 获取系统主题
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 获取当前主题
  const getCurrentTheme = (): Theme => {
    const effectiveMode = mode === 'system' ? getSystemTheme() : mode;
    switch (effectiveMode) {
      case 'light':
        return lightTheme;
      case 'dark':
        return darkTheme;
      case 'high-contrast':
        return highContrastTheme;
      default:
        return darkTheme;
    }
  };

  const [theme, setTheme] = useState<Theme>(getCurrentTheme());

  // 监听系统主题变化
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(getCurrentTheme());

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // 更新主题
  useEffect(() => {
    setTheme(getCurrentTheme());
    localStorage.setItem('themeMode', mode);

    // 更新CSS变量
    const root = document.documentElement;
    Object.entries(getCurrentTheme().colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [mode]);

  // 切换主题
  const toggleMode = () => {
    setMode(prev => {
      switch (prev) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'high-contrast';
        case 'high-contrast':
          return 'light';
        default:
          return 'light';
      }
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 主题钩子
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 