import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { checkPublicRegistrationStatus } from '../../../services/yatraService';

export const YatraCheckStatusPage = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!registrationNumber.trim() || !mobile.trim()) {
      setError('कृपया पंजीकरण क्रमांक एवं पंजीकृत मोबाइल नंबर दोनों दर्ज करें।');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRegistration(null);
      setSearched(true);

      const res = await checkPublicRegistrationStatus(registrationNumber, mobile);

      if (res.success && res.data) {
        setRegistration(res.data);
      } else {
        setError(res.message || 'पंजीकरण रिकॉर्ड नहीं मिला। कृपया दर्ज की गई जानकारी जांचें।');
      }
    } catch (err) {
      console.error('Status check failed:', err);
      const apiMsg = err.response?.data?.message;
      setError(apiMsg || 'स्थिति जांचने में असमर्थ। कृपया बाद में प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            स्वीकृत / पुष्ट (Confirmed)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            यात्रा संपन्न (Completed)
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            रद्द (Cancelled)
          </span>
        );
      case 'waitlisted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
            <Clock className="w-3.5 h-3.5" />
            प्रतीक्षारत (Waitlisted)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 font-bold text-xs rounded-full">
            <Clock className="w-3.5 h-3.5" />
            प्रक्रियाधीन (Pending Verification)
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-medium text-xs rounded-md">
            पूर्ण भुगतान (Paid)
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 font-medium text-xs rounded-md">
            आंशिक भुगतान (Partial)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 text-stone-700 font-medium text-xs rounded-md">
            भुगतान लंबित (Pending)
          </span>
        );
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* TOP NAV */}
        <div className="flex items-center justify-between">
          <Link
            to="/yatra"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            यात्रा मुख्य पृष्ठ पर लौटें
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            ऑनलाइन स्थिति जांच
          </span>
        </div>

        {/* HERO TITLE */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            पंजीकरण की वर्तमान स्थिति जांचें
          </h1>
          <p className="text-sm text-stone-600 max-w-xl mx-auto">
            गोपनीयता सुरक्षा के अंतर्गत पंजीकरण की जानकारी देखने के लिए पंजीकरण क्रमांक एवं पंजीकृत मोबाइल नंबर दोनों आवश्यक हैं।
          </p>
        </div>

        {/* SEARCH FORM */}
        <div className="bg-white rounded-3xl border border-amber-200 shadow-md p-6 sm:p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  पंजीकरण क्रमांक (Registration No.) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Compass className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                    placeholder="उदा. RNY-2026-000001"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  पंजीकृत मोबाइल नंबर <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="९८२६०XXXXX (१० अंक)"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>सत्यापित किया जा रहा है...</>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  पंजीकरण खोजें
                </>
              )}
            </button>
          </form>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900">खोज परिणाम अनुपलब्ध</h4>
              <p className="text-sm text-rose-800 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* RESULT CARD */}
        {registration && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-amber-300 block mb-1">
                  {registration.yatraType === 'RAM_NAVAMI' ? 'श्री राम नवमी दर्शन यात्रा' : 'पवित्र कैलाश मानसरोवर यात्रा'}
                </span>
                <h3 className="text-2xl font-serif font-bold tracking-wide">
                  {registration.registrationNumber}
                </h3>
              </div>
              <div className="self-start sm:self-auto">
                {getBookingStatusBadge(registration.bookingStatus)}
              </div>
            </div>

            {/* Details Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-stone-100">
                <div>
                  <span className="text-xs text-stone-500 uppercase font-semibold block">मुख्य श्रद्धालु</span>
                  <strong className="text-lg text-stone-900">{registration.primaryName}</strong>
                </div>

                <div>
                  <span className="text-xs text-stone-500 uppercase font-semibold block">सुरक्षित मोबाइल</span>
                  <strong className="text-lg text-stone-900 font-mono">{registration.mobileMasked}</strong>
                </div>

                <div>
                  <span className="text-xs text-stone-500 uppercase font-semibold block">यात्रा दिनांक</span>
                  <span className="text-sm text-stone-800 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    {new Date(registration.travelDate).toLocaleDateString('hi-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-stone-500 uppercase font-semibold block">यात्री संख्या</span>
                  <span className="text-sm text-stone-800 flex items-center gap-1.5 mt-0.5">
                    <Users className="w-4 h-4 text-amber-600" />
                    {registration.numberOfTravelers} सदस्य
                  </span>
                </div>

                <div>
                  <span className="text-xs text-stone-500 uppercase font-semibold block">प्रस्थान केंद्र</span>
                  <span className="text-sm text-stone-800 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    {registration.departureLocation || 'खलघाट मंदिर'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-stone-500 uppercase font-semibold block">भुगतान स्थिति</span>
                  <div className="mt-1">
                    {getPaymentStatusBadge(registration.paymentStatus)}
                  </div>
                </div>
              </div>

              {/* Status specific message */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed space-y-2">
                <div className="font-bold flex items-center gap-2 text-amber-950">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  अगले कदम एवं सूचना:
                </div>
                {registration.bookingStatus === 'confirmed' ? (
                  <p>
                    बधाई हो! आपका पंजीकरण पुष्ट (Confirmed) हो चुका है। कृपया यात्रा दिनांक को निर्धारित समय से पूर्व प्रस्थान केंद्र पर पहचान पत्र सहित उपस्थित रहें।
                  </p>
                ) : registration.bookingStatus === 'completed' ? (
                  <p>
                    आपकी यात्रा सफलतापूर्वक संपन्न हो चुकी है। कुलदेवी माताजी की कृपा आप एवं आपके परिवार पर सदैव बनी रहे।
                  </p>
                ) : registration.bookingStatus === 'cancelled' ? (
                  <p>
                    यह पंजीकरण रद्द कर दिया गया है। अधिक जानकारी हेतु समिति कार्यालय से संपर्क करें।
                  </p>
                ) : (
                  <p>
                    आपका पंजीकरण समिति के सत्यापन के अधीन है। पुष्टि होने पर आपको सूचित किया जाएगा अथवा आप पुनः यहाँ स्थिति जांच सकते हैं।
                  </p>
                )}
              </div>

              <div className="text-center pt-2">
                <Link
                  to={`/yatra/registration-success/${registration.registrationNumber}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-950 underline"
                >
                  डिजिटल पंजीकरण पर्ची देखें / प्रिंट करें →
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default YatraCheckStatusPage;
