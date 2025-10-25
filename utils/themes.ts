// Theme definitions
export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    header: string;
    button: string;
    card: string;
  };
}

export const themes: Record<string, Theme> = {
  dark: {
    name: 'dark',
    displayName: 'Dark Mode',
    colors: {
      primary: '#8B5CF6', // Purple
      secondary: '#3B82F6', // Blue
      background: '#111827', // Gray-900
      surface: '#1F2937', // Gray-800
      text: '#FFFFFF',
      textSecondary: '#D1D5DB', // Gray-300
      border: '#374151', // Gray-700
      accent: '#F59E0B', // Amber-500
      success: '#10B981', // Emerald-500
      warning: '#F59E0B', // Amber-500
      error: '#EF4444', // Red-500
      info: '#3B82F6', // Blue-500
    },
    gradients: {
      header: 'from-purple-600 to-blue-600',
      button: 'from-purple-600 to-purple-700',
      card: 'from-gray-800 to-gray-700',
    },
  },
  light: {
    name: 'light',
    displayName: 'Light Mode',
    colors: {
      primary: '#7C3AED', // Purple-600
      secondary: '#2563EB', // Blue-600
      background: '#F9FAFB', // Gray-50
      surface: '#FFFFFF',
      text: '#111827', // Gray-900
      textSecondary: '#6B7280', // Gray-500
      border: '#E5E7EB', // Gray-200
      accent: '#D97706', // Amber-600
      success: '#059669', // Emerald-600
      warning: '#D97706', // Amber-600
      error: '#DC2626', // Red-600
      info: '#2563EB', // Blue-600
    },
    gradients: {
      header: 'from-purple-500 to-blue-500',
      button: 'from-purple-500 to-purple-600',
      card: 'from-white to-gray-50',
    },
  },
  neon: {
    name: 'neon',
    displayName: 'Neon Cyber',
    colors: {
      primary: '#00FFFF', // Cyan
      secondary: '#FF00FF', // Magenta
      background: '#0A0A0A', // Near black
      surface: '#1A1A1A', // Dark gray
      text: '#00FFFF', // Cyan
      textSecondary: '#80FFFF', // Light cyan
      border: '#333333', // Dark gray
      accent: '#FFFF00', // Yellow
      success: '#00FF00', // Green
      warning: '#FFFF00', // Yellow
      error: '#FF0080', // Pink-red
      info: '#0080FF', // Blue
    },
    gradients: {
      header: 'from-cyan-400 to-purple-500',
      button: 'from-cyan-500 to-purple-600',
      card: 'from-gray-900 to-gray-800',
    },
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset Vibes',
    colors: {
      primary: '#FF6B6B', // Coral
      secondary: '#4ECDC4', // Teal
      background: '#FFF5F5', // Rose-50
      surface: '#FFFFFF',
      text: '#2D3748', // Gray-800
      textSecondary: '#718096', // Gray-500
      border: '#E2E8F0', // Gray-200
      accent: '#FFD93D', // Yellow
      success: '#48BB78', // Green-500
      warning: '#ED8936', // Orange-500
      error: '#F56565', // Red-400
      info: '#4299E1', // Blue-400
    },
    gradients: {
      header: 'from-orange-400 to-pink-500',
      button: 'from-orange-500 to-red-500',
      card: 'from-orange-50 to-pink-50',
    },
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean Depths',
    colors: {
      primary: '#0EA5E9', // Sky-500
      secondary: '#06B6D4', // Cyan-500
      background: '#0F172A', // Slate-900
      surface: '#1E293B', // Slate-800
      text: '#F1F5F9', // Slate-100
      textSecondary: '#94A3B8', // Slate-400
      border: '#334155', // Slate-700
      accent: '#F59E0B', // Amber-500
      success: '#10B981', // Emerald-500
      warning: '#F59E0B', // Amber-500
      error: '#EF4444', // Red-500
      info: '#0EA5E9', // Sky-500
    },
    gradients: {
      header: 'from-blue-600 to-cyan-600',
      button: 'from-blue-500 to-cyan-500',
      card: 'from-slate-800 to-slate-700',
    },
  },
  forest: {
    name: 'forest',
    displayName: 'Forest Green',
    colors: {
      primary: '#059669', // Emerald-600
      secondary: '#16A34A', // Green-600
      background: '#F0FDF4', // Green-50
      surface: '#FFFFFF',
      text: '#14532D', // Green-900
      textSecondary: '#4B5563', // Gray-600
      border: '#D1FAE5', // Emerald-100
      accent: '#D97706', // Amber-600
      success: '#059669', // Emerald-600
      warning: '#D97706', // Amber-600
      error: '#DC2626', // Red-600
      info: '#2563EB', // Blue-600
    },
    gradients: {
      header: 'from-green-600 to-emerald-600',
      button: 'from-green-500 to-emerald-500',
      card: 'from-green-50 to-emerald-50',
    },
  },
  midnight: {
    name: 'midnight',
    displayName: 'Midnight Blue',
    colors: {
      primary: '#6366F1', // Indigo-500
      secondary: '#8B5CF6', // Purple-500
      background: '#0C0A2E', // Very dark blue
      surface: '#1E1B4B', // Indigo-900
      text: '#E0E7FF', // Indigo-100
      textSecondary: '#A5B4FC', // Indigo-300
      border: '#3730A3', // Indigo-700
      accent: '#F59E0B', // Amber-500
      success: '#10B981', // Emerald-500
      warning: '#F59E0B', // Amber-500
      error: '#EF4444', // Red-500
      info: '#3B82F6', // Blue-500
    },
    gradients: {
      header: 'from-indigo-600 to-purple-600',
      button: 'from-indigo-500 to-purple-500',
      card: 'from-indigo-900 to-purple-900',
    },
  },
};

export const getTheme = (themeName: string): Theme => {
  return themes[themeName] || themes.dark;
};

export const getThemeColors = (themeName: string) => {
  const theme = getTheme(themeName);
  return theme.colors;
};

export const applyTheme = (themeName: string) => {
  const theme = getTheme(themeName);
  const root = document.documentElement;
  
  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Apply theme class to body
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${theme.name}`);
  
  return theme;
};
