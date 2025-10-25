import React from 'react';
import { RelatedTerm } from '../types';

interface RelatedTermsProps {
    relatedTerms: RelatedTerm[];
    onSearchTerm: (term: string) => void;
}

export const RelatedTerms: React.FC<RelatedTermsProps> = ({
    relatedTerms,
    onSearchTerm,
}) => {
    if (!relatedTerms || relatedTerms.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Related Terms
            </h3>
            <div className="flex flex-wrap gap-2">
                {relatedTerms.map((relatedTerm, index) => (
                    <button
                        key={`${relatedTerm.term}-${index}`}
                        onClick={() => onSearchTerm(relatedTerm.term)}
                        className="group bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 flex items-center gap-2"
                        title={relatedTerm.reason}
                    >
                        <span className="font-medium">{relatedTerm.term}</span>
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Click any term to search for its definition
            </p>
        </div>
    );
};