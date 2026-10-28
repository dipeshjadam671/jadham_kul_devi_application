import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Flame,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Users,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import {
  createPujaRecord,
  getPujaRecordById,
  updatePujaRecord,
} from '../../../services/pujaService';

/**
 * PujaRecordFormPage Component - Phase 6
 * Form for creating and editing Mata Ji Annual Puja records with dynamic couple
 * and Jamal records sub-forms.
 */
export const PujaRecordFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    pujaDate: new Date().toISOString().split('T')[0],
    pujaType: 'annual_puja',
    familyName: '',
    primaryPersonName: '',
    mobile: '',
    village: '',
    city: '',
    address: '',
    numberOfPeople: 1,
    numberOfCouples: 0,
    couples: [],
    jamalCount: 0,
    jamalDetails: [],
    jamalNotes: '',
    pujaStatus: 'registered',
    paymentStatus: 'not_required',
    amount: 0,
    paymentMethod: 'cash',
    notes: '',
    isPublic: true,
  });

  useEffect(() => {
    if (isEditMode) {
      const loadRecord = async () => {
        try {
          setLoading(true);
          const res = await getPujaRecordById(id);
          if (res.success && res.data) {
            const r = res.data;
            setFormData({
              year: r.year || new Date().getFullYear(),
              pujaDate: r.pujaDate ? new Date(r.pujaDate).toISOString().split('T')[0] : '',
              pujaType: r.pujaType || 'annual_puja',
              familyName: r.familyName || '',
              primaryPersonName: r.primaryPersonName || '',
              mobile: r.mobile || '',
              village: r.village || '',
              city: r.city || '',
              address: r.address || '',
              numberOfPeople: r.numberOfPeople || 1,
              numberOfCouples: r.numberOfCouples || 0,
              couples: r.couples || [],
              jamalCount: r.jamalCount || 0,
              jamalDetails: r.jamalDetails || [],
              jamalNotes: r.jamalNotes || '',
              pujaStatus: r.pujaStatus || 'registered',
              paymentStatus: r.paymentStatus || 'not_required',
              amount: r.amount || 0,
              paymentMethod: r.paymentMethod || 'cash',
              notes: r.notes || '',
              isPublic: r.isPublic !== false,
            });
          }
        } catch (err) {
          console.error('Error loading puja record:', err);
          setError('रिकॉर्ड लोड करने में असमर्थ।');
        } finally {
          setLoading(false);
        }
      };

      loadRecord();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Dynamic Couple Sub-form Helpers
  const addCouple = () => {
    setFormData((prev) => ({
      ...prev,
      couples: [
        ...prev.couples,
        { husbandName: '', wifeName: '', village: prev.village || '', mobile: '', notes: '' },
      ],
      numberOfCouples: prev.couples.length + 1,
    }));
  };

  const removeCouple = (index) => {
    setFormData((prev) => {
      const updated = prev.couples.filter((_, i) => i !== index);
      return {
        ...prev,
        couples: updated,
        numberOfCouples: updated.length,
      };
    });
  };

  const updateCoupleField = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.couples];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, couples: updated };
    });
  };

  // Dynamic Jamal Detail Sub-form Helpers
  const addJamalDetail = () => {
    setFormData((prev) => ({
      ...prev,
      jamalDetails: [
        ...prev.jamalDetails,
        {
          name: prev.primaryPersonName || '',
          village: prev.village || '',
          date: prev.pujaDate,
          quantity: 1,
          notes: '',
        },
      ],
      jamalCount: prev.jamalDetails.length + 1,
    }));
  };

  const removeJamalDetail = (index) => {
    setFormData((prev) => {
      const updated = prev.jamalDetails.filter((_, i) => i !== index);
      return {
        ...prev,
        jamalDetails: updated,
        jamalCount: updated.length,
      };
    });
  };

  const updateJamalField = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.jamalDetails];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, jamalDetails: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.primaryPersonName.trim()) {
      setError('यजमान का नाम अनिवार्य है।');
      return;
    }
    if (Number(formData.numberOfPeople) < 1) {
      setError('श्रद्धालुओं की संख्या कम से कम 1 होनी चाहिए।');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        year: Number(formData.year),
        numberOfPeople: Number(formData.numberOfPeople),
        numberOfCouples: Number(formData.numberOfCouples),
        jamalCount: Number(formData.jamalCount),
        amount: Number(formData.amount),
      };

      if (isEditMode) {
        await updatePujaRecord(id, payload);
      } else {
        await createPujaRecord(payload);
      }

      navigate('/admin/puja/records');
    } catch (err) {
      console.error('Error saving puja record:', err);
      setError(err.response?.data?.message || err.message || 'सहेजने में त्रुटि आई।');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-stone-500 text-sm">
        पूजा रिकॉर्ड लोड हो रहा है...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/puja/records"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-600" />
              <span>{isEditMode ? 'पूजा रिकॉर्ड संपादन' : 'नया पूजा रिकॉर्ड दर्ज करें'}</span>
            </h1>
            <p className="text-xs text-stone-500">
              {isEditMode ? 'पूर्व दर्ज पूजा विवरण अद्यतित करें' : 'वार्षिक पूजा संकल्प एवं यजमान प्रविष्टि'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. PUJA EVENT DETAILS */}
        <Card variant="default" className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 border-b border-stone-100 pb-2">
            1. पूजा एवं समय निर्धारण (Event Details)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                पूजा वर्ष (Year) *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                पूजा दिनांक (Date) *
              </label>
              <input
                type="date"
                name="pujaDate"
                value={formData.pujaDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                पूजा प्रकार (Puja Type) *
              </label>
              <select
                name="pujaType"
                value={formData.pujaType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="annual_puja">वार्षिक पूजा (Annual Puja)</option>
                <option value="special_puja">विशेष पूजा (Special Puja)</option>
                <option value="navratri_puja">नवरात्रि पूजा (Navratri Puja)</option>
                <option value="ashtami_puja">अष्टमी पूजा (Ashtami Puja)</option>
                <option value="navami_puja">नवमी पूजा (Navami Puja)</option>
                <option value="other">अन्य (Other)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 2. DEVOTEE & FAMILY DETAILS */}
        <Card variant="default" className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 border-b border-stone-100 pb-2">
            2. यजमान एवं पारिवारिक विवरण (Devotee Information)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                मुख्य यजमान का नाम (Primary Person) *
              </label>
              <input
                type="text"
                name="primaryPersonName"
                value={formData.primaryPersonName}
                onChange={handleChange}
                required
                placeholder="उदा. श्री राजेश जादम"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                परिवार का नाम (Family Name / शाखा)
              </label>
              <input
                type="text"
                name="familyName"
                value={formData.familyName}
                onChange={handleChange}
                placeholder="उदा. जादम परिवार (बड़ा खेड़ा)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                मोबाइल नंबर (Mobile)
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="उदा. 98260XXXXX"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                मूल गांव / कस्बा (Village)
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="उदा. खलघाट"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                शहर / जिला (City)
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="उदा. धार / इंदौर"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                वर्तमान निवास पता (Address)
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="मकान नं., वार्ड, सड़क..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </Card>

        {/* 3. COUNTS & DYNAMIC COUPLE SUBDOCUMENTS */}
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
              3. सहभागिता एवं दंपति जोड़ा विवरण (Couples Tracking)
            </h2>
            <button
              type="button"
              onClick={addCouple}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ जोड़ा विवरण जोड़ें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                कुल सम्मिलित सदस्य (Number of People) *
              </label>
              <input
                type="number"
                min="1"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                दंपति जोड़ों की संख्या (Number of Couples)
              </label>
              <input
                type="number"
                min="0"
                name="numberOfCouples"
                value={formData.numberOfCouples}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Dynamic Couples List */}
          {formData.couples.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-600">सहभागी दंपतियों का विवरण:</p>
              {formData.couples.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-stone-200 bg-sand-50/50 relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">जोड़ा #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCouple(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="पति का नाम"
                      value={c.husbandName}
                      onChange={(e) => updateCoupleField(idx, 'husbandName', e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="पत्नी का नाम"
                      value={c.wifeName}
                      onChange={(e) => updateCoupleField(idx, 'wifeName', e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="गांव"
                      value={c.village}
                      onChange={(e) => updateCoupleField(idx, 'village', e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="मोबाइल (वैकल्पिक)"
                      value={c.mobile}
                      onChange={(e) => updateCoupleField(idx, 'mobile', e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 4. JAMAL / NIKASI DETAILS */}
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
              4. जमाल निकासी रिकॉर्ड (Jamal Details)
            </h2>
            <button
              type="button"
              onClick={addJamalDetail}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ जमाल विवरण जोड़ें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                जमाल निकासी कुल संख्या (Jamal Count)
              </label>
              <input
                type="number"
                min="0"
                name="jamalCount"
                value={formData.jamalCount}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                जमाल संबंधी सामान्य टिप्पणी (Jamal Notes)
              </label>
              <input
                type="text"
                name="jamalNotes"
                value={formData.jamalNotes}
                onChange={handleChange}
                placeholder="उदा. निकासी सकुशल संपन्न..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Dynamic Jamal Items List */}
          {formData.jamalDetails.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-600">जमाल निकासी विशिष्ट प्रविष्टियां:</p>
              {formData.jamalDetails.map((j, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-stone-200 bg-sand-50/50 relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">निकासी #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeJamalDetail(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="नाम"
                      value={j.name}
                      onChange={(e) => updateJamalField(idx, 'name', e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="गांव"
                      value={j.village}
                      onChange={(e) => updateJamalField(idx, 'village', e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="मात्रा (Qty)"
                      value={j.quantity}
                      onChange={(e) => updateJamalField(idx, 'quantity', Number(e.target.value))}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="टिप्पणी"
                      value={j.notes}
                      onChange={(e) => updateJamalField(idx, 'notes', e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 5. STATUS & PAYMENT INFORMATION */}
        <Card variant="default" className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 border-b border-stone-100 pb-2">
            5. स्थिति एवं सहयोग राशि (Status & Contribution)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                पूजा स्थिति (Puja Status)
              </label>
              <select
                name="pujaStatus"
                value={formData.pujaStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="registered">पंजीकृत (Registered)</option>
                <option value="completed">संपन्न (Completed)</option>
                <option value="scheduled">नियत (Scheduled)</option>
                <option value="cancelled">निरस्त (Cancelled)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                भुगतान स्थिति (Payment)
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="not_required">निःशुल्क / लागू नहीं</option>
                <option value="pending">लंबित (Pending)</option>
                <option value="partial">आंशिक (Partial)</option>
                <option value="paid">प्राप्त (Paid)</option>
                <option value="refunded">वापस (Refunded)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                सहयोग राशि (Amount ₹)
              </label>
              <input
                type="number"
                min="0"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                माध्यम (Payment Method)
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="cash">नकद (Cash)</option>
                <option value="upi">UPI / QR</option>
                <option value="bank_transfer">बैंक ट्रांसफर (Bank Transfer)</option>
                <option value="cheque">चेक (Cheque)</option>
                <option value="none">लागू नहीं</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              अतिरिक्त प्रशासनिक टिप्पणी (Notes)
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="विशेष संकल्प, मंत्रोच्चार या पूजन विवरण..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="isPublic" className="text-xs font-medium text-stone-700 cursor-pointer">
              वार्षिक समग्र सांख्यिकी में सम्मिलित करें (Include in public aggregates)
            </label>
          </div>
        </Card>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/admin/puja/records">
            <Button variant="outline" size="md">
              रद्द करें
            </Button>
          </Link>
          <Button variant="gold" size="md" type="submit" isLoading={submitting}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isEditMode ? 'रिकॉर्ड अद्यतित करें' : 'पूजा रिकॉर्ड सहेजें'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PujaRecordFormPage;
