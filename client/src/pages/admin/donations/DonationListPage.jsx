import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getDonations,
  verifyDonation,
  rejectDonation,
  archiveDonation,
} from '../../../services/donationService';
import {
  formatINR,
  formatDate,
  DONATION_TYPES,
  getStatusBadge,
} from '../../../utils/formatters';
import { ConfirmationModal } from '../../../components/financial/ConfirmationModal';

export const DonationListPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalFinancialValue: 0, count: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'verify', 'reject', 'archive'
    donation: null,
    loading: false,
  });

  const fetchDonationList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDonations({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter,
        type: typeFilter,
      });

      if (res.success) {
        setDonations(res.data);
        setPagination(res.pagination);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
      setError(err.message || 'दान प्रविष्टियां लोड करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchDonationList();
  }, [fetchDonationList]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOpenModal = (type, donation) => {
    setModalState({
      isOpen: true,
      type,
      donation,
      loading: false,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      donation: null,
      loading: false,
    });
  };

  const handleConfirmAction = async (reason) => {
    const { type, donation } = modalState;
    if (!donation) return;

    setModalState((prev) => ({ ...prev, loading: true }));
    try {
      if (type === 'verify') {
        await verifyDonation(donation._id);
      } else if (type === 'reject') {
        await rejectDonation(donation._id, reason);
      } else if (type === 'archive') {
        await archiveDonation(donation._id);
      }
      handleCloseModal();
      fetchDonationList();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'कार्रवाई असफल रही');
      setModalState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">दान प्रबंधन (Donation Register)</h1>
          <p className="text-xs text-stone-500">
            मंदिर में प्राप्त समस्त नगद, यूपीआई, बैंक एवं वस्तु दानों की अधिकृत सूची एवं सत्यापन
          </p>
        </div>
        <Link
          to="/admin/donations/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition"
        >
          <span className="text-lg leading-none">+</span>
          नया दान दर्ज करें (New Donation)
        </Link>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-stone-500">कुल वित्तीय मूल्य (Filtered Total)</p>
          <p className="mt-1 font-serif text-xl font-bold text-emerald-700">
            {formatINR(summary.totalFinancialValue)}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-stone-500">प्रविष्टियों की संख्या (Record Count)</p>
          <p className="mt-1 font-serif text-xl font-bold text-stone-800">
            {summary.count} दान
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-stone-500">सत्यापन स्थिति (Status Tab)</p>
          <p className="mt-1 font-serif text-xl font-bold text-amber-600">
            {statusFilter ? statusFilter.toUpperCase() : 'ALL (सभी)'}
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-4">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-3 text-xs font-semibold">
          {[
            { id: '', label: 'सभी (All)' },
            { id: 'verified', label: 'सत्यापित (Verified)' },
            { id: 'pending', label: 'लंबित (Pending)' },
            { id: 'rejected', label: 'अस्वीकृत (Rejected)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`rounded-lg px-3 py-1.5 transition ${
                statusFilter === tab.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Type filter */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="दानदाता का नाम, गांव, रसीद क्र., या मोबाइल..."
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:border-amber-500 focus:outline-hidden"
            >
              <option value="">सभी प्रकार (All Types)</option>
              <option value="cash">नगद (Cash)</option>
              <option value="upi">यूपीआई (UPI)</option>
              <option value="bank_transfer">बैंक ट्रांसफर (Bank Transfer)</option>
              <option value="item">वस्तु दान (Item)</option>
              <option value="mixed">मिश्रित (Mixed)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-900 transition"
            >
              खोजें (Search)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTypeFilter('');
                setStatusFilter('');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"
            >
              रीसेट
            </button>
          </div>
        </form>
      </div>

      {/* Donations Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-stone-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
            <span className="ml-3 text-sm">लोड हो रहा है...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">{error}</div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <p className="font-serif text-base font-semibold">कोई दान प्रविष्टि नहीं मिली</p>
            <p className="mt-1 text-xs">खोज शब्द या फ़िल्टर बदलकर पुनः प्रयास करें।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-600">
                  <th className="py-3.5 px-4">रसीद / दिनांक</th>
                  <th className="py-3.5 px-4">दानदाता एवं ग्राम</th>
                  <th className="py-3.5 px-4">प्रकार एवं विवरण</th>
                  <th className="py-3.5 px-4 text-right">कुल वित्तीय मूल्य</th>
                  <th className="py-3.5 px-4 text-center">स्थिति</th>
                  <th className="py-3.5 px-4 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {donations.map((d) => {
                  const statusInfo = getStatusBadge(d.verificationStatus);
                  const typeInfo = DONATION_TYPES[d.donationType] || DONATION_TYPES.other;

                  return (
                    <tr key={d._id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-semibold text-stone-900">
                          {d.receiptNumber || (
                            <span className="text-amber-600 italic">लंबित (Pending)</span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400">{formatDate(d.donationDate)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-800">{d.donorName}</div>
                        <div className="text-[11px] text-stone-500">
                          {d.village ? d.village : '—'} {d.city ? `(${d.city})` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                        {d.itemName && (
                          <div className="mt-0.5 text-[11px] text-stone-600">
                            {d.itemName} ({d.itemQuantity} {d.itemUnit || ''})
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-stone-900">
                        {formatINR(d.totalFinancialValue)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusInfo.bgClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotClass}`} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          to={`/admin/donations/${d._id}`}
                          className="rounded-lg border border-stone-200 px-2.5 py-1 text-stone-700 hover:bg-stone-100 transition inline-block"
                        >
                          विवरण (View)
                        </Link>

                        {d.verificationStatus === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenModal('verify', d)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-white hover:bg-emerald-700 transition"
                            >
                              सत्यापित करें
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenModal('reject', d)}
                              className="rounded-lg bg-rose-50 border border-rose-200 px-2 py-1 text-rose-700 hover:bg-rose-100 transition"
                            >
                              अस्वीकृत
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenModal('archive', d)}
                          className="text-stone-400 hover:text-stone-600 transition p-1"
                          title="पुरालेख / हटाएं"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={modalState.isOpen && modalState.type === 'verify'}
        title="दान सत्यापन एवं रसीद जारी (Verify Donation)"
        message={`क्या आप सुनिश्चित हैं कि आप दानदाता '${modalState.donation?.donorName}' का कुल ${formatINR(
          modalState.donation?.totalFinancialValue
        )} का दान सत्यापित करना चाहते हैं? सत्यापन पर एक आधिकारिक रसीद क्रमांक (JKM-YYYY-XXXXXX) स्वतः आबंटित किया जाएगा।`}
        confirmText="हां, सत्यापित करें"
        confirmVariant="success"
        isLoading={modalState.loading}
        onConfirm={handleConfirmAction}
        onClose={handleCloseModal}
      />

      <ConfirmationModal
        isOpen={modalState.isOpen && modalState.type === 'reject'}
        title="दान प्रविष्टि अस्वीकृत करें (Reject Donation)"
        message={`दानदाता '${modalState.donation?.donorName}' की प्रविष्टि को अस्वीकृत करने हेतु वैध कारण दर्ज करें:`}
        confirmText="अस्वीकृत करें (Reject)"
        confirmVariant="danger"
        requireReason={true}
        isLoading={modalState.loading}
        onConfirm={handleConfirmAction}
        onClose={handleCloseModal}
      />

      <ConfirmationModal
        isOpen={modalState.isOpen && modalState.type === 'archive'}
        title="प्रविष्टि पुरालेख करें (Archive Record)"
        message={`क्या आप दानदाता '${modalState.donation?.donorName}' का दान रिकॉर्ड पुरालेख (Archive) करना चाहते हैं? यह रिकॉर्ड सामान्य सूची से हटा दिया जाएगा।`}
        confirmText="पुरालेख करें"
        confirmVariant="danger"
        isLoading={modalState.loading}
        onConfirm={handleConfirmAction}
        onClose={handleCloseModal}
      />
    </div>
  );
};
