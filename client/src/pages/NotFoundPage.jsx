import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * NotFoundPage (404) Component
 */
export const NotFoundPage = () => {
  return (
    <div className="py-16 sm:py-24 bg-sand-50/50 min-h-[65vh] flex items-center">
      <Container size="sm">
        <Card variant="warm" className="p-8 sm:p-12 text-center shadow-md border-maroon-200">
          <span className="text-6xl sm:text-7xl block mb-4">🕉️</span>
          
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 rounded-full border border-rose-200">
            Error 404
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
            पृष्ठ नहीं मिला (Page Not Found)
          </h1>

          <p className="text-sm text-stone-600 mb-8 leading-relaxed max-w-sm mx-auto">
            क्षमा करें, आपके द्वारा खोजा गया पृष्ठ उपलब्ध नहीं है या इसका पता बदल दिया गया है।
          </p>

          <Link to="/">
            <Button variant="primary" size="md">
              ← मुख्य पृष्ठ पर जाएं (Back to Home)
            </Button>
          </Link>
        </Card>
      </Container>
    </div>
  );
};

export default NotFoundPage;
