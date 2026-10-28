import React from 'react';

/**
 * Reusable SectionTitle with traditional Indian temple motif divider
 */
export const SectionTitle = ({
  title,
  subtitle,
  align = 'center',
  badge = '',
  className = '',
}) => {
  const alignClasses = {
    center: 'text-center items-center',
    left: 'text-left items-start',
    right: 'text-right items-end',
  };

  return (
    <div className={`flex flex-col mb-10 ${alignClasses[align] || alignClasses.center} ${className}`}>
      {badge && (
        <span className="inline-block px-3 py-1 mb-2 text-xs font-bold uppercase tracking-wider text-saffron-700 bg-saffron-100/80 rounded-full border border-saffron-200">
          {badge}
        </span>
      )}

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
        {title}
      </h2>

      {/* Traditional Temple Motif Divider */}
      <div className="flex items-center gap-2 my-3">
        <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-r from-transparent to-saffron-400"></span>
        <span className="w-2.5 h-2.5 rotate-45 bg-saffron-600 rounded-xs"></span>
        <span className="w-1.5 h-1.5 rotate-45 bg-maroon-700 rounded-xs"></span>
        <span className="w-2.5 h-2.5 rotate-45 bg-saffron-600 rounded-xs"></span>
        <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-l from-transparent to-saffron-400"></span>
      </div>

      {subtitle && (
        <p className="max-w-2xl text-sm sm:text-base text-stone-600 font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
