import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle,
  Printer,
  Calendar,
  MapPin,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Home,
} from 'lucide-react';

export const YatraRegistrationSuccessPage = () => {
  const { registrationNumber } = useParams();
  const location = useLocation();
  const registration = location.state?.registration;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Printable Confirmation Card */}
        <div className="bg-white rounded-3xl border border-amber-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
          
          {/* Sacred Header */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-8 text-white text-center relative">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <CheckCircle className="w-8 h-8 text-amber-300" />
            </div>
            <span className="text-xs uppercase tracking-widest text-amber-200 font-semibold block mb-1">
              श्री जादम परिवार कुलदेवी माताजी मंदिर ट्रस्ट, खलघाट
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">
              पंजीकरण सफलतापूर्वक दर्ज हुआ!
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 mt-2">
              माँ कुलदेवी की कृपा से आपकी यात्रा सुखद एवं मंगलमय हो।
            </p>
          </div>

          {/* Registration Number Highlight */}
          <div className="bg-amber-50 p-6 border-b border-amber-200 text-center">
            <span className="text-xs uppercase font-bold text-stone-600 block mb-1">
              आपका स्थायी पंजीकरण क्रमांक
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-900 tracking-wider">
              {registrationNumber}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              कृपया भविष्य में संदर्भ एवं स्थिति जांच के लिए यह क्रमांक सुरक्षित रखें।
            </p>
          </div>

          {/* Summary Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {registration && (
              <div className="grid grid-cols-2 gap-4 text-sm pb-6 border-b border-stone-100">
                <div>
                  <span className="text-xs text-stone-500 block font-medium">यात्रा प्रकार</span>
                  <strong className="text-stone-900">
                    {registration.yatraType === 'RAM_NAVAMI' ? 'श्री राम नवमी दर्शन यात्रा' : 'पवित्र कैलाश मानसरोवर यात्रा'}
                  </strong>
                </div>

                <div>
                  <span className="text-xs text-stone-500 block font-medium">मुख्य व्यक्ति</span>
                  <strong className="text-stone-900">{registration.primaryName}</strong>
                </div>

                <div>
                  <span className="text-xs text-stone-500 block font-medium">यात्रा दिनांक</span>
                  <span className="text-stone-800">
                    {registration.travelDate ? new Date(registration.travelDate).toISOString().split('T')[0] : 'निर्धारित तिथि'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-stone-500 block font-medium">कुल यात्री संख्या</span>
                  <strong className="text-amber-900 font-bold">{registration.numberOfTravelers || 1} सदस्य</strong>
                </div>
              </div>
            )}

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-xs text-stone-700 leading-relaxed space-y-2">
              <strong className="text-stone-900 block font-bold">निर्देश:</strong>
              <p>१. मंदिर समिति द्वारा पंजीकरण का सत्यापन किया जाएगा।</p>
              <p>२. यात्रा प्रस्थान से पूर्व टोकन सत्यापन एवं बस/वाहन व्यवस्था हेतु संपर्क किया जाएगा।</p>
              <p>३. किसी भी प्रश्न हेतु समिति कार्यालय से संपर्क करें।</p>
            </div>

            {/* Print & Action Buttons (Hidden on Print) */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-1/2 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                पर्ची प्रिंट / सेव करें
              </button>

              <Link
                to="/yatra/check-registration"
                className="w-full sm:w-1/2 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                स्थिति जांचें
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="text-center pt-2 print:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
              >
                <Home className="w-3.5 h-3.5" />
                मुख्य पृष्ठ पर जाएं
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default YatraRegistrationSuccessPage;
