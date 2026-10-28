import React from 'react';

/**
 * Reusable Alert Component
 * @param {string} type - 'info' | 'success' | 'warning' | 'error'
 */
export const Alert = ({
  type = 'info',
  title = '',
  children,
  className = '',
  onClose,
}) => {
  const typeStyles = {
    info: {
      container: 'bg-blue-50/80 border-blue-200 text-blue-900',
      icon: 'text-blue-600',
    },
    success: {
      container: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: 'text-emerald-600',
    },
    warning: {
      container: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: 'text-amber-600',
    },
    error: {
      container: 'bg-rose-50/80 border-rose-200 text-rose-900',
      icon: 'text-rose-600',
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 p-4 rounded-xl border ${style.container} ${className}`}
    >
      <div className="flex-1 text-sm">
        {title && <h4 className="font-bold text-base mb-1">{title}</h4>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-stone-400 hover:text-stone-600 focus:outline-none p-1"
          aria-label="Close"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
