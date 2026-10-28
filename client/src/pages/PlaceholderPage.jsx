import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionTitle from '../components/common/SectionTitle';
import Badge from '../components/common/Badge';

/**
 * Reusable Placeholder Page for Future Phase Routes
 * @param {string} title - Page title (Hindi)
 * @param {string} titleEn - Page title (English)
 * @param {string} icon - Emoji or symbol
 * @param {string} description - Description of the planned feature
 */
export const PlaceholderPage = ({
  title,
  titleEn,
  icon = '🏛️',
  description = 'इस पृष्ठ की संपूर्ण कार्यप्रणाली आगामी विकास चरण में क्रियान्वित की जाएगी।',
}) => {
  return (
    <div className="py-12 sm:py-20 bg-sand-50/40 min-h-[60vh] flex items-center">
      <Container size="md">
        <Card variant="warm" className="p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-md border-saffron-200">

          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-saffron-100 to-amber-100 border-2 border-saffron-300 flex items-center justify-center text-4xl shadow-inner">
            {icon}
          </div>

          <SectionTitle
            badge="Phase 1 Foundation"
            title={title}
            subtitle={titleEn ? `(${titleEn})` : ''}
            className="mb-4"
          />

          <div className="my-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-stone-700">
            <p className="text-base font-semibold text-amber-900 mb-1">
              भविष्य के विकास चरण में उपलब्ध होगा।
            </p>
            <p className="text-sm text-stone-600">
              "Coming in a future development phase."
            </p>
          </div>

          <p className="text-sm text-stone-600 mb-8 max-w-lg mx-auto leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/">
              <Button variant="primary" size="md">
                ← मुख्य पृष्ठ पर लौटें (Home)
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="md">
                संपर्क करें
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200/60 flex items-center justify-center gap-2">
            <Badge variant="saffron" size="sm">
              जादम परिवार कुलदेवी मंदिर, खलघाट
            </Badge>
          </div>

        </Card>
      </Container>
    </div>
  );
};

export default PlaceholderPage;
