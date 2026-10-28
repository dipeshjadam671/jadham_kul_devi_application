import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicNoticeBySlug } from '../../services/noticeService';
import { formatIndianDate } from '../../utils/sanitize';

const NoticeDetailsPage = () => {
  const { slug } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPublicNoticeBySlug(slug);
        if (res.success && res.data) {
          setNotice(res.data);
        } else {
          setError('यह सूचना उपलब्ध नहीं है अथवा हटा दी गई है।');
        }
      } catch (err) {
        console.error('Failed to fetch notice details:', err);
        setError('सूचना प्राप्त करने में समस्या आई।');
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-4">📜</div>
        <h2 className="text-xl font-serif font-bold text-stone-800 mb-2">
          {error || 'सूचना प्राप्त नहीं हो सकी'}
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          हो सकता है यह सूचना अप्रकाशित हो या लिंक बदल गया हो।
        </p>
        <Link
          to="/notices"
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
        >
          ← सभी सूचनाएं देखें
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back Link */}
        <div>
          <Link
            to="/notices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-700 transition"
          >
            <span>← सभी सूचनाएं एवं आयोजन</span>
          </Link>
        </div>

        {/* Notice Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200/80">
          
          {/* Banner Image if available */}
          {notice.bannerImageUrl && (
            <div className="w-full max-h-[400px] overflow-hidden bg-stone-900">
              <img
                src={notice.bannerImageUrl}
                alt={notice.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10 space-y-6">

            {/* Header info */}
            <div className="space-y-3 border-b border-stone-100 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                {notice.isPinned && (
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs">
                    📌 मुख्य सूचना (Pinned)
                  </span>
                )}
                <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-lg">
                  प्रकाशित: {formatIndianDate(notice.publishedAt || notice.createdAt)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 leading-tight">
                {notice.title}
              </h1>

              {/* Event Details Ribbon */}
              <div className="flex flex-wrap gap-4 pt-3 text-xs sm:text-sm text-stone-700">
                {notice.eventDate && (
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60 font-medium text-amber-900">
                    <span>🗓️ कार्यक्रम दिनांक:</span>
                    <strong>{formatIndianDate(notice.eventDate)}</strong>
                  </div>
                )}
                {notice.startTime && (
                  <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700">
                    <span>⏰ समय:</span>
                    <span>{notice.startTime} {notice.endTime ? `- ${notice.endTime}` : ''}</span>
                  </div>
                )}
                {notice.location && (
                  <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700">
                    <span>📍 स्थान:</span>
                    <span>{notice.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {notice.description}
            </div>

            {/* Share and Trust Footer */}
            <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-stone-500">
                जारीकर्ता: श्री जादम समाज कुलदेवी मंदिर ट्रस्ट, खलघाट
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition"
              >
                <span>{copied ? '✅ लिंक कॉपी हो गया!' : '🔗 सूचना शेयर करें'}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default NoticeDetailsPage;
