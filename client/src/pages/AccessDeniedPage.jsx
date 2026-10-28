import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

/**
 * AccessDeniedPage Component
 * Rendered when an authenticated user attempts to access routes restricted to Admin or Committee roles
 */
export const AccessDeniedPage = ({ requiredRoles = ['admin', 'committee'] }) => {
  const { currentUser, role, logout } = useAuth();

  return (
    <div className="py-16 sm:py-24 bg-sand-50/50 min-h-[70vh] flex items-center">
      <Container size="sm">
        <Card variant="warm" className="p-8 sm:p-12 text-center shadow-lg border-maroon-300">
          
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-4xl shadow-inner">
            🚫
          </div>

          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-100/90 rounded-full border border-rose-200">
            Access Denied / पहुंच अस्वीकृत (403)
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">
            अनधिकृत पहुंच (Unauthorized Access)
          </h1>

          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            क्षमा करें, यह अनुभाग केवल मंदिर ट्रस्ट के <strong>प्रशासक (Admin)</strong> अथवा <strong>समिति सदस्य (Committee)</strong> के लिए आरक्षित है।
          </p>

          {/* Current Role Details Box */}
          <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200 text-left text-xs sm:text-sm space-y-2 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">आपका मोबाइल नंबर:</span>
              <span className="font-bold text-stone-800">{currentUser?.mobile || 'प्रमाणीकृत सदस्य'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">वर्तमान भूमिका (Current Role):</span>
              <Badge variant={role === 'admin' ? 'maroon' : role === 'committee' ? 'gold' : 'neutral'} size="sm">
                {role || 'public'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">आवश्यक भूमिका (Required):</span>
              <span className="font-semibold text-maroon-700">{requiredRoles.join(' या ')}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="md">
                ← मुख्य पृष्ठ (Home)
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={logout}>
              लॉग आउट करें
            </Button>
          </div>

          <p className="mt-8 text-xs text-stone-400">
            यदि आप मंदिर समिति के सदस्य हैं, तो कृपया मुख्य ट्रस्टी से भूमिका अद्यतन (role upgrade) का अनुरोध करें।
          </p>
        </Card>
      </Container>
    </div>
  );
};

export default AccessDeniedPage;
