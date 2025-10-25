// localStorage utilities for SlangSupport app
import { SearchHistoryItem, FavoriteItem, UserPreferences, QuizScore } from '../types';

const STORAGE_KEYS = {
    SEARCH_HISTORY: 'slangsupport_search_history',
    FAVORITES: 'slangsupport_favorites',
    PREFERENCES: 'slangsupport_preferences',
    QUIZ_SCORES: 'slangsupport_quiz_scores',
} as const;

// Search History Functions
export const getSearchHistory = (): SearchHistoryItem[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading search history:', error);
        return [];
    }
};

export const addToSearchHistory = (item: SearchHistoryItem): void => {
    try {
        const history = getSearchHistory();
        // Remove existing entry if it exists (to move to top)
        const filtered = history.filter(h => h.term !== item.term);
        // Add new item to beginning
        const updated = [item, ...filtered].slice(0, 50); // Keep last 50 items
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error saving to search history:', error);
    }
};

export const removeFromSearchHistory = (term: string): void => {
    try {
        const history = getSearchHistory();
        const updated = history.filter(h => h.term !== term);
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error removing from search history:', error);
    }
};

export const clearSearchHistory = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
        console.error('Error clearing search history:', error);
    }
};

// Favorites Functions
export const getFavorites = (): FavoriteItem[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading favorites:', error);
        return [];
    }
};

export const addToFavorites = (item: FavoriteItem): void => {
    try {
        const favorites = getFavorites();
        // Check if already exists
        if (!favorites.some(f => f.term === item.term)) {
            const updated = [item, ...favorites];
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
    }
};

export const removeFromFavorites = (term: string): void => {
    try {
        const favorites = getFavorites();
        const updated = favorites.filter(f => f.term !== term);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    } catch (error) {
        console.error('Error removing from favorites:', error);
    }
};

export const isFavorite = (term: string): boolean => {
    try {
        const favorites = getFavorites();
        return favorites.some(f => f.term === term);
    } catch (error) {
        console.error('Error checking favorite status:', error);
        return false;
    }
};

export const clearFavorites = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    } catch (error) {
        console.error('Error clearing favorites:', error);
    }
};

// User Preferences Functions
export const getUserPreferences = (): UserPreferences => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }

    // Return default preferences
    return {
        autoSpeak: true,
        speechRate: 1.0,
        speechVoice: 'default',
        theme: 'dark',
        showHistory: true,
        showFavorites: true,
        lastWordOfDayDate: '',
        lastWordOfDay: '',
        searchCount: 0,
        favoriteCount: 0,
        quizHighScore: 0,
        totalQuizAttempts: 0,
    };
};

export const updateUserPreferences = (preferences: Partial<UserPreferences>): void => {
    try {
        const current = getUserPreferences();
        const updated = { ...current, ...preferences };
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (error) {
        console.error('Error updating preferences:', error);
    }
};

// Quiz Scores Functions
export const getQuizScores = (): QuizScore[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_SCORES);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading quiz scores:', error);
        return [];
    }
};

export const addQuizScore = (score: QuizScore): void => {
    try {
        const scores = getQuizScores();
        const updated = [score, ...scores].slice(0, 20); // Keep last 20 scores
        localStorage.setItem(STORAGE_KEYS.QUIZ_SCORES, JSON.stringify(updated));

        // Update high score in preferences
        const preferences = getUserPreferences();
        if (score.score > preferences.quizHighScore) {
            updateUserPreferences({
                quizHighScore: score.score,
                totalQuizAttempts: preferences.totalQuizAttempts + 1
            });
        } else {
            updateUserPreferences({
                totalQuizAttempts: preferences.totalQuizAttempts + 1
            });
        }
    } catch (error) {
        console.error('Error saving quiz score:', error);
    }
};

// Data Export/Import Functions
export const exportData = (): string => {
    try {
        const data = {
            searchHistory: getSearchHistory(),
            favorites: getFavorites(),
            preferences: getUserPreferences(),
            quizScores: getQuizScores(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        return JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error exporting data:', error);
        throw new Error('Failed to export data');
    }
};

export const importData = (jsonData: string): void => {
    try {
        const data = JSON.parse(jsonData);

        if (data.searchHistory) {
            localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(data.searchHistory));
        }
        if (data.favorites) {
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
        }
        if (data.preferences) {
            localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
        }
        if (data.quizScores) {
            localStorage.setItem(STORAGE_KEYS.QUIZ_SCORES, JSON.stringify(data.quizScores));
        }
    } catch (error) {
        console.error('Error importing data:', error);
        throw new Error('Failed to import data');
    }
};

// Clear All Data
export const clearAllData = (): void => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing all data:', error);
    }
};