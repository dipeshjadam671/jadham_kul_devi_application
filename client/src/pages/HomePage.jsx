import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTempleInfo, getTempleRules } from '../services/templeService';
import { getPublicNotices } from '../services/noticeService';
import { getPublicAlbums } from '../services/galleryService';
import { formatIndianDate } from '../utils/sanitize';

const DEFAULT_RULES_SUMMARY = [
  { _id: 'r1', order: 1, title: 'शराब एवं नशा पूर्ण प्रतिबंध' },
  { _id: 'r2', order: 2, title: 'शराब पीने पर 5 वर्ष का मढ़ बहिष्कार' },
  { _id: 'r3', order: 3, title: 'बटवारा केवल अष्मी–नवमी को मान्य' },
  { _id: 'r4', order: 4, title: 'अष्मी–नवमी पूजा सामग्री व्यवस्था' },
];

export const HomePage = () => {
  const [templeInfo, setTempleInfo] = useState(null);
  const [latestNotices, setLatestNotices] = useState([]);
  const [recentAlbums, setRecentAlbums] = useState([]);
  const [rulesSummary, setRulesSummary] = useState(DEFAULT_RULES_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [infoRes, noticeRes, albumRes, rulesRes] = await Promise.allSettled([
          getTempleInfo(),
          getPublicNotices({ limit: 3 }),
          getPublicAlbums({ limit: 3 }),
          getTempleRules({ limit: 4 }),
        ]);

        if (infoRes.status === 'fulfilled' && infoRes.value?.success) {
          setTempleInfo(infoRes.value.data);
        }

        if (noticeRes.status === 'fulfilled' && noticeRes.value?.success) {
          setLatestNotices(noticeRes.value.data?.notices || []);
        }

        if (albumRes.status === 'fulfilled' && albumRes.value?.success) {
          setRecentAlbums(albumRes.value.data?.albums || []);
        }

        if (rulesRes.status === 'fulfilled' && rulesRes.value?.success && Array.isArray(rulesRes.value.data) && rulesRes.value.data.length > 0) {
          setRulesSummary(rulesRes.value.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const info = templeInfo || {};
  const timings = info.templeTimings || {};

  return (
    <div className="flex flex-col bg-stone-50 min-h-screen">

      {/* 1. HERO SECTION - Live Database-backed Temple Branding */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-amber-950 to-stone-900 text-white py-16 sm:py-24 border-b border-amber-500/20">
        {/* Background Image Layer */}
        {info.coverImageUrl && (
          <img
            src={info.coverImageUrl}
            alt="Temple Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
          />
        )}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/70 to-stone-950" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Main Text Content */}
            <div className="lg:col-span-8 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide">
                <span>🕉️</span>
                <span>जादम कुलवंश कुलदेवी धाम, खलघाट</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-amber-100 leading-tight drop-shadow-md">
                {info.title || 'श्री जादम परिवार कुलदेवी माताजी मंदिर'}
              </h1>

              <p className="text-lg sm:text-xl text-amber-200/90 font-medium">
                {info.shortDescription || 'पवित्र नर्मदा तट पर विराजित कुलदेवी माँ का पावन धाम एवं आस्था का केंद्र'}
              </p>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
                {info.templeIntroduction
                  ? `${info.templeIntroduction.slice(0, 220)}...`
                  : 'पवित्र नर्मदा नदी के पावन तट पर स्थित कुलदेवी माँ का सिद्ध मंदिर। जादम परिवार की कुल परंपरा, आस्था, शक्ति और सामाजिक एकता का दिव्य प्रतीक।'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/about"
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-900/40 transition"
                >
                  मंदिर परिचय एवं दर्शन
                </Link>
                <Link
                  to="/history"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/30 font-semibold text-sm rounded-xl transition"
                >
                  माँ कुलदेवी का इतिहास
                </Link>
                <Link
                  to="/financial-transparency"
                  className="px-6 py-3 bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-sm rounded-xl transition"
                >
                  वित्तीय पारदर्शिता
                </Link>
              </div>
            </div>

            {/* Aarti Quick Widget */}
            <div className="lg:col-span-4">
              <div className="bg-stone-900/90 backdrop-blur-md rounded-3xl p-6 border border-amber-500/30 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h3 className="text-base font-serif font-bold text-amber-300 flex items-center gap-2">
                    <span>🪔</span> दैनिक आरती समय
                  </h3>
                  <span className="text-[10px] uppercase font-bold bg-amber-600/30 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    दैनिक दर्शन
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-stone-800/50">
                    <span className="text-stone-300">मंगला आरती</span>
                    <strong className="text-amber-400 font-bold">{timings.morningAarti || '07:00 AM'}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-stone-800/50">
                    <span className="text-stone-300">संध्या महाआरती</span>
                    <strong className="text-amber-400 font-bold">{timings.sandhyaAarti || '07:30 PM'}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-stone-800/50">
                    <span className="text-stone-300">शयन आरती</span>
                    <strong className="text-amber-400 font-bold">{timings.shayanAarti || '09:00 PM'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800/80 text-center">
                  <Link
                    to="/contact"
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition inline-flex items-center gap-1"
                  >
                    साप्ताहिक दर्शन समय-सारणी देखें →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LATEST NOTICES & EVENTS SECTION */}
      <section className="py-14 bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                महत्वपूर्ण आयोजन
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                आगामी उत्सव एवं आधिकारिक सूचनाएं
              </h2>
            </div>
            <Link
              to="/notices"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              सभी सूचनाएं देखें →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" />
            </div>
          ) : latestNotices.length === 0 ? (
            <p className="text-sm text-stone-500 py-4">वर्तमान में कोई नई सूचना प्रकाशित नहीं है।</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNotices.map((n) => (
                <div
                  key={n._id}
                  className={`bg-stone-50 rounded-2xl p-5 border flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow ${n.isPinned ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-stone-200'
                    }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-md">
                        {n.eventDate ? formatIndianDate(n.eventDate) : formatIndianDate(n.publishedAt)}
                      </span>
                      {n.isPinned && (
                        <span className="text-amber-700 font-bold">📌 मुख्य</span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-stone-900 text-base line-clamp-2">
                      <Link to={`/notices/${n.slug}`} className="hover:text-amber-700 transition">
                        {n.title}
                      </Link>
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {n.shortDescription || n.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-stone-200/60 flex items-center justify-between text-xs">
                    <span className="text-stone-500 truncate max-w-[150px]">
                      📍 {n.location || 'खलघाट'}
                    </span>
                    <Link
                      to={`/notices/${n.slug}`}
                      className="font-bold text-amber-700 hover:text-amber-800"
                    >
                      विवरण पढ़ें →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 3. PHOTO & VIDEO GALLERY PREVIEW */}
      <section className="py-14 bg-stone-100/70 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                अलौकिक स्मृतियां
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                मंदिर फोटो एवं वीडियो गैलरी
              </h2>
            </div>
            <Link
              to="/gallery"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              सम्पूर्ण गैलरी देखें →
            </Link>
          </div>

          {recentAlbums.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentAlbums.map((album) => (
                <Link
                  key={album._id}
                  to={`/gallery/${album.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-stone-200/80 flex flex-col"
                >
                  <div className="relative aspect-4/3 w-full bg-stone-900 overflow-hidden">
                    <img
                      src={album.coverImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-600/90 text-white text-xs font-semibold rounded-md shadow-xs">
                      {album.category}
                    </div>
                    <div className="absolute bottom-3 right-3 flex gap-1.5 text-xs text-white bg-black/60 px-2 py-0.5 rounded-md font-medium">
                      <span>📷 {album.photoCount || 0}</span>
                      {album.videoCount > 0 && <span>🎬 {album.videoCount}</span>}
                    </div>
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-serif font-bold text-stone-900 text-base group-hover:text-amber-700 transition line-clamp-1">
                      {album.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {album.description || 'एल्बम की तस्वीरें एवं वीडियो देखें'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500 py-4">वर्तमान में कोई गैलरी एल्बम उपलब्ध नहीं है।</p>
          )}

        </div>
      </section>

      {/* 4. TEMPLE RULES & TRANSPARENCY SECTION */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Rules Preview Box */}
            <div className="bg-amber-50/50 rounded-3xl p-6 sm:p-8 border border-amber-200/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <span>📜</span>
                  <span>आचार संहिता</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  मंदिर नियमावली (15 पावन नियम)
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  माँ कुलदेवी के पावन धाम में पवित्रता, मर्यादा और अनुशासन बनाए रखने हेतु ट्रस्ट द्वारा निर्धारित दिशा-निर्देश:
                </p>

                <div className="space-y-2 pt-2">
                  {rulesSummary.map((rule) => (
                    <div key={rule._id} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {rule.order}
                      </span>
                      <span className="font-medium">{rule.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-amber-200/60">
                <Link
                  to="/rules"
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1"
                >
                  सभी 15 नियम विस्तार से पढ़ें →
                </Link>
              </div>
            </div>

            {/* Financial Transparency Box */}
            <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <span>🛡️</span>
                  <span>पारदर्शिता एवं सुशासन</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
                  सार्वजनिक वित्तीय पारदर्शिता
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  दान का एक-एक रुपया समाज और माँ के धाम के विकास में समर्पित है। मंदिर ट्रस्ट का मासिक एवं वार्षिक वित्तीय विवरण सार्वजनिक रूप से प्रमाणित है।
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-center">
                  <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                    <span className="text-xs text-stone-400">दान सत्यापन</span>
                    <p className="font-bold text-emerald-400 text-sm mt-0.5">100% ऑडिटेड</p>
                  </div>
                  <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                    <span className="text-xs text-stone-400">कम्प्यूटरीकृत रसीद</span>
                    <p className="font-bold text-amber-400 text-sm mt-0.5">सत्यापित प्रणाली</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-800">
                <Link
                  to="/financial-transparency"
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1"
                >
                  सार्वजनिक आय-व्यय विवरण देखें →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
