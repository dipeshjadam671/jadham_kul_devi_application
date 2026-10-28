import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  createIncome,
  getIncomeById,
  updateIncome,
} from '../../../services/incomeService';
import { formatDateForInput, INCOME_CATEGORIES } from '../../../utils/formatters';

export const IncomeFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    date: formatDateForInput(new Date()),
    category: 'event_income',
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: '',
    isPublic: true,
  });

  useEffect(() => {
    if (isEditMode) {
      const loadIncome = async () => {
        try {
          const res = await getIncomeById(id);
          if (res.success && res.data) {
            const item = res.data;
            setFormData({
              title: item.title || '',
              description: item.description || '',
              amount: item.amount || '',
              date: formatDateForInput(item.date),
              category: item.category || 'event_income',
              paymentMethod: item.paymentMethod || 'cash',
              referenceNumber: item.referenceNumber || '',
              notes: item.notes || '',
              isPublic: item.isPublic !== undefined ? item.isPublic : true,
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'आय विवरण लोड करने में विफल');
        } finally {
          setLoading(false);
        }
      };
      loadIncome();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        throw new Error('शीर्षक अनिवार्य है (Title is required)');
      }
      if (formData.amount === '' || Number(formData.amount) < 0) {
        throw new Error('वैध राशि दर्ज करें (Valid amount is required)');
      }

      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (isEditMode) {
        await updateIncome(id, payload);
      } else {
        await createIncome(payload);
      }

      navigate('/admin/income');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'आय प्रविष्टि सहेजने में त्रुटि');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-stone-400">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
        <span className="ml-3 text-sm">लोड हो रहा है...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            {isEditMode ? 'आय प्रविष्टि संपादित करें (Edit Income)' : 'नई आय प्रविष्टि (Record Income)'}
          </h1>
          <p className="text-xs text-stone-500">
            उत्सव बोली, धर्मशाला व्यवस्था सहयोग अथवा अन्य मंदिर राजस्व दर्ज करें
          </p>
        </div>
        <Link
          to="/admin/income"
          className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
        >
          ← वापस जाएं
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-stone-700">
            आय का शीर्षक / मद (Title) *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="उदा. महाआरती थाली बोली, धर्मशाला सहयोग..."
            className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-stone-700">
              राशि (Amount ₹) *
            </label>
            <input
              type="number"
              name="amount"
              min="0"
              required
              value={formData.amount}
              onChange={handleChange}
              placeholder="उदा. 15000"
              className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm font-semibold text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700">
              दिनांक (Date) *
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700">
              श्रेणी (Category) *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-hidden"
            >
              {Object.entries(INCOME_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700">
              भुगतान माध्यम (Payment Method) *
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-hidden"
            >
              <option value="cash">नगद (Cash)</option>
              <option value="upi">यूपीआई (UPI)</option>
              <option value="bank_transfer">बैंक ट्रांसफर (Bank Transfer)</option>
              <option value="cheque">चेक (Cheque)</option>
              <option value="other">अन्य (Other)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700">
              संदर्भ क्र. / रसीद क्र. (Reference Number)
            </label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              placeholder="उदा. BOLI-01 या UPI Ref Number..."
              className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700">
              विस्तृत विवरण (Description)
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="सहयोगकर्ता का नाम अथवा कार्यक्रम का संक्षिप्त विवरण..."
              className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700">
              आंतरिक नोट्स (Internal Notes)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="केवल समिति संदर्भ हेतु..."
              className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 rounded-sm text-amber-600 focus:ring-amber-500"
            />
            <span>सार्वजनिक वित्तीय पंजी में प्रदर्शित करें (Display on Public Register)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-stone-100 pt-5">
          <button
            type="button"
            onClick={() => navigate('/admin/income')}
            disabled={submitting}
            className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50"
          >
            रद्द करें
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 transition"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isEditMode ? 'परिवर्तन सहेजें' : 'आय सुरक्षित करें'}
          </button>
        </div>
      </form>
    </div>
  );
};
