import React from 'react';

interface MaterialButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const MaterialButton: React.FC<MaterialButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false,
}) => {
  const sizeClasses = {
    small: 'px-3 py-1 text-sm min-h-8',
    medium: 'px-4 py-2 text-sm min-h-10',
    large: 'px-6 py-3 text-base min-h-12',
  };

  const variantClasses = {
    primary: 'md-button md-button-primary',
    secondary: 'md-button md-button-secondary',
    text: 'md-button md-button-text',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
};

interface MaterialTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'password' | 'search';
  className?: string;
}

export const MaterialTextField: React.FC<MaterialTextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  helperText,
  type = 'text',
  className = '',
}) => {
  return (
    <div className={`md-text-field ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ' '}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
      <label className="md-text-field-label">{label}</label>
      {error && (
        <span className="md-caption text-red-500 mt-1">{error}</span>
      )}
      {helperText && !error && (
        <span className="md-caption mt-1">{helperText}</span>
      )}
    </div>
  );
};

interface MaterialChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const MaterialChip: React.FC<MaterialChipProps> = ({
  label,
  selected = false,
  onClick,
  onDelete,
  className = '',
}) => {
  return (
    <div
      className={`
        md-chip
        ${selected ? 'md-chip-selected' : ''}
        ${className}
      `.trim()}
      onClick={onClick}
    >
      <span>{label}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-1"
          aria-label={`Remove ${label}`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

interface MaterialCardProps {
  children: React.ReactNode;
  elevation?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  onClick?: () => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  children,
  elevation = 1,
  className = '',
  onClick,
}) => {
  const elevationClasses = {
    1: 'md-card',
    2: 'md-card-elevated',
    3: 'md-card-elevated',
    4: 'md-card-elevated',
    5: 'md-card-elevated',
  };

  return (
    <div
      className={`
        ${elevationClasses[elevation]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `.trim()}
      onClick={onClick}
      style={{
        boxShadow: elevation > 2 ? `var(--md-elevation-${elevation})` : undefined,
      }}
    >
      {children}
    </div>
  );
};

interface MaterialAppBarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const MaterialAppBar: React.FC<MaterialAppBarProps> = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <header className={`md-app-bar ${className}`}>
      <div className="md-app-bar-content">
        <div>
          <h1 className="md-h1">{title}</h1>
          {subtitle && <p className="md-body2 opacity-90">{subtitle}</p>}
        </div>
        {children && <div className="md-flex md-items-center md-gap-md">{children}</div>}
      </div>
    </header>
  );
};

interface MaterialContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const MaterialContainer: React.FC<MaterialContainerProps> = ({
  children,
  maxWidth = 'lg',
  className = '',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`md-container ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );
};

interface MaterialGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MaterialGrid: React.FC<MaterialGridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className = '',
}) => {
  const columnClasses = {
    2: 'md-grid md-grid-2',
    3: 'md-grid md-grid-3',
    4: 'md-grid md-grid-4',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={`${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

interface MaterialTypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default';
  className?: string;
}

export const MaterialTypography: React.FC<MaterialTypographyProps> = ({
  children,
  variant = 'body1',
  color = 'default',
  className = '',
}) => {
  const variantClasses = {
    h1: 'md-h1',
    h2: 'md-h2',
    h3: 'md-h3',
    body1: 'md-body1',
    body2: 'md-body2',
    caption: 'md-caption',
  };

  const colorClasses = {
    primary: 'md-text-primary',
    secondary: 'md-text-secondary',
    success: 'md-text-success',
    warning: 'md-text-warning',
    error: 'md-text-error',
    default: '',
  };

  const Tag = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';

  return (
    <Tag className={`${variantClasses[variant]} ${colorClasses[color]} ${className}`}>
      {children}
    </Tag>
  );
};
