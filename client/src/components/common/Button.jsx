import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Reusable Button Component
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'gold' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} isLoading - Shows spinner and disables button
 * @param {boolean} fullWidth - Expands to 100% width
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  icon = null,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-4 py-2.5 text-sm font-semibold',
    lg: 'px-6 py-3 text-base font-bold',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white hover:from-saffron-600 hover:to-saffron-700 focus:ring-saffron-500 shadow-saffron-500/20',
    secondary:
      'bg-gradient-to-r from-maroon-700 to-maroon-800 text-white hover:from-maroon-800 hover:to-maroon-900 focus:ring-maroon-700 shadow-maroon-700/20',
    gold:
      'bg-gradient-to-r from-gold-500 to-gold-600 text-stone-900 hover:from-gold-600 hover:to-gold-700 focus:ring-gold-500 shadow-gold-500/20',
    outline:
      'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 hover:border-stone-400 focus:ring-saffron-500',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" color={variant === 'outline' || variant === 'gold' ? 'primary' : 'white'} />
          <span className="ml-2">कृपया प्रतीक्षा करें...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2 -ml-0.5">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
