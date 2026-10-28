import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  User,
  Users,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { registerPublicYatra, getPublicYatraInfo } from '../../../services/yatraService';

export const RamNavamiRegistrationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [yatraInfo, setYatraInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    yatraType: 'RAM_NAVAMI',
    primaryName: '',
    mobile: '',
    village: '',
    city: '',
    address: '',
    departureLocation: 'श्री जादम परिवार कुलदेवी मंदिर प्रांगण, खलघाट',
    travelDate: '2026-04-15',
    numberOfTravelers: 1,
    travelers: [
      {
        name: '',
        age: '',
        gender: 'male',
        mobile: '',
        idType: 'aadhaar',
        idLastFourDigits: '',
      },
    ],
    termsAccepted: false,
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await getPublicYatraInfo('RAM_NAVAMI');
        if (res?.success && res.data) {
          setYatraInfo(res.data);
          if (res.data.startDate) {
            const formattedDate = new Date(res.data.startDate).toISOString().split('T')[0];
            setFormData((prev) => ({
              ...prev,
              travelDate: formattedDate,
              departureLocation: res.data.departureLocation || prev.departureLocation,
            }));
          }
        }
      } catch (e) {
        console.warn('Could not fetch Ram Navami info:', e);
      }
    };
    fetchInfo();
  }, []);

  const handlePrimaryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Sync traveler 0 with primary name/mobile if it's the same
      if (name === 'primaryName' && updated.travelers.length > 0) {
        updated.travelers[0].name = value;
      }
      if (name === 'mobile' && updated.travelers.length > 0) {
        updated.travelers[0].mobile = value;
      }
      return updated;
    });
    setError(null);
    setDuplicateWarning(null);
  };

  const handleTravelerChange = (index, field, value) => {
    setFormData((prev) => {
      const newTravelers = [...prev.travelers];
      newTravelers[index] = { ...newTravelers[index], [field]: value };
      return { ...prev, travelers: newTravelers };
    });
  };

  const addTraveler = () => {
    if (formData.travelers.length >= 50) {
      setError('अधिकतम ५० यात्रियों का पंजीकरण अनुमत है।');
      return;
    }
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
          idType: 'aadhaar',
          idLastFourDigits: '',
        },
      ],
    }));
  };

  const removeTraveler = (index) => {
    if (formData.travelers.length <= 1) {
      return;
    }
    setFormData((prev) => {
      const newTravelers = prev.travelers.filter((_, i) => i !== index);
      return {
        ...prev,
        numberOfTravelers: newTravelers.length,
        travelers: newTravelers,
      };
    });
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.primaryName.trim()) {
      setError('कृपया मुख्य व्यक्ति / परिवार प्रमुख का नाम दर्ज करें।');
      return false;
    }
    if (!formData.mobile.trim() || !/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      setError('कृपया एक मान्य १० अंकों का भारतीय मोबाइल नंबर दर्ज करें।');
      return false;
    }
    if (!formData.city.trim() && !formData.village.trim()) {
      setError('कृपया अपना शहर अथवा ग्राम का नाम दर्ज करें।');
      return false;
    }
    if (!formData.travelDate) {
      setError('कृपया यात्रा दिनांक का चयन करें।');
      return false;
    }
    setError(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    for (let i = 0; i < formData.travelers.length; i++) {
      const t = formData.travelers[i];
      if (!t.name.trim()) {
        setError(`यात्री क्रमांक ${i + 1} का नाम अनिवार्य है।`);
        return false;
      }
      if (t.idLastFourDigits && !/^\d{4}$/.test(t.idLastFourDigits)) {
        setError(`यात्री क्रमांक ${i + 1} का पहचान पत्र क्रमांक केवल अंतिम ४ अंक होना चाहिए।`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      setError('पंजीकरण पूर्ण करने के लिए कृपया यात्रा नियम एवं शर्तों की स्वीकृति प्रदान करें।');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDuplicateWarning(null);

      const payload = {
        yatraType: 'RAM_NAVAMI',
        primaryName: formData.primaryName.trim(),
        mobile: formData.mobile.trim(),
        village: formData.village.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        departureLocation: formData.departureLocation.trim(),
        travelDate: formData.travelDate,
        numberOfTravelers: formData.travelers.length,
        travelers: formData.travelers.map((t) => ({
          name: t.name.trim(),
          age: t.age ? parseInt(t.age, 10) : null,
          gender: t.gender,
          mobile: t.mobile ? t.mobile.trim() : '',
          idType: t.idType,
          idLastFourDigits: t.idLastFourDigits ? t.idLastFourDigits.trim() : '',
        })),
      };

      const res = await registerPublicYatra(payload);

      if (res.success && res.data) {
        navigate(`/yatra/registration-success/${res.data.registrationNumber}`, {
          state: { registration: res.data },
        });
      } else {
        setError(res.message || 'पंजीकरण में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }
    } catch (err) {
      console.error('Yatra registration failed:', err);
      const apiRes = err.response?.data;
      if (apiRes?.isDuplicate) {
        setDuplicateWarning(apiRes.message);
      } else {
        setError(apiRes?.message || 'पंजीकरण विफल रहा। कृपया विवरण जांचें अथवा बाद में प्रयास करें।');
      }
    } finally {
      setLoading(false);
    }
  };

  const feePerPerson = yatraInfo?.feePerPerson || 3500;
  const estimatedTotal = feePerPerson * formData.travelers.length;

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            to="/yatra"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            यात्रा मुख्य पृष्ठ पर लौटें
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            श्री राम नवमी दर्शन यात्रा
          </span>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 1 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                १
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${step === 1 ? 'text-amber-900' : 'text-stone-500'}`}>
                मुख्य व्यक्ति विवरण
              </span>
            </div>

            <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-amber-600' : 'bg-stone-200'}`} />

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 2 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                २
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${step === 2 ? 'text-amber-900' : 'text-stone-500'}`}>
                सह-यात्री एवं परिवार
              </span>
            </div>

            <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 3 ? 'bg-amber-600' : 'bg-stone-200'}`} />

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 3 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                ३
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${step === 3 ? 'text-amber-900' : 'text-stone-500'}`}>
                समीक्षा एवं पुष्टि
              </span>
            </div>
          </div>
        </div>

        {/* ERROR / DUPLICATE NOTIFICATION */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-800">{error}</p>
          </div>
        )}

        {duplicateWarning && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-start gap-3">
            <Info className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">पूर्व पंजीकरण पाया गया</h4>
              <p className="text-sm text-amber-800 mt-1">{duplicateWarning}</p>
              <div className="mt-3">
                <Link
                  to="/yatra/check-registration"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 underline hover:text-amber-950"
                >
                  अपने पंजीकरण की स्थिति यहाँ जांचें →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-10 space-y-8">

          {/* STEP 1: PRIMARY DEVOTEE */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">चरण १</span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  मुख्य श्रद्धालु एवं संपर्क विवरण
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  यह विवरण मुख्य संपर्क व्यक्ति एवं परिवार प्रमुख के रूप में पंजीकृत रहेगा।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    मुख्य व्यक्ति का नाम <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="primaryName"
                      value={formData.primaryName}
                      onChange={handlePrimaryChange}
                      placeholder="उदा. मोहनलाल जादम"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    मोबाइल नंबर <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="mobile"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={handlePrimaryChange}
                      placeholder="९८२६०XXXXX (१० अंक)"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    ग्राम (Village)
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handlePrimaryChange}
                    placeholder="उदा. खलघाट"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    शहर / तहसील <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handlePrimaryChange}
                    placeholder="उदा. धरमपुरी / इंदौर"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    पूरा पता (Full Address)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handlePrimaryChange}
                    placeholder="मकान नंबर, गली, मोहल्ला..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    प्रस्थान / बोर्डिंग स्थल
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="departureLocation"
                      value={formData.departureLocation}
                      onChange={handlePrimaryChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    यात्रा दिनांक <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handlePrimaryChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CO-TRAVELERS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">चरण २</span>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    सह-यात्री एवं परिवार के सदस्य
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    कुल यात्री: <strong className="text-amber-800">{formData.travelers.length}</strong> (१ से ५० यात्री)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTraveler}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-semibold rounded-xl transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  और सदस्य जोड़ें
                </button>
              </div>

              {/* Travelers List */}
              <div className="space-y-4">
                {formData.travelers.map((traveler, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider bg-stone-200/80 px-2.5 py-1 rounded-md">
                        यात्री #{index + 1} {index === 0 ? '(मुख्य व्यक्ति)' : ''}
                      </span>
                      {formData.travelers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTraveler(index)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition"
                          title="यात्री हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          पूरा नाम <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={traveler.name}
                          onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                          placeholder="यात्री का नाम"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-amber-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          आयु (वर्ष)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="110"
                          value={traveler.age}
                          onChange={(e) => handleTravelerChange(index, 'age', e.target.value)}
                          placeholder="उदा. 35"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-amber-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          लिंग (Gender)
                        </label>
                        <select
                          value={traveler.gender}
                          onChange={(e) => handleTravelerChange(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-amber-600 focus:outline-none"
                        >
                          <option value="male">पुरुष (Male)</option>
                          <option value="female">महिला (Female)</option>
                          <option value="other">अन्य (Other)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          पहचान पत्र प्रकार
                        </label>
                        <select
                          value={traveler.idType}
                          onChange={(e) => handleTravelerChange(index, 'idType', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-amber-600 focus:outline-none"
                        >
                          <option value="aadhaar">आधार कार्ड (Aadhaar)</option>
                          <option value="voter_id">मतदाता पहचान पत्र (Voter ID)</option>
                          <option value="pan">पैन कार्ड (PAN)</option>
                          <option value="driving_license">ड्राइविंग लाइसेंस (DL)</option>
                          <option value="passport">पासपोर्ट (Passport)</option>
                          <option value="other">अन्य सरकारी आईडी</option>
                          <option value="none">कोई नहीं</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          पहचान पत्र के अंतिम ४ अंक
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={traveler.idLastFourDigits}
                          onChange={(e) => handleTravelerChange(index, 'idLastFourDigits', e.target.value)}
                          placeholder="उदा. 4589"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono focus:ring-2 focus:ring-amber-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          व्यक्तिगत मोबाइल (यदि हो)
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={traveler.mobile}
                          onChange={(e) => handleTravelerChange(index, 'mobile', e.target.value)}
                          placeholder="वैकल्पिक मोबाइल"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono focus:ring-2 focus:ring-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-900">
                💡 <strong>सूचना:</strong> सुरक्षा नियमों के तहत आधार कार्ड का पूरा नंबर कभी न दें। केवल अंतिम ४ अंक ही सत्यापन के लिए पर्याप्त हैं।
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">चरण ३</span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  पंजीकरण सारांश एवं पुष्टि
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  कृपया प्रविष्ट किए गए विवरण की पुनः जांच कर पुष्टि करें।
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-stone-200">
                  <div>
                    <span className="text-xs text-stone-500 block">मुख्य श्रद्धालु</span>
                    <strong className="text-base text-stone-900">{formData.primaryName}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">मोबाइल नंबर</span>
                    <strong className="text-base text-stone-900 font-mono">{formData.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">ग्राम / शहर</span>
                    <span className="text-stone-800">{formData.village ? `${formData.village}, ` : ''}{formData.city}</span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">यात्रा दिनांक</span>
                    <span className="text-stone-800">{formData.travelDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">प्रस्थान केंद्र</span>
                    <span className="text-stone-800">{formData.departureLocation}</span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">कुल यात्री संख्या</span>
                    <strong className="text-amber-800 font-bold">{formData.travelers.length} व्यक्ति</strong>
                  </div>
                </div>

                {/* Estimated Cost calculation */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-stone-600">अनुमानित सहयोग राशि ({formData.travelers.length} × ₹{feePerPerson}):</span>
                  <span className="text-xl font-bold text-amber-900 font-mono">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-amber-700 border-stone-300 rounded-sm focus:ring-amber-600"
                  />
                  <span className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                    मैं यह प्रमाणित करता/करती हूँ कि दी गई सभी जानकारियाँ पूर्णतः सत्य हैं। मैं एवं मेरे साथ यात्रा करने वाले सभी सदस्य मंदिर समिति के दिशा-निर्देशों एवं आचार संहिता का पूर्ण निष्ठा से पालन करेंगे।
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* BUTTONS NAVIGATION */}
          <div className="flex items-center justify-between border-t border-stone-200 pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                पीछे
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-xs transition"
              >
                आगे बढ़ें
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !formData.termsAccepted}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? (
                  <>पंजीकरण हो रहा है...</>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    पंजीकरण सुरक्षित करें
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};

export default RamNavamiRegistrationPage;
