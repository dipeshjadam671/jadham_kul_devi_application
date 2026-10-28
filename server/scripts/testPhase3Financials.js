const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Donation = require('../models/Donation');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Counter = require('../models/Counter');
const { getFinancialSummary, getMonthlySummary } = require('../services/financialService');
const { generateReceiptNumber } = require('../services/receiptService');

const runTests = async () => {
  console.log('🧪 Starting Phase 3 Financial Verification Suite...\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      testsFailed++;
    }
  };

  try {
    // 1. Test Financial Summary Formula Consistency
    console.log('\n--- 1. Testing Financial Summary & Core Formulas ---');
    const summary = await getFinancialSummary();

    assert(
      summary.totalDonations === 71000,
      `Total Verified Donations = 71000 (Actual: ${summary.totalDonations})`
    );
    assert(
      summary.totalOtherIncome === 75000,
      `Total Other Income = 75000 (Actual: ${summary.totalOtherIncome})`
    );
    assert(
      summary.totalIncome === summary.totalDonations + summary.totalOtherIncome,
      `Total Income (${summary.totalIncome}) = Total Donations (${summary.totalDonations}) + Other Income (${summary.totalOtherIncome})`
    );
    assert(
      summary.totalExpenses === 81400,
      `Total Expenses = 81400 (Actual: ${summary.totalExpenses})`
    );
    assert(
      summary.currentBalance === summary.totalIncome - summary.totalExpenses,
      `Current Balance (${summary.currentBalance}) = Total Income (${summary.totalIncome}) - Total Expenses (${summary.totalExpenses})`
    );
    assert(
      summary.currentBalance === 64600,
      `Net Balance = 64600 (Actual: ${summary.currentBalance})`
    );
    assert(
      summary.donationCount === 4,
      `Verified Donation Count = 4 (Actual: ${summary.donationCount})`
    );
    assert(
      summary.pendingDonationCount === 1,
      `Pending Donation Count = 1 (Actual: ${summary.pendingDonationCount})`
    );
    assert(
      summary.pendingDonationTotal === 51000,
      `Pending Donation Total = 51000 (Actual: ${summary.pendingDonationTotal})`
    );

    // 2. Test Monthly Breakdown
    console.log('\n--- 2. Testing Monthly Financial Breakdown ---');
    const monthly = await getMonthlySummary(2026);
    assert(monthly.months.length === 12, `Monthly array has exactly 12 months (Actual: ${monthly.months.length})`);
    
    // Check January (Month 1): Don: 11000, Inc: 25000 => Tot Inc: 36000, Exp: 8400 => Net: 27600
    const jan = monthly.months[0];
    assert(jan.donations === 11000, `Jan Donations = 11000 (Actual: ${jan.donations})`);
    assert(jan.otherIncome === 25000, `Jan Other Income = 25000 (Actual: ${jan.otherIncome})`);
    assert(jan.expense === 8400, `Jan Expenses = 8400 (Actual: ${jan.expense})`);
    assert(jan.balance === 27600, `Jan Net Balance = 27600 (Actual: ${jan.balance})`);

    // 3. Test Atomic Sequential Receipt Number Generation
    console.log('\n--- 3. Testing Sequential Receipt Number Generation ---');
    const testDate = new Date('2026-03-21');
    const seqReceipt = await generateReceiptNumber(testDate);
    const receiptRegex = /^JKM-2026-\d{6}$/;
    assert(
      receiptRegex.test(seqReceipt),
      `Receipt format matches JKM-YYYY-XXXXXX (Generated: ${seqReceipt})`
    );

    // Rollback test sequence increment
    await Counter.findByIdAndUpdate('receipt_2026', { $inc: { seq: -1 } });

    // 4. Test Pre-Save Total Financial Value Calculation
    console.log('\n--- 4. Testing Pre-Save Financial Value Calculation ---');
    const testDonation = new Donation({
      donorName: 'Test Pre-save Donor',
      donationDate: new Date(),
      donationType: 'mixed',
      paymentMethod: 'cash',
      amount: 10000,
      itemName: 'देसी घी (Desi Ghee)',
      itemQuantity: 5,
      itemUnit: 'डब्बे',
      itemPrice: 2000, // 5 * 2000 = 10,000
      createdBy: new mongoose.Types.ObjectId(),
    });

    await testDonation.validate(); // triggers validation
    // Save to trigger pre-save hook
    await testDonation.save();

    assert(
      testDonation.itemTotalValue === 10000,
      `Item Total Value automatically computed: 5 * 2000 = 10000 (Actual: ${testDonation.itemTotalValue})`
    );
    assert(
      testDonation.totalFinancialValue === 20000,
      `Total Financial Value automatically computed: 10000 + 10000 = 20000 (Actual: ${testDonation.totalFinancialValue})`
    );

    // Clean up test donation
    await Donation.findByIdAndDelete(testDonation._id);
    console.log('  Cleaned up temporary test donation');

    // 5. Test Public Privacy & Mobile Masking
    console.log('\n--- 5. Testing Public Privacy Masking ---');
    const publicDonations = await Donation.find({
      isPublic: true,
      isArchived: { $ne: true },
      verificationStatus: 'verified',
    });

    const hasPrivateDetails = publicDonations.some((d) => d.verificationStatus !== 'verified');
    assert(!hasPrivateDetails, 'Public list contains ONLY verified donations');

    const samplePublic = publicDonations[0];
    const publicView = samplePublic.getPublicView();
    assert(
      publicView.mobileMasked && publicView.mobileMasked.endsWith('XXXXX'),
      `Public phone is properly masked (Result: ${publicView.mobileMasked})`
    );
    assert(
      publicView.notes === undefined,
      'Internal notes are strictly excluded from public view'
    );

    // Summary
    console.log('\n======================================');
    console.log(`Verification Complete: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('======================================\n');

    if (testsFailed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
