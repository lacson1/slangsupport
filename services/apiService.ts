import { SlangDefinition, SearchHistoryItem, FavoriteItem, UserPreferences, QuizScore } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
};

// Authentication API
export const authAPI = {
  register: async (email: string, username: string, password: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  getProfile: () => apiRequest('/auth/profile'),

  updateProfile: (data: { username?: string; email?: string }) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Search API
export const searchAPI = {
  getDefinition: async (term: string): Promise<SlangDefinition> => {
    const response = await apiRequest('/search', {
      method: 'POST',
      body: JSON.stringify({ term }),
    });
    return response.definition;
  },

  getSuggestions: () => apiRequest('/search/suggestions'),

  getTrending: () => apiRequest('/search/trending'),
};

// Favorites API
export const favoritesAPI = {
  getFavorites: (): Promise<FavoriteItem[]> =>
    apiRequest('/favorites').then(res => res.favorites),

  addFavorite: (term: string, definition: SlangDefinition) =>
    apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({ term, definition }),
    }),

  removeFavorite: (term: string) =>
    apiRequest(`/favorites/${encodeURIComponent(term)}`, {
      method: 'DELETE',
    }),

  clearFavorites: () =>
    apiRequest('/favorites', {
      method: 'DELETE',
    }),
};

// History API
export const historyAPI = {
  getHistory: (page = 1, limit = 50) =>
    apiRequest(`/history?page=${page}&limit=${limit}`),

  removeFromHistory: (id: string) =>
    apiRequest(`/history/${id}`, {
      method: 'DELETE',
    }),

  clearHistory: () =>
    apiRequest('/history', {
      method: 'DELETE',
    }),
};

// Quiz API
export const quizAPI = {
  getScores: (): Promise<QuizScore[]> =>
    apiRequest('/quiz/scores').then(res => res.scores),

  saveScore: (score: number, total: number) =>
    apiRequest('/quiz/score', {
      method: 'POST',
      body: JSON.stringify({ score, total }),
    }),

  getStats: () => apiRequest('/quiz/stats'),
};

// Preferences API
export const preferencesAPI = {
  getPreferences: (): Promise<UserPreferences> =>
    apiRequest('/preferences').then(res => res.preferences),

  updatePreferences: (preferences: Partial<UserPreferences>) =>
    apiRequest('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),

  resetPreferences: () =>
    apiRequest('/preferences/reset', {
      method: 'POST',
    }),
};

// Word of the Day API
export const wordOfDayAPI = {
  getWordOfTheDay: () => apiRequest('/word-of-day'),

  getHistory: (limit = 30) =>
    apiRequest(`/word-of-day/history?limit=${limit}`),
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Get current user from token (basic implementation)
export const getCurrentUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
};