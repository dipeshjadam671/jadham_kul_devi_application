import React from 'react';
import Card from '../../components/common/Card';
import SectionTitle from '../../components/common/SectionTitle';
import Badge from '../../components/common/Badge';

/**
 * AdminPlaceholderModule Component
 * Reusable placeholder for future Phase 3 administrative modules
 */
export const AdminPlaceholderModule = ({ title, titleEn, icon = '📦', description }) => {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <Card variant="warm" className="p-8 sm:p-12 text-center shadow-md border-saffron-200">
        
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-saffron-100 border-2 border-saffron-300 flex items-center justify-center text-3xl shadow-inner">
          {icon}
        </div>

        <SectionTitle
          badge="Phase 3 Planned Module"
          title={title}
          subtitle={titleEn ? `(${titleEn})` : ''}
          className="mb-4"
        />

        <div className="my-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200 max-w-md mx-auto">
          <p className="text-sm font-semibold text-amber-900">
            Coming in a future phase.
          </p>
          <p className="text-xs text-stone-600 mt-0.5">
            यह प्रशासनिक मॉड्यूल आगामी चरण 3 में क्रियान्वित किया जाएगा।
          </p>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed mb-6">
          {description || 'इस मॉड्यूल के लिए डेटाबेस मॉडल, रिपोर्टिंग एवं फॉर्म आगामी चरण में जोड़े जाएंगे।'}
        </p>

        <Badge variant="saffron" size="sm">
          जादम परिवार कुलदेवी मंदिर प्रबंधन
        </Badge>

      </Card>
    </div>
  );
};

export default AdminPlaceholderModule;
