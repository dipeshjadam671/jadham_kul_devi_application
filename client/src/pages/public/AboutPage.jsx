import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTempleInfo } from '../../services/templeService';

const AboutPage = () => {
  const [templeInfo, setTempleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await getTempleInfo();
        if (res.success && res.data) {
          setTempleInfo(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch temple info:', err);
        setError('मंदिर विवरण लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  const info = templeInfo || {};

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center text-9xl font-serif">
            ॐ
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-3 py-1 bg-amber-600/60 backdrop-blur-xs text-amber-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-4 border border-amber-400/30">
              पावन परिचय एवं मंदिर दर्शन
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight">
              {info.title || 'श्री जादम परिवार कुलदेवी माताजी मंदिर, खलघाट'}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-amber-100 font-light leading-relaxed">
              {info.shortDescription || 'पवित्र नर्मदा तट पर विराजित कुलदेवी माँ का पावन धाम एवं आस्था का केंद्र'}
            </p>
            {info.description && (
              <p className="mt-2 text-xs sm:text-sm text-amber-200/90 font-mono">
                {info.description}
              </p>
            )}
          </div>
        </div>

        {/* Temple Introduction */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">
                मंदिर परिचय (Introduction)
              </h2>
              <p className="text-xs text-stone-500">पवित्र नर्मदा तीर्थ खलघाट</p>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {info.templeIntroduction || 'मध्य प्रदेश के पावन नर्मदा तट पर खलघाट में स्थित श्री जादम परिवार कुलदेवी माताजी मंदिर समस्त जादम वंशजों एवं श्रद्धालुओं की आस्था का केंद्र है।'}
          </div>

          {/* Quick Links inside About */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap gap-4">
            <Link
              to="/history"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <span>माँ कुलदेवी का इतिहास पढ़ें</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/rules"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-xl transition"
            >
              <span>मंदिर नियमावली देखें</span>
            </Link>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-xl transition"
            >
              <span>फोटो एवं वीडियो गैलरी</span>
            </Link>
          </div>
        </div>

        {/* Location & Contact Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6">
            <h3 className="font-serif font-bold text-lg text-stone-800 flex items-center gap-2 mb-3">
              <span className="text-amber-600">📍</span> पावन स्थल एवं पता
            </h3>
            <p className="text-stone-700 text-sm leading-relaxed mb-4">
              {info.address || 'नर्मदा तट, मुख्य राष्ट्रीय राजमार्ग 52, खलघाट'}
            </p>
            <p className="text-xs text-stone-500 mb-4">
              {info.village && `${info.village}, `}
              {info.district && `जिला ${info.district}, `}
              {info.state && `${info.state} - `}
              {info.pincode}
            </p>
            {info.googleMapsUrl && (
              <a
                href={info.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg transition"
              >
                <span>गूगल मैप्स पर दिशा-निर्देश प्राप्त करें</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* Aarti & Darshan Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6">
            <h3 className="font-serif font-bold text-lg text-stone-800 flex items-center gap-2 mb-3">
              <span className="text-amber-600">⏰</span> दैनिक आरती समय
            </h3>
            <div className="space-y-2.5 text-sm text-stone-700 mb-4">
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="font-medium">प्रातः मंगला आरती</span>
                <span className="font-bold text-amber-700">{info.templeTimings?.morningAarti || '07:00 AM'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="font-medium">संध्या महाआरती</span>
                <span className="font-bold text-amber-700">{info.templeTimings?.sandhyaAarti || '07:30 PM'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-medium">शयन आरती</span>
                <span className="font-bold text-amber-700">{info.templeTimings?.shayanAarti || '09:00 PM'}</span>
              </div>
            </div>
            <Link
              to="/contact"
              className="text-xs font-semibold text-stone-600 hover:text-amber-700 inline-flex items-center gap-1"
            >
              सम्पूर्ण सप्ताह की दर्शन समय-सारणी देखें →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
