import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getIncome, archiveIncome } from '../../../services/incomeService';
import {
  formatINR,
  formatDate,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../../../utils/formatters';
import { ConfirmationModal } from '../../../components/financial/ConfirmationModal';

export const IncomeListPage = () => {
  const [incomeList, setIncomeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalAmount: 0, count: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [modalState, setModalState] = useState({
    isOpen: false,
    item: null,
    loading: false,
  });

  const fetchIncome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIncome({
        page: pagination.page,
        limit: pagination.limit,
        search,
        category: categoryFilter,
      });

      if (res.success) {
        setIncomeList(res.data);
        setPagination(res.pagination);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Error loading income records:', err);
      setError(err.message || 'आय सूची लोड करने में विफल');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, categoryFilter]);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  const handleArchive = async () => {
    if (!modalState.item) return;
    setModalState((prev) => ({ ...prev, loading: true }));
    try {
      await archiveIncome(modalState.item._id);
      setModalState({ isOpen: false, item: null, loading: false });
      fetchIncome();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'रिकॉर्ड पुरालेख करने में त्रुटि');
      setModalState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">मंदिर अन्य आय (Other Income)</h1>
          <p className="text-xs text-stone-500">
            उत्सव बोली, धर्मशाला व्यवस्था शुल्क, प्रायोजन एवं अन्य राजस्व प्रविष्टियां
          </p>
        </div>
        <Link
          to="/admin/income/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition"
        >
          <span className="text-lg leading-none">+</span>
          नई आय दर्ज करें (Record Income)
        </Link>
      </div>

      {/* KPI Summary Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-stone-500">कुल अन्य आय (Filtered Income Total)</p>
          <p className="mt-1 font-serif text-xl font-bold text-emerald-700">
            {formatINR(summary.totalAmount)}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-stone-500">प्रविष्टियों की संख्या (Record Count)</p>
          <p className="mt-1 font-serif text-xl font-bold text-stone-800">
            {summary.count} प्रविष्टियां
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="शीर्षक, विवरण या संदर्भ क्र. खोजें..."
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:border-amber-500 focus:outline-hidden"
            >
              <option value="">सभी श्रेणियां (All Categories)</option>
              {Object.entries(INCOME_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
              className="flex-1 rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-900 transition"
            >
              फ़िल्टर करें (Apply)
            </button>
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"
            >
              रीसेट
            </button>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-stone-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
            <span className="ml-3 text-sm">लोड हो रहा है...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">{error}</div>
        ) : incomeList.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <p className="font-serif text-base font-semibold">कोई आय प्रविष्टि नहीं मिली</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-600">
                  <th className="py-3.5 px-4">दिनांक</th>
                  <th className="py-3.5 px-4">शीर्षक एवं विवरण</th>
                  <th className="py-3.5 px-4">श्रेणी</th>
                  <th className="py-3.5 px-4">माध्यम</th>
                  <th className="py-3.5 px-4 text-right">राशि (Amount)</th>
                  <th className="py-3.5 px-4 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {incomeList.map((item) => (
                  <tr key={item._id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-mono text-stone-600">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-800">{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] text-stone-500 truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                      {item.referenceNumber && (
                        <div className="font-mono text-[10px] text-stone-400">
                          Ref: {item.referenceNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-700">
                        {INCOME_CATEGORIES[item.category] || item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {PAYMENT_METHODS[item.paymentMethod] || item.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-emerald-700">
                      {formatINR(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/admin/income/${item._id}/edit`}
                        className="rounded-lg border border-stone-200 px-2.5 py-1 text-stone-700 hover:bg-stone-100 transition inline-block"
                      >
                        संपादित
                      </Link>
                      <button
                        type="button"
                        onClick={() => setModalState({ isOpen: true, item, loading: false })}
                        className="text-stone-400 hover:text-stone-600 transition p-1"
                        title="पुरालेख करें"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
          <div>
            कुल {pagination.total} प्रविष्टियां | पृष्ठ {pagination.page} / {pagination.totalPages}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1}
              className="rounded-md border border-stone-200 bg-white px-3 py-1 font-medium hover:bg-stone-100 disabled:opacity-50"
            >
              पिछला (Prev)
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(pagination.totalPages, prev.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-md border border-stone-200 bg-white px-3 py-1 font-medium hover:bg-stone-100 disabled:opacity-50"
            >
              अगला (Next)
            </button>
          </div>
        </div>
      </div>

      {/* Archive Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title="आय प्रविष्टि पुरालेख करें (Archive Record)"
        message={`क्या आप '${modalState.item?.title}' की ${formatINR(
          modalState.item?.amount
        )} की प्रविष्टि पुरालेख में डालना चाहते हैं?`}
        confirmText="पुरालेख करें"
        confirmVariant="danger"
        isLoading={modalState.loading}
        onConfirm={handleArchive}
        onClose={() => setModalState({ isOpen: false, item: null, loading: false })}
      />
    </div>
  );
};
