import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { getYatraPayments } from '../../../services/yatraPaymentService';

export const YatraPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [totalAmount, setTotalAmount] = useState(0);

  // Filters
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getYatraPayments({
        page,
        limit: 15,
        paymentMethod: methodFilter,
      });

      if (res.success) {
        setPayments(res.data);
        setPagination(res.pagination);
        setTotalAmount(res.totalAmount || 0);
      }
    } catch (err) {
      console.error('Failed to load yatra payments ledger:', err);
      setError('भुगतान खाता सूची लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }, [page, methodFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            यात्रा भुगतान खाता (Yatra Payments Ledger)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            सभी यात्रा किस्तों एवं प्राप्त भुगतानों का पूर्ण ऑडिट बहीखाता
          </p>
        </div>

        <Link
          to="/admin/yatra"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          यात्रा डैशबोर्ड
        </Link>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}

      {/* FILTER & SUMMARY */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-64">
          <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
            भुगतान माध्यम से फ़िल्टर करें
          </label>
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
          >
            <option value="">सभी माध्यम (All Methods)</option>
            <option value="cash">नकद (Cash)</option>
            <option value="upi">UPI / ऑनलाइन</option>
            <option value="bank_transfer">बैंक ट्रांसफर</option>
            <option value="cheque">चेक (Cheque)</option>
            <option value="other">अन्य</option>
          </select>
        </div>

        <div className="bg-amber-50 px-6 py-3 rounded-xl border border-amber-200 text-right w-full sm:w-auto">
          <span className="text-xs text-amber-900 uppercase font-semibold block">कुल प्राप्त राशि (इस पृष्ठ/फ़िल्टर अनुसार)</span>
          <span className="text-xl font-mono font-bold text-amber-900">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3.5 font-bold">दिनांक</th>
                <th className="px-6 py-3.5 font-bold">पंजीकरण क्र.</th>
                <th className="px-6 py-3.5 font-bold">मुख्य व्यक्ति</th>
                <th className="px-6 py-3.5 font-bold">राशि (₹)</th>
                <th className="px-6 py-3.5 font-bold">माध्यम</th>
                <th className="px-6 py-3.5 font-bold">लेनदेन आईडी</th>
                <th className="px-6 py-3.5 font-bold">टिप्पणी</th>
                <th className="px-6 py-3.5 font-bold text-right">पंजीकरण देखें</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-stone-400">
                    भुगतान विवरण लोड हो रहा है...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-stone-400">
                    कोई भुगतान प्रविष्टि नहीं मिली।
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-amber-50/30 transition">
                    <td className="px-6 py-4 font-mono text-xs">
                      {new Date(p.paymentDate).toLocaleDateString('hi-IN')}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-stone-900 text-xs">
                      {p.registrationId?.registrationNumber || '-'}
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-900">
                      {p.registrationId?.primaryName || '-'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-700 text-base">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4 text-xs uppercase font-semibold">
                      {p.paymentMethod}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-700">
                      {p.transactionId || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">
                      {p.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.registrationId?._id ? (
                        <Link
                          to={`/admin/yatra/registrations/${p.registrationId._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950"
                        >
                          <Eye className="w-3.5 h-3.5" /> विवरण
                        </Link>
                      ) : '-'}
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

export default YatraPaymentsPage;
