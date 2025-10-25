import React from 'react';
import { SearchHistoryItem } from '../types';
import { formatTimeAgo, formatDateTime } from '../utils/dateUtils';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSearchTerm: (term: string) => void;
  onRemoveItem: (term: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSearchTerm,
  onRemoveItem,
  onClearAll,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-40 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
        aria-label="Toggle search history"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">History</span>
        {history.length > 0 && (
          <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {history.length}
          </span>
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 border-r border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Search History</h2>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close history"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearAll}
              className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All History
            </button>
          )}
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {history.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No search history yet</p>
              <p className="text-sm mt-1">Your searches will appear here</p>
            </div>
          ) : (
            <div className="p-2">
              {history.map((item, index) => (
                <div
                  key={`${item.term}-${item.timestamp}`}
                  className="bg-gray-800 rounded-lg p-3 mb-2 hover:bg-gray-750 transition-colors cursor-pointer group"
                  onClick={() => onSearchTerm(item.term)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{item.term}</h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {item.definition.meaning}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                        {item.definition.category && (
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {item.definition.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.term);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200 ml-2"
                      aria-label={`Remove ${item.term} from history`}
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