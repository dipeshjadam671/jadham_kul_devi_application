import React from 'react';

/**
 * Reusable Card component
 */
export const Card = ({
  children,
  header,
  footer,
  className = '',
  hoverEffect = true,
  variant = 'default',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white border-stone-200/80',
    warm: 'bg-gradient-to-b from-white to-sand-50/50 border-saffron-100',
    saffron: 'bg-gradient-to-br from-saffron-50/80 to-amber-50/40 border-saffron-200',
    outlined: 'bg-transparent border-stone-300',
  };

  const hoverClass = hoverEffect
    ? 'hover:shadow-md hover:border-saffron-300 transition-all duration-300'
    : '';

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden ${variantClasses[variant] || variantClasses.default} ${hoverClass} ${className}`}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          {header}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
