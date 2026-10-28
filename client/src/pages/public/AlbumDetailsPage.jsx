import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicAlbumBySlug } from '../../services/galleryService';
import ImageLightbox from '../../components/gallery/ImageLightbox';
import VideoPlayerModal from '../../components/gallery/VideoPlayerModal';
import { formatIndianDate } from '../../utils/sanitize';

const AlbumDetailsPage = () => {
  const { slug } = useParams();
  const [album, setAlbum] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lightbox state for images
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Video modal state
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPublicAlbumBySlug(slug);
        if (res.success && res.data) {
          setAlbum(res.data.album);
          setMediaList(res.data.media || []);
        } else {
          setError('यह एल्बम उपलब्ध नहीं है अथवा हटा दिया गया है।');
        }
      } catch (err) {
        console.error('Failed to load album:', err);
        setError('एल्बम लोड करने में त्रुटि आई।');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetails();
  }, [slug]);

  // Filter only images for lightbox navigation
  const imageMediaList = mediaList.filter((m) => m.type === 'image');

  const handleMediaClick = (item) => {
    if (item.type === 'video') {
      setSelectedVideo(item);
    } else {
      const idx = imageMediaList.findIndex((m) => m._id === item._id);
      setActiveImageIndex(idx !== -1 ? idx : 0);
      setLightboxOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-4">🖼️</div>
        <h2 className="text-xl font-serif font-bold text-stone-800 mb-2">
          {error || 'एल्बम प्राप्त नहीं हो सका'}
        </h2>
        <Link
          to="/gallery"
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition mt-4"
        >
          ← सभी एल्बम देखें
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Back Link */}
        <div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-700 transition"
          >
            <span>← सभी गैलरी एल्बम</span>
          </Link>
        </div>

        {/* Album Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider">
              {album.category}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {album.eventDate ? formatIndianDate(album.eventDate) : formatIndianDate(album.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 leading-tight">
            {album.name}
          </h1>

          {album.description && (
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {album.description}
            </p>
          )}

          <div className="pt-3 border-t border-stone-100 flex items-center gap-4 text-xs font-medium text-stone-500">
            <span>📷 कुल तस्वीरें: {album.photoCount || 0}</span>
            <span>🎬 कुल वीडियो: {album.videoCount || 0}</span>
          </div>
        </div>

        {/* Media Grid */}
        {mediaList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500 text-sm">
            इस एल्बम में अभी कोई मीडिया फाइल नहीं है।
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {mediaList.map((item) => (
              <div
                key={item._id}
                onClick={() => handleMediaClick(item)}
                className="group relative aspect-square bg-stone-900 rounded-2xl overflow-hidden shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 border border-stone-200"
              >
                <img
                  src={item.thumbnailUrl || item.fileUrl}
                  alt={item.title || 'दर्शन'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />

                {/* Video Play Badge */}
                {item.type === 'video' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/50 transition">
                    <div className="w-12 h-12 rounded-full bg-amber-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {item.duration && (
                      <span className="mt-2 text-xs font-medium text-white px-2 py-0.5 bg-black/60 rounded-md">
                        {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-end p-3">
                    {item.title && (
                      <span className="text-white text-xs font-medium drop-shadow-md line-clamp-1 opacity-0 group-hover:opacity-100 transition">
                        {item.title}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        <ImageLightbox
          isOpen={lightboxOpen}
          mediaList={imageMediaList}
          currentIndex={activeImageIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageMediaList.length - 1))}
          onNext={() => setActiveImageIndex((prev) => (prev < imageMediaList.length - 1 ? prev + 1 : 0))}
        />

        {/* Video Player Modal */}
        <VideoPlayerModal
          isOpen={!!selectedVideo}
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />

      </div>
    </div>
  );
};

export default AlbumDetailsPage;
