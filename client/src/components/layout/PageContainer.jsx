import React from 'react';

/**
 * PageContainer Component
 * Provides standard responsive horizontal padding and vertical spacing for pages
 */
export const PageContainer = ({ children, className = '', maxWidth = 'max-w-7xl' }) => {
  return (
    <main className={`flex-1 w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ${className}`}>
      {children}
    </main>
  );
};

export default PageContainer;
