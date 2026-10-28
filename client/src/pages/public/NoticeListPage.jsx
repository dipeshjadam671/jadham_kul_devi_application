import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicNotices } from '../../services/noticeService';
import { formatIndianDate } from '../../utils/sanitize';

const NoticeListPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchNotices = async (currentPage = 1, search = '') => {
    try {
      setLoading(true);
      const res = await getPublicNotices({
        page: currentPage,
        limit: 9,
        search,
      });

      if (res.success && res.data) {
        setNotices(res.data.notices || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalItems(res.data.pagination?.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(page, searchTerm);
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNotices(1, searchTerm);
  };

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            मंदिर समाचार एवं आयोजन
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            आगामी उत्सव, पर्व एवं आधिकारिक सूचनाएं
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            माँ कुलदेवी मंदिर खलघाट में आयोजित होने वाले आगामी धार्मिक अनुष्ठान, महायज्ञ, बैठकें एवं महत्वपूर्ण सूचनाएं
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="सूचना या कार्यक्रम खोजें..."
              className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              खोजें
            </button>
          </form>

          <div className="text-xs font-medium text-stone-500">
            कुल सूचनाएं: <span className="font-bold text-stone-800">{totalItems}</span>
          </div>
        </div>

        {/* Notices Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500 text-sm">
            वर्तमान में कोई सूचना उपलब्ध नहीं है।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className={`bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between border ${
                  notice.isPinned
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : 'border-stone-200/80'
                }`}
              >
                {/* Banner Thumbnail if available */}
                {notice.bannerImageUrl ? (
                  <div className="h-44 w-full overflow-hidden relative">
                    <img
                      src={notice.bannerImageUrl}
                      alt={notice.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {notice.isPinned && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm">
                        📌 मुख्य सूचना
                      </span>
                    )}
                  </div>
                ) : (
                  notice.isPinned && (
                    <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                      <span>📌 मुख्य सूचना (Pinned Notice)</span>
                    </div>
                  )
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* Date / Time Badge */}
                    <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                      <span className="bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                        🗓️ {notice.eventDate ? formatIndianDate(notice.eventDate) : formatIndianDate(notice.publishedAt)}
                      </span>
                      {notice.startTime && (
                        <span className="text-stone-500">
                          ⏰ {notice.startTime} {notice.endTime ? `- ${notice.endTime}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif font-bold text-stone-900 text-base line-clamp-2 hover:text-amber-700 transition">
                      <Link to={`/notices/${notice.slug}`}>
                        {notice.title}
                      </Link>
                    </h3>

                    {/* Short Description */}
                    <p className="text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                      {notice.shortDescription || notice.description}
                    </p>
                  </div>

                  {/* Location & Read More Button */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500 truncate max-w-[160px]">
                      📍 {notice.location || 'खलघाट'}
                    </span>
                    <Link
                      to={`/notices/${notice.slug}`}
                      className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      <span>विस्तार से पढ़ें</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-semibold bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition"
            >
              ← पिछला
            </button>
            <span className="text-xs text-stone-600 font-medium px-2">
              पृष्ठ {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-xs font-semibold bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition"
            >
              अगला →
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default NoticeListPage;
