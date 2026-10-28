import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  MapPin,
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  Phone,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { getPublicYatraInfo } from '../../../services/yatraService';

export const YatraHubPage = () => {
  const [ramNavamiInfo, setRamNavamiInfo] = useState(null);
  const [mansarovarInfo, setMansarovarInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RAM_NAVAMI');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const [rnRes, msRes] = await Promise.all([
          getPublicYatraInfo('RAM_NAVAMI').catch(() => null),
          getPublicYatraInfo('MANSAROVAR').catch(() => null),
        ]);
        if (rnRes?.success) setRamNavamiInfo(rnRes.data);
        if (msRes?.success) setMansarovarInfo(msRes.data);
      } catch (err) {
        console.error('Failed to load yatra info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'घोषित होगा';
    return new Date(dateStr).toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (val) => {
    if (!val) return 'निःशुल्क / स्वैच्छिक';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const currentInfo = activeTab === 'RAM_NAVAMI' ? ramNavamiInfo : mansarovarInfo;

  return (
    <div className="bg-stone-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HERO SECTION */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center text-9xl font-serif">
            🚩
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-3 py-1 bg-amber-600/60 backdrop-blur-xs text-amber-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-4 border border-amber-400/30">
              तीर्थ यात्रा एवं दर्शन सेवा
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight">
              जादम परिवार पावन तीर्थ यात्रा पंजीकरण
            </h1>
            <p className="mt-4 text-base sm:text-lg text-amber-100 font-light leading-relaxed">
              श्री जादम परिवार कुलदेवी माताजी मंदिर, खलघाट द्वारा आयोजित श्री राम नवमी दर्शन यात्रा एवं पवित्र कैलाश मानसरोवर यात्रा के लिए ऑनलाइन पंजीकरण पोर्टल।
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/yatra/check-registration"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-900 font-semibold rounded-xl shadow-md hover:bg-amber-50 transition"
              >
                <Search className="w-5 h-5" />
                पंजीकरण की स्थिति जांचें
              </Link>
              <a
                href="#yatra-types"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-900/60 hover:bg-amber-900/80 text-white font-semibold rounded-xl border border-amber-400/30 transition"
              >
                यात्राओं का विवरण देखें
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* LOOKUP BANNER */}
        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-800">
                क्या आपने पहले से पंजीकरण कराया है?
              </h3>
              <p className="text-sm text-stone-600">
                अपने पंजीकरण क्रमांक और पंजीकृत मोबाइल नंबर की सहायता से वर्तमान स्थिति जांचें।
              </p>
            </div>
          </div>
          <Link
            to="/yatra/check-registration"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-xl shadow-xs transition shrink-0"
          >
            स्थिति देखें
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* YATRA CARDS SECTION */}
        <div id="yatra-types" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">उपलब्ध यात्राएं</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              तीर्थ यात्राओं का चयन करें
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              अपनी श्रद्धा एवं सुविधा के अनुसार यात्रा का चयन कर परिवार सहित पंजीकरण पूर्ण करें।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Card 1: Ram Navami */}
            <div className="bg-white rounded-3xl border border-amber-200 shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                    वार्षिक पावन दर्शन
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    ramNavamiInfo?.isRegistrationOpen !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ramNavamiInfo?.isRegistrationOpen !== false ? '● पंजीकरण खुला है' : '● पंजीकरण बंद है'}
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  {ramNavamiInfo?.title || 'श्री राम नवमी पावन दर्शन एवं पदयात्रा'}
                </h3>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                  {ramNavamiInfo?.description || 'जादम परिवार कुलदेवी मंदिर, खलघाट द्वारा आयोजित भव्य राम नवमी पदयात्रा एवं दर्शन उत्सव।'}
                </p>

                <div className="mt-6 space-y-3 border-t border-stone-100 pt-6 text-sm text-stone-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="font-medium text-stone-900">यात्रा अवधि:</strong>{' '}
                      {formatDate(ramNavamiInfo?.startDate)} से {formatDate(ramNavamiInfo?.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="font-medium text-stone-900">प्रस्थान स्थल:</strong>{' '}
                      {ramNavamiInfo?.departureLocation || 'श्री जादम परिवार कुलदेवी मंदिर, खलघाट'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Compass className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="font-medium text-stone-900">गंतव्य:</strong>{' '}
                      {ramNavamiInfo?.destination || 'श्री राम जन्मभूमि, अयोध्या धाम'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="font-medium text-stone-900">सहयोग राशि:</strong>{' '}
                      {formatCurrency(ramNavamiInfo?.feePerPerson)} प्रति व्यक्ति
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 border-t border-stone-100 p-6">
                <Link
                  to="/yatra/ram-navami"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-semibold rounded-xl shadow-md transition"
                >
                  राम नवमी यात्रा पंजीकरण करें
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Mansarovar */}
            <div className="bg-white rounded-3xl border border-sky-200 shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full">
                    अलौकिक हिमालयी तीर्थ
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    mansarovarInfo?.isRegistrationOpen !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {mansarovarInfo?.isRegistrationOpen !== false ? '● पंजीकरण खुला है' : '● पंजीकरण बंद है'}
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  {mansarovarInfo?.title || 'पवित्र कैलाश मानसरोवर दर्शन एवं परिक्रमा यात्रा'}
                </h3>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                  {mansarovarInfo?.description || 'जादम परिवार कुलदेवी मंदिर समिति द्वारा प्रबंधित पावन मानसरोवर एवं देवाधिदेव महादेव कैलाश परिक्रमा यात्रा।'}
                </p>

                <div className="mt-6 space-y-3 border-t border-stone-100 pt-6 text-sm text-stone-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-sky-600 shrink-0" />
                    <span>
                      <strong className="font-medium text-stone-900">यात्रा अवधि:</strong>{' '}
                      {formatDate(mansarovarInfo?.startDate)} से {formatDate(mansarovarInfo?.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-sky-600 shrink-0" />
                    <span>
                      <strong className="font-medium text-stone-900">प्रस्थान केंद्र:</strong>{' '}
                      {mansarovarInfo?.departureLocation || 'काठमांडू / नई दिल्ली'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Compass className="w-5 h-5 text-sky-600 shrink-0" />
                    <span>
                      <strong className="font-medium text-stone-900">गंतव्य:</strong>{' '}
                      {mansarovarInfo?.destination || 'कैलाश पर्वत एवं मानसरोवर झील'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-sky-600 shrink-0" />
                    <span>
                      <strong className="font-medium text-stone-900">अनुमानित शुल्क:</strong>{' '}
                      {formatCurrency(mansarovarInfo?.feePerPerson)} प्रति व्यक्ति
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 border-t border-stone-100 p-6">
                <Link
                  to="/yatra/mansarovar"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-sky-700 to-sky-800 hover:from-sky-800 hover:to-sky-900 text-white font-semibold rounded-xl shadow-md transition"
                >
                  मानसरोवर यात्रा पंजीकरण करें
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* GUIDELINES & INSTRUCTIONS TABS */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">मार्गदर्शन एवं नियम</span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
              यात्रा दिशा-निर्देश एवं प्रस्थान व्यवस्था
            </h3>
          </div>

          <div className="flex border-b border-stone-200">
            <button
              onClick={() => setActiveTab('RAM_NAVAMI')}
              className={`pb-3 px-6 text-sm font-semibold border-b-2 transition ${
                activeTab === 'RAM_NAVAMI'
                  ? 'border-amber-700 text-amber-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              राम नवमी यात्रा नियम
            </button>
            <button
              onClick={() => setActiveTab('MANSAROVAR')}
              className={`pb-3 px-6 text-sm font-semibold border-b-2 transition ${
                activeTab === 'MANSAROVAR'
                  ? 'border-sky-700 text-sky-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              कैलाश मानसरोवर यात्रा नियम
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                महत्वपूर्ण दिशा-निर्देश एवं आचार संहिता
              </h4>
              <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-line bg-stone-50 p-5 rounded-2xl border border-stone-200">
                {currentInfo?.guidelines || 'दिशा-निर्देश जल्द ही अद्यतन किए जाएंगे।'}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                प्रस्थान एवं रिपोर्टिंग निर्देश
              </h4>
              <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-line bg-stone-50 p-5 rounded-2xl border border-stone-200">
                {currentInfo?.departureGuidelines || 'प्रस्थान की विस्तृत जानकारी पंजीकृत यात्रियों को प्रेषित की जाएगी।'}
              </div>
            </div>
          </div>

          {/* Contact coordinators */}
          {currentInfo?.contactPersons && currentInfo.contactPersons.length > 0 && (
            <div className="border-t border-stone-100 pt-6">
              <h4 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-4">
                यात्रा समिति संपर्क सूत्र
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentInfo.contactPersons.map((contact, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-900">{contact.name}</div>
                      <div className="text-xs text-amber-800">{contact.designation || 'यात्रा प्रभारी'}</div>
                      <a href={`tel:${contact.phone}`} className="text-xs text-stone-600 hover:text-amber-800 font-mono mt-0.5 inline-block">
                        +91 {contact.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PRIVACY & SECURITY COMMITMENT */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>गोपनीयता एवं सुरक्षा प्रतिज्ञा:</strong> जादम परिवार कुलदेवी मंदिर समिति आपके व्यक्तिगत डेटा की पूर्ण सुरक्षा सुनिश्चित करती है। पंजीकरण के दौरान कभी भी आधार कार्ड का पूर्ण क्रमांक नहीं लिया जाता है। केवल पहचान हेतु अंतिम ४ अंक ही दर्ज किए जाते हैं।
          </div>
        </div>

      </div>
    </div>
  );
};

export default YatraHubPage;
