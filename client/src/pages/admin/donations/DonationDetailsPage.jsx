import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getDonationById,
  verifyDonation,
  rejectDonation,
  archiveDonation,
} from '../../../services/donationService';
import {
  formatINR,
  formatDate,
  DONATION_TYPES,
  PAYMENT_METHODS,
  getStatusBadge,
} from '../../../utils/formatters';
import { ConfirmationModal } from '../../../components/financial/ConfirmationModal';

export const DonationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    loading: false,
  });

  const loadDonation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDonationById(id);
      if (res.success) {
        setDonation(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'दान विवरण लोड करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonation();
  }, [id]);

  const handleOpenModal = (type) => {
    setModalState({ isOpen: true, type, loading: false });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, type: null, loading: false });
  };

  const handleConfirmAction = async (reason) => {
    setModalState((prev) => ({ ...prev, loading: true }));
    try {
      if (modalState.type === 'verify') {
        await verifyDonation(id);
      } else if (modalState.type === 'reject') {
        await rejectDonation(id, reason);
      } else if (modalState.type === 'archive') {
        await archiveDonation(id);
        navigate('/admin/donations');
        return;
      }
      handleCloseModal();
      loadDonation();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'कार्रवाई निष्पादित नहीं हो सकी');
      setModalState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-stone-400">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
        <span className="ml-3 text-sm">विवरण लोड हो रहा है...</span>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        <p className="font-semibold">{error || 'दान रिकॉर्ड नहीं मिला'}</p>
        <Link
          to="/admin/donations"
          className="mt-4 inline-block rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-white"
        >
          ← दान सूची पर वापस जाएं
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusBadge(donation.verificationStatus);
  const typeInfo = DONATION_TYPES[donation.donationType] || DONATION_TYPES.other;
  const isItem = donation.donationType === 'item' || donation.donationType === 'mixed';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top action bar - Hidden during print */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/donations"
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
          >
            ← दान सूची
          </Link>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusInfo.bgClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotClass}`} />
            {statusInfo.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs"
          >
            🖨️ रसीद प्रिंट करें (Print)
          </button>

          <Link
            to={`/admin/donations/${donation._id}/edit`}
            className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs"
          >
            संपादित करें (Edit)
          </Link>

          {donation.verificationStatus === 'pending' && (
            <>
              <button
                onClick={() => handleOpenModal('verify')}
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
              >
                सत्यापित करें (Verify)
              </button>
              <button
                onClick={() => handleOpenModal('reject')}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                अस्वीकृत (Reject)
              </button>
            </>
          )}

          <button
            onClick={() => handleOpenModal('archive')}
            className="rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-400 hover:text-stone-600"
            title="पुरालेख करें"
          >
            🗑️ पुरालेख
          </button>
        </div>
      </div>

      {/* Official Temple Receipt Printable Container */}
      <div className="overflow-hidden rounded-2xl border-2 border-amber-300 bg-white shadow-md print:border-none print:shadow-none">
        {/* Receipt Header */}
        <div className="border-b-2 border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50/30 p-6 text-center">
          <p className="font-serif text-xs font-bold tracking-widest text-amber-800 uppercase">
            || श्री गणेशाय नमः || श्री कुलदेवी माताजी प्रसन्न ||
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
            जादम परिवार कुलदेवी मंदिर
          </h2>
          <p className="text-xs font-medium text-stone-600">
            खलघाट, जिला धार (मध्य प्रदेश) - 454552 | अधिकृत दान पावती (Official Receipt)
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-amber-200/60 pt-3 text-xs font-mono">
            <div>
              <span className="text-stone-500">रसीद क्रमांक: </span>
              <span className="font-bold text-amber-900 text-sm">
                {donation.receiptNumber || 'लंबित (PENDING)'}
              </span>
            </div>
            <div>
              <span className="text-stone-500">दिनांक: </span>
              <span className="font-semibold text-stone-800">
                {formatDate(donation.donationDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6">
          {/* Donor & General Info Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 rounded-xl bg-stone-50 p-4 text-xs">
            <div>
              <p className="font-semibold text-stone-500 uppercase tracking-wide text-[10px]">
                दानदाता का नाम (Donor Name)
              </p>
              <p className="mt-1 font-serif text-base font-bold text-stone-900">
                {donation.donorName}
              </p>
              <p className="mt-0.5 text-stone-600">
                {donation.village ? `ग्राम: ${donation.village}` : ''}{' '}
                {donation.city ? `(${donation.city})` : ''}
              </p>
              {donation.address && (
                <p className="text-stone-500 mt-0.5">पता: {donation.address}</p>
              )}
              {donation.mobile && (
                <p className="text-stone-500 mt-0.5">संपर्क: {donation.mobile}</p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <p className="font-semibold text-stone-500 uppercase tracking-wide text-[10px]">
                भुगतान एवं सत्यापन विवरण
              </p>
              <p className="text-stone-700">
                <span className="text-stone-400">प्रकार: </span>
                <span className="font-semibold">{typeInfo.label}</span>
              </p>
              <p className="text-stone-700">
                <span className="text-stone-400">माध्यम: </span>
                <span className="font-semibold">
                  {PAYMENT_METHODS[donation.paymentMethod] || donation.paymentMethod}
                </span>
              </p>
              {donation.transactionId && (
                <p className="font-mono text-stone-700">
                  <span className="text-stone-400">Txn / Ref: </span>
                  {donation.transactionId}
                </p>
              )}
              <p className="text-stone-700">
                <span className="text-stone-400">उद्देश्य: </span>
                <span className="font-semibold text-amber-900">{donation.purpose}</span>
              </p>
            </div>
          </div>

          {/* Item Breakdown (if any) */}
          {isItem && (
            <div className="overflow-hidden rounded-xl border border-stone-200">
              <div className="bg-stone-100 px-4 py-2 font-serif text-xs font-bold text-stone-800">
                वस्तु दान विवरण (In-Kind / Material Contribution)
              </div>
              <table className="w-full text-left text-xs">
                <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
                  <tr>
                    <th className="py-2 px-4">वस्तु का नाम</th>
                    <th className="py-2 px-4">मात्रा</th>
                    <th className="py-2 px-4">दर प्रति इकाई</th>
                    <th className="py-2 px-4 text-right">कुल वस्तु मूल्य</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-800">
                      {donation.itemName}
                    </td>
                    <td className="py-2.5 px-4">
                      {donation.itemQuantity} {donation.itemUnit}
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {donation.itemPrice ? formatINR(donation.itemPrice) : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                      {formatINR(donation.itemTotalValue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Financial Value Summary Card */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-600">कुल वित्तीय मूल्य (Total Financial Value)</p>
                <p className="text-[11px] text-stone-500">
                  {donation.amount > 0 && `नगद राशि: ${formatINR(donation.amount)} `}
                  {donation.itemTotalValue > 0 && `+ वस्तु मूल्य: ${formatINR(donation.itemTotalValue)}`}
                </p>
              </div>
              <div className="font-serif text-2xl font-bold text-amber-900">
                {formatINR(donation.totalFinancialValue)}
              </div>
            </div>
          </div>

          {/* Notes and Rejection Reason if any */}
          {donation.rejectionReason && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <span className="font-bold">अस्वीकृति का कारण: </span>
              {donation.rejectionReason}
            </div>
          )}

          {donation.notes && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
              <span className="font-semibold text-stone-700">टिप्पणी / नोट्स: </span>
              {donation.notes}
            </div>
          )}

          {/* Signatures and Verification Footer */}
          <div className="pt-6 border-t border-stone-200 flex flex-wrap justify-between items-end gap-6 text-xs text-stone-600">
            <div>
              <p className="text-[11px] text-stone-400">प्रविष्टि कर्ता:</p>
              <p className="font-semibold text-stone-800">
                {donation.createdBy?.name || 'व्यवस्थापक'}
              </p>
              <p className="text-[10px] text-stone-400">
                दिनांक: {formatDate(donation.createdAt)}
              </p>
            </div>

            {donation.verifiedBy && (
              <div className="text-center">
                <div className="inline-block rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 font-serif text-[11px] font-bold text-emerald-800">
                  ✓ मंदिर समिति सत्यापित (Verified)
                </div>
                <p className="mt-1 text-[11px] text-stone-600">
                  द्वारा: {donation.verifiedBy?.name || 'समिति'}
                </p>
              </div>
            )}

            <div className="text-right">
              <div className="h-10 border-b border-stone-400 w-32 ml-auto" />
              <p className="mt-1 font-semibold text-stone-800">अधिकृत हस्ताक्षर</p>
              <p className="text-[10px] text-stone-400">जादम कुलदेवी मंदिर ट्रस्ट</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={modalState.isOpen && modalState.type === 'verify'}
        title="दान सत्यापन (Verify Donation)"
        message={`क्या आप '${donation.donorName}' का दान सत्यापित कर रसीद क्रमांक जारी करना चाहते हैं?`}
        confirmText="हां, सत्यापित करें"
        confirmVariant="success"
        isLoading={modalState.loading}
        onConfirm={handleConfirmAction}
        onClose={handleCloseModal}
      />

      <ConfirmationModal
        isOpen={modalState.isOpen && modalState.type === 'reject'}
        title="दान अस्वीकृत करें (Reject Donation)"
        message={`अस्वीकृति हेतु कारण दर्ज करें:`}
        confirmText="अस्वीकृत करें"
        confirmVariant="danger"
        requireReason={true}
        isLoading={modalState.loading}
        onConfirm={handleConfirmAction}
        onClose={handleCloseModal}
      />

      <ConfirmationModal
        isOpen={modalState.isOpen && modalState.type === 'archive'}
        title="रिकॉर्ड पुरालेख करें (Archive Record)"
        message={`क्या आप इस दान रिकॉर्ड को पुरालेख में डालना चाहते हैं?`}
        confirmText="पुरालेख करें"
        confirmVariant="danger"
        isLoading={modalState.loading}
        onConfirm={handleConfirmAction}
        onClose={handleCloseModal}
      />
    </div>
  );
};
