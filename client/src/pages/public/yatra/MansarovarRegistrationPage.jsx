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
  HeartPulse,
} from 'lucide-react';
import { registerPublicYatra, getPublicYatraInfo } from '../../../services/yatraService';

export const MansarovarRegistrationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [yatraInfo, setYatraInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    yatraType: 'MANSAROVAR',
    primaryName: '',
    mobile: '',
    village: '',
    city: '',
    address: '',
    departureLocation: 'काठमांडू / नई दिल्ली',
    travelDate: '2026-07-10',
    numberOfTravelers: 1,
    travelOrganizer: '',
    organizerMobile: '',
    travelers: [
      {
        name: '',
        age: '',
        gender: 'male',
        mobile: '',
        idType: 'passport',
        idLastFourDigits: '',
      },
    ],
    medicalDeclared: false,
    termsAccepted: false,
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await getPublicYatraInfo('MANSAROVAR');
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
        console.warn('Could not fetch Mansarovar info:', e);
      }
    };
    fetchInfo();
  }, []);

  const handlePrimaryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
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
    if (formData.travelers.length >= 20) {
      setError('मानसरोवर यात्रा में अधिकतम २० यात्रियों का पंजीकरण एक साथ अनुमत है।');
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
          idType: 'passport',
          idLastFourDigits: '',
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

  const validateStep1 = () => {
    if (!formData.primaryName.trim()) {
      setError('कृपया मुख्य व्यक्ति का नाम दर्ज करें।');
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
      setError('कृपया प्रस्थान दिनांक का चयन करें।');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    for (let i = 0; i < formData.travelers.length; i++) {
      const t = formData.travelers[i];
      if (!t.name.trim()) {
        setError(`यात्री क्रमांक ${i + 1} का नाम अनिवार्य है।`);
        return false;
      }
      if (t.idLastFourDigits && !/^[A-Za-z0-9]{4}$/.test(t.idLastFourDigits)) {
        setError(`यात्री क्रमांक ${i + 1} के पासपोर्ट / पहचान पत्र के अंतिम ४ अक्षर/अंक दर्ज करें।`);
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
    if (!formData.medicalDeclared) {
      setError('कृपया उच्च-तुंगता (High Altitude) स्वास्थ्य एवं मेडिकल फिटनेस की घोषणा पर सहमति दें।');
      return;
    }
    if (!formData.termsAccepted) {
      setError('पंजीकरण पूर्ण करने के लिए कृपया यात्रा नियम एवं शर्तों की स्वीकृति प्रदान करें।');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDuplicateWarning(null);

      const payload = {
        yatraType: 'MANSAROVAR',
        primaryName: formData.primaryName.trim(),
        mobile: formData.mobile.trim(),
        village: formData.village.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        departureLocation: formData.departureLocation.trim(),
        travelDate: formData.travelDate,
        travelOrganizer: formData.travelOrganizer.trim(),
        organizerMobile: formData.organizerMobile.trim(),
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
      console.error('Mansarovar registration failed:', err);
      const apiRes = err.response?.data;
      if (apiRes?.isDuplicate) {
        setDuplicateWarning(apiRes.message);
      } else {
        setError(apiRes?.message || 'पंजीकरण विफल रहा। कृपया बाद में प्रयास करें।');
      }
    } finally {
      setLoading(false);
    }
  };

  const feePerPerson = yatraInfo?.feePerPerson || 185000;
  const estimatedTotal = feePerPerson * formData.travelers.length;

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Link
            to="/yatra"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-sky-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            यात्रा मुख्य पृष्ठ पर लौटें
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
            पवित्र कैलाश मानसरोवर यात्रा
          </span>
        </div>

        {/* STEP PROGRESS */}
        <div className="bg-white rounded-2xl p-6 border border-sky-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 1 ? 'bg-sky-700 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                १
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${step === 1 ? 'text-sky-900' : 'text-stone-500'}`}>
                यात्री व संपर्क
              </span>
            </div>

            <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-sky-600' : 'bg-stone-200'}`} />

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 2 ? 'bg-sky-700 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                २
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${step === 2 ? 'text-sky-900' : 'text-stone-500'}`}>
                पासपोर्ट व सदस्य
              </span>
            </div>

            <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 3 ? 'bg-sky-600' : 'bg-stone-200'}`} />

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 3 ? 'bg-sky-700 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                ३
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${step === 3 ? 'text-sky-900' : 'text-stone-500'}`}>
                स्वास्थ्य व पुष्टि
              </span>
            </div>
          </div>
        </div>

        {/* ERROR / WARNING */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-800">{error}</p>
          </div>
        )}

        {duplicateWarning && (
          <div className="bg-sky-50 border border-sky-300 rounded-2xl p-5 flex items-start gap-3">
            <Info className="w-6 h-6 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-sky-900">पूर्व पंजीकरण पाया गया</h4>
              <p className="text-sm text-sky-800 mt-1">{duplicateWarning}</p>
              <div className="mt-3">
                <Link
                  to="/yatra/check-registration"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-900 underline hover:text-sky-950"
                >
                  अपने पंजीकरण की स्थिति यहाँ जांचें →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-10 space-y-8">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">चरण १</span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  कैलाश मानसरोवर मुख्य यात्री विवरण
                </h3>
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
                      placeholder="उदा. दिलीप जादम"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
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
                      placeholder="९८२६०XXXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none font-mono"
                    />
                  </div>
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
                    placeholder="उदा. उज्जैन"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    ग्राम (यदि लागू हो)
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handlePrimaryChange}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    पूरा डाक पता (Full Postal Address)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handlePrimaryChange}
                    placeholder="मकान नंबर, मार्ग, पिनकोड सहित"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    प्रस्थान केंद्र
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="departureLocation"
                      value={formData.departureLocation}
                      onChange={handlePrimaryChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    प्रस्थान दिनांक <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handlePrimaryChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    सह-आयोजक एजेंसी / संस्था (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    name="travelOrganizer"
                    value={formData.travelOrganizer}
                    onChange={handlePrimaryChange}
                    placeholder="उदा. कैलाश सेवा ट्रस्ट"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    आयोजक मोबाइल (वैकल्पिक)
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    name="organizerMobile"
                    value={formData.organizerMobile}
                    onChange={handlePrimaryChange}
                    placeholder="आयोजक संपर्क नंबर"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700">चरण २</span>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    यात्रियों का विवरण एवं पासपोर्ट
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    कैलाश मानसरोवर के लिए वैध पासपोर्ट अनिवार्य है।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTraveler}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-900 text-sm font-semibold rounded-xl transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  और यात्री जोड़ें
                </button>
              </div>

              <div className="space-y-4">
                {formData.travelers.map((traveler, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider bg-stone-200/80 px-2.5 py-1 rounded-md">
                        यात्री #{index + 1} {index === 0 ? '(मुख्य यात्री)' : ''}
                      </span>
                      {formData.travelers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTraveler(index)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          पूरा नाम (पासपोर्ट अनुसार) <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={traveler.name}
                          onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                          placeholder="नाम जैसा पासपोर्ट में है"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          आयु (वर्ष)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="80"
                          value={traveler.age}
                          onChange={(e) => handleTravelerChange(index, 'age', e.target.value)}
                          placeholder="उदा. 45"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          लिंग (Gender)
                        </label>
                        <select
                          value={traveler.gender}
                          onChange={(e) => handleTravelerChange(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        >
                          <option value="male">पुरुष (Male)</option>
                          <option value="female">महिला (Female)</option>
                          <option value="other">अन्य (Other)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          पहचान पत्र
                        </label>
                        <select
                          value={traveler.idType}
                          onChange={(e) => handleTravelerChange(index, 'idType', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        >
                          <option value="passport">पासपोर्ट (Passport - अनुशंसित)</option>
                          <option value="aadhaar">आधार कार्ड (Aadhaar)</option>
                          <option value="voter_id">मतदाता पहचान पत्र (Voter ID)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          पहचान पत्र के अंतिम ४ अंक/अक्षर
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={traveler.idLastFourDigits}
                          onChange={(e) => handleTravelerChange(index, 'idLastFourDigits', e.target.value)}
                          placeholder="उदा. 9876"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono focus:ring-2 focus:ring-sky-600 focus:outline-none uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          मोबाइल (यदि हो)
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={traveler.mobile}
                          onChange={(e) => handleTravelerChange(index, 'mobile', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">चरण ३</span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  स्वास्थ्य घोषणा एवं अंतिम पुष्टि
                </h3>
              </div>

              {/* Summary */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-stone-200">
                  <div>
                    <span className="text-xs text-stone-500 block">मुख्य यात्री</span>
                    <strong className="text-base text-stone-900">{formData.primaryName}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">मोबाइल नंबर</span>
                    <strong className="text-base text-stone-900 font-mono">{formData.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">प्रस्थान केंद्र</span>
                    <span className="text-stone-800">{formData.departureLocation}</span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">यात्रा दिनांक</span>
                    <span className="text-stone-800">{formData.travelDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">कुल यात्री</span>
                    <strong className="text-sky-800 font-bold">{formData.travelers.length} व्यक्ति</strong>
                  </div>
                  {formData.travelOrganizer && (
                    <div>
                      <span className="text-xs text-stone-500 block">सह-आयोजक</span>
                      <span className="text-stone-800">{formData.travelOrganizer}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-stone-600">अनुमानित पैकेज राशि ({formData.travelers.length} × ₹{feePerPerson.toLocaleString('en-IN')}):</span>
                  <span className="text-xl font-bold text-sky-900 font-mono">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Medical declaration */}
              <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.medicalDeclared}
                    onChange={(e) => setFormData((prev) => ({ ...prev, medicalDeclared: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-sky-700 border-stone-300 rounded-sm focus:ring-sky-600"
                  />
                  <div className="text-xs sm:text-sm text-sky-950 leading-relaxed">
                    <strong className="flex items-center gap-1.5 text-sky-900 mb-1">
                      <HeartPulse className="w-4 h-4 text-rose-600" />
                      उच्च-तुंगता (High Altitude) मेडिकल फिटनेस घोषणा:
                    </strong>
                    मैं प्रमाणित करता/करती हूँ कि मैं और मेरे सभी सह-यात्री शारीरिक व मानसिक रूप से १५,०००+ फीट की ऊंचाई पर यात्रा करने हेतु पूर्ण स्वस्थ हैं तथा प्रस्थान पूर्व अधिकृत चिकित्सक से फिटनेस प्रमाण पत्र प्रस्तुत करेंगे।
                  </div>
                </label>
              </div>

              {/* Terms Checkbox */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-stone-700 border-stone-300 rounded-sm focus:ring-stone-600"
                  />
                  <span className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                    मैं कैलाश मानसरोवर यात्रा के सभी नियम, वीज़ा शर्तें एवं मंदिर समिति के निर्देशों का पूर्ण अनुपालन करने की सहमति देता/देती हूँ।
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* BUTTONS */}
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
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-xl shadow-xs transition"
              >
                आगे बढ़ें
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !formData.medicalDeclared || !formData.termsAccepted}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-700 to-sky-800 hover:from-sky-800 hover:to-sky-900 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? 'पंजीकरण हो रहा है...' : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    मानसरोवर पंजीकरण सुरक्षित करें
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

export default MansarovarRegistrationPage;
