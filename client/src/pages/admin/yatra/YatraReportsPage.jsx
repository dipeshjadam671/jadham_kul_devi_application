import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Download,
  ArrowLeft,
  Users,
  Compass,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getYearlySummaryReport,
  getMonthlySummaryReport,
  exportYatraCsv,
} from '../../../services/yatraService';

export const YatraReportsPage = () => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [yearlySummary, setYearlySummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const [yRes, mRes] = await Promise.all([
          getYearlySummaryReport(selectedYear),
          getMonthlySummaryReport(selectedYear),
        ]);

        if (yRes.success) setYearlySummary(yRes.data || []);
        if (mRes.success) setMonthlySummary(mRes.data);
      } catch (err) {
        console.error('Failed to load yatra reports:', err);
        setError('यात्रा रिपोर्ट्स लोड करने में त्रुटि हुई।');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedYear]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportYatraCsv({ year: selectedYear });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Yatra_Report_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('CSV Export failed:', err);
      alert('CSV रिपोर्ट निर्यात विफल रहा।');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-8 font-sans pb-16">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            यात्रा सांख्यिकी एवं रिपोर्ट्स (Yatra Reports)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            वार्षिक एवं मासिक यात्री पंजीकरण, भुगतान एवं तुलनात्मक विश्लेषण
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-bold text-stone-800 shadow-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
          >
            <option value="2026">वर्ष २०२६ (2026)</option>
            <option value="2025">वर्ष २०२५ (2025)</option>
            <option value="2024">वर्ष २०२४ (2024)</option>
          </select>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl text-sm transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'डाउनलोड हो रहा है...' : 'वार्षिक CSV डाउनलोड'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* YEARLY COMPARISON CARDS */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-700" />
              यात्रा प्रकार तुलनात्मक सारांश (Ram Navami vs Mansarovar)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 font-bold">वर्ष</th>
                    <th className="px-6 py-3 font-bold">राम नवमी पंजीकरण</th>
                    <th className="px-6 py-3 font-bold">राम नवमी कुल यात्री</th>
                    <th className="px-6 py-3 font-bold">मानसरोवर पंजीकरण</th>
                    <th className="px-6 py-3 font-bold">मानसरोवर कुल यात्री</th>
                    <th className="px-6 py-3 font-bold">कुल पंजीकरण</th>
                    <th className="px-6 py-3 font-bold">कुल यात्री संख्या</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {yearlySummary.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-stone-400">
                        कोई वार्षिक डेटा उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    yearlySummary.map((item) => (
                      <tr key={item.year} className="hover:bg-amber-50/30 transition">
                        <td className="px-6 py-4 font-mono font-bold text-stone-900">{item.year}</td>
                        <td className="px-6 py-4 font-semibold text-amber-800">{item.ramNavamiRegistrations}</td>
                        <td className="px-6 py-4">{item.ramNavamiTravelers}</td>
                        <td className="px-6 py-4 font-semibold text-sky-800">{item.mansarovarRegistrations}</td>
                        <td className="px-6 py-4">{item.mansarovarTravelers}</td>
                        <td className="px-6 py-4 font-bold text-stone-900">{item.totalRegistrations}</td>
                        <td className="px-6 py-4 font-bold text-amber-900">{item.totalTravelers}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MONTHLY BREAKDOWN TABLE */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-700" />
              माहवार विश्लेषण - वर्ष {selectedYear} (Monthly Breakdown)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 font-bold">माह (Month)</th>
                    <th className="px-6 py-3 font-bold">पंजीकरण संख्या</th>
                    <th className="px-6 py-3 font-bold">कुल यात्री</th>
                    <th className="px-6 py-3 font-bold">पुष्ट (Confirmed)</th>
                    <th className="px-6 py-3 font-bold">रद्द (Cancelled)</th>
                    <th className="px-6 py-3 font-bold">प्राप्त राशि (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {monthlySummary?.months?.map((m) => (
                    <tr
                      key={m.month}
                      className={`hover:bg-amber-50/30 transition ${
                        m.registrations > 0 ? 'bg-amber-50/10 font-medium' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5 text-stone-900">{m.monthName}</td>
                      <td className="px-6 py-3.5">{m.registrations}</td>
                      <td className="px-6 py-3.5 font-semibold text-stone-800">{m.travelers}</td>
                      <td className="px-6 py-3.5 text-emerald-700">{m.confirmed}</td>
                      <td className="px-6 py-3.5 text-rose-600">{m.cancelled}</td>
                      <td className="px-6 py-3.5 font-mono text-stone-900 font-bold">
                        {formatCurrency(m.payments)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default YatraReportsPage;
