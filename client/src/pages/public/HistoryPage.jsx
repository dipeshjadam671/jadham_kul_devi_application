import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTempleInfo } from '../../services/templeService';

const HistoryPage = () => {
  const [templeInfo, setTempleInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getTempleInfo();
        if (res.success && res.data) {
          setTempleInfo(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
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
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-amber-950 text-white min-h-[260px] flex flex-col justify-end p-8 sm:p-12">
          {info.coverImageUrl && (
            <img
              src={info.coverImageUrl}
              alt="Mata Ji Mandir"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
          
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-amber-600/80 text-amber-100 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
              पौराणिक गाथा एवं कुल गौरव
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight text-amber-200">
              माँ कुलदेवी का पावन इतिहास
            </h1>
            <p className="mt-2 text-stone-300 text-sm sm:text-base font-light">
              जादम वंश की आराध्य शक्ति, महिमा एवं पवित्र धाम की अमर कथा
            </p>
          </div>
        </div>

        {/* Section 1: Mata Ji History */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold font-serif shadow-xs">
              माँ
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                कुलदेवी माँ भगवती की महिमा एवं प्राकट्य
              </h2>
              <p className="text-xs text-stone-500">जादम गोत्र एवं वंश की रक्षक शक्ति</p>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-stone-700 text-base sm:text-lg leading-relaxed whitespace-pre-line font-serif">
            {info.mataJiHistory || `जादम वंश की आराध्य कुलदेवी माँ भगवती की कृपा से जादम कुल अनादिकाल से धर्म, परोपकार और राष्ट्र सेवा के मार्ग पर अग्रसर रहा है। जनश्रुतियों और प्राचीन अभिलेखों के अनुसार, पूर्वजों ने माँ भगवती की कठोर तपस्या कर कुल की रक्षा, वंश वृद्धि और संकट निवारण का वरदान प्राप्त किया था। नर्मदा मैया के पावन प्रवाह के समीप खलघाट की इस पवित्र भूमि पर कुलदेवी माताजी की प्राण-प्रतिष्ठा की गई, जहाँ माँ सदैव जागृत रूप में अपने भक्तों की हर मनोकामना पूर्ण करती हैं।`}
          </div>
        </div>

        {/* Section 2: Mandir History & Jirnoddhar */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center text-xl font-bold font-serif shadow-xs">
              🏛️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                मंदिर निर्माण एवं जीर्णोद्धार गाथा
              </h2>
              <p className="text-xs text-stone-500">पूर्वजों का संकल्प एवं समाज का सामूहिक सहयोग</p>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-stone-700 text-base sm:text-lg leading-relaxed whitespace-pre-line font-serif">
            {info.history || `मंदिर निर्माण का संकल्प जादम समाज के वरिष्ठ पूर्वजों द्वारा लिया गया था। नर्मदा मैया के पावन प्रवाह के समीप खलघाट की इस पवित्र धरा पर भव्य पाषाण मंदिर का निर्माण कार्य जनसहयोग एवं समाज के दानदाताओं के सहयोग से संपन्न हुआ।`}
          </div>

          <div className="pt-6 border-t border-stone-100 flex flex-wrap gap-4">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <span>निर्माण एवं जीर्णोद्धार तस्वीरें देखें</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/rules"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-xl transition"
            >
              <span>मंदिर के 15 पावन नियम</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HistoryPage;
