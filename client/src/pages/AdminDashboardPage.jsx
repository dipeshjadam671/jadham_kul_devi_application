import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionTitle from '../components/common/SectionTitle';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';

/**
 * AdminDashboardPage Component
 * Admin Dashboard architectural placeholder for Phase 1.
 * Clearly states authentication and role-based access will be implemented in Phase 2.
 */
export const AdminDashboardPage = () => {
  return (
    <div className="py-12 sm:py-16 bg-sand-50/50 min-h-[75vh]">
      <Container size="md">
        
        {/* Admin Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔐</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-sm text-stone-600">
              जादम परिवार कुलदेवी मंदिर प्रबंधन पोर्टल (Temple Management System)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="maroon" size="md">
              Role: Admin (Planned)
            </Badge>
            <Badge variant="gold" size="md">
              Phase 1 Architecture
            </Badge>
          </div>
        </div>

        {/* Primary Notice Card */}
        <Card variant="warm" className="p-8 sm:p-10 mb-8 border-maroon-200 shadow-sm">
          <SectionTitle
            align="left"
            badge="सुरक्षा एवं प्रमाणीकरण सूचना"
            title="प्रशासनिक नियंत्रण कक्ष (Admin Dashboard)"
            subtitle="Authentication and role-based access will be implemented in Phase 2."
            className="mb-6"
          />

          <Alert type="warning" title="Phase 2 Authentication Roadmap" className="mb-6">
            प्रमाणीकरण एवं भूमिका-आधारित पहुंच (Role-based Access Control) को आगामी <strong>चरण 2</strong> में Firebase Authentication एवं Phone OTP के माध्यम से लागू किया जाएगा। प्रथम चरण में सुरक्षा के उद्देश्य से कोई भी संवेदनशील डेटा या असुरक्षित डमी एडमिन क्रेडेंशियल नहीं खोले गए हैं।
          </Alert>

          {/* Architectural Readiness Checklist */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
              चरण 1 में तैयार की गई आर्किटेक्चरल नींव:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-stone-200 text-xs sm:text-sm text-stone-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>User Mongoose Model (firebaseUid, role, permissions)</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-stone-200 text-xs sm:text-sm text-stone-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Auth Middleware (`server/middleware/authMiddleware.js`)</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-stone-200 text-xs sm:text-sm text-stone-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Role Middleware (`server/middleware/roleMiddleware.js`)</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-stone-200 text-xs sm:text-sm text-stone-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Client Axios Token Interceptor Architecture</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                ← सार्वजनिक पोर्टल पर लौटें
              </Button>
            </Link>

            <span className="text-xs text-stone-500">
              No sensitive information is exposed.
            </span>
          </div>
        </Card>

      </Container>
    </div>
  );
};

export default AdminDashboardPage;
