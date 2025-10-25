// Modern UI Components for 21st Century Experience
import React, { useState, useEffect, useRef } from 'react';

// Modern Button Component
interface ModernButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    loading = false,
    className = '',
    icon,
}) => {
    const [isPressed, setIsPressed] = useState(false);

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg'
    };

    const variantClasses = {
        primary: 'modern-btn-primary',
        secondary: 'modern-btn-secondary',
        ghost: 'modern-btn-ghost'
    };

    return (
        <button
            className={`modern-btn ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${loading ? 'modern-loading' : ''}`}
            onClick={onClick}
            disabled={disabled || loading}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            style={{
                transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                transition: 'transform 0.1s ease'
            }}
        >
            {icon && <span className="modern-icon">{icon}</span>}
            {loading ? 'Loading...' : children}
        </button>
    );
};

// Modern Input Component
interface ModernInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
    label?: string;
}

export const ModernInput: React.FC<ModernInputProps> = ({
    value,
    onChange,
    placeholder,
    type = 'text',
    disabled = false,
    className = '',
    icon,
    label,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block modern-text-sm modern-mb-sm font-medium">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 modern-icon text-white/60">
                        {icon}
                    </div>
                )}
                <input
                    ref={inputRef}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`modern-input ${icon ? 'pl-10' : ''} ${isFocused ? 'modern-focus' : ''}`}
                />
            </div>
        </div>
    );
};

// Modern Card Component
interface ModernCardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
    onClick?: () => void;
    hover?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
    children,
    className = '',
    interactive = false,
    onClick,
    hover = true,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`modern-card ${interactive ? 'modern-card-interactive' : ''} ${hover ? 'modern-hover-lift' : ''} ${className}`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                cursor: interactive ? 'pointer' : 'default',
                transform: isHovered && hover ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {children}
        </div>
    );
};

// Modern Chip Component
interface ModernChipProps {
    label: string;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
}

export const ModernChip: React.FC<ModernChipProps> = ({
    label,
    selected = false,
    onClick,
    className = '',
    icon,
}) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <button
            className={`modern-chip ${selected ? 'modern-chip-selected' : ''} ${className}`}
            onClick={onClick}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            style={{
                transform: isPressed ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.1s ease'
            }}
        >
            {icon && <span className="modern-icon">{icon}</span>}
            {label}
        </button>
    );
};

// Modern Typography Components
interface ModernHeadingProps {
    children: React.ReactNode;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    gradient?: boolean;
}

export const ModernHeading: React.FC<ModernHeadingProps> = ({
    children,
    level = 1,
    className = '',
    gradient = false,
}) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    const sizeClass = {
        1: 'modern-heading-xl',
        2: 'modern-heading-lg',
        3: 'modern-heading-md',
        4: 'modern-heading-md',
        5: 'modern-heading-md',
        6: 'modern-heading-md'
    }[level];

    return (
        <Tag className={`modern-heading ${sizeClass} ${gradient ? 'modern-gradient-text' : ''} ${className}`}>
            {children}
        </Tag>
    );
};

interface ModernTextProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const ModernText: React.FC<ModernTextProps> = ({
    children,
    size = 'md',
    className = '',
}) => {
    const sizeClass = {
        sm: 'modern-text-sm',
        md: 'modern-text',
        lg: 'modern-text-lg'
    }[size];

    return (
        <p className={`${sizeClass} ${className}`}>
            {children}
        </p>
    );
};

// Modern Container Component
interface ModernContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const ModernContainer: React.FC<ModernContainerProps> = ({
    children,
    className = '',
    maxWidth = 'xl',
}) => {
    const maxWidthClass = {
        sm: 'max-w-2xl',
        md: 'max-w-4xl',
        lg: 'max-w-6xl',
        xl: 'max-w-7xl',
        '2xl': 'max-w-none'
    }[maxWidth];

    return (
        <div className={`modern-container ${maxWidthClass} ${className}`}>
            {children}
        </div>
    );
};

// Modern Grid Component
interface ModernGridProps {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4;
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const ModernGrid: React.FC<ModernGridProps> = ({
    children,
    cols = 3,
    gap = 'md',
    className = '',
}) => {
    const colsClass = {
        1: 'grid-cols-1',
        2: 'modern-grid-2',
        3: 'modern-grid-3',
        4: 'grid-cols-4'
    }[cols];

    const gapClass = {
        sm: 'modern-gap-sm',
        md: 'modern-gap-md',
        lg: 'modern-gap-lg'
    }[gap];

    return (
        <div className={`modern-grid ${colsClass} ${gapClass} ${className}`}>
            {children}
        </div>
    );
};

// Modern Loading Component
interface ModernLoadingProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export const ModernLoading: React.FC<ModernLoadingProps> = ({
    size = 'md',
    text = 'Loading...',
}) => {
    const sizeClass = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    }[size];

    return (
        <div className="modern-flex-center modern-gap-md">
            <div className={`${sizeClass} border-2 border-white/20 border-t-white rounded-full animate-spin`}></div>
            {text && <ModernText className="modern-text-sm">{text}</ModernText>}
        </div>
    );
};

// Modern Floating Action Button
interface ModernFABProps {
    icon: React.ReactNode;
    onClick?: () => void;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    className?: string;
}

export const ModernFAB: React.FC<ModernFABProps> = ({
    icon,
    onClick,
    position = 'bottom-right',
    className = '',
}) => {
    const positionClass = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6'
    }[position];

    return (
        <button
            className={`fixed ${positionClass} w-14 h-14 modern-glass rounded-full modern-flex-center modern-hover-lift modern-hover-glow z-50 ${className}`}
            onClick={onClick}
        >
            <span className="modern-icon-lg">{icon}</span>
        </button>
    );
};

// Modern Search Bar Component
interface ModernSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: () => void;
    placeholder?: string;
    loading?: boolean;
    onVoiceClick?: () => void;
    isListening?: boolean;
    className?: string;
}

export const ModernSearchBar: React.FC<ModernSearchBarProps> = ({
    value,
    onChange,
    onSearch,
    placeholder = 'Search...',
    loading = false,
    onVoiceClick,
    isListening = false,
    className = '',
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`modern-glass-card ${className}`}>
            <div className="modern-flex modern-gap-md">
                <div className="flex-1">
                    <ModernInput
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                    />
                </div>
                <div className="modern-flex modern-gap-sm">
                    <ModernButton
                        variant="primary"
                        onClick={onSearch}
                        disabled={loading || !value.trim()}
                        loading={loading}
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                    >
                        Search
                    </ModernButton>
                    {onVoiceClick && (
                        <ModernButton
                            variant={isListening ? 'primary' : 'secondary'}
                            onClick={onVoiceClick}
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            }
                        >
                            {isListening ? 'Stop' : 'Voice'}
                        </ModernButton>
                    )}
                </div>
            </div>
        </div>
    );
};

// Modern Definition Card Component
interface ModernDefinitionCardProps {
    term: string;
    definition: {
        meaning: string;
        example: string;
        category: string;
        relatedTerms?: Array<{ term: string; reason: string }>;
    };
    onSpeak?: () => void;
    onToggleFavorite?: () => void;
    isFavorite?: boolean;
    className?: string;
}

export const ModernDefinitionCard: React.FC<ModernDefinitionCardProps> = ({
    term,
    definition,
    onSpeak,
    onToggleFavorite,
    isFavorite = false,
    className = '',
}) => {
    return (
        <ModernCard className={`modern-fade-in ${className}`}>
            <div className="modern-flex-between modern-mb-lg">
                <div>
                    <ModernHeading level={2} gradient className="modern-mb-sm">
                        {term}
                    </ModernHeading>
                    <ModernChip label={definition.category} />
                </div>
                <div className="modern-flex modern-gap-sm">
                    {onSpeak && (
                        <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={onSpeak}
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            }
                        />
                    )}
                    {onToggleFavorite && (
                        <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={onToggleFavorite}
                            icon={
                                <svg className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.329 1.176l1.519 4.674c.3.921-.755 1.688-1.539 1.175l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.513-1.83-.254-1.539-1.175l1.519-4.674a1 1 0 00-.329-1.176l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                                </svg>
                            }
                        />
                    )}
                </div>
            </div>

            <div className="modern-space-y-lg">
                <div>
                    <ModernText className="modern-mb-sm font-semibold">Meaning:</ModernText>
                    <ModernText className="modern-text-lg">{definition.meaning}</ModernText>
                </div>

                <div>
                    <ModernText className="modern-mb-sm font-semibold">Example:</ModernText>
                    <ModernText className="modern-text-lg italic">"{definition.example}"</ModernText>
                </div>

                {definition.relatedTerms && definition.relatedTerms.length > 0 && (
                    <div>
                        <ModernText className="modern-mb-sm font-semibold">Related Terms:</ModernText>
                        <div className="modern-flex modern-gap-sm flex-wrap">
                            {definition.relatedTerms.map((related, index) => (
                                <ModernChip
                                    key={index}
                                    label={related.term}
                                    className="modern-hover-lift"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ModernCard>
    );
};
