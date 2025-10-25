
export enum Category {
  INTERNET = 'Internet',
  GAMING = 'Gaming',
  GEN_Z = 'Gen Z',
  AAVE = 'AAVE',
  ABBREVIATIONS = 'Abbreviations',
  MEMES = 'Memes',
  SOCIAL_MEDIA = 'Social Media',
  MUSIC = 'Music',
  SPORTS = 'Sports',
  GENERAL = 'General',
}

export interface RelatedTerm {
  term: string;
  reason: string;
}

export interface SlangDefinition {
  meaning: string;
  example: string;
  category?: Category;
  relatedTerms?: RelatedTerm[];
}

export interface SearchHistoryItem {
  term: string;
  timestamp: number;
  definition: SlangDefinition;
}

export interface FavoriteItem {
  term: string;
  definition: SlangDefinition;
  savedAt: number;
}

export interface UserPreferences {
  autoSpeak: boolean;
  speechRate: number;
  speechVoice: string;
  theme: 'dark' | 'light';
  showHistory: boolean;
  showFavorites: boolean;
  lastWordOfDay: string;
  lastWordOfDayDate: string;
  searchCount: number;
  favoriteCount: number;
  quizHighScore: number;
  totalQuizAttempts: number;
}

export interface QuizScore {
  score: number;
  total: number;
  date: number;
}

export interface QuizQuestion {
  term: string;
  correctAnswer: string;
  options: string[];
  definition: SlangDefinition;
}
