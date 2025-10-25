import React, { useState } from 'react';
import { UserPreferences } from '../types';

interface SettingsProps {
    preferences: UserPreferences;
    onPreferencesChange: (preferences: Partial<UserPreferences>) => void;
    onExportData: () => void;
    onImportData: (file: File) => void;
    onClearAllData: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
    preferences,
    onPreferencesChange,
    onExportData,
    onImportData,
    onClearAllData,
    isOpen,
    onToggle,
}) => {
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportData(file);
        }
    };

    const handleClearAllData = () => {
        onClearAllData();
        setShowClearConfirm(false);
        onToggle();
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="fixed bottom-4 right-4 z-40 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
                aria-label="Open settings"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {/* Settings Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Settings</h2>
                        <button
                            onClick={onToggle}
                            className="text-gray-400 hover:text-white transition-colors"
                            aria-label="Close settings"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-full pb-20 p-4 space-y-6">
                    {/* Speech Settings */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Speech</h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between">
                                <span className="text-gray-300">Auto-speak</span>
                                <input
                                    type="checkbox"
                                    checked={preferences.autoSpeak}
                                    onChange={(e) => onPreferencesChange({ autoSpeak: e.target.checked })}
                                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                                />
                            </label>
                            
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">Speech Rate</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={preferences.speechRate}
                                    onChange={(e) => onPreferencesChange({ speechRate: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    aria-label={`Speech rate: ${preferences.speechRate}x`}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Slow</span>
                                    <span className="text-cyan-400 font-medium">{preferences.speechRate}x</span>
                                    <span>Fast</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Display Settings */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Display</h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between">
                                <span className="text-gray-300">Show history</span>
                                <input
                                    type="checkbox"
                                    checked={preferences.showHistory}
                                    onChange={(e) => onPreferencesChange({ showHistory: e.target.checked })}
                                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                                />
                            </label>
                            
                            <label className="flex items-center justify-between">
                                <span className="text-gray-300">Show favorites</span>
                                <input
                                    type="checkbox"
                                    checked={preferences.showFavorites}
                                    onChange={(e) => onPreferencesChange({ showFavorites: e.target.checked })}
                                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Stats</h3>
                        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Searches:</span>
                                <span className="text-white font-medium">{preferences.searchCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Favorites:</span>
                                <span className="text-white font-medium">{preferences.favoriteCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Quiz Score:</span>
                                <span className="text-white font-medium">{preferences.quizHighScore}</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Data</h3>
                        <div className="space-y-2">
                            <button
                                onClick={onExportData}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                            >
                                Export Data
                            </button>
                            
                            <label className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm cursor-pointer flex items-center justify-center">
                                Import Data
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileImport}
                                    className="hidden"
                                />
                            </label>
                            
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                            >
                                Clear All Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-gray-700">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-2">Clear All Data?</h3>
                            <p className="text-gray-400 mb-4 text-sm">
                                This will permanently delete all your data. This action cannot be undone.
                            </p>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllData}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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