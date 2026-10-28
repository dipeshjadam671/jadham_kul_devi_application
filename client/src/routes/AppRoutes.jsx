import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import HomePage from '../pages/HomePage';
import PlaceholderPage from '../pages/PlaceholderPage';
import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import AdminPlaceholderModule from '../pages/admin/AdminPlaceholderModule';
import NotFoundPage from '../pages/NotFoundPage';

// Phase 3 Financial Components
import { DonationListPage } from '../pages/admin/donations/DonationListPage';
import { DonationFormPage } from '../pages/admin/donations/DonationFormPage';
import { DonationDetailsPage } from '../pages/admin/donations/DonationDetailsPage';
import { IncomeListPage } from '../pages/admin/income/IncomeListPage';
import { IncomeFormPage } from '../pages/admin/income/IncomeFormPage';
import { ExpenseListPage } from '../pages/admin/expenses/ExpenseListPage';
import { ExpenseFormPage } from '../pages/admin/expenses/ExpenseFormPage';
import { FinancialReportsPage } from '../pages/admin/reports/FinancialReportsPage';
import { PublicFinancialTransparencyPage } from '../pages/PublicFinancialTransparencyPage';

// Phase 4 Public Components
import AboutPage from '../pages/public/AboutPage';
import HistoryPage from '../pages/public/HistoryPage';
import RulesPage from '../pages/public/RulesPage';
import ContactPage from '../pages/public/ContactPage';
import NoticeListPage from '../pages/public/NoticeListPage';
import NoticeDetailsPage from '../pages/public/NoticeDetailsPage';
import GalleryPage from '../pages/public/GalleryPage';
import AlbumDetailsPage from '../pages/public/AlbumDetailsPage';

// Phase 4 Admin Components
import TempleInfoPage from '../pages/admin/temple/TempleInfoPage';
import TempleRulesPage from '../pages/admin/temple/TempleRulesPage';
import AdminNoticeListPage from '../pages/admin/notices/NoticeListPage';
import NoticeFormPage from '../pages/admin/notices/NoticeFormPage';
import GalleryAlbumListPage from '../pages/admin/gallery/GalleryAlbumListPage';
import GalleryAlbumDetailsPage from '../pages/admin/gallery/GalleryAlbumDetailsPage';

// Phase 5 Public Yatra Components
import YatraHubPage from '../pages/public/yatra/YatraHubPage';
import RamNavamiRegistrationPage from '../pages/public/yatra/RamNavamiRegistrationPage';
import MansarovarRegistrationPage from '../pages/public/yatra/MansarovarRegistrationPage';
import YatraCheckStatusPage from '../pages/public/yatra/YatraCheckStatusPage';
import YatraRegistrationSuccessPage from '../pages/public/yatra/YatraRegistrationSuccessPage';

// Phase 5 Admin Yatra Components
import YatraDashboardPage from '../pages/admin/yatra/YatraDashboardPage';
import YatraRegistrationListPage from '../pages/admin/yatra/YatraRegistrationListPage';
import YatraRegistrationFormPage from '../pages/admin/yatra/YatraRegistrationFormPage';
import YatraRegistrationDetailsPage from '../pages/admin/yatra/YatraRegistrationDetailsPage';
import YatraPaymentsPage from '../pages/admin/yatra/YatraPaymentsPage';
import YatraInfoAdminPage from '../pages/admin/yatra/YatraInfoAdminPage';
import YatraReportsPage from '../pages/admin/yatra/YatraReportsPage';

// Phase 6 Public Puja Component
import PublicPujaPage from '../pages/public/PublicPujaPage';

// Phase 6 Admin Puja Components
import PujaDashboardPage from '../pages/admin/puja/PujaDashboardPage';
import PujaRecordListPage from '../pages/admin/puja/PujaRecordListPage';
import PujaRecordFormPage from '../pages/admin/puja/PujaRecordFormPage';
import PujaRecordDetailsPage from '../pages/admin/puja/PujaRecordDetailsPage';
import PujaReportsPage from '../pages/admin/puja/PujaReportsPage';

// Phase 6 Admin Restricted Records Components (PRIVATE)
import RestrictedPersonListPage from '../pages/admin/restricted/RestrictedPersonListPage';
import RestrictedPersonFormPage from '../pages/admin/restricted/RestrictedPersonFormPage';
import RestrictedPersonDetailsPage from '../pages/admin/restricted/RestrictedPersonDetailsPage';

// Phase 6 Admin User & Committee Components
import UserListPage from '../pages/admin/users/UserListPage';
import CommitteeListPage from '../pages/admin/users/CommitteeListPage';
import UserPermissionsPage from '../pages/admin/users/UserPermissionsPage';

/**
 * AppRoutes Component - Phase 6 Complete
 * Full routing tree supporting public pages, transparency portal, Phone OTP login,
 * Phase 3 financial management, Phase 4 temple CMS & media gallery,
 * Phase 5 yatra management, and Phase 6 Annual Puja + Restricted Records + Committee Management.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. PUBLIC LAYOUT ROUTES */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />

        {/* Public Financial Transparency Portal */}
        <Route path="financial-transparency" element={<PublicFinancialTransparencyPage />} />
        <Route path="donation" element={<PublicFinancialTransparencyPage />} />

        {/* Phase 4 Live Public CMS Routes */}
        <Route path="about" element={<AboutPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="contact" element={<ContactPage />} />

        {/* Notices & Events */}
        <Route path="notices" element={<NoticeListPage />} />
        <Route path="notices/:slug" element={<NoticeDetailsPage />} />

        {/* Photo & Video Gallery */}
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="gallery/:slug" element={<AlbumDetailsPage />} />

        {/* Phase 5 Live Public Yatra Routes */}
        <Route path="yatra" element={<YatraHubPage />} />
        <Route path="yatra/ram-navami" element={<RamNavamiRegistrationPage />} />
        <Route path="yatra/mansarovar" element={<MansarovarRegistrationPage />} />
        <Route path="yatra/check-registration" element={<YatraCheckStatusPage />} />
        <Route path="yatra/registration-success/:registrationNumber" element={<YatraRegistrationSuccessPage />} />

        {/* Phase 6 Live Public Puja Route (Aggregates only - Zero private data leaks) */}
        <Route path="puja" element={<PublicPujaPage />} />

        {/* Login Route */}
        <Route path="login" element={<LoginPage />} />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 2. PROTECTED ADMIN & COMMITTEE PORTAL ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'committee']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* /admin redirects to /admin/dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* Core Functional Modules */}
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="profile" element={<AdminProfilePage />} />

        {/* Phase 3 Live Financial Management Modules */}
        {/* Donations */}
        <Route path="donations" element={<DonationListPage />} />
        <Route path="donations/new" element={<DonationFormPage />} />
        <Route path="donations/:id" element={<DonationDetailsPage />} />
        <Route path="donations/:id/edit" element={<DonationFormPage />} />

        {/* Income */}
        <Route path="income" element={<IncomeListPage />} />
        <Route path="income/new" element={<IncomeFormPage />} />
        <Route path="income/:id/edit" element={<IncomeFormPage />} />

        {/* Expenses */}
        <Route path="expenses" element={<ExpenseListPage />} />
        <Route path="expenses/new" element={<ExpenseFormPage />} />
        <Route path="expenses/:id/edit" element={<ExpenseFormPage />} />

        {/* Reports */}
        <Route path="reports" element={<FinancialReportsPage />} />

        {/* Phase 4 Live Temple Content & Gallery Modules */}
        <Route path="temple-info" element={<TempleInfoPage />} />
        <Route path="temple-rules" element={<TempleRulesPage />} />
        <Route path="notices" element={<AdminNoticeListPage />} />
        <Route path="notices/new" element={<NoticeFormPage />} />
        <Route path="notices/:id/edit" element={<NoticeFormPage />} />
        <Route path="gallery" element={<GalleryAlbumListPage />} />
        <Route path="gallery/albums/:id" element={<GalleryAlbumDetailsPage />} />

        {/* Phase 5 Live Yatra Management Modules */}
        <Route path="yatra" element={<YatraDashboardPage />} />
        <Route path="yatra/registrations" element={<YatraRegistrationListPage />} />
        <Route path="yatra/registrations/new" element={<YatraRegistrationFormPage />} />
        <Route path="yatra/registrations/:id" element={<YatraRegistrationDetailsPage />} />
        <Route path="yatra/registrations/:id/edit" element={<YatraRegistrationFormPage />} />
        <Route path="yatra/payments" element={<YatraPaymentsPage />} />
        <Route path="yatra/info" element={<YatraInfoAdminPage />} />
        <Route path="yatra/reports" element={<YatraReportsPage />} />

        {/* Phase 6 Live Annual Puja Records Modules */}
        <Route path="puja" element={<PujaDashboardPage />} />
        <Route path="puja/records" element={<PujaRecordListPage />} />
        <Route path="puja/records/new" element={<PujaRecordFormPage />} />
        <Route path="puja/records/:id" element={<PujaRecordDetailsPage />} />
        <Route path="puja/records/:id/edit" element={<PujaRecordFormPage />} />
        <Route path="puja/reports" element={<PujaReportsPage />} />

        {/* Phase 6 Live Restricted / Blacklist Records Modules (100% PRIVATE) */}
        <Route path="restricted-persons" element={<RestrictedPersonListPage />} />
        <Route path="restricted-persons/new" element={<RestrictedPersonFormPage />} />
        <Route path="restricted-persons/:id" element={<RestrictedPersonDetailsPage />} />
        <Route path="restricted-persons/:id/edit" element={<RestrictedPersonFormPage />} />
        {/* Backwards compatibility alias for /admin/blacklist */}
        <Route path="blacklist" element={<Navigate to="/admin/restricted-persons" replace />} />

        {/* Phase 6 Live User Directory & Committee Management Modules */}
        <Route path="users" element={<UserListPage />} />
        <Route path="users/:id/permissions" element={<UserPermissionsPage />} />
        <Route path="committee" element={<CommitteeListPage />} />

        {/* Future Module Placeholder: Audit Logs */}
        <Route
          path="audit-logs"
          element={
            <AdminPlaceholderModule
              title="सिस्टम ऑडिट लॉग्स"
              titleEn="System Audit Logs"
              icon="📜"
              description="प्रशासनिक परिवर्तनों, लॉगिन रिकॉर्ड एवं गतिविधियों का अपरिवर्तनीय ऑडिट ट्रेल।"
            />
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
