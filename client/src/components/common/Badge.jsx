import React from 'react';

/**
 * Reusable Badge component
 * @param {string} variant - 'saffron' | 'maroon' | 'gold' | 'success' | 'info' | 'danger' | 'neutral'
 * @param {string} size - 'sm' | 'md'
 */
export const Badge = ({
  children,
  variant = 'saffron',
  size = 'md',
  className = '',
  icon = null,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs sm:text-sm',
  };

  const variantClasses = {
    saffron: 'bg-saffron-100 text-saffron-800 border-saffron-200',
    maroon: 'bg-maroon-100 text-maroon-800 border-maroon-200',
    gold: 'bg-gold-100 text-gold-900 border-gold-300',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.saffron} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
