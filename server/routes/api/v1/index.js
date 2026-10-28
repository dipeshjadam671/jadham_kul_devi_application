const express = require('express');
const router = express.Router();
const healthRoutes = require('../../health.routes');
const authRoutes = require('../../auth.routes');
const testRoutes = require('../../test.routes');

// Phase 3 Financial Routes
const donationRoutes = require('../../donationRoutes');
const incomeRoutes = require('../../incomeRoutes');
const expenseRoutes = require('../../expenseRoutes');
const financialRoutes = require('../../financialRoutes');
const publicFinancialRoutes = require('../../publicFinancialRoutes');

// Phase 4 Content & Media Routes
const templeInfoRoutes = require('../../templeInfoRoutes');
const templeRuleRoutes = require('../../templeRuleRoutes');
const noticeRoutes = require('../../noticeRoutes');
const galleryRoutes = require('../../galleryRoutes');
const uploadRoutes = require('../../uploadRoutes');
const publicContentRoutes = require('../../publicContentRoutes');

// Phase 5 Yatra Management Routes
const yatraRoutes = require('../../yatraRoutes');
const yatraPaymentRoutes = require('../../yatraPaymentRoutes');
const yatraInfoRoutes = require('../../yatraInfoRoutes');
const publicYatraRoutes = require('../../publicYatraRoutes');

// Phase 6 Puja, Restricted Records & User Management Routes
const pujaRoutes = require('../../pujaRoutes');
const publicPujaRoutes = require('../../publicPujaRoutes');
const restrictedPersonRoutes = require('../../restrictedPersonRoutes');
const userRoutes = require('../../userRoutes');

/**
 * API Version 1 Root Router
 * Mounts sub-routers across all phases (Auth, Financials, Content, Yatra, Puja, Security, Users)
 */

// Health endpoints: /api/v1/health
router.use('/', healthRoutes);

// Auth endpoints: /api/v1/auth/*
router.use('/auth', authRoutes);

// Test authorization endpoints: /api/v1/test/*
router.use('/test', testRoutes);

// Phase 3 Management Endpoints
router.use('/donations', donationRoutes);
router.use('/income', incomeRoutes);
router.use('/expenses', expenseRoutes);
router.use('/financial', financialRoutes);

// Phase 3 Public Transparency Endpoints
router.use('/public/financial', publicFinancialRoutes);

// Phase 4 Management Endpoints
router.use('/temple-info', templeInfoRoutes);
router.use('/temple-rules', templeRuleRoutes);
router.use('/notices', noticeRoutes);
router.use('/gallery', galleryRoutes);
router.use('/upload', uploadRoutes);

// Phase 4 Public Content Endpoints
router.use('/public/content', publicContentRoutes);

// Phase 5 Yatra Endpoints
router.use('/yatra/payments', yatraPaymentRoutes);
router.use('/yatra/info', yatraInfoRoutes);
router.use('/yatra', yatraRoutes);
router.use('/public/yatra', publicYatraRoutes);

// Phase 6 Annual Puja Endpoints
router.use('/puja', pujaRoutes);
router.use('/public/puja', publicPujaRoutes);

// Phase 6 Restricted / Blacklist Records (100% PRIVATE)
router.use('/restricted-persons', restrictedPersonRoutes);

// Phase 6 User Directory & Committee Management
router.use('/users', userRoutes);

// API v1 root status
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jadam Kuldevi Mandir API v1 is active',
    version: '1.0.0',
    phase: 'Phase 6 - Annual Puja Records, Restricted Records & Committee Management',
    endpoints: {
      health: '/api/v1/health',
      auth: {
        me: 'GET /api/v1/auth/me',
        sync: 'POST /api/v1/auth/sync',
      },
      donations: '/api/v1/donations',
      income: '/api/v1/income',
      expenses: '/api/v1/expenses',
      financial: '/api/v1/financial',
      publicTransparency: '/api/v1/public/financial',
      templeInfo: '/api/v1/temple-info',
      templeRules: '/api/v1/temple-rules',
      notices: '/api/v1/notices',
      gallery: '/api/v1/gallery',
      upload: '/api/v1/upload',
      publicContent: '/api/v1/public/content',
      yatra: '/api/v1/yatra',
      yatraPayments: '/api/v1/yatra/payments',
      yatraInfo: '/api/v1/yatra/info',
      publicYatra: '/api/v1/public/yatra',
      puja: '/api/v1/puja',
      publicPuja: '/api/v1/public/puja',
      restrictedPersons: '/api/v1/restricted-persons',
      users: '/api/v1/users',
    },
  });
});

module.exports = router;
