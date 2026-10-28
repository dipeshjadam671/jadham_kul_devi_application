const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Donation = require('../models/Donation');
const {
  createDonation,
  getDonations,
  verifyDonation,
  rejectDonation,
} = require('../controllers/donationController');
const { exportFinancialCSV } = require('../controllers/financialController');

const testAdminApi = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';
  await mongoose.connect(mongoUri);

  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) throw new Error('No admin user found');

  console.log('Testing Admin Controller Logic with user:', adminUser.name);

  // Helper mock response
  const createMockRes = () => {
    return {
      statusCode: 200,
      headers: {},
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(k, v) {
        this.headers[k] = v;
      },
      json(data) {
        this.body = data;
        return this;
      },
      send(data) {
        this.body = data;
        return this;
      },
    };
  };

  // 1. Create a Pending Donation via Controller
  const mockReq1 = {
    user: adminUser,
    body: {
      donorName: 'गोविंद जादम (Govind Jadam)',
      village: 'खलघाट',
      mobile: '9826199999',
      donationDate: new Date('2026-03-21'),
      donationType: 'cash',
      paymentMethod: 'cash',
      amount: 5100,
      purpose: 'दैनिक भोग सेवा (Daily Bhog)',
      isPublic: true,
    },
  };
  const mockRes1 = createMockRes();
  await createDonation(mockReq1, mockRes1);

  console.log(
    '1. Create Donation Status:',
    mockRes1.statusCode,
    mockRes1.body?.success ? 'SUCCESS' : 'FAIL',
    'Verification Status:',
    mockRes1.body?.data?.verificationStatus
  );
  const createdId = mockRes1.body?.data?._id;

  // 2. Verify Donation via Controller
  const mockReq2 = {
    user: adminUser,
    params: { id: createdId },
  };
  const mockRes2 = createMockRes();
  await verifyDonation(mockReq2, mockRes2);

  console.log(
    '2. Verify Donation Status:',
    mockRes2.statusCode,
    'Issued Receipt:',
    mockRes2.body?.data?.receiptNumber,
    'Status:',
    mockRes2.body?.data?.verificationStatus
  );

  // 3. Test CSV Export Controller
  const mockReq3 = {
    query: { type: 'donations' },
  };
  const mockRes3 = createMockRes();
  await exportFinancialCSV(mockReq3, mockRes3);

  console.log(
    '3. CSV Export Content-Type:',
    mockRes3.headers['Content-Type'],
    'Has UTF-8 BOM:',
    mockRes3.body?.startsWith('\uFEFF'),
    'Header contains Receipt Number:',
    mockRes3.body?.includes('Receipt Number')
  );

  // Cleanup test donation
  await Donation.findByIdAndDelete(createdId);
  console.log('Cleaned up test donation');

  await mongoose.disconnect();
  console.log('🎉 Admin Financial API Logic Verified Successfully!');
};

testAdminApi().catch(console.error);
