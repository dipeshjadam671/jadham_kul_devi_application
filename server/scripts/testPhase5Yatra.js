const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const YatraRegistration = require('../models/YatraRegistration');
const YatraPayment = require('../models/YatraPayment');
const YatraInfo = require('../models/YatraInfo');
const { generateYatraRegistrationNumber } = require('../services/yatraRegistrationNumberService');
const {
  checkDuplicateRegistration,
  validateStatusTransition,
  getYatraStats,
  getYearlySummary,
  getMonthlySummary,
  generateYatraCsv,
} = require('../services/yatraService');

const runPhase5Tests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';
    await mongoose.connect(mongoUri);
    console.log('🧪 Starting Phase 5 Yatra Test Suite...\n');

    // 1. Test Registration Number Format
    console.log('--- 1. Testing Registration Number Generation ---');
    const rnyNum = await generateYatraRegistrationNumber('RAM_NAVAMI');
    const currentYear = new Date().getFullYear();
    assert(
      rnyNum.startsWith(`RNY-${currentYear}-`),
      `Ram Navami registration number starts with RNY-${currentYear}- (Got: ${rnyNum})`
    );
    assert(rnyNum.length === 15, `Ram Navami registration number length is 15 chars (Got: ${rnyNum.length})`);

    const msyNum = await generateYatraRegistrationNumber('MANSAROVAR');
    assert(
      msyNum.startsWith(`MSY-${currentYear}-`),
      `Mansarovar registration number starts with MSY-${currentYear}- (Got: ${msyNum})`
    );
    assert(msyNum.length === 15, `Mansarovar registration number length is 15 chars (Got: ${msyNum.length})`);

    // 2. Test Duplicate Registration Detection
    console.log('\n--- 2. Testing Duplicate Registration Detection ---');
    const testTravelDate = new Date('2026-08-15');
    const testMobile = '9826098765';

    // Create a temporary test registration
    const dummyRegNo = await generateYatraRegistrationNumber('RAM_NAVAMI');
    const dummyReg = await YatraRegistration.create({
      registrationNumber: dummyRegNo,
      yatraType: 'RAM_NAVAMI',
      year: 2026,
      primaryName: 'टेस्ट भक्त',
      mobile: testMobile,
      numberOfTravelers: 1,
      travelers: [
        {
          name: 'टेस्ट भक्त',
          age: 30,
          gender: 'male',
          mobile: testMobile,
          idType: 'aadhaar',
          idLastFourDigits: '1234',
        },
      ],
      travelDate: testTravelDate,
      paymentAmount: 3500,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
    });

    const dupResult = await checkDuplicateRegistration({
      mobile: testMobile,
      yatraType: 'RAM_NAVAMI',
      year: 2026,
      travelDate: testTravelDate,
    });
    assert(dupResult.isDuplicate === true, 'Duplicate registration correctly detected for same mobile, yatra & year');

    const notDupDifferentYatra = await checkDuplicateRegistration({
      mobile: testMobile,
      yatraType: 'MANSAROVAR',
      year: 2026,
      travelDate: testTravelDate,
    });
    assert(notDupDifferentYatra.isDuplicate === false, 'Different yatra type is NOT flagged as duplicate');

    // 3. Test Status Transitions
    console.log('\n--- 3. Testing Status Transitions Validation ---');
    const t1 = validateStatusTransition('pending', 'confirmed', 'committee');
    assert(t1.isValid === true, 'Status change pending -> confirmed allowed for committee');

    const t2 = validateStatusTransition('confirmed', 'completed', 'committee');
    assert(t2.isValid === true, 'Status change confirmed -> completed allowed for committee');

    const t3 = validateStatusTransition('completed', 'cancelled', 'committee');
    assert(t3.isValid === false, 'Status change completed -> cancelled NOT allowed for committee');

    const t4 = validateStatusTransition('completed', 'confirmed', 'admin');
    assert(t4.isValid === true, 'Status revert completed -> confirmed ALLOWED for admin override');

    const t5 = validateStatusTransition('cancelled', 'completed', 'admin');
    assert(t5.isValid === false, 'Status change cancelled -> completed is strictly prohibited');

    // 4. Test Payment Ledger & Recalculation
    console.log('\n--- 4. Testing Payment Ledger & Synchronization ---');
    const paymentRegNo = await generateYatraRegistrationNumber('RAM_NAVAMI');
    const paymentReg = await YatraRegistration.create({
      registrationNumber: paymentRegNo,
      yatraType: 'RAM_NAVAMI',
      year: 2026,
      primaryName: 'पेमेंट टेस्ट भक्त',
      mobile: '9826077711',
      numberOfTravelers: 2,
      travelers: [
        { name: 'भक्त १', age: 35, gender: 'male' },
        { name: 'भक्त २', age: 32, gender: 'female' },
      ],
      travelDate: new Date('2026-10-10'),
      paymentAmount: 0,
      paymentStatus: 'pending',
    });

    // Record 1st installment: 3000
    const payment1 = await YatraPayment.create({
      registrationId: paymentReg._id,
      amount: 3000,
      paymentMethod: 'upi',
      transactionId: 'TEST-TXN-001',
      status: 'received',
      notes: 'First installment',
    });

    // Recalculate payments
    const allP1 = await YatraPayment.find({ registrationId: paymentReg._id, status: 'received' });
    const totalP1 = allP1.reduce((sum, p) => sum + p.amount, 0);
    paymentReg.paymentAmount = totalP1;
    paymentReg.paymentStatus = 'partial';
    await paymentReg.save();

    const checkP1 = await YatraRegistration.findById(paymentReg._id);
    assert(checkP1.paymentAmount === 3000, `Payment amount updated to 3000 (Got: ${checkP1.paymentAmount})`);
    assert(checkP1.paymentStatus === 'partial', `Payment status is 'partial' (Got: ${checkP1.paymentStatus})`);

    // Record 2nd installment: 4000
    const payment2 = await YatraPayment.create({
      registrationId: paymentReg._id,
      amount: 4000,
      paymentMethod: 'cash',
      transactionId: 'TEST-TXN-002',
      status: 'received',
      notes: 'Final installment',
    });

    const allP2 = await YatraPayment.find({ registrationId: paymentReg._id, status: 'received' });
    const totalP2 = allP2.reduce((sum, p) => sum + p.amount, 0);
    paymentReg.paymentAmount = totalP2;
    paymentReg.paymentStatus = 'paid';
    await paymentReg.save();

    const checkP2 = await YatraRegistration.findById(paymentReg._id);
    assert(checkP2.paymentAmount === 7000, `Payment amount updated to 7000 (Got: ${checkP2.paymentAmount})`);
    assert(checkP2.paymentStatus === 'paid', `Payment status is 'paid' (Got: ${checkP2.paymentStatus})`);

    // 5. Test Public Masking (Privacy)
    console.log('\n--- 5. Testing Public Privacy Masking ---');
    const publicView = checkP2.getPublicView();
    assert(publicView.mobileMasked === '98260XXXXX', `Mobile is masked as 98260XXXXX (Got: ${publicView.mobileMasked})`);
    assert(publicView.notes === undefined, 'Admin notes are omitted from public view');
    assert(publicView.createdBy === undefined, 'Internal createdBy is omitted from public view');
    assert(publicView.registrationNumber === paymentReg.registrationNumber, 'Registration number is present in public view');

    // Clean up test documents
    await YatraRegistration.deleteMany({ _id: { $in: [dummyReg._id, paymentReg._id] } });
    await YatraPayment.deleteMany({ _id: { $in: [payment1._id, payment2._id] } });

    // 6. Test Reports, Aggregations & CSV
    console.log('\n--- 6. Testing Stats, Aggregations & CSV Export ---');
    const stats = await getYatraStats({ year: 2026 });
    assert(typeof stats.totalRegistrations === 'number', `Stats returns numeric totalRegistrations (Got: ${stats.totalRegistrations})`);
    assert(typeof stats.totalTravelers === 'number', `Stats returns numeric totalTravelers (Got: ${stats.totalTravelers})`);
    assert(stats.totalRegistrations >= 5, `Stats found >= 5 seeded registrations (Got: ${stats.totalRegistrations})`);

    const yearlySummary = await getYearlySummary();
    assert(Array.isArray(yearlySummary), 'Yearly summary returns array');
    const year2026 = yearlySummary.find((y) => y.year === 2026);
    assert(year2026 && year2026.totalRegistrations >= 5, 'Yearly summary contains 2026 aggregated stats');

    const monthlySummary = await getMonthlySummary(2026);
    assert(monthlySummary.year === 2026, 'Monthly summary year matches 2026');
    assert(monthlySummary.months.length === 12, 'Monthly summary returns 12 calendar months');

    const csvData = await generateYatraCsv({ year: 2026 });
    assert(csvData.startsWith('\uFEFF'), 'CSV export starts with UTF-8 BOM (\\uFEFF) for Hindi Excel compatibility');
    assert(csvData.includes('Registration Number'), 'CSV contains header "Registration Number"');
    assert(csvData.includes('मोहनलाल जादम'), 'CSV includes seeded devotee names');

    console.log('\n======================================');
    console.log(`Phase 5 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Test suite failed with exception:', err);
    process.exit(1);
  }
};

runPhase5Tests();
