import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';
import {
  getYatraRegistrationById,
  createAdminYatraRegistration,
  updateYatraRegistration,
} from '../../../services/yatraService';

export const YatraRegistrationFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const [formData, setFormData] = useState({
    yatraType: 'RAM_NAVAMI',
    primaryName: '',
    mobile: '',
    village: '',
    city: '',
    address: '',
    travelDate: new Date().toISOString().split('T')[0],
    departureLocation: 'श्री जादम परिवार कुलदेवी मंदिर प्रांगण, खलघाट',
    numberOfTravelers: 1,
    bookingStatus: 'pending',
    paymentStatus: 'pending',
    paymentAmount: 0,
    paymentMethod: 'cash',
    transactionId: '',
    travelOrganizer: '',
    organizerMobile: '',
    notes: '',
    travelers: [
      {
        name: '',
        age: '',
        gender: 'male',
        mobile: '',
        idType: 'aadhaar',
        idLastFourDigits: '',
        notes: '',
      },
    ],
    allowDuplicate: false,
  });

  useEffect(() => {
    if (isEdit) {
      const loadRecord = async () => {
        try {
          setFetching(true);
          const res = await getYatraRegistrationById(id);
          if (res.success && res.data?.registration) {
            const r = res.data.registration;
            setFormData({
              yatraType: r.yatraType || 'RAM_NAVAMI',
              primaryName: r.primaryName || '',
              mobile: r.mobile || '',
              village: r.village || '',
              city: r.city || '',
              address: r.address || '',
              travelDate: r.travelDate ? new Date(r.travelDate).toISOString().split('T')[0] : '',
              departureLocation: r.departureLocation || '',
              numberOfTravelers: r.numberOfTravelers || 1,
              bookingStatus: r.bookingStatus || 'pending',
              paymentStatus: r.paymentStatus || 'pending',
              paymentAmount: r.paymentAmount || 0,
              paymentMethod: r.paymentMethod || 'cash',
              transactionId: r.transactionId || '',
              travelOrganizer: r.travelOrganizer || '',
              organizerMobile: r.organizerMobile || '',
              notes: r.notes || '',
              travelers: r.travelers && r.travelers.length > 0 ? r.travelers : [
                { name: r.primaryName, mobile: r.mobile, gender: 'male', idType: 'aadhaar' },
              ],
              allowDuplicate: false,
            });
          }
        } catch (err) {
          console.error('Failed to load registration:', err);
          setError('पंजीकरण रिकॉर्ड लोड करने में त्रुटि हुई।');
        } finally {
          setFetching(false);
        }
      };
      loadRecord();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTravelerChange = (index, field, value) => {
    setFormData((prev) => {
      const newTravelers = [...prev.travelers];
      newTravelers[index] = { ...newTravelers[index], [field]: value };
      return { ...prev, travelers: newTravelers };
    });
  };

  const addTraveler = () => {
    setFormData((prev) => ({
      ...prev,
      numberOfTravelers: prev.travelers.length + 1,
      travelers: [
        ...prev.travelers,
        {
          name: '',
          age: '',
          gender: 'male',
          mobile: '',
          idType: prev.yatraType === 'MANSAROVAR' ? 'passport' : 'aadhaar',
          idLastFourDigits: '',
          notes: '',
        },
      ],
    }));
  };

  const removeTraveler = (index) => {
    if (formData.travelers.length <= 1) return;
    setFormData((prev) => {
      const newTravelers = prev.travelers.filter((_, i) => i !== index);
      return {
        ...prev,
        numberOfTravelers: newTravelers.length,
        travelers: newTravelers,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDuplicateWarning(null);

    if (!formData.primaryName.trim() || !formData.mobile.trim() || !formData.travelDate) {
      setError('मुख्य व्यक्ति का नाम, मोबाइल नंबर एवं यात्रा दिनांक अनिवार्य हैं।');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        numberOfTravelers: formData.travelers.length,
        paymentAmount: Number(formData.paymentAmount) || 0,
        travelers: formData.travelers.map((t) => ({
          ...t,
          age: t.age ? parseInt(t.age, 10) : null,
        })),
      };

      if (isEdit) {
        await updateYatraRegistration(id, payload);
        navigate(`/admin/yatra/registrations/${id}`);
      } else {
        const res = await createAdminYatraRegistration(payload);
        if (res.success && res.data) {
          navigate(`/admin/yatra/registrations/${res.data._id}`);
        }
      }
    } catch (err) {
      console.error('Registration save error:', err);
      const apiRes = err.response?.data;
      if (apiRes?.isDuplicate) {
        setDuplicateWarning(apiRes.message);
      } else {
        setError(apiRes?.message || 'रिकॉर्ड सुरक्षित करने में त्रुटि हुई।');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans pb-12">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/yatra/registrations"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          पंजीकरण सूची पर लौटें
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
          {isEdit ? 'पंजीकरण संपादन (Edit)' : 'नया प्रशासनिक पंजीकरण (New)'}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
        {isEdit ? 'यात्रा पंजीकरण विवरण संपादित करें' : 'नया यात्रा पंजीकरण दर्ज करें'}
      </h1>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}

      {duplicateWarning && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">संभावित डुप्लिकेट पंजीकरण</h4>
              <p className="text-sm text-amber-800 mt-0.5">{duplicateWarning}</p>
            </div>
          </div>
          <label className="flex items-center gap-2 pt-2 border-t border-amber-200 text-xs text-amber-950 font-semibold cursor-pointer">
            <input
              type="checkbox"
              name="allowDuplicate"
              checked={formData.allowDuplicate}
              onChange={handleChange}
              className="w-4 h-4 text-amber-700 rounded-sm"
            />
            प्रशासनिक विशेषाधिकार: चेतावनी को अनदेखा कर इस पंजीकरण को सुरक्षित करें (Override duplicate check)
          </label>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* 1. Yatra & Devotee Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-700" />
            यात्रा एवं मुख्य श्रद्धालु विवरण
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                यात्रा का प्रकार <span className="text-rose-600">*</span>
              </label>
              <select
                name="yatraType"
                disabled={isEdit}
                value={formData.yatraType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              >
                <option value="RAM_NAVAMI">श्री राम नवमी दर्शन यात्रा</option>
                <option value="MANSAROVAR">कैलाश मानसरोवर यात्रा</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                मुख्य व्यक्ति का नाम <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                name="primaryName"
                value={formData.primaryName}
                onChange={handleChange}
                placeholder="उदा. मोहनलाल जादम"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                मोबाइल नंबर <span className="text-rose-600">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="९८२६०XXXXX (१० अंक)"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                ग्राम (Village)
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="उदा. खलघाट"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                शहर / तहसील
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="उदा. इंदौर / धरमपुरी"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                यात्रा दिनांक <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                name="travelDate"
                value={formData.travelDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                पूरा डाक पता (Full Address)
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="मकान नंबर, मोहल्ला..."
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                प्रस्थान / बोर्डिंग स्थल
              </label>
              <input
                type="text"
                name="departureLocation"
                value={formData.departureLocation}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Co-Travelers List */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              सह-यात्री सूची (Travelers: {formData.travelers.length})
            </h3>
            <button
              type="button"
              onClick={addTraveler}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> यात्री जोड़ें
            </button>
          </div>

          <div className="space-y-4">
            {formData.travelers.map((traveler, index) => (
              <div key={index} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 uppercase">
                    यात्री #{index + 1} {index === 0 ? '(मुख्य व्यक्ति)' : ''}
                  </span>
                  {formData.travelers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTraveler(index)}
                      className="text-stone-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">नाम *</label>
                    <input
                      type="text"
                      required
                      value={traveler.name}
                      onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1">आयु (वर्ष)</label>
                    <input
                      type="number"
                      value={traveler.age || ''}
                      onChange={(e) => handleTravelerChange(index, 'age', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1">लिंग</label>
                    <select
                      value={traveler.gender}
                      onChange={(e) => handleTravelerChange(index, 'gender', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-sm"
                    >
                      <option value="male">पुरुष</option>
                      <option value="female">महिला</option>
                      <option value="other">अन्य</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1">पहचान पत्र प्रकार</label>
                    <select
                      value={traveler.idType}
                      onChange={(e) => handleTravelerChange(index, 'idType', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-sm"
                    >
                      <option value="aadhaar">आधार (Aadhaar)</option>
                      <option value="voter_id">मतदाता पहचान</option>
                      <option value="passport">पासपोर्ट</option>
                      <option value="pan">पैन कार्ड</option>
                      <option value="driving_license">ड्राइविंग लाइसेंस</option>
                      <option value="other">अन्य</option>
                      <option value="none">कोई नहीं</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1">आईडी अंतिम ४ अंक</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={traveler.idLastFourDigits || ''}
                      onChange={(e) => handleTravelerChange(index, 'idLastFourDigits', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1">मोबाइल</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={traveler.mobile || ''}
                      onChange={(e) => handleTravelerChange(index, 'mobile', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-stone-600 mb-1">टिप्पणी / स्वास्थ्य नोट</label>
                    <input
                      type="text"
                      value={traveler.notes || ''}
                      onChange={(e) => handleTravelerChange(index, 'notes', e.target.value)}
                      placeholder="उदा. वरिष्ठ नागरिक / सीट प्राथमिकता"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Statuses & Financials */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-700" />
            बुकिंग स्थिति एवं भुगतान विवरण
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                बुकिंग स्थिति (Booking Status)
              </label>
              <select
                name="bookingStatus"
                value={formData.bookingStatus}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              >
                <option value="pending">लंबित (Pending)</option>
                <option value="confirmed">पुष्ट (Confirmed)</option>
                <option value="completed">संपन्न (Completed)</option>
                <option value="cancelled">रद्द (Cancelled)</option>
                <option value="waitlisted">प्रतीक्षारत (Waitlisted)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                भुगतान स्थिति (Payment Status)
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              >
                <option value="pending">लंबित (Pending)</option>
                <option value="partial">आंशिक भुगतान (Partial)</option>
                <option value="paid">पूर्ण भुगतान (Paid)</option>
                <option value="refunded">वापस किया गया (Refunded)</option>
                <option value="not_required">आवश्यक नहीं</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                भुगतान राशि (₹)
              </label>
              <input
                type="number"
                min="0"
                name="paymentAmount"
                value={formData.paymentAmount}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                भुगतान माध्यम
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              >
                <option value="cash">नकद (Cash)</option>
                <option value="upi">UPI / ऑनलाइन</option>
                <option value="bank_transfer">बैंक ट्रांसफर (NEFT/RTGS)</option>
                <option value="cheque">चेक (Cheque)</option>
                <option value="other">अन्य</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                लेनदेन संदर्भ (Transaction ID)
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="उदा. UPI-12345"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                सह-आयोजक (यदि लागू हो)
              </label>
              <input
                type="text"
                name="travelOrganizer"
                value={formData.travelOrganizer}
                onChange={handleChange}
                placeholder="आयोजक संस्था"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                आंतरिक प्रशासनिक टिप्पणी (Internal Admin Notes)
              </label>
              <textarea
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="प्रशासनिक संदर्भ हेतु टिप्पणी..."
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/admin/yatra/registrations"
            className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-sm transition"
          >
            रद्द करें
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'सुरक्षित हो रहा है...' : (isEdit ? 'परिवर्तन सुरक्षित करें' : 'पंजीकरण सुरक्षित करें')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default YatraRegistrationFormPage;
