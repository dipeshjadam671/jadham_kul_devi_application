import React from 'react';

/**
 * Reusable Page/Section Container with responsive constraints
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 */
export const Container = ({ children, size = 'lg', className = '', ...props }) => {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeClasses[size] || sizeClasses.lg} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
