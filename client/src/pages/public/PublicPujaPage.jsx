import React, { useState, useEffect } from 'react';
import { Flame, Users, HeartHandshake, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import Container from '../../components/common/Container';
import Card from '../../components/common/Card';
import SectionTitle from '../../components/common/SectionTitle';
import Badge from '../../components/common/Badge';
import { getPublicPujaSummary } from '../../services/pujaService';

/**
 * PublicPujaPage Component - Phase 6
 * Public transparency page displaying Mata Ji Annual Puja traditions and
 * aggregate year-wise statistics without exposing private devotee information.
 */
export const PublicPujaPage = () => {
  const [summaryList, setSummaryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await getPublicPujaSummary();
        if (res.success) {
          setSummaryList(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching public puja summary:', err);
        setError('पूजा सारांश लोड करने में असमर्थ। कृपया पुनः प्रयास करें।');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="py-8 sm:py-12 bg-sand-50/50 min-h-screen">
      <Container>
        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-10 border border-amber-600/30">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>श्री जादम कुलदेवी माताजी वार्षिक पूजा एवं महायज्ञ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif">
              माताजी वार्षिक पूजा एवं धार्मिक अनुष्ठान
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              जादम परिवार कुलदेवी मंदिर, खलघाट में प्रतिवर्ष चैत्र व शारदीय नवरात्रि तथा विशेष तिथियों
              पर कुलदेवी माताजी के वार्षिक पूजन, शतचंडी महायज्ञ एवं जमाल निकासी का पावन आयोजन किया जाता है।
            </p>
          </div>
        </div>

        {/* TRADITION & SIGNIFICANCE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card variant="warm" className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-2 font-serif">
              कुलदेवी वार्षिक पूजन
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              समस्त जादम परिवार के कल्याण, वंश वृद्धि एवं सुख-समृद्धि हेतु वैदिक मंत्रोच्चार के साथ
              विधि-विधान से माताजी का अभिषेक व महाआरती आयोजित की जाती है।
            </p>
          </Card>

          <Card variant="warm" className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-2 font-serif">
              दंपति जोड़ा पूजन परंपरा
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              पारिवारिक परंपरा के अनुसार कुल के सौभाग्यशाली नवदंपति एवं पारिवारिक जोड़े माताजी के समक्ष
              आशीर्वाद प्राप्त करते हैं और हवन कुंड में आहुति समर्पित करते हैं।
            </p>
          </Card>

          <Card variant="warm" className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-2 font-serif">
              जमाल निकासी एवं महाप्रसाद
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              मंदिर नियमावली एवं पूर्वजों की मर्यादा के अनुरूप जमाल निकासी की जाती है और समस्त स्वजनों
              के साथ सामूहिक महाप्रसादी ग्रहण की जाती है।
            </p>
          </Card>
        </div>

        {/* YEAR-WISE AGGREGATE SUMMARY SECTION */}
        <div className="space-y-6">
          <SectionTitle
            subtitle="वार्षिक सांख्यिकी एवं अवलोकन (Public Aggregate Summary)"
            title="वर्षवार पूजा एवं सहभागिता विवरण"
          />

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent mb-2"></div>
              <p className="text-stone-500 text-sm">सांख्यिकी लोड हो रही है...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-center text-sm">
              {error}
            </div>
          ) : summaryList.length === 0 ? (
            <Card variant="default" className="p-8 text-center">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 font-medium text-sm">कोई पूजा रिकॉर्ड उपलब्ध नहीं है।</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {summaryList.map((stat) => (
                <div
                  key={stat._id || stat.year}
                  className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs hover:border-amber-400 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                    <span className="text-2xl font-serif font-black text-amber-900">
                      वर्ष {stat.year}
                    </span>
                    <Badge variant="gold" size="sm">
                      सफलतापूर्वक संपन्न
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50/60 p-3 rounded-xl">
                      <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                        कुल पूजा प्रविष्टियां
                      </p>
                      <p className="text-xl font-bold text-stone-900 mt-1">
                        {stat.totalRecords || 0}
                      </p>
                    </div>

                    <div className="bg-emerald-50/60 p-3 rounded-xl">
                      <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        कुल श्रद्धालु सहभागिता
                      </p>
                      <p className="text-xl font-bold text-emerald-900 mt-1">
                        {stat.totalParticipants || 0}
                      </p>
                    </div>

                    <div className="bg-rose-50/60 p-3 rounded-xl">
                      <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                        सहभागी दंपति जोड़े
                      </p>
                      <p className="text-xl font-bold text-rose-900 mt-1">
                        {stat.totalCouples || 0}
                      </p>
                    </div>

                    <div className="bg-indigo-50/60 p-3 rounded-xl">
                      <p className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                        जमाल निकासी संख्या
                      </p>
                      <p className="text-xl font-bold text-indigo-900 mt-1">
                        {stat.totalJamalCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRIVACY ASSURANCE NOTICE */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 flex items-start gap-3 shadow-xs">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs text-stone-600 leading-relaxed">
              <strong className="text-stone-900 font-bold block mb-0.5">गोपनीयता नीति (Devotee Privacy):</strong>
              श्रद्धालुओं की निजता एवं सुरक्षा को ध्यान में रखते हुए व्यक्तिगत संपर्क नंबर, पारिवारिक
              पते एवं वित्तीय विवरण सार्वजनिक रूप से प्रकाशित नहीं किए जाते हैं। विशेष पूजा संकल्प
              अथवा जानकारी हेतु मंदिर व्यवस्थापक समिति से संपर्क करें।
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PublicPujaPage;
