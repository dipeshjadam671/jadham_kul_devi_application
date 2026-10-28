import React, { useState, useEffect } from 'react';
import { getTempleInfo } from '../../services/templeService';

const ContactPage = () => {
  const [templeInfo, setTempleInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await getTempleInfo();
        if (res.success && res.data) {
          setTempleInfo(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch contact info:', err);
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
  const timings = info.templeTimings || {};
  const weeklyDays = timings.days || [];

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            संपर्क एवं दर्शन समय
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            मंदिर कार्यालय संपर्क एवं दर्शन समय-सारणी
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            माँ कुलदेवी धाम खलघाट की यात्रा, दर्शन, पूजा व्यवस्था अथवा दान से संबंधित किसी भी जानकारी हेतु ट्रस्ट कार्यालय से संपर्क करें।
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phone Box */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl mb-4">
              📞
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base mb-2">फोन संपर्क</h3>
            <p className="text-sm font-semibold text-stone-700">{info.contactMobile || '+91 9977788693'}</p>
            <p className="text-xs text-stone-500 mt-2">कार्यालय समय: प्रातः 09:00 से सायं 06:00</p>
          </div>

          {/* Email Box */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl mb-4">
              ✉️
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base mb-2">ईमेल</h3>
            <p className="text-sm font-semibold text-stone-700">{info.contactEmail || 'dipeshjadam671@gmail.com'}</p>
            <p className="text-xs text-stone-500 mt-2">आधिकारिक पत्राचार एवं सूचना हेतु</p>
          </div>

          {/* Location Box */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl mb-4">
              📍
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base mb-2">मंदिर पता</h3>
            <p className="text-xs text-stone-700 leading-relaxed text-center">
              {info.address || 'नर्मदा तट मार्ग, खलघाट'}<br />
              तहसील धरमपुरी, जिला धार (म.प्र.) - 454552
            </p>
            {info.googleMapsUrl && (
              <a
                href={info.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-xs font-semibold text-amber-600 hover:text-amber-800 underline"
              >
                गूगल मैप्स पर देखें →
              </a>
            )}
          </div>
        </div>

        {/* Weekly Timings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">
          <div className="p-6 bg-stone-900 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-300">
                साप्ताहिक दर्शन एवं आरती समय-सारणी
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                नियमित एवं पर्व दर्शन समय (माँ के दर्शन प्रतिदिन सुलभ हैं)
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-amber-600/30 text-amber-200 px-3 py-1 rounded-full border border-amber-500/30">
                प्रातः आरती: {timings.morningAarti || '07:00 AM'}
              </span>
              <span className="bg-amber-600/30 text-amber-200 px-3 py-1 rounded-full border border-amber-500/30">
                संध्या आरती: {timings.sandhyaAarti || '07:30 PM'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">दिन (Day)</th>
                  <th className="px-6 py-3.5">प्रातः दर्शन (Morning)</th>
                  <th className="px-6 py-3.5">सायं दर्शन (Evening)</th>
                  <th className="px-6 py-3.5">स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {weeklyDays.map((dayItem) => (
                  <tr key={dayItem.day} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      {dayItem.dayHindi || dayItem.day}
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-700">
                      {dayItem.morningOpen} - {dayItem.morningClose}
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-700">
                      {dayItem.eveningOpen} - {dayItem.eveningClose}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        पट खुले हैं
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(timings.specialNote || timings.festivalTimings) && (
            <div className="p-5 bg-amber-50/60 border-t border-amber-100 text-xs sm:text-sm text-amber-900 space-y-1">
              {timings.specialNote && <p><strong>विशेष ध्यान:</strong> {timings.specialNote}</p>}
              {timings.festivalTimings && <p><strong>त्यौहार दर्शन:</strong> {timings.festivalTimings}</p>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
