import React, { useEffect } from 'react';

/**
 * Responsive Video Player Modal - Phase 4
 */
const VideoPlayerModal = ({ isOpen, video, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-4xl w-full bg-stone-900 rounded-xl overflow-hidden shadow-2xl border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex justify-between items-center px-4 py-3 bg-stone-950 border-b border-stone-800 text-white">
          <div className="truncate pr-4">
            <h3 className="font-semibold text-sm sm:text-base text-amber-400 truncate">
              {video.title || 'मंदिर वीडियो दर्शन'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-gray-300 hover:text-white transition"
            title="बंद करें (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* HTML5 Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            src={video.fileUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          >
            आपका ब्राउज़र वीडियो प्लेबैक को सपोर्ट नहीं करता।
          </video>
        </div>

        {/* Video Details */}
        {video.description && (
          <div className="p-4 bg-stone-900 text-gray-300 text-xs sm:text-sm border-t border-stone-800">
            <p>{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerModal;
