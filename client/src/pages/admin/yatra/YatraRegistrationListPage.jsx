import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Compass,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  getYatraRegistrations,
  confirmYatraRegistration,
  cancelYatraRegistration,
  completeYatraRegistration,
  exportYatraCsv,
} from '../../../services/yatraService';

export const YatraRegistrationListPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [yatraTypeFilter, setYatraTypeFilter] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('2026');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getYatraRegistrations({
        page,
        limit: 15,
        search: search.trim(),
        yatraType: yatraTypeFilter,
        bookingStatus: bookingStatusFilter,
        paymentStatus: paymentStatusFilter,
        year: yearFilter,
      });

      if (res.success) {
        setRegistrations(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load yatra registrations:', err);
      setError('पंजीकरण सूची लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }, [page, search, yatraTypeFilter, bookingStatusFilter, paymentStatusFilter, yearFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleStatusAction = async (id, action) => {
    try {
      setActionLoading(true);
      if (action === 'confirm') {
        await confirmYatraRegistration(id);
      } else if (action === 'complete') {
        await completeYatraRegistration(id);
      } else if (action === 'cancel') {
        const reason = window.prompt('रद्द करने का कारण दर्ज करें (वैकल्पिक):');
        if (reason === null) {
          setActionLoading(false);
          return;
        }
        await cancelYatraRegistration(id, reason);
      }
      await fetchRegistrations();
    } catch (err) {
      console.error('Status action failed:', err);
      alert(err.response?.data?.message || 'स्थिति परिवर्तन विफल रहा।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const blob = await exportYatraCsv({
        yatraType: yatraTypeFilter,
        bookingStatus: bookingStatusFilter,
        paymentStatus: paymentStatusFilter,
        year: yearFilter,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Yatra_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export CSV error:', err);
      alert('CSV निर्यात विफल रहा।');
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setYatraTypeFilter('');
    setBookingStatusFilter('');
    setPaymentStatusFilter('');
    setYearFilter('2026');
    setPage(1);
  };

  return (
    <div className="space-y-6 font-sans">

      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            यात्रा पंजीकरण सूची (Registrations)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            कुल {pagination.total} पंजीकरण प्रविष्टियां उपलब्ध
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium rounded-xl text-sm transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-stone-500" />
            {exporting ? 'निर्यात हो रहा है...' : 'CSV निर्यात'}
          </button>

          <Link
            to="/admin/yatra/registrations/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl text-sm transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            नया पंजीकरण
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="पंजीकरण क्र., नाम, मोबाइल, शहर..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
            />
          </div>

          {/* Yatra Type */}
          <div>
            <select
              value={yatraTypeFilter}
              onChange={(e) => {
                setYatraTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
            >
              <option value="">सभी यात्राएं (All)</option>
              <option value="RAM_NAVAMI">श्री राम नवमी</option>
              <option value="MANSAROVAR">कैलाश मानसरोवर</option>
            </select>
          </div>

          {/* Booking Status */}
          <div>
            <select
              value={bookingStatusFilter}
              onChange={(e) => {
                setBookingStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
            >
              <option value="">सभी बुकिंग स्थिति (All)</option>
              <option value="pending">लंबित (Pending)</option>
              <option value="confirmed">पुष्ट (Confirmed)</option>
              <option value="completed">संपन्न (Completed)</option>
              <option value="cancelled">रद्द (Cancelled)</option>
              <option value="waitlisted">प्रतीक्षारत (Waitlisted)</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
            >
              <option value="">सभी भुगतान स्थिति (All)</option>
              <option value="pending">लंबित (Pending)</option>
              <option value="partial">आंशिक (Partial)</option>
              <option value="paid">पूर्ण (Paid)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span>फ़िल्टर सक्रिय: {search || yatraTypeFilter || bookingStatusFilter || paymentStatusFilter ? 'हाँ' : 'डिफ़ॉल्ट'}</span>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            फ़िल्टर रीसेट करें
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-5 py-3.5 font-bold">पंजीकरण क्र.</th>
                <th className="px-5 py-3.5 font-bold">यात्रा</th>
                <th className="px-5 py-3.5 font-bold">मुख्य श्रद्धालु</th>
                <th className="px-5 py-3.5 font-bold">मोबाइल</th>
                <th className="px-5 py-3.5 font-bold">ग्राम / शहर</th>
                <th className="px-5 py-3.5 font-bold">यात्री</th>
                <th className="px-5 py-3.5 font-bold">यात्रा दिनांक</th>
                <th className="px-5 py-3.5 font-bold">बुकिंग</th>
                <th className="px-5 py-3.5 font-bold">भुगतान</th>
                <th className="px-5 py-3.5 font-bold text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center text-stone-400">
                    डेटा लोड हो रहा है...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center text-stone-400">
                    कोई पंजीकरण रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-amber-50/30 transition">
                    <td className="px-5 py-4 font-mono font-bold text-stone-900 text-xs">
                      {reg.registrationNumber}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        reg.yatraType === 'RAM_NAVAMI'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {reg.yatraType === 'RAM_NAVAMI' ? 'राम नवमी' : 'मानसरोवर'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-stone-900">
                      {reg.primaryName}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">
                      {reg.mobile}
                    </td>
                    <td className="px-5 py-4 text-xs text-stone-700">
                      {reg.village ? `${reg.village}, ` : ''}{reg.city}
                    </td>
                    <td className="px-5 py-4 font-semibold text-stone-800 text-center">
                      {reg.numberOfTravelers}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono">
                      {new Date(reg.travelDate).toISOString().split('T')[0]}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        reg.bookingStatus === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reg.bookingStatus === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : reg.bookingStatus === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {reg.bookingStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        reg.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reg.paymentStatus === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {reg.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/yatra/registrations/${reg._id}`}
                          title="विवरण देखें"
                          className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/admin/yatra/registrations/${reg._id}/edit`}
                          title="संपादित करें"
                          className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Quick Confirm */}
                        {reg.bookingStatus === 'pending' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleStatusAction(reg._id, 'confirm')}
                            title="पुष्टि करें (Confirm)"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Quick Complete */}
                        {reg.bookingStatus === 'confirmed' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleStatusAction(reg._id, 'complete')}
                            title="यात्रा पूर्ण करें (Complete)"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Quick Cancel */}
                        {reg.bookingStatus !== 'cancelled' && reg.bookingStatus !== 'completed' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleStatusAction(reg._id, 'cancel')}
                            title="रद्द करें (Cancel)"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div>
            पृष्ठ {pagination.page} / {pagination.totalPages} (कुल {pagination.total} रिकॉर्ड)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default YatraRegistrationListPage;
