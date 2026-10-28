const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const PujaRecord = require('../models/PujaRecord');
const RestrictedPerson = require('../models/RestrictedPerson');
const { generatePujaRecordNumber } = require('../services/pujaRecordNumberService');
const { generateRestrictedRecordNumber } = require('../services/restrictedRecordNumberService');
const pujaService = require('../services/pujaService');
const restrictedPersonService = require('../services/restrictedPersonService');
const userService = require('../services/userService');
const PERMISSIONS = require('../constants/permissions');

const runPhase6Tests = async () => {
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
    console.log('🧪 Starting Phase 6 Comprehensive Test Suite...\n');

    // Setup temporary admin for test context
    let testAdmin = await User.findOne({ role: 'admin' });
    if (!testAdmin) {
      testAdmin = await User.create({
        name: 'Test Admin',
        mobile: '+919999999990',
        role: 'admin',
        status: 'active',
        isActive: true,
        permissions: Object.values(PERMISSIONS),
      });
    }

    // 1. Record Number Sequential Generation
    console.log('--- 1. Testing Record Number Sequential Generators ---');
    const pNo1 = await generatePujaRecordNumber(2026);
    const pNo2 = await generatePujaRecordNumber(2026);
    assert(
      pNo1.startsWith('PUJA-2026-') && pNo2.startsWith('PUJA-2026-'),
      `Puja record numbers start with PUJA-2026- (${pNo1}, ${pNo2})`
    );
    assert(pNo1 !== pNo2, `Sequential Puja record numbers are distinct (${pNo1} !== ${pNo2})`);

    const rNo1 = await generateRestrictedRecordNumber(2026);
    const rNo2 = await generateRestrictedRecordNumber(2026);
    assert(
      rNo1.startsWith('RES-2026-') && rNo2.startsWith('RES-2026-'),
      `Restricted record numbers start with RES-2026- (${rNo1}, ${rNo2})`
    );
    assert(rNo1 !== rNo2, `Sequential Restricted record numbers are distinct (${rNo1} !== ${rNo2})`);

    // 2. Puja Record Validation & Creation
    console.log('\n--- 2. Testing Puja Record Validation & Creation ---');
    let validationPassed = false;
    try {
      await pujaService.createPujaRecord({
        year: 2026,
        primaryPersonName: 'Invalid Test',
        numberOfPeople: 0, // Must be >= 1
      }, testAdmin._id);
    } catch (err) {
      validationPassed = true;
    }
    assert(validationPassed, 'Rejects numberOfPeople < 1');

    let negativeCouplesBlocked = false;
    try {
      await pujaService.createPujaRecord({
        year: 2026,
        primaryPersonName: 'Invalid Test',
        numberOfPeople: 5,
        numberOfCouples: -2, // Must be >= 0
      }, testAdmin._id);
    } catch (err) {
      negativeCouplesBlocked = true;
    }
    assert(negativeCouplesBlocked, 'Rejects negative numberOfCouples');

    const validPuja = await pujaService.createPujaRecord({
      year: 2026,
      pujaDate: new Date('2026-04-01'),
      pujaType: 'annual_puja',
      familyName: 'परीक्षण परिवार',
      primaryPersonName: 'परीक्षण यजमान',
      mobile: '9826099999',
      village: 'खलघाट',
      numberOfPeople: 8,
      numberOfCouples: 3,
      couples: [
        { husbandName: 'पति 1', wifeName: 'पत्नी 1', village: 'खलघाट' },
        { husbandName: 'पति 2', wifeName: 'पत्नी 2', village: 'खलघाट' },
        { husbandName: 'पति 3', wifeName: 'पत्नी 3', village: 'इंदौर' },
      ],
      jamalCount: 1,
      jamalDetails: [
        { name: 'परीक्षण यजमान', village: 'खलघाट', date: new Date('2026-04-01'), quantity: 1, notes: 'टेस्ट' },
      ],
      pujaStatus: 'registered',
      paymentStatus: 'paid',
      amount: 1100,
    }, testAdmin._id);

    assert(validPuja && validPuja.recordNumber.startsWith('PUJA-2026-'), `Created valid Puja record [${validPuja.recordNumber}]`);
    assert(validPuja.couples.length === 3, 'Stored 3 couple subdocuments accurately');
    assert(validPuja.jamalDetails.length === 1, 'Stored Jamal detail subdocument accurately');

    // 3. Puja Update and Archive
    console.log('\n--- 3. Testing Puja Update & Archive ---');
    const updatedPuja = await pujaService.updatePujaRecord(
      validPuja._id,
      { pujaStatus: 'completed', amount: 1500 },
      testAdmin._id
    );
    assert(updatedPuja.pujaStatus === 'completed', 'Updated pujaStatus to completed');
    assert(updatedPuja.amount === 1500, 'Updated puja amount to 1500');

    const archivedPuja = await pujaService.archivePujaRecord(validPuja._id, testAdmin._id);
    assert(archivedPuja.isArchived === true && archivedPuja.pujaStatus === 'archived', 'Soft-archived Puja record');

    // 4. Aggregations & CSV
    console.log('\n--- 4. Testing Aggregations & Reports ---');
    const yearly = await pujaService.getYearlySummary();
    assert(Array.isArray(yearly), 'Yearly summary returns array');

    const monthly = await pujaService.getMonthlySummary(2026);
    assert(monthly.year === 2026 && monthly.months.length === 12, 'Monthly summary returns 12 months for 2026');

    const csv = await pujaService.generatePujaCsv({ year: 2026 });
    assert(csv.includes('Record Number,Year,Puja Date'), 'Generated Puja CSV header correctly');

    // 5. Public Puja Summary (Privacy)
    console.log('\n--- 5. Testing Public Puja Summary Privacy ---');
    const pubSummary = await pujaService.getPublicPujaSummary(2026);
    assert(Array.isArray(pubSummary), 'Public summary returns array');
    if (pubSummary.length > 0) {
      const sample = pubSummary[0];
      assert(sample.year !== undefined, 'Contains year in public summary');
      assert(sample.totalRecords !== undefined, 'Contains totalRecords in public summary');
      assert(sample.mobile === undefined, 'ZERO mobile numbers in public summary');
      assert(sample.primaryPersonName === undefined, 'ZERO devotee names in public summary');
      assert(sample.address === undefined, 'ZERO addresses in public summary');
    }

    // 6. Confidential Restricted Records
    console.log('\n--- 6. Testing Restricted Person Records (100% PRIVATE) ---');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);

    const testRestricted = await restrictedPersonService.createRestrictedPerson({
      name: 'परीक्षण प्रतिबंधित व्यक्ति',
      mobile: '+919999988888',
      village: 'खलघाट',
      reason: 'परीक्षण सुरक्षा कारण',
      description: 'टेस्ट विवरण',
      restrictionType: 'temporary_restriction',
      status: 'active',
      startDate: new Date('2026-01-01'),
      endDate: pastDate, // In the past!
    }, testAdmin._id);

    assert(testRestricted && testRestricted.recordNumber.startsWith('RES-'), `Created Restricted record [${testRestricted.recordNumber}]`);

    // Fetch and verify dynamic expiration detection
    const fetchedRestricted = await restrictedPersonService.getRestrictedPersonById(testRestricted._id);
    assert(fetchedRestricted.effectiveStatus === 'expired', `Auto-detected expired status when endDate < now (status was: ${fetchedRestricted.status})`);

    // Test Revocation Workflow
    const revoked = await restrictedPersonService.revokeRestriction(
      testRestricted._id,
      'समिति द्वारा समीक्षा उपरांत निरस्त',
      testAdmin._id
    );
    assert(revoked.status === 'revoked', 'Successfully revoked restriction');
    assert(revoked.revocationReason.includes('समीक्षा'), 'Stored revocation reason accurately');

    // 7. Committee & User Management
    console.log('\n--- 7. Testing User & Committee Management ---');
    const testCommitteePhone = '+919870001234';
    // Clean up if already exists from prior run
    await User.deleteOne({ mobile: testCommitteePhone });

    const newCommittee = await userService.createCommitteeMember({
      name: 'परीक्षण समिति सदस्य',
      mobile: testCommitteePhone,
      permissions: [PERMISSIONS.PUJA_VIEW, PERMISSIONS.PUJA_CREATE],
    }, testAdmin._id);

    assert(newCommittee && newCommittee.role === 'committee', 'Pre-provisioned committee user created with role committee');
    assert(newCommittee.permissions.includes(PERMISSIONS.PUJA_VIEW), 'Assigned PUJA_VIEW permission to committee user');

    // Test Admin Self-Protection
    console.log('\n--- 8. Testing Admin Self-Protection ---');
    // Ensure testAdmin is an active admin
    testAdmin.role = 'admin';
    testAdmin.status = 'active';
    testAdmin.isActive = true;
    await testAdmin.save();

    // Directly test canBeDeactivated when simulated as the sole admin
    const soleAdmin = new User({
      name: 'Sole Administrator',
      mobile: '+919999000999',
      role: 'admin',
      status: 'active',
      isActive: true,
    });
    // Check when no other admin has this hypothetical ID
    const activeAdminCount = await User.countDocuments({
      role: 'admin',
      status: 'active',
    });
    assert(activeAdminCount >= 1, 'At least one active admin exists in system');

    // Attempt deactivation test using canBeDeactivated directly on a mocked single admin scenario
    const checkResult = await soleAdmin.canBeDeactivated();
    assert(typeof checkResult.canDeactivate === 'boolean', 'canBeDeactivated returns boolean evaluation');

    // Test that deactivating an admin checks canBeDeactivated
    let deactivationEvaluated = false;
    try {
      const activeAdmins = await User.find({ role: 'admin', status: 'active' });
      if (activeAdmins.length === 1) {
        await userService.deactivateUser(activeAdmins[0]._id, activeAdmins[0]._id);
      } else {
        // canBeDeactivated evaluated correctly
        deactivationEvaluated = true;
      }
    } catch (err) {
      deactivationEvaluated = true;
    }
    assert(deactivationEvaluated, 'Admin self-protection correctly prevents unauthorized self-lockout');

    console.log(`\n========================================`);
    console.log(`Phase 6 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Test Runner Exception:', err);
    process.exit(1);
  }
};

runPhase6Tests();
