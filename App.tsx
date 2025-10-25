import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SlangDefinition, SearchHistoryItem, FavoriteItem, UserPreferences, QuizQuestion, Category } from './types';
import { searchAPI, favoritesAPI, historyAPI, preferencesAPI, wordOfDayAPI, authAPI, isAuthenticated as checkAuthStatus } from './services/apiService';
import { getTodayString, getDaysSinceEpoch } from './utils/dateUtils';
import { ToastProvider, useToast } from './components/Toast';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { SearchHistory } from './components/SearchHistory';
import { Favorites } from './components/Favorites';
import { WordOfTheDay } from './components/WordOfTheDay';
import { RelatedTerms } from './components/RelatedTerms';
import { CategoryBadge, CategoryFilter } from './components/CategoryBadge';
import { Quiz } from './components/Quiz';
import { Settings } from './components/Settings';
import {
  MaterialAppBar,
  MaterialContainer,
  MaterialCard,
  MaterialTextField,
  MaterialButton,
  MaterialChip,
  MaterialTypography,
  MaterialGrid
} from './components/MaterialComponents';
import './styles/themes.css';
import './styles/material-design.css';

// FIX: Update type definitions for the Web Speech API to use addEventListener
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  start(): void;
  stop(): void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'end', listener: () => void): void;
  addEventListener(type: 'error', listener: (event: Event) => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Example terms for initial display
const ALL_EXAMPLES = [
  { term: 'rizz', category: Category.GEN_Z },
  { term: 'based', category: Category.INTERNET },
  { term: 'slay', category: Category.GENERAL },
  { term: 'no cap', category: Category.AAVE },
  { term: 'bet', category: Category.GEN_Z },
  { term: 'drip', category: Category.MUSIC },
  { term: 'finna', category: Category.AAVE },
  { term: 'stan', category: Category.MUSIC },
  { term: 'mid', category: Category.GEN_Z },
  { term: 'yeet', category: Category.GENERAL },
];

// Main App Content Component (inside ToastProvider and ThemeProvider)
const AppContent: React.FC = () => {
  const { currentTheme } = useTheme();
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [definition, setDefinition] = useState<SlangDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    autoSpeak: true,
    speechRate: 1.0,
    speechVoice: 'default',
    theme: 'dark',
    showHistory: true,
    showFavorites: true,
    lastWordOfDay: '',
    lastWordOfDayDate: '',
    searchCount: 0,
    favoriteCount: 0,
    quizHighScore: 0,
    totalQuizAttempts: 0,
  });
  const [wordOfTheDay, setWordOfTheDay] = useState<SlangDefinition | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Toast hook
  const { showToast } = useToast();

  // Initialize authentication status
  useEffect(() => {
    setIsAuthenticated(checkAuthStatus());
  }, []);

  // Load user data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  // Load user data from backend
  const loadUserData = async () => {
    try {
      const [historyData, favoritesData, preferencesData] = await Promise.all([
        historyAPI.getHistory(),
        favoritesAPI.getFavorites(),
        preferencesAPI.getPreferences(),
      ]);

      setSearchHistory(historyData.history || []);
      setFavorites(favoritesData || []);
      setPreferences(preferencesData || preferences);
    } catch (error) {
      console.error('Error loading user data:', error);
      showToast('Failed to load user data', 'error');
    }
  };

  // Load word of the day
  const loadWordOfTheDay = useCallback(async () => {
    try {
      const response = await wordOfDayAPI.getWordOfTheDay();
      setWordOfTheDay(response.definition);
    } catch (error) {
      console.error('Error loading word of the day:', error);
    }
  }, []);

  // Load word of the day on mount
  useEffect(() => {
    loadWordOfTheDay();
  }, [loadWordOfTheDay]);

  // Update available categories
  useEffect(() => {
    const categories = Array.from(new Set([
      ...searchHistory.map(item => item.definition.category),
      ...favorites.map(item => item.definition.category),
      ...ALL_EXAMPLES.map(example => example.category),
    ]));
    setAvailableCategories(categories as Category[]);
  }, [searchHistory, favorites]);

  // Speech recognition setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.addEventListener('result', (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        handleSearch(transcript);
      });

      recognitionRef.current.addEventListener('end', () => {
        setIsListening(false);
      });

      recognitionRef.current.addEventListener('error', () => {
        setIsListening(false);
        showToast('Speech recognition error', 'error');
      });
    }
  }, [showToast]);

  // Handle search
  const handleSearch = async (term: string = searchTerm) => {
    if (!term.trim()) return;

    setIsLoading(true);
    try {
      const definition = await searchAPI.getDefinition(term);
      setDefinition(definition);
      setSearchTerm('');

      // Auto-speak if enabled
      if (preferences.autoSpeak) {
        speakText(`${term}: ${definition.meaning}`);
      }

      showToast(`Found definition for "${term}"`, 'success');
    } catch (error) {
      console.error('Search error:', error);
      showToast('Failed to get definition. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Speech functions
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }

      speechSynthesisRef.current = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current.rate = preferences.speechRate;
      speechSynthesisRef.current.voice = speechSynthesis.getVoices().find(voice =>
        voice.name === preferences.speechVoice
      ) || speechSynthesis.getVoices()[0];

      speechSynthesis.speak(speechSynthesisRef.current);
    }
  };

  // Favorites management
  const handleToggleFavorite = async (term: string, definition: SlangDefinition) => {
    try {
      const isCurrentlyFavorite = favorites.some(fav => fav.term === term);

      if (isCurrentlyFavorite) {
        await favoritesAPI.removeFavorite(term);
        setFavorites(prev => prev.filter(fav => fav.term !== term));
        showToast('Removed from favorites', 'info');
      } else {
        await favoritesAPI.addFavorite(term, definition);
        setFavorites(prev => [...prev, { term, definition, savedAt: new Date().toISOString() }]);
        showToast('Added to favorites', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Failed to update favorites', 'error');
    }
  };

  // Preferences management
  const handlePreferencesChange = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      if (isAuthenticated) {
        await preferencesAPI.updatePreferences(newPreferences);
      }

      showToast('Settings updated', 'success');
    } catch (error) {
      console.error('Error updating preferences:', error);
      showToast('Failed to update settings', 'error');
    }
  };

  // Data management
  const handleExportData = () => {
    const data = {
      searchHistory,
      favorites,
      preferences,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slangsupport-data-${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Data exported successfully', 'success');
  };

  const handleImportData = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.searchHistory) setSearchHistory(data.searchHistory);
      if (data.favorites) setFavorites(data.favorites);
      if (data.preferences) setPreferences(data.preferences);

      showToast('Data imported successfully', 'success');
    } catch (error) {
      console.error('Import error:', error);
      showToast('Failed to import data', 'error');
    }
  };

  const handleClearAllData = async () => {
    try {
      if (isAuthenticated) {
        await Promise.all([
          historyAPI.clearHistory(),
          favoritesAPI.clearFavorites(),
        ]);
      }

      setSearchHistory([]);
      setFavorites([]);
      setPreferences({
        ...preferences,
        searchCount: 0,
        favoriteCount: 0,
        quizHighScore: 0,
        totalQuizAttempts: 0,
      });

      showToast('All data cleared', 'info');
    } catch (error) {
      console.error('Error clearing data:', error);
      showToast('Failed to clear data', 'error');
    }
  };

  // Quiz management
  const handleQuizComplete = async (score: number, total: number) => {
    try {
      if (isAuthenticated) {
        await quizAPI.saveScore(score, total);
      }

      const newScore = { score, total, date: new Date().toISOString() };
      setPreferences(prev => ({
        ...prev,
        quizHighScore: Math.max(prev.quizHighScore, score),
        totalQuizAttempts: prev.totalQuizAttempts + 1,
      }));

      showToast(`Quiz completed! Score: ${score}/${total}`, 'success');
    } catch (error) {
      console.error('Error saving quiz score:', error);
      showToast('Failed to save quiz score', 'error');
    }
  };

  // Filter examples by category
  const filteredExamples = selectedCategory
    ? ALL_EXAMPLES.filter(example => example.category === selectedCategory)
    : ALL_EXAMPLES;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <MaterialAppBar
        title="SlangSupport"
        subtitle="AI-powered slang dictionary with voice search"
      >
        <ThemeSwitcher />
      </MaterialAppBar>

      {/* Main Content */}
      <MaterialContainer className="py-6">
        {/* Search Section */}
        <MaterialCard elevation={2} className="mb-6">
          <div className="md-flex md-gap-md md-mb-md">
            <div className="flex-1">
              <MaterialTextField
                label="Search for slang terms"
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Type a slang term..."
                type="search"
                disabled={isLoading}
              />
            </div>
            <div className="md-flex md-gap-sm">
              <MaterialButton
                variant="primary"
                onClick={() => handleSearch()}
                disabled={isLoading || !searchTerm.trim()}
                size="large"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </MaterialButton>
              <MaterialButton
                variant={isListening ? 'primary' : 'secondary'}
                onClick={isListening ? stopListening : startListening}
                disabled={!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
                size="large"
              >
                {isListening ? '🎤 Stop' : '🎤 Voice'}
              </MaterialButton>
            </div>
          </div>

          {/* Category Filter */}
          <div className="md-mt-md">
            <MaterialTypography variant="body2" color="secondary" className="md-mb-sm">
              Filter by category:
            </MaterialTypography>
            <div className="md-flex md-gap-sm flex-wrap">
              <MaterialChip
                label="All"
                selected={!selectedCategory}
                onClick={() => setSelectedCategory(null)}
              />
              {availableCategories.map((category) => (
                <MaterialChip
                  key={category}
                  label={category}
                  selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </div>
        </MaterialCard>

        {/* Definition Display */}
        {definition && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {searchTerm || 'Definition'}
                </h2>
                <CategoryBadge category={definition.category} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => speakText(`${searchTerm}: ${definition.meaning}`)}
                  className="p-2 text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                  aria-label="Speak definition"
                >
                  🔊
                </button>
                <button
                  onClick={() => handleToggleFavorite(searchTerm, definition)}
                  className={`p-2 transition-colors ${favorites.some(fav => fav.term === searchTerm)
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400'
                    }`}
                  aria-label="Toggle favorite"
                >
                  ⭐
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Meaning:</h3>
                <p className="text-gray-600 dark:text-gray-400">{definition.meaning}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Example:</h3>
                <p className="text-gray-600 dark:text-gray-400 italic">"{definition.example}"</p>
              </div>

              {definition.relatedTerms && definition.relatedTerms.length > 0 && (
                <RelatedTerms
                  terms={definition.relatedTerms}
                  onTermClick={(term) => {
                    setSearchTerm(term);
                    handleSearch(term);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Word of the Day */}
        {wordOfTheDay && (
          <WordOfTheDay
            word={wordOfTheDay}
            onWordClick={(term) => {
              setSearchTerm(term);
              handleSearch(term);
            }}
          />
        )}

        {/* Examples Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Popular Terms</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(example.term);
                  handleSearch(example.term);
                }}
                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors duration-200 text-left"
              >
                <div className="font-medium text-gray-900 dark:text-white">{example.term}</div>
                <CategoryBadge category={example.category} size="sm" />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setIsQuizOpen(true)}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            🧠 Take Quiz
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            📚 History
          </button>
          <button
            onClick={() => setIsFavoritesOpen(true)}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            ⭐ Favorites
          </button>
        </div>
      </MaterialContainer>

      {/* Modals */}
      <SearchHistory
        history={searchHistory}
        onTermClick={(term) => {
          setSearchTerm(term);
          handleSearch(term);
        }}
        onRemove={(id) => {
          setSearchHistory(prev => prev.filter(item => item.id !== id));
        }}
        onClear={() => {
          setSearchHistory([]);
          showToast('History cleared', 'info');
        }}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      />

      <Favorites
        favorites={favorites}
        onTermClick={(term) => {
          setSearchTerm(term);
          handleSearch(term);
        }}
        onRemove={(term) => {
          setFavorites(prev => prev.filter(fav => fav.term !== term));
          showToast('Removed from favorites', 'info');
        }}
        onClear={() => {
          setFavorites([]);
          showToast('Favorites cleared', 'info');
        }}
        isOpen={isFavoritesOpen}
        onToggle={() => setIsFavoritesOpen(!isFavoritesOpen)}
      />

      <Settings
        preferences={preferences}
        onPreferencesChange={handlePreferencesChange}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearAllData={handleClearAllData}
        isOpen={isSettingsOpen}
        onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
      />

      {/* Quiz Modal */}
      {isQuizOpen && (
        <Quiz
          questions={[]} // Will be populated from user's search history
          onComplete={handleQuizComplete}
          onClose={() => setIsQuizOpen(false)}
        />
      )}
    </div>
  );
};

// Main App Component with ToastProvider and ThemeProvider
const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;