import React from 'react';
import { SlangDefinition } from '../types';
import { CategoryBadge } from './CategoryBadge';

interface WordOfTheDayProps {
    word: string;
    definition: SlangDefinition | null;
    onLearnMore: () => void;
}

export const WordOfTheDay: React.FC<WordOfTheDayProps> = ({
    word,
    definition,
    onLearnMore,
}) => {
    return (
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Word of the Day</h2>
                    <p className="text-sm text-gray-400">Discover trending slang</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-2xl font-bold text-cyan-300 mb-2">{word}</h3>
                    {definition ? (
                        <>
                            <p className="text-gray-300 mb-3">{definition.meaning}</p>
                            <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-400 mb-1">Example:</p>
                                <p className="text-gray-200 italic">"{definition.example}"</p>
                            </div>
                            {definition.category && (
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm text-gray-400">Category:</span>
                                    <CategoryBadge category={definition.category} size="sm" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    )}
                </div>

                <button
                    onClick={onLearnMore}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Learn More
                </button>
            </div>
        </div>
    );
};