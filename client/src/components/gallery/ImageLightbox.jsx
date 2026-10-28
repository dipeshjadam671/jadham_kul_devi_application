import React, { useEffect } from 'react';

/**
 * Accessible Image Lightbox Modal - Phase 4
 */
const ImageLightbox = ({ isOpen, mediaList = [], currentIndex = 0, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || mediaList.length === 0) return null;

  const currentItem = mediaList[currentIndex] || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Container to stop event bubbling */}
      <div
        className="relative max-w-5xl w-full flex flex-col items-center max-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="w-full flex justify-between items-center text-white pb-3 px-2">
          <div className="text-sm font-medium opacity-80">
            {currentIndex + 1} / {mediaList.length}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
            title="बंद करें (Esc)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Image View */}
        <div className="relative w-full flex items-center justify-center max-h-[75vh] overflow-hidden">
          {/* Previous Button */}
          {mediaList.length > 1 && (
            <button
              onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition focus:outline-none"
              title="पिछला (←)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <img
            src={currentItem.fileUrl}
            alt={currentItem.title || 'दर्शन छवि'}
            className="max-h-[75vh] max-w-full object-contain rounded-md shadow-2xl transition-transform duration-200"
          />

          {/* Next Button */}
          {mediaList.length > 1 && (
            <button
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition focus:outline-none"
              title="अगला (→)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Caption & Info */}
        {(currentItem.title || currentItem.description) && (
          <div className="w-full text-center text-white mt-3 px-4 py-2 bg-black/40 rounded-lg max-w-2xl">
            {currentItem.title && <h4 className="font-semibold text-base text-amber-300">{currentItem.title}</h4>}
            {currentItem.description && <p className="text-xs text-gray-300 mt-1">{currentItem.description}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
