const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('../app');

const runPhase6HttpTests = async () => {
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
    // 1. Public Puja Summary Endpoints
    console.log('--- 1. Testing Public Puja Summary Endpoints ---');
    const pubRes = await fetch(`${baseUrl}/api/v1/public/puja/summary`);
    assert(pubRes.status === 200, 'GET /api/v1/public/puja/summary returns HTTP 200 without auth');
    const pubData = await pubRes.json();
    assert(pubData.success === true, 'Public summary response indicates success: true');
    assert(Array.isArray(pubData.data), 'Public summary returns an array of yearly aggregates');

    const pubYearRes = await fetch(`${baseUrl}/api/v1/public/puja/summary?year=2026`);
    assert(pubYearRes.status === 200, 'GET /api/v1/public/puja/summary?year=2026 returns HTTP 200');
    const pubYearData = await pubYearRes.json();
    if (pubYearData.data && pubYearData.data.length > 0) {
      const yearStat = pubYearData.data[0];
      assert(yearStat.totalRecords !== undefined, 'Contains totalRecords count');
      assert(yearStat.totalParticipants !== undefined, 'Contains totalParticipants count');
      assert(yearStat.totalCouples !== undefined, 'Contains totalCouples count');
      assert(yearStat.mobile === undefined, 'ZERO mobile numbers in public payload');
      assert(yearStat.primaryPersonName === undefined, 'ZERO devotee names in public payload');
      assert(yearStat.address === undefined, 'ZERO addresses in public payload');
      assert(yearStat.notes === undefined, 'ZERO notes in public payload');
    }

    // 2. Protected Puja Endpoints (Unauthenticated Access Blocks)
    console.log('\n--- 2. Testing Protected Puja API Security ---');
    const unauthPujaList = await fetch(`${baseUrl}/api/v1/puja/records`);
    assert(unauthPujaList.status === 401, 'Unauthenticated GET /api/v1/puja/records blocked with HTTP 401');

    const unauthPujaStats = await fetch(`${baseUrl}/api/v1/puja/records/stats`);
    assert(unauthPujaStats.status === 401, 'Unauthenticated GET /api/v1/puja/records/stats blocked with HTTP 401');

    const unauthPujaYearly = await fetch(`${baseUrl}/api/v1/puja/yearly-summary`);
    assert(unauthPujaYearly.status === 401, 'Unauthenticated GET /api/v1/puja/yearly-summary blocked with HTTP 401');

    const unauthPujaMonthly = await fetch(`${baseUrl}/api/v1/puja/monthly-summary?year=2026`);
    assert(unauthPujaMonthly.status === 401, 'Unauthenticated GET /api/v1/puja/monthly-summary blocked with HTTP 401');

    const unauthPujaExport = await fetch(`${baseUrl}/api/v1/puja/export`);
    assert(unauthPujaExport.status === 401, 'Unauthenticated GET /api/v1/puja/export blocked with HTTP 401');

    const unauthPujaPost = await fetch(`${baseUrl}/api/v1/puja/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 2026, primaryPersonName: 'Test' }),
    });
    assert(unauthPujaPost.status === 401, 'Unauthenticated POST /api/v1/puja/records blocked with HTTP 401');

    // 3. Confidential Restricted Records (100% PRIVATE) Security
    console.log('\n--- 3. Testing Restricted Person API Security (100% PRIVATE) ---');
    const unauthRestrictedList = await fetch(`${baseUrl}/api/v1/restricted-persons`);
    assert(unauthRestrictedList.status === 401, 'Unauthenticated GET /api/v1/restricted-persons blocked with HTTP 401');

    const unauthRestrictedCounts = await fetch(`${baseUrl}/api/v1/restricted-persons/counts`);
    assert(unauthRestrictedCounts.status === 401, 'Unauthenticated GET /api/v1/restricted-persons/counts blocked with HTTP 401');

    const unauthRestrictedSearch = await fetch(`${baseUrl}/api/v1/restricted-persons/search?search=test`);
    assert(unauthRestrictedSearch.status === 401, 'Unauthenticated GET /api/v1/restricted-persons/search blocked with HTTP 401');

    const unauthRestrictedExport = await fetch(`${baseUrl}/api/v1/restricted-persons/export`);
    assert(unauthRestrictedExport.status === 401, 'Unauthenticated GET /api/v1/restricted-persons/export blocked with HTTP 401');

    const unauthRestrictedPost = await fetch(`${baseUrl}/api/v1/restricted-persons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', reason: 'Security' }),
    });
    assert(unauthRestrictedPost.status === 401, 'Unauthenticated POST /api/v1/restricted-persons blocked with HTTP 401');

    // 4. User & Committee Management Security
    console.log('\n--- 4. Testing User Management API Security ---');
    const unauthUsers = await fetch(`${baseUrl}/api/v1/users`);
    assert(unauthUsers.status === 401, 'Unauthenticated GET /api/v1/users blocked with HTTP 401');

    const unauthCommitteePost = await fetch(`${baseUrl}/api/v1/users/committee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', mobile: '9999999999' }),
    });
    assert(unauthCommitteePost.status === 401, 'Unauthenticated POST /api/v1/users/committee blocked with HTTP 401');

    const unauthActivate = await fetch(`${baseUrl}/api/v1/users/507f1f77bcf86cd799439011/activate`, {
      method: 'PATCH',
    });
    assert(unauthActivate.status === 401, 'Unauthenticated PATCH /api/v1/users/:id/activate blocked with HTTP 401');

    const unauthPermissions = await fetch(`${baseUrl}/api/v1/users/507f1f77bcf86cd799439011/permissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: ['PUJA_VIEW'] }),
    });
    assert(unauthPermissions.status === 401, 'Unauthenticated PATCH /api/v1/users/:id/permissions blocked with HTTP 401');

    // 5. Malformed Token Tests
    console.log('\n--- 5. Testing Malformed Token Handling ---');
    const badHeaderRes = await fetch(`${baseUrl}/api/v1/puja/records`, {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    assert(badHeaderRes.status === 401, 'Non-Bearer Authorization header returns HTTP 401');

    const emptyBearerRes = await fetch(`${baseUrl}/api/v1/puja/records`, {
      headers: { Authorization: 'Bearer ' },
    });
    assert(emptyBearerRes.status === 401, 'Empty Bearer token returns HTTP 401');

    const invalidTokenRes = await fetch(`${baseUrl}/api/v1/puja/records`, {
      headers: { Authorization: 'Bearer invalid_mock_token_payload' },
    });
    assert(invalidTokenRes.status === 401, 'Invalid Firebase ID token returns HTTP 401');

    console.log('\n======================================');
    console.log(`Phase 6 HTTP API Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Phase 6 HTTP test suite failed with error:', err);
    server.close();
    process.exit(1);
  }
};

runPhase6HttpTests();
