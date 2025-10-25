import React, { useState } from 'react';
import { FavoriteItem, Category } from '../types';
import { formatTimeAgo } from '../utils/dateUtils';
import { CategoryBadge } from './CategoryBadge';

interface FavoritesProps {
  favorites: FavoriteItem[];
  onSearchTerm: (term: string) => void;
  onRemoveFavorite: (term: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Favorites: React.FC<FavoritesProps> = ({
  favorites,
  onSearchTerm,
  onRemoveFavorite,
  onClearAll,
  isOpen,
  onToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Filter favorites based on search and category
  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.definition.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || favorite.definition.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get available categories from favorites
  const availableCategories = Array.from(new Set(
    favorites.map(f => f.definition.category).filter(Boolean)
  )) as Category[];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-40 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
        aria-label="Toggle favorites"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="hidden sm:inline">Favorites</span>
        {favorites.length > 0 && (
          <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {favorites.length}
          </span>
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Favorites</h2>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close favorites"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />

            {availableCategories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${selectedCategory === null
                      ? 'bg-pink-600/20 text-pink-300 border-pink-500/30'
                      : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-600/50'
                    }`}
                >
                  All
                </button>
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${selectedCategory === category
                        ? 'bg-pink-600/20 text-pink-300 border-pink-500/30'
                        : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-600/50'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {favorites.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All Favorites
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {favorites.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p>No favorites yet</p>
              <p className="text-sm mt-1">Star definitions to save them here</p>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No favorites match your search</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredFavorites.map((favorite, index) => (
                <div
                  key={`${favorite.term}-${favorite.savedAt}`}
                  className="bg-gray-800 rounded-lg p-3 mb-2 hover:bg-gray-750 transition-colors cursor-pointer group"
                  onClick={() => onSearchTerm(favorite.term)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium truncate">{favorite.term}</h3>
                        <svg className="w-4 h-4 text-pink-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {favorite.definition.meaning}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(favorite.savedAt)}
                        </span>
                        {favorite.definition.category && (
                          <CategoryBadge category={favorite.definition.category} size="sm" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(favorite.term);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200 ml-2"
                      aria-label={`Remove ${favorite.term} from favorites`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}
    </>
  );
};