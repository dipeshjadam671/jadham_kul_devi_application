const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('../app');
const YatraRegistration = require('../models/YatraRegistration');

const runHttpTests = async () => {
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

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🚀 Test HTTP server running on ${baseUrl}\n`);

  try {
    // 1. Test Public Yatra Info endpoints
    console.log('--- 1. Testing Public Yatra Info Endpoints ---');
    const rnInfoRes = await fetch(`${baseUrl}/api/v1/yatra/info/RAM_NAVAMI`);
    assert(rnInfoRes.status === 200, 'GET /api/v1/yatra/info/RAM_NAVAMI returns HTTP 200');
    const rnInfoData = await rnInfoRes.json();
    assert(rnInfoData.success === true, 'Response indicates success: true');
    assert(rnInfoData.data?.yatraType === 'RAM_NAVAMI', 'Returned info is for RAM_NAVAMI');
    assert(
      (rnInfoData.data?.guidelines && rnInfoData.data.guidelines.length > 20) ||
      (rnInfoData.data?.instructions && rnInfoData.data.instructions.length > 0),
      'Guidelines or instructions are present'
    );

    const msInfoRes = await fetch(`${baseUrl}/api/v1/yatra/info/MANSAROVAR`);
    assert(msInfoRes.status === 200, 'GET /api/v1/yatra/info/MANSAROVAR returns HTTP 200');
    const msInfoData = await msInfoRes.json();
    assert(msInfoData.data?.yatraType === 'MANSAROVAR', 'Returned info is for MANSAROVAR');

    // 2. Test Public Registration Validation
    console.log('\n--- 2. Testing Public Registration Input Validation ---');
    const badRegRes = await fetch(`${baseUrl}/api/v1/public/yatra/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primaryName: 'अधूरा पंजीकरण',
        // missing mobile, travelDate, yatraType
      }),
    });
    assert(badRegRes.status === 400, 'Incomplete registration request returns HTTP 400 Bad Request');
    const badRegData = await badRegRes.json();
    assert(badRegData.success === false, 'Bad registration response has success: false');

    // 3. Test Successful Public Registration with dynamic future date
    console.log('\n--- 3. Testing Successful Public Registration ---');
    const testDevoteeMobile = '9826088899';
    const futureDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    const regPayload = {
      yatraType: 'RAM_NAVAMI',
      primaryName: 'सुरेश कुमार जादम',
      mobile: testDevoteeMobile,
      village: 'खलघाट',
      city: 'धरमपुरी',
      address: 'नर्मदा तट, खलघाट',
      departureLocation: 'खलघाट मंदिर प्रांगण',
      travelDate: futureDate,
      numberOfTravelers: 2,
      travelers: [
        {
          name: 'सुरेश कुमार जादम',
          age: 44,
          gender: 'male',
          mobile: testDevoteeMobile,
          idType: 'aadhaar',
          idLastFourDigits: '9900',
        },
        {
          name: 'गीता जादम',
          age: 40,
          gender: 'female',
          idType: 'aadhaar',
          idLastFourDigits: '1122',
        },
      ],
    };

    const goodRegRes = await fetch(`${baseUrl}/api/v1/public/yatra/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const goodRegData = await goodRegRes.json();
    if (goodRegRes.status !== 201) {
      console.error('Registration failed body:', goodRegData);
    }
    assert(goodRegRes.status === 201, `Successful registration returns HTTP 201 Created (Got: ${goodRegRes.status})`);
    assert(goodRegData.success === true, 'Success response has success: true');
    const createdRegNo = goodRegData.data?.registrationNumber;
    assert(Boolean(createdRegNo && createdRegNo.startsWith('RNY-')), `Created registration number format is valid (Got: ${createdRegNo})`);

    // 4. Test Public Status Lookup (Strict Dual-Key Requirement)
    console.log('\n--- 4. Testing Public Status Lookup ---');
    // Missing mobile
    const checkNoMobile = await fetch(`${baseUrl}/api/v1/public/yatra/check?registrationNumber=${createdRegNo}`);
    assert(checkNoMobile.status === 400, 'Status check without mobile returns HTTP 400');

    // Missing registration number
    const checkNoReg = await fetch(`${baseUrl}/api/v1/public/yatra/check?mobile=${testDevoteeMobile}`);
    assert(checkNoReg.status === 400, 'Status check without registration number returns HTTP 400');

    // Mismatched mobile
    const checkWrongMobile = await fetch(
      `${baseUrl}/api/v1/public/yatra/check?registrationNumber=${createdRegNo}&mobile=9826000000`
    );
    assert(checkWrongMobile.status === 404, 'Status check with wrong mobile returns HTTP 404 Not Found');

    // Matching registration number and mobile
    const checkValid = await fetch(
      `${baseUrl}/api/v1/public/yatra/check?registrationNumber=${createdRegNo}&mobile=${testDevoteeMobile}`
    );
    assert(checkValid.status === 200, 'Status check with matching regNo & mobile returns HTTP 200 OK');
    const checkValidData = await checkValid.json();
    assert(checkValidData.success === true, 'Check status response indicates success');
    assert(
      checkValidData.data?.mobileMasked === '98260XXXXX',
      `Mobile is properly masked in HTTP response (Got: ${checkValidData.data?.mobileMasked})`
    );
    assert(checkValidData.data?.notes === undefined, 'Admin notes are strictly excluded from HTTP response');
    assert(checkValidData.data?.bookingStatus === 'pending', 'Booking status is returned');

    // 5. Test Protected Endpoints Security (RBAC Safeguard)
    console.log('\n--- 5. Testing Protected Admin API Security ---');
    const unauthRegs = await fetch(`${baseUrl}/api/v1/yatra/registrations`);
    assert(unauthRegs.status === 401, 'Unauthenticated GET /api/v1/yatra/registrations blocked with HTTP 401');

    const unauthPayments = await fetch(`${baseUrl}/api/v1/yatra/payments`);
    assert(unauthPayments.status === 401, 'Unauthenticated GET /api/v1/yatra/payments blocked with HTTP 401');

    const unauthExport = await fetch(`${baseUrl}/api/v1/yatra/export`);
    assert(unauthExport.status === 401, 'Unauthenticated GET /api/v1/yatra/export blocked with HTTP 401');

    // Clean up created registration
    if (createdRegNo) {
      await YatraRegistration.deleteOne({ registrationNumber: createdRegNo });
    }

    console.log('\n======================================');
    console.log(`Phase 5 HTTP Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ HTTP test suite failed with error:', err);
    server.close();
    process.exit(1);
  }
};

runHttpTests();
