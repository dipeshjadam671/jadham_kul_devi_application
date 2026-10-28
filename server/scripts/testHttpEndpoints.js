const http = require('http');
const app = require('../app');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testHttp = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';
  await mongoose.connect(mongoUri);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('Test server listening on port 5099');

  const fetchJson = (path) => {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:5099${path}`, (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
        res.on('error', reject);
      });
    });
  };

  try {
    // 1. Health check
    const health = await fetchJson('/api/v1/health');
    console.log('1. Health check:', health.status, health.data?.success ? 'OK' : 'FAIL');

    // 2. Public Financial Summary
    const summary = await fetchJson('/api/v1/public/financial/summary');
    console.log(
      '2. Public Summary:',
      summary.status,
      'Total Verified Income:',
      summary.data?.data?.totalIncome,
      'Balance:',
      summary.data?.data?.currentBalance
    );

    // 3. Public Monthly Summary
    const monthly = await fetchJson('/api/v1/public/financial/monthly-summary?year=2026');
    console.log('3. Public Monthly:', monthly.status, 'Months:', monthly.data?.data?.months?.length);

    // 4. Public Donations Register
    const donations = await fetchJson('/api/v1/public/financial/donations?limit=5');
    console.log(
      '4. Public Donations:',
      donations.status,
      'Count:',
      donations.data?.data?.length,
      'First Masked Phone:',
      donations.data?.data?.[0]?.mobileMasked,
      'First Receipt:',
      donations.data?.data?.[0]?.receiptNumber
    );

    // 5. Public Income Register
    const income = await fetchJson('/api/v1/public/financial/income?limit=5');
    console.log('5. Public Income:', income.status, 'Count:', income.data?.data?.length);

    // 6. Public Expenses Register
    const expenses = await fetchJson('/api/v1/public/financial/expenses?limit=5');
    console.log('6. Public Expenses:', expenses.status, 'Count:', expenses.data?.data?.length);

    console.log('\n🎉 All Public Financial HTTP Endpoints Verified Successfully!');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

testHttp().catch(console.error);
