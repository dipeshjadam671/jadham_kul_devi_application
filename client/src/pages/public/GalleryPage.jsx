import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicAlbums } from '../../services/galleryService';
import { formatIndianDate } from '../../utils/sanitize';

const CATEGORIES = [
  { id: 'all', label: 'सभी एल्बम' },
  { id: 'Navratri', label: 'नवरात्रि महोत्सव' },
  { id: 'Temple Event', label: 'मंदिर उत्सव एवं निर्माण' },
  { id: 'Puja', label: 'पूजा एवं आरती' },
  { id: 'Ram Navami', label: 'राम नवमी' },
  { id: 'Festival', label: 'त्यौहार एवं पर्व' },
  { id: 'General', label: 'अन्य' },
];

const GalleryPage = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        const res = await getPublicAlbums(params);
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.albums || []);
          setAlbums(list);
        }
      } catch (err) {
        console.error('Failed to fetch albums:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [selectedCategory]);

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            दिव्य दर्शन एवं स्मृतियां
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            मंदिर फोटो एवं वीडियो गैलरी
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            माँ कुलदेवी के पावन श्रृंगार, महाआरती, नवरात्रि अनुष्ठान एवं मंदिर निर्माण की अलौकिक तस्वीरें व वीडियो
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Albums Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500 text-sm">
            इस श्रेणी में कोई एल्बम उपलब्ध नहीं है।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Link
                key={album._id}
                to={`/gallery/${album.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-stone-200/80 flex flex-col"
              >
                {/* Cover Image Container */}
                <div className="relative aspect-4/3 w-full bg-stone-900 overflow-hidden">
                  <img
                    src={album.coverImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition" />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-amber-600/90 backdrop-blur-xs text-white text-xs font-semibold rounded-lg shadow-sm">
                      {album.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-xs rounded-lg flex items-center gap-1 font-medium">
                      📷 {album.photoCount || 0}
                    </span>
                    {album.videoCount > 0 && (
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs text-amber-300 text-xs rounded-lg flex items-center gap-1 font-medium">
                        🎬 {album.videoCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg group-hover:text-amber-700 transition line-clamp-1">
                      {album.name}
                    </h3>
                    {album.description && (
                      <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 mt-1.5 leading-relaxed">
                        {album.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>
                      {album.eventDate ? formatIndianDate(album.eventDate) : formatIndianDate(album.createdAt)}
                    </span>
                    <span className="font-bold text-amber-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                      दर्शन करें →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default GalleryPage;
