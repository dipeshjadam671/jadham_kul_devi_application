import React, { useState, useEffect } from 'react';
import { getTempleRules } from '../../services/templeService';

const DEFAULT_RULES = [
  { _id: 'r1', order: 1, title: 'शराब एवं नशा पूर्ण प्रतिबंध', description: 'कृपया शराब पीकर अन्दर आना सख्त मना है।' },
  { _id: 'r2', order: 2, title: 'शराब पीने पर 5 वर्ष का मढ़ बहिष्कार', description: 'शराब पीकर मंदिर में पकड़े जाने पर उसको और उसके परिवार को 5 साल तक मढ़ से बहिष्कार कर दिया जायेगा।' },
  { _id: 'r3', order: 3, title: 'बटवारा केवल अष्मी–नवमी को मान्य', description: 'बटवारा सिर्फ अष्मी–नवमी को ही लिया जायेगा, उसके पहले या बाद में नहीं।' },
  { _id: 'r4', order: 4, title: 'अष्मी–नवमी पूजा सामग्री व्यवस्था', description: 'माता जी अष्मी–नवमी की पूजा सामग्री बटवारे के पैसों से ही आयेगी, किसी एक व्यक्ति के पैसों से नहीं।' },
  { _id: 'r5', order: 5, title: 'माता जी की अष्मी–नवमी की मान निषेध', description: 'माता जी की अष्मी–नवमी की मान ना लें, माता जी इस पूजा को स्वीकार नहीं करती है। माता जी केवल बटवारे के पैसों से लाई हुई पूजा सामग्री ही स्वीकार करती है। जैसे—कंकू, चावल से लेकर पिलका–पिलकी मेण्डी तक।' },
  { _id: 'r6', order: 6, title: 'भैरवान बाबा की मान स्वीकार्य', description: 'भैरवान बाबा की मान लें, भैरवान बाबा इस पूजा को स्वीकार करते हैं।' },
  { _id: 'r7', order: 7, title: 'नवमी जोड़े, उपवास एवं मर्यादा', description: 'नवमी के दिन जोड़े लगाये जाते हैं और उन जोड़ों को उपवास रखना होगा, जोड़े लगाने वाली महिला को सफेद कपड़े पहनना है, श्रृंगार नहीं करना है।' },
  { _id: 'r8', order: 8, title: 'नाते वाले जोड़े एवं नेवज–पाती नियम', description: 'नाते वाले जोड़े की महिला को अष्मी–नवमी का नेवज एवं पाती नहीं दिया जायेगा, अष्मी–नवमी का नेवज एवं पाती पहला लड़का होने पर ही दिया जायेगा अन्यथा नहीं।' },
  { _id: 'r9', order: 9, title: 'जमाल की शुरुआत', description: 'जमाल की शुरुआत केवल दशहरे के दिन से ही चालू होगी।' },
  { _id: 'r10', order: 10, title: 'बकरा अर्पण मर्यादा (10 किलो से ऊपर)', description: 'बकरा 10 किलो से ऊपर का ही स्वीकार होगा।' },
  { _id: 'r11', order: 11, title: 'सूतक संबंधी मढ़ मर्यादा (सवा महीना)', description: 'जिस जादम व्यक्ति के घर सूतक होगा वो व्यक्ति सवा महीने के बाद ही आवे, उससे पहले आने पर और पता लगने पर उसे मढ़ से बाहर कर दिया जायेगा।' },
  { _id: 'r12', order: 12, title: 'जमाल भोजन जवाबदारी एवं जादम गोत्र कन्याती नेवज मर्यादा', description: 'जो व्यक्ति जमाल में निमंत्रण देकर लाये हुए व्यक्तियों को भोजन कराने की जवाबदारी स्वयं की रहेगी। जादम गोत्र कन्याती के अलावा किसी दूसरे गोत्र के व्यक्ति को नेवज व बिजोरा नहीं दिया जायेगा।' },
  { _id: 'r13', order: 13, title: 'अष्मी–नवमी पूर्व या पश्चात पूजा नियम', description: 'अष्मी–नवमी के पहले या बाद में मढ़ में पूजा करने आवे तो केवल नारियल और अगरबत्ती ही लावे।' },
  { _id: 'r14', order: 14, title: 'जमाल आयु मर्यादा (7 महीने पश्चात)', description: 'जमाल बच्चों के 7 महीने होने के बाद ही लिया जायेगा।' },
  { _id: 'r15', order: 15, title: 'जमाल से पूर्व मान–मनते पूर्ति', description: 'बच्चे के जमाल से पहले जितने भी मान मनते हो वो देने के बाद ही जमाल निकाले जायेंगे।' },
];

const RulesPage = () => {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await getTempleRules();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setRules(res.data);
        }
      } catch (err) {
        console.warn('Using authentic default temple rules fallback:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const filteredRules = rules.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(term)) ||
      (r.description && r.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            अनुशासन एवं मर्यादा संहिता
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            मंदिर नियमावली एवं आचार संहिता
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            माँ कुलदेवी के पावन मढ़ प्रांगण में परंपरा, पवित्रता, स्वच्छता एवं अनुशासन बनाए रखने हेतु जादम समाज के 15 अनिवार्य नियम।
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="नियम खोजें (उदा. शराब, बटवारा, सूतक, जमाल)..."
              className="w-full px-4 py-2.5 pl-10 text-sm bg-white border border-stone-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Rules Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500 text-sm">
            कोई नियम नहीं मिला। कृपया अन्य शब्द से खोजें।
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRules.map((rule) => (
              <div
                key={rule._id || rule.order}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow flex items-start gap-4"
              >
                {/* Number Badge */}
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {rule.order}
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                    {rule.title}
                  </h3>
                  <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sacred Trust Footer Note */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 text-center text-xs sm:text-sm text-amber-900 leading-relaxed">
          <p className="font-semibold mb-1">
            "माँ कुलदेवी के पावन मढ़ की मर्यादा एवं कुल परंपराओं का पालन करना प्रत्येक जादम बंधु का परम कर्तव्य है।"
          </p>
          <p className="text-amber-800/80">
            - श्री जादम समाज कुलदेवी मंदिर ट्रस्ट, खलघाट (पंजीकृत)
          </p>
        </div>

      </div>
    </div>
  );
};

export default RulesPage;
