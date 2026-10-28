import React from 'react';

/**
 * Reusable Loading Spinner component
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} color - 'primary' | 'gold' | 'white'
 * @param {string} text - Optional label below the spinner
 */
export const LoadingSpinner = ({ size = 'md', color = 'primary', text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    primary: 'border-saffron-200 border-t-saffron-600',
    gold: 'border-gold-200 border-t-gold-600',
    white: 'border-white/30 border-t-white',
    maroon: 'border-maroon-200 border-t-maroon-700',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`rounded-full animate-spin ${sizeClasses[size] || sizeClasses.md} ${
          colorClasses[color] || colorClasses.primary
        }`}
        role="status"
        aria-label="loading"
      />
      {text && <p className="mt-3 text-sm text-stone-600 font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
