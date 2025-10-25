import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getSlangDefinition, getSpeech } from './services/geminiService';
import { SlangDefinition, SearchHistoryItem, FavoriteItem, UserPreferences, QuizQuestion, Category } from './types';
import {
  getSearchHistory, addToSearchHistory, clearSearchHistory, removeFromSearchHistory,
  getFavorites, addToFavorites, removeFromFavorites, isFavorite, clearFavorites,
  getUserPreferences, updateUserPreferences, getQuizScores, addQuizScore
} from './utils/storage';
import { getTodayString, getDaysSinceEpoch } from './utils/dateUtils';
import { ToastProvider, useToast } from './components/Toast';
import { SearchHistory } from './components/SearchHistory';
import { Favorites } from './components/Favorites';
import { WordOfTheDay } from './components/WordOfTheDay';
import { RelatedTerms } from './components/RelatedTerms';
import { CategoryBadge, CategoryFilter } from './components/CategoryBadge';
import { Quiz } from './components/Quiz';
import { Settings } from './components/Settings';

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
  { term: 'iykyk', category: Category.ABBREVIATIONS },
  { term: 'fr', category: Category.ABBREVIATIONS },
  { term: 'periodt', category: Category.AAVE },
  { term: 'main character', category: Category.GEN_Z },
  { term: 'vibe check', category: Category.GEN_Z },
];

const EXAMPLES_TO_SHOW = 6;

// Utility function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const AppContent: React.FC = () => {
  const { showToast } = useToast();

  // Core state
  const [searchTerm, setSearchTerm] = useState('');
  const [definition, setDefinition] = useState<SlangDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // UI state
  const [showAllExamples, setShowAllExamples] = useState(false);
  const [shuffledExamples, setShuffledExamples] = useState(shuffleArray(ALL_EXAMPLES));
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Sidebar states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Data state
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());

  // Word of the Day state
  const [wordOfTheDay, setWordOfTheDay] = useState<{ word: string; definition: SlangDefinition | null }>({
    word: '',
    definition: null
  });

  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Load data on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
    setFavorites(getFavorites());
    refreshExamples();
    loadWordOfTheDay();
  }, []);

  const refreshExamples = useCallback(() => {
    setShuffledExamples(shuffleArray([...ALL_EXAMPLES]));
  }, []);

  const handleToggleShowMore = () => {
    setShowAllExamples(prev => !prev);
  };

  const loadWordOfTheDay = useCallback(async () => {
    const today = getTodayString();
    const lastWordOfDayDate = preferences.lastWordOfDayDate;

    if (lastWordOfDayDate === today && preferences.lastWordOfDay) {
      // Use cached word of the day - just set the word, don't fetch definition yet
      setWordOfTheDay({
        word: preferences.lastWordOfDay,
        definition: null
      });
    } else {
      // Generate new word of the day
      const wordsOfTheDay = ['rizz', 'based', 'slay', 'no cap', 'bet', 'drip', 'finna', 'stan', 'mid', 'yeet'];
      const dayIndex = getDaysSinceEpoch() % wordsOfTheDay.length;
      const selectedWord = wordsOfTheDay[dayIndex];

      setWordOfTheDay({
        word: selectedWord,
        definition: null
      });

      // Update preferences
      const updatedPreferences = {
        ...preferences,
        lastWordOfDay: selectedWord,
        lastWordOfDayDate: today
      };
      updateUserPreferences(updatedPreferences);
      setPreferences(updatedPreferences);
    }
  }, []);

  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    setAudioContext(context);
    return () => {
      context.close();
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsListening(false);
    });

    recognition.addEventListener('end', () => {
      setIsListening(false);
    });

    recognition.addEventListener('error', () => {
      setIsListening(false);
      showToast('Speech recognition failed. Please try again.', 'error');
    });

    recognitionRef.current = recognition;
  }, [showToast]);

  const startListening = () => {
    if (!micSupported || !recognitionRef.current) return;

    setIsListening(true);
    recognitionRef.current.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getSlangDefinition(searchTerm);
      setDefinition(result);

      // Add to search history
      const historyItem: SearchHistoryItem = {
        term: searchTerm,
        timestamp: Date.now(),
        definition: result
      };
      addToSearchHistory(historyItem);
      setSearchHistory(getSearchHistory());

      // Update search count
      const updatedPreferences = {
        ...preferences,
        searchCount: preferences.searchCount + 1
      };
      updateUserPreferences(updatedPreferences);
      setPreferences(updatedPreferences);

      // Auto-speak if enabled
      if (preferences.autoSpeak && audioContext) {
        try {
          const audioBuffer = await getSpeech(result.meaning);
          const source = audioContext.createBufferSource();
          source.buffer = await audioContext.decodeAudioData(audioBuffer);
          source.connect(audioContext.destination);
          source.start();
        } catch (speechError) {
          console.warn('Speech synthesis failed:', speechError);
        }
      }

      showToast(`Found definition for "${searchTerm}"`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get definition';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    if (!definition) return;

    const term = searchTerm;
    const isCurrentlyFavorite = isFavorite(term);

    if (isCurrentlyFavorite) {
      removeFromFavorites(term);
      showToast(`Removed "${term}" from favorites`, 'info');
    } else {
      const favoriteItem: FavoriteItem = {
        term,
        definition,
        savedAt: Date.now()
      };
      addToFavorites(favoriteItem);
      showToast(`Added "${term}" to favorites`, 'success');
    }

    setFavorites(getFavorites());

    // Update favorite count
    const updatedPreferences = {
      ...preferences,
      favoriteCount: getFavorites().length
    };
    updateUserPreferences(updatedPreferences);
    setPreferences(updatedPreferences);
  };

  const handleLearnMore = async () => {
    if (!wordOfTheDay.word) return;

    setSearchTerm(wordOfTheDay.word);
    setIsLoading(true);

    try {
      const result = await getSlangDefinition(wordOfTheDay.word);
      setWordOfTheDay(prev => ({ ...prev, definition: result }));
      setDefinition(result);

      // Add to search history
      const historyItem: SearchHistoryItem = {
        term: wordOfTheDay.word,
        timestamp: Date.now(),
        definition: result
      };
      addToSearchHistory(historyItem);
      setSearchHistory(getSearchHistory());

      showToast(`Loaded definition for "${wordOfTheDay.word}"`, 'success');
    } catch (err) {
      showToast('Failed to load word of the day definition', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuizQuestions = (): QuizQuestion[] => {
    const historyTerms = searchHistory.slice(0, 10); // Use recent history
    const favoriteTerms = favorites.slice(0, 10); // Use some favorites
    const allTerms = [...historyTerms, ...favoriteTerms].slice(0, 5); // Max 5 questions

    return allTerms.map(item => {
      const correctAnswer = item.definition.meaning;
      const wrongAnswers = [
        "A completely different meaning",
        "Something unrelated",
        "The opposite meaning",
        "A made-up definition"
      ].slice(0, 3);

      const options = shuffleArray([correctAnswer, ...wrongAnswers]);

      return {
        term: item.term,
        correctAnswer,
        options,
        definition: item.definition
      };
    });
  };

  const startQuiz = () => {
    const questions = generateQuizQuestions();
    if (questions.length === 0) {
      showToast('Not enough search history for a quiz. Search for some terms first!', 'warning');
      return;
    }
    setQuizQuestions(questions);
    setIsQuizOpen(true);
  };

  const handleQuizComplete = (score: any) => {
    addQuizScore(score);
    setIsQuizOpen(false);
    showToast(`Quiz completed! Score: ${score.score}/${score.total}`, 'success');
  };

  const handlePreferencesChange = (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    updateUserPreferences(updated);
    setPreferences(updated);
    showToast('Settings updated', 'success');
  };

  const handleExportData = () => {
    try {
      const data = {
        searchHistory: getSearchHistory(),
        favorites: getFavorites(),
        preferences: getUserPreferences(),
        quizScores: getQuizScores(),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slangsupport-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Data exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.searchHistory) {
          localStorage.setItem('slangsupport_search_history', JSON.stringify(data.searchHistory));
        }
        if (data.favorites) {
          localStorage.setItem('slangsupport_favorites', JSON.stringify(data.favorites));
        }
        if (data.preferences) {
          localStorage.setItem('slangsupport_preferences', JSON.stringify(data.preferences));
        }
        if (data.quizScores) {
          localStorage.setItem('slangsupport_quiz_scores', JSON.stringify(data.quizScores));
        }

        // Refresh state
        setSearchHistory(getSearchHistory());
        setFavorites(getFavorites());
        setPreferences(getUserPreferences());

        showToast('Data imported successfully', 'success');
      } catch (error) {
        showToast('Failed to import data. Please check the file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    clearSearchHistory();
    clearFavorites();
    localStorage.removeItem('slangsupport_preferences');
    localStorage.removeItem('slangsupport_quiz_scores');

    setSearchHistory([]);
    setFavorites([]);
    setPreferences(getUserPreferences());
    setDefinition(null);
    setSearchTerm('');

    showToast('All data cleared', 'info');
  };

  // Filter examples by category
  const filteredExamples = selectedCategory
    ? shuffledExamples.filter(example => example.category === selectedCategory)
    : shuffledExamples;

  const examplesToDisplay = showAllExamples ? filteredExamples : filteredExamples.slice(0, EXAMPLES_TO_SHOW);

  // Get available categories from history and favorites
  const availableCategories = Array.from(new Set([
    ...(searchHistory || []).map(item => item.definition.category).filter(Boolean),
    ...(favorites || []).map(item => item.definition.category).filter(Boolean)
  ])) as Category[];

  // Count searches today
  const today = getTodayString();
  const searchCount = (searchHistory || []).filter(item =>
    new Date(item.timestamp).toDateString() === today
  ).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 relative">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Header */}
      <header className="w-full max-w-4xl mb-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            SlangSupport
          </h1>
          <p className="text-gray-400 text-lg mb-4">Your AI-powered slang dictionary</p>

          {/* Quick Stats */}
          <div className="flex justify-center gap-4 sm:gap-6 mt-4 text-sm text-gray-500 flex-wrap">
            <span className="bg-gray-800 px-3 py-1 rounded-full">{searchCount} searches today</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full">{favorites.length} favorites</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full">{preferences.quizHighScore} quiz high score</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl flex-1">
        {!definition ? (
          <div className="animate-fade-in">
            {/* Word of the Day */}
            {wordOfTheDay.word && (
              <WordOfTheDay
                word={wordOfTheDay.word}
                definition={wordOfTheDay.definition}
                onLearnMore={handleLearnMore}
              />
            )}

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div className="mb-4">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  availableCategories={availableCategories}
                />
              </div>
            )}

            {/* Example Terms */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {examplesToDisplay.map((example, index) => (
                <button
                  key={`${example.term}-${index}`}
                  onClick={() => setSearchTerm(example.term)}
                  className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 text-left group"
                >
                  <div className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                    {example.term}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {example.category}
                  </div>
                </button>
              ))}
            </div>

            {/* Show More Button */}
            {filteredExamples.length > EXAMPLES_TO_SHOW && (
              <div className="text-center">
                <button
                  onClick={handleToggleShowMore}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-6 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
                >
                  {showAllExamples ? 'Show Less' : `Show More (${filteredExamples.length - EXAMPLES_TO_SHOW} more)`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Definition Display */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 pr-4">
                  <h2 className="text-3xl font-bold text-white mb-3">{searchTerm}</h2>
                  {definition.category && (
                    <CategoryBadge category={definition.category} size="md" />
                  )}
                </div>
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-3 rounded-lg transition-all duration-200 ${isFavorite(searchTerm)
                    ? 'text-pink-400 hover:text-pink-300 bg-pink-400/10'
                    : 'text-gray-400 hover:text-pink-400 hover:bg-pink-400/10'
                    }`}
                  aria-label={isFavorite(searchTerm) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className="w-6 h-6" fill={isFavorite(searchTerm) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Meaning</h3>
                  <p className="text-white text-lg leading-relaxed">{definition.meaning}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Example</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-200 italic">"{definition.example}"</p>
                  </div>
                </div>

                {/* Related Terms */}
                {definition.relatedTerms && definition.relatedTerms.length > 0 && (
                  <RelatedTerms
                    relatedTerms={definition.relatedTerms}
                    onSearchTerm={setSearchTerm}
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() => {
                  setDefinition(null);
                  setSearchTerm('');
                  setError(null);
                }}
                className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg"
              >
                Search Another Term
              </button>

              <button
                onClick={startQuiz}
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Take Quiz
              </button>
            </div>
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-8">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isListening ? "🎤 Listening... Speak now" : "e.g., 'rizz', 'iykyk', 'based'"}
              className="w-full px-6 py-4 text-lg text-white bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 placeholder-gray-500 pr-16 shadow-lg"
              disabled={isLoading || isListening}
            />

            {/* Microphone Button */}
            {micSupported && (
              <button
                type="button"
                onClick={startListening}
                disabled={isListening || isLoading}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-lg transition-all duration-200 ${isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                  }`}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="w-full px-8 py-4 text-lg font-bold text-white bg-cyan-600 rounded-xl hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Searching...
              </>
            ) : 'Define'}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}
      </main>

      {/* Sidebar Components */}
      <SearchHistory
        history={searchHistory}
        onSearchTerm={setSearchTerm}
        onRemoveItem={(term) => {
          removeFromSearchHistory(term);
          setSearchHistory(getSearchHistory());
          showToast(`Removed "${term}" from history`, 'info');
        }}
        onClearAll={() => {
          clearSearchHistory();
          setSearchHistory([]);
          showToast('Search history cleared', 'info');
        }}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      />

      <Favorites
        favorites={favorites}
        onSearchTerm={setSearchTerm}
        onRemoveFavorite={(term) => {
          removeFromFavorites(term);
          setFavorites(getFavorites());
          showToast(`Removed "${term}" from favorites`, 'info');
        }}
        onClearAll={() => {
          clearFavorites();
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
          questions={quizQuestions}
          onClose={() => setIsQuizOpen(false)}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;