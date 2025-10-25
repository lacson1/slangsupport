import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'dark':
        return '🌙';
      case 'light':
        return '☀️';
      case 'neon':
        return '⚡';
      case 'sunset':
        return '🌅';
      case 'ocean':
        return '🌊';
      case 'forest':
        return '🌲';
      case 'midnight':
        return '🌌';
      default:
        return '🎨';
    }
  };

  const getThemePreview = (theme: any) => {
    return (
      <div 
        className="w-4 h-4 rounded-full border border-gray-300"
        style={{ 
          background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})` 
        }}
      />
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
        aria-label="Change theme"
      >
        <span className="text-lg">{getThemeIcon(currentTheme.name)}</span>
        <span className="text-sm font-medium">{currentTheme.displayName}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Theme Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Choose Theme
              </div>
              
              <div className="space-y-1">
                {availableThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      setTheme(theme.name);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      currentTheme.name === theme.name
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{getThemeIcon(theme.name)}</span>
                    {getThemePreview(theme)}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{theme.displayName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {theme.name} theme
                      </div>
                    </div>
                    {currentTheme.name === theme.name && (
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Compact theme switcher for mobile
export const CompactThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'dark':
        return '🌙';
      case 'light':
        return '☀️';
      case 'neon':
        return '⚡';
      case 'sunset':
        return '🌅';
      case 'ocean':
        return '🌊';
      case 'forest':
        return '🌲';
      case 'midnight':
        return '🌌';
      default:
        return '🎨';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Compact Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
        aria-label="Change theme"
      >
        <span className="text-lg">{getThemeIcon(currentTheme.name)}</span>
      </button>

      {/* Theme Grid */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Themes
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {availableThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      setTheme(theme.name);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-200 ${
                      currentTheme.name === theme.name
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    title={theme.displayName}
                  >
                    <span className="text-lg">{getThemeIcon(theme.name)}</span>
                    <span className="text-xs font-medium">{theme.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
