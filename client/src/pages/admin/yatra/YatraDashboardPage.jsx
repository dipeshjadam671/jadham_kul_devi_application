import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Calendar,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { getYatraStats, getYatraRegistrations, exportYatraCsv } from '../../../services/yatraService';

export const YatraDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, regRes] = await Promise.all([
          getYatraStats(),
          getYatraRegistrations({ limit: 5 }),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (regRes.success) setRecentRegistrations(regRes.data);
      } catch (err) {
        console.error('Failed to load yatra dashboard:', err);
        setError('यात्रा डैशबोर्ड डेटा लोड करने में त्रुटि हुई।');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const blob = await exportYatraCsv();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Yatra_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('CSV Export failed:', err);
      alert('CSV निर्यात विफल रहा। कृपया पुनः प्रयास करें।');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">

      {/* TOP TITLE & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            चरण ५ प्रबंधन
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            यात्रा प्रबंधन डैशबोर्ड (Yatra Dashboard)
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            राम नवमी दर्शन यात्रा एवं कैलाश मानसरोवर यात्रा का एकीकृत प्रबंधन
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium rounded-xl text-sm transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-stone-500" />
            {exporting ? 'निर्यात हो रहा है...' : 'CSV रिपोर्ट'}
          </button>
          <Link
            to="/admin/yatra/registrations/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl text-sm transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            नया पंजीकरण जोड़ें
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}

      {/* STATS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">कुल पंजीकरण</span>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">{stats?.totalRegistrations || 0}</div>
            <span className="text-xs text-amber-700 font-medium mt-1 inline-block">
              {stats?.totalTravelers || 0} कुल यात्री
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">पुष्ट (Confirmed)</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">{stats?.confirmedRegistrations || 0}</div>
            <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">
              यात्रा हेतु स्वीकृत
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">सत्यापन लंबित</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-1">{stats?.pendingRegistrations || 0}</div>
            <span className="text-xs text-stone-500 font-medium mt-1 inline-block">
              समीक्षा की आवश्यकता
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">कुल प्राप्त भुगतान</span>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1 font-mono">
              {formatCurrency(stats?.totalLedgerPayments)}
            </div>
            <span className="text-xs text-stone-500 font-medium mt-1 inline-block">
              {stats?.paidPaymentsCount || 0} पूर्ण चुकता
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* QUICK LINKS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/yatra/registrations"
          className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-400 hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-amber-800">पंजीकरण प्रबंधन</span>
            <h4 className="text-base font-bold text-stone-900 group-hover:text-amber-800 transition">
              सभी यात्रा पंजीकरण देखें
            </h4>
            <p className="text-xs text-stone-500">खोजें, फ़िल्टर करें और स्थिति बदलें</p>
          </div>
          <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/admin/yatra/payments"
          className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-400 hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-purple-800">भुगतान खाता</span>
            <h4 className="text-base font-bold text-stone-900 group-hover:text-purple-800 transition">
              यात्रा भुगतान खाता (Ledger)
            </h4>
            <p className="text-xs text-stone-500">किस्त, रसीद एवं भुगतान इतिहास</p>
          </div>
          <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-purple-800 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/admin/yatra/info"
          className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-400 hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-emerald-800">दिशा-निर्देश</span>
            <h4 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition">
              यात्रा नियम व सूचनाएं संपादित करें
            </h4>
            <p className="text-xs text-stone-500">तिथियां, शुल्क एवं दिशा-निर्देश बदलें</p>
          </div>
          <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-800 group-hover:translate-x-1 transition" />
        </Link>
      </div>

      {/* RECENT REGISTRATIONS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900">हालिया पंजीकरण (Recent Registrations)</h3>
            <p className="text-xs text-stone-500">नवीनतम ५ यात्रा पंजीकरण</p>
          </div>
          <Link
            to="/admin/yatra/registrations"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 transition flex items-center gap-1"
          >
            सभी देखें <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3.5 font-bold">पंजीकरण क्र.</th>
                <th className="px-6 py-3.5 font-bold">यात्रा</th>
                <th className="px-6 py-3.5 font-bold">मुख्य श्रद्धालु</th>
                <th className="px-6 py-3.5 font-bold">मोबाइल</th>
                <th className="px-6 py-3.5 font-bold">यात्री</th>
                <th className="px-6 py-3.5 font-bold">यात्रा दिनांक</th>
                <th className="px-6 py-3.5 font-bold">स्थिति</th>
                <th className="px-6 py-3.5 font-bold text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-stone-400">
                    कोई पंजीकरण रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                recentRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-amber-50/40 transition">
                    <td className="px-6 py-4 font-mono font-bold text-stone-900">
                      {reg.registrationNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        reg.yatraType === 'RAM_NAVAMI'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {reg.yatraType === 'RAM_NAVAMI' ? 'राम नवमी' : 'मानसरोवर'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-900">
                      {reg.primaryName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {reg.mobile}
                    </td>
                    <td className="px-6 py-4 font-semibold text-stone-800">
                      {reg.numberOfTravelers}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(reg.travelDate).toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        reg.bookingStatus === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reg.bookingStatus === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : reg.bookingStatus === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {reg.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/yatra/registrations/${reg._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        विवरण
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default YatraDashboardPage;
