import React, { useState } from 'react';

/**
 * Reusable Confirmation & Action Modal - Phase 3
 * Supports:
 * - Simple confirm/cancel (e.g. Verify donation, Archive record)
 * - Input textarea prompt (e.g. Reject reason)
 */
export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'पुष्टि करें (Confirm)',
  cancelText = 'रद्द करें (Cancel)',
  confirmVariant = 'primary', // 'primary', 'success', 'danger'
  requireReason = false,
  reasonPlaceholder = 'कारण दर्ज करें (Reason is required)...',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('कारण दर्ज करना अनिवार्य है (Reason is required)');
      return;
    }
    setError('');
    onConfirm(requireReason ? reason.trim() : null);
  };

  const getButtonStyles = () => {
    switch (confirmVariant) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'primary':
      default:
        return 'bg-amber-600 hover:bg-amber-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-serif text-lg font-bold text-stone-900">{title}</h3>
        <p className="mt-2 text-sm text-stone-600">{message}</p>

        {requireReason && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-stone-700">
              कारण (Reason) *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={reasonPlaceholder}
              className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-xs disabled:opacity-50 ${getButtonStyles()}`}
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
