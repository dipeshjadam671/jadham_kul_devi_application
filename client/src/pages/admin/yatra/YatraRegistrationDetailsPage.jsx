import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  FileText,
  Printer,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import {
  getYatraRegistrationById,
  confirmYatraRegistration,
  cancelYatraRegistration,
  completeYatraRegistration,
} from '../../../services/yatraService';
import { createYatraPayment } from '../../../services/yatraPaymentService';

export const YatraRegistrationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getYatraRegistrationById(id);
      if (res.success && res.data) {
        setRegistration(res.data.registration);
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error('Failed to load yatra registration details:', err);
      setError('पंजीकरण विवरण लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleStatusAction = async (action) => {
    try {
      setActionLoading(true);
      if (action === 'confirm') {
        await confirmYatraRegistration(id);
      } else if (action === 'complete') {
        await completeYatraRegistration(id);
      } else if (action === 'cancel') {
        const reason = window.prompt('रद्द करने का कारण दर्ज करें:');
        if (reason === null) {
          setActionLoading(false);
          return;
        }
        await cancelYatraRegistration(id, reason);
      }
      await fetchRecord();
    } catch (err) {
      console.error('Status action failed:', err);
      alert(err.response?.data?.message || 'स्थिति परिवर्तन विफल रहा।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setPaymentError('कृपया मान्य भुगतान राशि दर्ज करें।');
      return;
    }

    try {
      setPaymentSubmitting(true);
      setPaymentError(null);
      await createYatraPayment({
        registrationId: id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId.trim(),
        paymentDate: paymentForm.paymentDate,
        notes: paymentForm.notes.trim(),
      });

      setIsPaymentModalOpen(false);
      setPaymentForm({
        amount: '',
        paymentMethod: 'cash',
        transactionId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      await fetchRecord();
    } catch (err) {
      console.error('Record payment error:', err);
      setPaymentError(err.response?.data?.message || 'भुगतान दर्ज करने में त्रुटि हुई।');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-xl font-bold text-stone-800">{error || 'रिकॉर्ड नहीं मिला'}</h3>
        <Link
          to="/admin/yatra/registrations"
          className="inline-flex items-center gap-2 text-sm text-amber-800 font-semibold underline"
        >
          <ArrowLeft className="w-4 h-4" /> पंजीकरण सूची पर लौटें
        </Link>
      </div>
    );
  }

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans pb-16">

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/yatra/registrations"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          पंजीकरण सूची पर लौटें
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/admin/yatra/registrations/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition"
          >
            <Edit className="w-3.5 h-3.5" />
            संपादित करें
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs rounded-xl transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            प्रिंट
          </button>
        </div>
      </div>

      {/* REGISTRATION SUMMARY CARD */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                registration.yatraType === 'RAM_NAVAMI'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-sky-100 text-sky-800'
              }`}>
                {registration.yatraType === 'RAM_NAVAMI' ? 'श्री राम नवमी दर्शन यात्रा' : 'कैलाश मानसरोवर यात्रा'}
              </span>
              <span className="text-xs text-stone-400 font-mono">वर्ष: {registration.year}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-mono font-bold tracking-wider">
              {registration.registrationNumber}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badges */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              registration.bookingStatus === 'confirmed'
                ? 'bg-emerald-100 text-emerald-800'
                : registration.bookingStatus === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : registration.bookingStatus === 'cancelled'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-stone-100 text-stone-800'
            }`}>
              बुकिंग: {registration.bookingStatus}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              registration.paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : registration.paymentStatus === 'partial'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-800'
            }`}>
              भुगतान: {registration.paymentStatus}
            </span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-stone-500">
            पंजीकरण दिनांक: {new Date(registration.createdAt).toLocaleString('hi-IN')}
          </span>

          <div className="flex items-center gap-2">
            {registration.bookingStatus === 'pending' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStatusAction('confirm')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
              >
                <CheckCircle className="w-3.5 h-3.5" /> पुष्टि करें (Confirm)
              </button>
            )}

            {registration.bookingStatus === 'confirmed' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStatusAction('complete')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                <CheckCircle className="w-3.5 h-3.5" /> यात्रा संपन्न (Complete)
              </button>
            )}

            {registration.bookingStatus !== 'cancelled' && registration.bookingStatus !== 'completed' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStatusAction('cancel')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition"
              >
                <XCircle className="w-3.5 h-3.5" /> रद्द करें (Cancel)
              </button>
            )}
          </div>
        </div>

        {/* Devotee Info Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-xs text-stone-500 uppercase font-semibold block">मुख्य श्रद्धालु</span>
            <strong className="text-base text-stone-900">{registration.primaryName}</strong>
          </div>

          <div>
            <span className="text-xs text-stone-500 uppercase font-semibold block">मोबाइल नंबर</span>
            <strong className="text-base text-stone-900 font-mono">{registration.mobile}</strong>
          </div>

          <div>
            <span className="text-xs text-stone-500 uppercase font-semibold block">ग्राम / शहर</span>
            <span className="text-stone-800">{registration.village ? `${registration.village}, ` : ''}{registration.city}</span>
          </div>

          <div>
            <span className="text-xs text-stone-500 uppercase font-semibold block">यात्रा दिनांक</span>
            <span className="text-stone-800 font-medium">
              {new Date(registration.travelDate).toLocaleDateString('hi-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <div>
            <span className="text-xs text-stone-500 uppercase font-semibold block">प्रस्थान केंद्र</span>
            <span className="text-stone-800">{registration.departureLocation || 'खलघाट'}</span>
          </div>

          <div>
            <span className="text-xs text-stone-500 uppercase font-semibold block">कुल यात्री</span>
            <strong className="text-amber-800 text-base">{registration.numberOfTravelers} सदस्य</strong>
          </div>

          {registration.travelOrganizer && (
            <div className="sm:col-span-2">
              <span className="text-xs text-stone-500 uppercase font-semibold block">सह-आयोजक</span>
              <span className="text-stone-800">{registration.travelOrganizer} ({registration.organizerMobile || 'N/A'})</span>
            </div>
          )}

          {registration.address && (
            <div className="sm:col-span-3">
              <span className="text-xs text-stone-500 uppercase font-semibold block">डाक पता</span>
              <span className="text-stone-800">{registration.address}</span>
            </div>
          )}

          {registration.notes && (
            <div className="sm:col-span-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
              <span className="text-xs text-amber-900 font-bold block mb-1">आंतरिक प्रशासनिक टिप्पणी:</span>
              <p className="text-xs text-stone-700">{registration.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* TRAVELERS TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <h3 className="text-lg font-bold text-stone-900">
            यात्रियों की सूची ({registration.travelers?.length || 0} सदस्य)
          </h3>
          <p className="text-xs text-stone-500">परिवार एवं सह-यात्रियों का पंजीकृत विवरण</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 font-bold">क्र.</th>
                <th className="px-6 py-3 font-bold">यात्री का नाम</th>
                <th className="px-6 py-3 font-bold">आयु</th>
                <th className="px-6 py-3 font-bold">लिंग</th>
                <th className="px-6 py-3 font-bold">पहचान पत्र प्रकार</th>
                <th className="px-6 py-3 font-bold">आईडी अंतिम ४ अंक</th>
                <th className="px-6 py-3 font-bold">मोबाइल</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {registration.travelers?.map((t, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 transition">
                  <td className="px-6 py-4 font-bold text-stone-400">{idx + 1}</td>
                  <td className="px-6 py-4 font-semibold text-stone-900">{t.name}</td>
                  <td className="px-6 py-4">{t.age || '-'}</td>
                  <td className="px-6 py-4">
                    {t.gender === 'male' ? 'पुरुष' : t.gender === 'female' ? 'महिला' : 'अन्य'}
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-mono">{t.idType || 'none'}</td>
                  <td className="px-6 py-4 font-mono font-bold text-stone-800">
                    {t.idLastFourDigits ? `•••• •••• ${t.idLastFourDigits}` : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{t.mobile || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT LEDGER */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              भुगतान खाता एवं किस्त इतिहास (Payment Ledger)
            </h3>
            <p className="text-xs text-stone-500">इस पंजीकरण के अंतर्गत प्राप्त सभी किस्तों का विवरण</p>
          </div>

          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            नया भुगतान दर्ज करें
          </button>
        </div>

        {/* Ledger Summary Stats */}
        <div className="bg-stone-50 p-6 border-b border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-stone-500 uppercase block">कुल प्राप्त राशि (Total Paid)</span>
            <div className="text-2xl font-mono font-bold text-emerald-700 mt-0.5">
              {formatCurrency(registration.paymentAmount)}
            </div>
          </div>
          <div>
            <span className="text-xs text-stone-500 uppercase block">दर्ज किस्तों की संख्या</span>
            <div className="text-2xl font-mono font-bold text-stone-800 mt-0.5">
              {payments.length} किस्तें
            </div>
          </div>
          <div>
            <span className="text-xs text-stone-500 uppercase block">भुगतान स्थिति</span>
            <div className="mt-1">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                registration.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : registration.paymentStatus === 'partial'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-stone-200 text-stone-700'
              }`}>
                {registration.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 font-bold">भुगतान दिनांक</th>
                <th className="px-6 py-3 font-bold">राशि (₹)</th>
                <th className="px-6 py-3 font-bold">माध्यम</th>
                <th className="px-6 py-3 font-bold">लेनदेन आईडी</th>
                <th className="px-6 py-3 font-bold">टिप्पणी</th>
                <th className="px-6 py-3 font-bold">प्राप्तकर्ता</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-stone-400">
                    अभी कोई भुगतान दर्ज नहीं है।
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-amber-50/30 transition">
                    <td className="px-6 py-4 font-mono text-xs">
                      {new Date(p.paymentDate).toLocaleDateString('hi-IN')}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-700 text-base">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4 uppercase text-xs font-semibold">
                      {p.paymentMethod}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-700">
                      {p.transactionId || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-600">
                      {p.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {p.receivedBy?.name || 'व्यवस्थापक'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900">नया भुगतान दर्ज करें</h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                ✕
              </button>
            </div>

            {paymentError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  भुगतान राशि (₹) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="उदा. 3500"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-base focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  भुगतान माध्यम
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                >
                  <option value="cash">नकद (Cash)</option>
                  <option value="upi">UPI / ऑनलाइन</option>
                  <option value="bank_transfer">बैंक ट्रांसफर (Bank Transfer)</option>
                  <option value="cheque">चेक (Cheque)</option>
                  <option value="other">अन्य</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  भुगतान दिनांक
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  लेनदेन आईडी / रसीद क्रमांक (Transaction ID)
                </label>
                <input
                  type="text"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, transactionId: e.target.value }))}
                  placeholder="उदा. UPI-998811"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  टिप्पणी (Notes)
                </label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="उदा. प्रथम किस्त / अग्रिम"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs transition shadow-xs disabled:opacity-50"
                >
                  {paymentSubmitting ? 'सुरक्षित हो रहा है...' : 'भुगतान जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default YatraRegistrationDetailsPage;
