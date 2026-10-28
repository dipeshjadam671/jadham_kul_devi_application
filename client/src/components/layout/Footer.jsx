import React from 'react';
import { Link } from 'react-router-dom';
import { TEMPLE_INFO, NAV_LINKS } from '../../constants/navigation';

/**
 * Footer Component
 * Responsive footer blending traditional aesthetic with modern clean design
 */
export const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t-4 border-saffron-600 mt-auto">
      {/* Decorative Traditional Border Top */}
      <div className="h-1.5 bg-gradient-to-r from-saffron-500 via-gold-400 to-maroon-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Col 1: Temple Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🕉️</span>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {TEMPLE_INFO.nameHindi}
                </h3>
                <p className="text-xs text-gold-400 font-medium">
                  {TEMPLE_INFO.locationHindi}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              माँ कुलदेवी के पावन चरणों में समर्पित जादम परिवार का ऐतिहासिक एवं धार्मिक केंद्र, जहाँ श्रद्धा, संस्कृति और एकता का संगम होता है।
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gold-400 mb-4 border-b border-stone-800 pb-2">
              महत्वपूर्ण कड़ियां (Quick Links)
            </h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.slice(0, 5).map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="hover:text-saffron-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="text-saffron-500 text-xs">›</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services & Information */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gold-400 mb-4 border-b border-stone-800 pb-2">
              मंदिर सेवाएं व सूचना
            </h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.slice(5).map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="hover:text-saffron-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="text-saffron-500 text-xs">›</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/admin"
                  className="hover:text-gold-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="text-gold-500 text-xs">›</span>
                  <span>प्रबंधन पोर्टल (Admin)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gold-400 mb-4 border-b border-stone-800 pb-2">
              स्थान (Location)
            </h4>
            <p className="text-sm text-stone-400 leading-relaxed">
              📍 जादम परिवार कुलदेवी मंदिर, नर्मदा तट, खलघाट, जिला धार, मध्य प्रदेश - 454552
            </p>
            <div className="pt-2">
              {/* <span className="inline-block px-3 py-1 text-xs rounded-full bg-stone-800 text-gold-300 border border-stone-700">
                Phase 1: MERN Stack Foundation
              </span> */}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {TEMPLE_INFO.nameHindi}, खलघाट. सर्वाधिकार सुरक्षित।</p>
          <p className="flex items-center gap-2">
            <span>Designed By Dipesh Jadam</span>
            <span>•</span>
            <span className="text-saffron-400">जय कुलदेवी माँ</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
