import React from 'react';
import { Category } from '../types';

interface CategoryBadgeProps {
    category: Category;
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

const getCategoryColor = (category: Category): string => {
    switch (category) {
        case Category.INTERNET:
            return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
        case Category.GAMING:
            return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
        case Category.GEN_Z:
            return 'bg-pink-600/20 text-pink-300 border-pink-500/30';
        case Category.AAVE:
            return 'bg-orange-600/20 text-orange-300 border-orange-500/30';
        case Category.ABBREVIATIONS:
            return 'bg-green-600/20 text-green-300 border-green-500/30';
        case Category.MEMES:
            return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
        case Category.SOCIAL_MEDIA:
            return 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30';
        case Category.MUSIC:
            return 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30';
        case Category.SPORTS:
            return 'bg-red-600/20 text-red-300 border-red-500/30';
        default:
            return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
    switch (size) {
        case 'sm':
            return 'px-2 py-1 text-xs';
        case 'md':
            return 'px-3 py-1 text-sm';
        case 'lg':
            return 'px-4 py-2 text-base';
        default:
            return 'px-3 py-1 text-sm';
    }
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
    category,
    size = 'md',
    onClick,
}) => {
    const colorClasses = getCategoryColor(category);
    const sizeClasses = getSizeClasses(size as 'sm' | 'md' | 'lg');
    const baseClasses = 'inline-flex items-center font-medium rounded-full border transition-all duration-300';

    const classes = onClick
        ? `${baseClasses} ${colorClasses} ${sizeClasses} cursor-pointer hover:scale-105 hover:shadow-lg`
        : `${baseClasses} ${colorClasses} ${sizeClasses}`;

    return (
        <span className={classes} onClick={onClick}>
            {category}
        </span>
    );
};

// Category Filter Component
interface CategoryFilterProps {
    selectedCategory: Category | null;
    onCategorySelect: (category: Category | null) => void;
    availableCategories: Category[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    selectedCategory,
    onCategorySelect,
    availableCategories,
}) => {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <button
                onClick={() => onCategorySelect(null)}
                className={`px-3 py-1 text-sm font-medium rounded-full border transition-all duration-300 ${selectedCategory === null
                    ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30'
                    : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-600/50 hover:text-gray-300'
                    }`}
            >
                All
            </button>
            {(availableCategories || []).map((category) => (
                <CategoryBadge
                    key={category}
                    category={category}
                    size="sm"
                    onClick={() => onCategorySelect(category)}
                />
            ))}
        </div>
    );
};