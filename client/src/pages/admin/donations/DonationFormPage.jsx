import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  createDonation,
  getDonationById,
  updateDonation,
} from '../../../services/donationService';
import { formatDateForInput, formatINR } from '../../../utils/formatters';

export const DonationFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    donorName: '',
    village: '',
    city: '',
    address: '',
    mobile: '',
    donationDate: formatDateForInput(new Date()),
    donationType: 'cash',
    paymentMethod: 'cash',
    amount: '',
    itemName: '',
    itemQuantity: '',
    itemUnit: '',
    itemPrice: '',
    transactionId: '',
    purpose: 'सामान्य दान (General Donation)',
    notes: '',
    isPublic: true,
    autoVerify: false,
  });

  useEffect(() => {
    if (isEditMode) {
      const loadDonation = async () => {
        try {
          const res = await getDonationById(id);
          if (res.success && res.data) {
            const d = res.data;
            setFormData({
              donorName: d.donorName || '',
              village: d.village || '',
              city: d.city || '',
              address: d.address || '',
              mobile: d.mobile || '',
              donationDate: formatDateForInput(d.donationDate),
              donationType: d.donationType || 'cash',
              paymentMethod: d.paymentMethod || 'cash',
              amount: d.amount || '',
              itemName: d.itemName || '',
              itemQuantity: d.itemQuantity || '',
              itemUnit: d.itemUnit || '',
              itemPrice: d.itemPrice || '',
              transactionId: d.transactionId || '',
              purpose: d.purpose || 'सामान्य दान (General Donation)',
              notes: d.notes || '',
              isPublic: d.isPublic !== undefined ? d.isPublic : true,
              autoVerify: false,
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'दान विवरण लोड करने में विफल');
        } finally {
          setLoading(false);
        }
      };
      loadDonation();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isItemDonation = formData.donationType === 'item' || formData.donationType === 'mixed';
  const isMonetaryDonation = formData.donationType !== 'item';

  // Live estimated total value calculation preview for the user
  const estimatedItemValue = isItemDonation
    ? (Number(formData.itemQuantity) || 0) * (Number(formData.itemPrice) || 0)
    : 0;
  const estimatedMonetaryAmount = isMonetaryDonation ? Number(formData.amount) || 0 : 0;
  const estimatedTotalFinancialValue = estimatedMonetaryAmount + estimatedItemValue;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!formData.donorName.trim()) {
        throw new Error('दानदाता का नाम अनिवार्य है (Donor name is required)');
      }

      if (isItemDonation && !formData.itemName.trim()) {
        throw new Error('वस्तु का नाम अनिवार्य है (Item name is required)');
      }

      const payload = {
        ...formData,
        amount: isMonetaryDonation ? Number(formData.amount) || 0 : 0,
        itemQuantity: isItemDonation ? Number(formData.itemQuantity) || 0 : 0,
        itemPrice: isItemDonation ? Number(formData.itemPrice) || 0 : 0,
      };

      if (isEditMode) {
        await updateDonation(id, payload);
      } else {
        await createDonation(payload);
      }

      navigate('/admin/donations');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'प्रविष्टि सहेजने में त्रुटि हुई');
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            {isEditMode ? 'दान प्रविष्टि संपादित करें (Edit Donation)' : 'नया दान दर्ज करें (Record Donation)'}
          </h1>
          <p className="text-xs text-stone-500">
            दानदाता का नाम, गांव, राशि अथवा वस्तु विवरण पूर्ण सावधानी से भरें
          </p>
        </div>
        <Link
          to="/admin/donations"
          className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
        >
          ← वापस जाएं (Back)
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        {/* Donor Information Section */}
        <div>
          <h2 className="border-b border-stone-100 pb-2 font-serif text-base font-bold text-stone-800">
            1. दानदाता विवरण (Donor Information)
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700">
                दानदाता का नाम (Donor Full Name) *
              </label>
              <input
                type="text"
                name="donorName"
                required
                value={formData.donorName}
                onChange={handleChange}
                placeholder="उदा. श्री रमेशजी जादम"
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                गांव / कस्बा (Village)
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="उदा. खलघाट / धामनोद"
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                जिला / शहर (City / District)
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="उदा. धार / खरगोन"
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                मोबाइल नंबर (Mobile Number)
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="उदा. 98260XXXXX"
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400">सार्वजनिक पोर्टल पर फोन नंबर स्वतः सुरक्षित रखा जाता है</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                दान दिनांक (Donation Date) *
              </label>
              <input
                type="date"
                name="donationDate"
                required
                value={formData.donationDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700">
                पूरा पता (Full Address - Optional)
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="मकान नंबर, मोहल्ला, गली..."
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Donation Details Section */}
        <div className="border-t border-stone-100 pt-5">
          <h2 className="border-b border-stone-100 pb-2 font-serif text-base font-bold text-stone-800">
            2. दान प्रकार एवं वित्तीय विवरण (Donation Details)
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700">
                दान का प्रकार (Donation Type) *
              </label>
              <select
                name="donationType"
                value={formData.donationType}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="cash">नगद (Cash)</option>
                <option value="upi">यूपीआई (UPI)</option>
                <option value="bank_transfer">बैंक ट्रांसफर (Bank Transfer / NEFT)</option>
                <option value="item">वस्तु दान (Item Donation)</option>
                <option value="mixed">मिश्रित - नगद + वस्तु (Mixed)</option>
                <option value="other">अन्य (Other)</option>
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
                <option value="other">अन्य / वस्तु (Other)</option>
              </select>
            </div>

            {/* Monetary Amount Field (if applicable) */}
            {isMonetaryDonation && (
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  नगद / वित्तीय राशि (Monetary Amount ₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="1"
                  required={!isItemDonation}
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="उदा. 5100"
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden font-semibold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                ट्रांजेक्शन आईडी / चेक क्र. (Txn ID / Ref)
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="उदा. UPI12345678 या Cheque #000123"
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Item Donation Fields (Conditionally shown) */}
          {isItemDonation && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-4">
              <h3 className="font-serif text-xs font-bold text-amber-900">
                वस्तु दान विवरण (Item Contribution Details)
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    वस्तु का नाम (Item Name) *
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    required
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="उदा. सीमेंट, तेल, पंखे, फर्श टाइल्स..."
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    मात्रा (Quantity)
                  </label>
                  <input
                    type="number"
                    name="itemQuantity"
                    min="0"
                    value={formData.itemQuantity}
                    onChange={handleChange}
                    placeholder="उदा. 25"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    इकाई (Unit)
                  </label>
                  <input
                    type="text"
                    name="itemUnit"
                    value={formData.itemUnit}
                    onChange={handleChange}
                    placeholder="उदा. बोरी, डब्बे, नग"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    अनुमानित दर प्रति इकाई (Estimated Rate ₹)
                  </label>
                  <input
                    type="number"
                    name="itemPrice"
                    min="0"
                    value={formData.itemPrice}
                    onChange={handleChange}
                    placeholder="उदा. 380"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col justify-center">
                  <span className="text-xs text-stone-500">अनुमानित वस्तु कुल मूल्य:</span>
                  <span className="font-serif text-sm font-bold text-amber-800">
                    {formatINR(estimatedItemValue)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Live Calculated Financial Value Box */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-stone-900 p-4 text-white">
            <div>
              <p className="text-xs text-stone-400">कुल अनुमानित वित्तीय मूल्य (Total Financial Value)</p>
              <p className="text-[11px] text-stone-400">
                नगद राशि {formatINR(estimatedMonetaryAmount)} + वस्तु मूल्य {formatINR(estimatedItemValue)}
              </p>
            </div>
            <div className="font-serif text-2xl font-bold text-amber-400">
              {formatINR(estimatedTotalFinancialValue)}
            </div>
          </div>
        </div>

        {/* Purpose, Notes & Visibility */}
        <div className="border-t border-stone-100 pt-5 space-y-4">
          <h2 className="border-b border-stone-100 pb-2 font-serif text-base font-bold text-stone-800">
            3. दान उद्देश्य एवं प्राथमिकता (Purpose & Settings)
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700">
                दान का उद्देश्य (Purpose)
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="उदा. मंदिर निर्माण, अन्नक्षेत्र, उत्सव..."
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                टिप्पणी / आंतरिक विवरण (Internal Notes)
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="आंतरिक संदर्भ हेतु विवरण..."
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 rounded-sm text-amber-600 focus:ring-amber-500"
              />
              <span>सार्वजनिक दान पंजी में प्रदर्शित करें (Display on Public Register)</span>
            </label>

            {!isEditMode && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-800">
                <input
                  type="checkbox"
                  name="autoVerify"
                  checked={formData.autoVerify}
                  onChange={handleChange}
                  className="h-4 w-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span>तुरंत सत्यापित करें एवं रसीद क्र. जारी करें (Auto-verify)</span>
              </label>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 border-t border-stone-100 pt-5">
          <button
            type="button"
            onClick={() => navigate('/admin/donations')}
            disabled={submitting}
            className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50"
          >
            रद्द करें (Cancel)
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 transition"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isEditMode ? 'परिवर्तन सहेजें (Save Changes)' : 'दान सुरक्षित करें (Save Donation)'}
          </button>
        </div>
      </form>
    </div>
  );
};
