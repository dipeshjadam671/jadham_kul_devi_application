import React, { useEffect } from 'react';
import Button from './Button';

/**
 * Reusable Modal Dialog Placeholder Component
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Content */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden transform transition-all`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <h3 className="text-lg font-bold text-stone-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-500"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer ? (
          <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex justify-end gap-2">
            {footer}
          </div>
        ) : (
          <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              बंद करें
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
