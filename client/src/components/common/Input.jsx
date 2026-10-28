import React from 'react';

/**
 * Reusable Form Input Component
 */
export const Input = ({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  icon = null,
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-stone-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full rounded-lg border text-sm transition-colors py-2.5 ${
            icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 ${
            error
              ? 'border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-red-200'
              : 'border-stone-300 bg-white text-stone-800 hover:border-stone-400 focus:border-saffron-500 focus:ring-saffron-200'
          } focus:outline-none focus:ring-2 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed`}
          {...props}
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-stone-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
