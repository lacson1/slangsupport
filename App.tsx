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
  ModernButton,
  ModernInput,
  ModernCard,
  ModernChip,
  ModernHeading,
  ModernText,
  ModernContainer,
  ModernGrid,
  ModernSearchBar,
  ModernDefinitionCard,
  ModernFAB,
  ModernLoading
} from './components/ModernComponents';
import './styles/themes.css';
import './styles/material-design.css';
import './styles/modern-ui.css';

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
  const [wordOfTheDay, setWordOfTheDay] = useState<SlangDefinition | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    autoSpeak: false,
    speechRate: 1,
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
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
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

      // Add to history
      await historyAPI.addHistory({ term, definition });
      setSearchHistory(prev => [{ term, definition, timestamp: new Date().toISOString() }, ...prev]);

      // Update search count
      const updatedPreferences = { ...preferences, searchCount: preferences.searchCount + 1 };
      setPreferences(updatedPreferences);
      await preferencesAPI.updatePreferences(updatedPreferences);

      if (preferences.autoSpeak) {
        speakText(`${term}: ${definition.meaning}`);
      }
    } catch (error) {
      console.error('Error fetching slang definition:', error);
      showToast('Failed to get definition. The term might be invalid or there was a network issue.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle speech synthesis
  const speakText = useCallback(async (text: string) => {
    try {
      const audioBlob = await searchAPI.getSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.playbackRate = preferences.speechRate;
      audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      showToast('Failed to generate speech.', 'error');
    }
  }, [preferences.speechRate, showToast]);

  // Start speech recognition
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      showToast('Listening...', 'info');
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      showToast('Stopped listening.', 'info');
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (term: string, definition: SlangDefinition) => {
    try {
      if (favorites.some(fav => fav.term === term)) {
        await favoritesAPI.removeFavorite(term);
        setFavorites(prev => prev.filter(fav => fav.term !== term));
        showToast(`Removed "${term}" from favorites`, 'info');
        const updatedPreferences = { ...preferences, favoriteCount: preferences.favoriteCount - 1 };
        setPreferences(updatedPreferences);
        await preferencesAPI.updatePreferences(updatedPreferences);
      } else {
        await favoritesAPI.addFavorite({ term, definition });
        setFavorites(prev => [...prev, { term, definition, timestamp: new Date().toISOString() }]);
        showToast(`Added "${term}" to favorites`, 'success');
        const updatedPreferences = { ...preferences, favoriteCount: preferences.favoriteCount + 1 };
        setPreferences(updatedPreferences);
        await preferencesAPI.updatePreferences(updatedPreferences);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Failed to update favorites', 'error');
    }
  };

  // Handle preferences change
  const handlePreferencesChange = async (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    try {
      await preferencesAPI.updatePreferences(updatedPreferences);
      showToast('Settings updated', 'success');
    } catch (error) {
      console.error('Error updating preferences:', error);
      showToast('Failed to save settings', 'error');
    }
  };

  // Handle data export
  const handleExportData = () => {
    const data = { searchHistory, favorites, preferences };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slangsupport_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
  };

  // Handle data import
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.searchHistory && importedData.favorites && importedData.preferences) {
          setSearchHistory(importedData.searchHistory);
          setFavorites(importedData.favorites);
          setPreferences(importedData.preferences);

          // Update backend
          await historyAPI.clearHistory();
          await historyAPI.addBulkHistory(importedData.searchHistory);
          await favoritesAPI.clearFavorites();
          await favoritesAPI.addBulkFavorites(importedData.favorites);
          await preferencesAPI.updatePreferences(importedData.preferences);

          showToast('Data imported successfully', 'success');
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        showToast('Failed to import data. Invalid file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Handle clear all data
  const handleClearAllData = async () => {
    try {
      await Promise.all([
        historyAPI.clearHistory(),
        favoritesAPI.clearFavorites(),
        preferencesAPI.resetPreferences(),
      ]);
      setSearchHistory([]);
      setFavorites([]);
      setPreferences({
        autoSpeak: false,
        speechRate: 1,
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
      showToast('All data cleared', 'info');
    } catch (error) {
      console.error('Error clearing all data:', error);
      showToast('Failed to clear all data', 'error');
    }
  };

  // Handle clear search history
  const handleClearSearchHistory = async () => {
    try {
      await historyAPI.clearHistory();
      setSearchHistory([]);
      showToast('Search history cleared', 'info');
    } catch (error) {
      console.error('Error clearing search history:', error);
      showToast('Failed to clear search history', 'error');
    }
  };

  // Handle remove from search history
  const handleRemoveFromSearchHistory = async (id: string) => {
    try {
      await historyAPI.removeFromHistory(id);
      setSearchHistory(prev => prev.filter(item => item.id !== id));
      showToast('Removed from history', 'info');
    } catch (error) {
      console.error('Error removing from history:', error);
      showToast('Failed to remove from history', 'error');
    }
  };

  // Handle clear favorites
  const handleClearFavorites = async () => {
    try {
      await favoritesAPI.clearFavorites();
      setFavorites([]);
      showToast('Favorites cleared', 'info');
    } catch (error) {
      console.error('Error clearing favorites:', error);
      showToast('Failed to clear favorites', 'error');
    }
  };

  // Handle remove from favorites
  const handleRemoveFromFavorites = async (term: string) => {
    try {
      await favoritesAPI.removeFavorite(term);
      setFavorites(prev => prev.filter(fav => fav.term !== term));
      showToast('Removed from favorites', 'info');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showToast('Failed to remove from favorites', 'error');
    }
  };

  // Handle quiz completion
  const handleQuizComplete = async (score: number, total: number) => {
    try {
      await preferencesAPI.updatePreferences({
        quizHighScore: Math.max(preferences.quizHighScore, score),
        totalQuizAttempts: preferences.totalQuizAttempts + 1,
      });
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Background with Animated Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      </div>

      {/* Modern Header */}
      <header className="relative z-10 modern-glass-card modern-m-lg">
        <ModernContainer>
          <div className="modern-flex-between">
            <div className="modern-fade-in">
              <ModernHeading level={1} gradient className="modern-mb-sm">
                SlangSupport
              </ModernHeading>
              <ModernText className="modern-text-sm opacity-80">
                AI-powered slang dictionary with voice search
              </ModernText>
            </div>
            <div className="modern-scale-in">
              <ThemeSwitcher />
            </div>
          </div>
        </ModernContainer>
      </header>

      {/* Main Content */}
      <main className="relative z-10 modern-container modern-p-lg">
        {/* Modern Search Section */}
        <div className="modern-slide-up modern-mb-xl">
          <ModernSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => handleSearch()}
            loading={isLoading}
            onVoiceClick={isListening ? stopListening : startListening}
            isListening={isListening}
            placeholder="Search for slang terms..."
          />

          {/* Modern Category Filter */}
          <div className="modern-glass-card modern-mt-lg">
            <ModernText className="modern-mb-md font-semibold">Filter by category:</ModernText>
            <div className="modern-flex modern-gap-sm flex-wrap">
              <ModernChip
                label="All"
                selected={!selectedCategory}
                onClick={() => setSelectedCategory(null)}
              />
              {availableCategories.map((category) => (
                <ModernChip
                  key={category}
                  label={category}
                  selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modern Definition Display */}
        {definition && (
          <div className="modern-bounce-in modern-mb-xl">
            <ModernDefinitionCard
              term={searchTerm || 'Definition'}
              definition={definition}
              onSpeak={() => speakText(`${searchTerm}: ${definition.meaning}`)}
              onToggleFavorite={() => handleToggleFavorite(searchTerm, definition)}
              isFavorite={favorites.some(fav => fav.term === searchTerm)}
            />
          </div>
        )}

        {/* Modern Word of the Day */}
        {wordOfTheDay && (
          <div className="modern-fade-in modern-mb-xl">
            <ModernCard className="modern-hover-glow">
              <div className="modern-flex-between modern-mb-lg">
                <div>
                  <ModernHeading level={3} gradient className="modern-mb-sm">
                    Word of the Day
                  </ModernHeading>
                  <ModernText className="modern-text-sm opacity-80">
                    Discover new slang every day
                  </ModernText>
                </div>
                <div className="modern-flex modern-gap-sm">
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(`${wordOfTheDay.meaning}`)}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    }
                  />
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite('word-of-day', wordOfTheDay)}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.329 1.176l1.519 4.674c.3.921-.755 1.688-1.539 1.175l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.513-1.83-.254-1.539-1.175l1.519-4.674a1 1 0 00-.329-1.176l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                      </svg>
                    }
                  />
                </div>
              </div>
              <div className="modern-space-y-lg">
                <div>
                  <ModernText className="modern-mb-sm font-semibold">Meaning:</ModernText>
                  <ModernText className="modern-text-lg">{wordOfTheDay.meaning}</ModernText>
                </div>
                <div>
                  <ModernText className="modern-mb-sm font-semibold">Example:</ModernText>
                  <ModernText className="modern-text-lg italic">"{wordOfTheDay.example}"</ModernText>
                </div>
              </div>
            </ModernCard>
          </div>
        )}

        {/* Modern Example Terms Grid */}
        <div className="modern-slide-up">
          <ModernCard className="modern-mb-xl">
            <ModernHeading level={2} gradient className="modern-mb-lg">
              Explore Slang
            </ModernHeading>
            <ModernGrid cols={4} gap="md">
              {filteredExamples.map((example, index) => (
                <ModernCard
                  key={example.term}
                  interactive
                  onClick={() => handleSearch(example.term)}
                  className="modern-hover-lift modern-hover-glow"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <ModernHeading level={4} className="modern-mb-sm">
                    {example.term}
                  </ModernHeading>
                  <ModernChip label={example.category} />
                </ModernCard>
              ))}
            </ModernGrid>
          </ModernCard>
        </div>
      </main>

      {/* Modern Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 z-50 modern-flex flex-col modern-gap-sm">
        <ModernFAB
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onClick={() => setIsSearchHistoryOpen(!isSearchHistoryOpen)}
          position="bottom-left"
        />
        <ModernFAB
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.329 1.176l1.519 4.674c.3.921-.755 1.688-1.539 1.175l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.513-1.83-.254-1.539-1.175l1.519-4.674a1 1 0 00-.329-1.176l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
            </svg>
          }
          onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
          position="bottom-left"
        />
        <ModernFAB
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          onClick={() => setIsQuizOpen(!isQuizOpen)}
          position="bottom-left"
        />
      </div>

      {/* Modals */}
      <SearchHistory
        history={searchHistory || []}
        onSearch={handleSearch}
        onClearHistory={handleClearSearchHistory}
        onRemoveFromHistory={handleRemoveFromSearchHistory}
        isOpen={isSearchHistoryOpen}
        onToggle={() => setIsSearchHistoryOpen(!isSearchHistoryOpen)}
      />

      <Favorites
        favorites={favorites || []}
        onSearch={handleSearch}
        onClearFavorites={handleClearFavorites}
        onRemoveFromFavorites={handleRemoveFromFavorites}
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
          questions={[]}
          onClose={() => setIsQuizOpen(false)}
          onQuizComplete={handleQuizComplete}
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