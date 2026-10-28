const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Donation = require('../models/Donation');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Counter = require('../models/Counter');

const seedFinancialData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find or create an admin/system user to associate records with
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        firebaseUid: 'system_seed_admin',
        name: 'मंदिर व्यवस्थापक (Admin)',
        mobile: '9876543210',
        email: 'admin@jadamkuldevi.org',
        role: 'admin',
        isActive: true,
      });
      console.log('Created default admin user for seeding:', adminUser._id);
    } else {
      console.log(`Found existing admin user: ${adminUser.name} (${adminUser._id})`);
    }

    // Check if donations already exist
    const donationCount = await Donation.countDocuments();
    if (donationCount > 0) {
      console.log(`Financial data already exists (${donationCount} donations found). Skipping seeding.`);
      process.exit(0);
    }

    console.log('Seeding Phase 3 financial data...');

    // 1. Seed Donations
    const sampleDonations = [
      {
        donorName: 'रमेशजी जादम (Ramesh Jadam)',
        village: 'खलघाट (Khalghat)',
        city: 'धार (Dhar)',
        address: 'मेन रोड, खलघाट',
        mobile: '9826012345',
        donationDate: new Date('2026-01-15T10:00:00Z'),
        donationType: 'cash',
        paymentMethod: 'cash',
        amount: 11000,
        totalFinancialValue: 11000,
        receiptNumber: 'JKM-2026-000001',
        verificationStatus: 'verified',
        verifiedAt: new Date('2026-01-15T10:30:00Z'),
        verifiedBy: adminUser._id,
        purpose: 'मंदिर जीर्णोद्धार (Temple Renovation)',
        notes: 'नगद दान कार्यालय में प्राप्त',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        donorName: 'सुरेश कुमार जादम (Suresh Kumar Jadam)',
        village: 'धामनोद (Dhamnod)',
        city: 'धार (Dhar)',
        address: 'पटेल मोहल्ला, धामनोद',
        mobile: '9893054321',
        donationDate: new Date('2026-02-10T14:30:00Z'),
        donationType: 'upi',
        paymentMethod: 'upi',
        amount: 21000,
        totalFinancialValue: 21000,
        transactionId: 'UPI2026021009847192',
        receiptNumber: 'JKM-2026-000002',
        verificationStatus: 'verified',
        verifiedAt: new Date('2026-02-10T15:00:00Z'),
        verifiedBy: adminUser._id,
        purpose: 'अन्नक्षेत्र सेवा (Annakshetra Prasad)',
        notes: 'फोनपे द्वारा प्राप्त',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        donorName: 'कैलाशजी जादम (Kailash Jadam)',
        village: 'महेश्वर (Maheshwar)',
        city: 'खरगोन (Khargone)',
        address: 'नर्मदा तट, महेश्वर',
        mobile: '9425098765',
        donationDate: new Date('2026-02-20T11:00:00Z'),
        donationType: 'item',
        paymentMethod: 'other',
        amount: 0,
        itemName: 'अल्ट्राटेक सीमेंट (Ultratech Cement)',
        itemQuantity: 50,
        itemUnit: 'बोरी (Bags)',
        itemPrice: 380,
        itemTotalValue: 19000,
        totalFinancialValue: 19000,
        receiptNumber: 'JKM-2026-000003',
        verificationStatus: 'verified',
        verifiedAt: new Date('2026-02-20T12:00:00Z'),
        verifiedBy: adminUser._id,
        purpose: 'सभागृह निर्माण (Community Hall Construction)',
        notes: 'सीमेंट बोरियां मंदिर परिसर में प्राप्त हुईं',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        donorName: 'दिलीप जादम (Dilip Jadam)',
        village: 'बड़वाह (Barwaha)',
        city: 'खरगोन (Khargone)',
        address: 'स्टेशन रोड, बड़वाह',
        mobile: '9754011223',
        donationDate: new Date('2026-03-05T09:15:00Z'),
        donationType: 'mixed',
        paymentMethod: 'cash',
        amount: 5000,
        itemName: 'शुद्ध मूंगफली तेल (Groundnut Oil)',
        itemQuantity: 10,
        itemUnit: 'डब्बे (Tins)',
        itemPrice: 1500,
        itemTotalValue: 15000,
        totalFinancialValue: 20000,
        receiptNumber: 'JKM-2026-000004',
        verificationStatus: 'verified',
        verifiedAt: new Date('2026-03-05T10:00:00Z'),
        verifiedBy: adminUser._id,
        purpose: 'महाप्रसाद भंडारा (Maha Prasad Bhandara)',
        notes: '₹5,000 नगद + 10 डब्बे तेल',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        donorName: 'राजेंद्र जादम (Rajendra Jadam)',
        village: 'इंदौर (Indore)',
        city: 'इंदौर (Indore)',
        address: 'विजयनगर, इंदौर',
        mobile: '9111077889',
        donationDate: new Date('2026-03-18T16:45:00Z'),
        donationType: 'bank_transfer',
        paymentMethod: 'bank_transfer',
        amount: 51000,
        totalFinancialValue: 51000,
        transactionId: 'NEFT20260318991283',
        verificationStatus: 'pending',
        purpose: 'मुख्य मंदिर शिखर निर्माण (Temple Spire Construction)',
        notes: 'बैंक पासबुक में एंट्री की पुष्टि बाकी है',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        donorName: 'अज्ञात प्रविष्टि (Duplicate Entry)',
        village: 'खलघाट',
        city: 'धार',
        mobile: '9826000000',
        donationDate: new Date('2026-03-19T12:00:00Z'),
        donationType: 'cash',
        paymentMethod: 'cash',
        amount: 1100,
        totalFinancialValue: 1100,
        verificationStatus: 'rejected',
        rejectionReason: 'गलत रसीद प्रविष्टि / दोहरी प्रविष्टि (Duplicate record)',
        verifiedAt: new Date('2026-03-19T12:30:00Z'),
        verifiedBy: adminUser._id,
        notes: 'रद्द की गई प्रविष्टि',
        isPublic: false,
        createdBy: adminUser._id,
      },
    ];

    await Donation.insertMany(sampleDonations);
    console.log(`✅ Seeded ${sampleDonations.length} sample donations`);

    // Update Counter for receipts
    await Counter.findByIdAndUpdate(
      'receipt_2026',
      { seq: 4 },
      { upsert: true }
    );
    console.log('✅ Synchronized receipt sequence counter to 4');

    // 2. Seed Other Income
    const sampleIncome = [
      {
        title: 'महाआरती थाली एवं छत्र बोली (Maha Aarti Boli)',
        description: 'वार्षिक उत्सव में महाआरती थाली एवं छत्र सेवा हेतु प्राप्त सहयोग राशि',
        amount: 25000,
        date: new Date('2026-01-20T19:00:00Z'),
        category: 'event_income',
        paymentMethod: 'cash',
        referenceNumber: 'BOLI-2026-01',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        title: 'धर्मशाला एवं सामुदायिक भवन सेवा सहयोग (Hall Seva)',
        description: 'परिवार वैवाहिक कार्यक्रम हेतु धर्मशाला व्यवस्था शुल्क',
        amount: 15000,
        date: new Date('2026-02-14T11:00:00Z'),
        category: 'rental',
        paymentMethod: 'upi',
        referenceNumber: 'UPIHALL20260214',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        title: 'नवरात्रि अन्नक्षेत्र विशेष प्रायोजन (Annakshetra Sponsorship)',
        description: 'भक्त मंडल द्वारा अन्नक्षेत्र भोजन प्रसादी का विशेष प्रायोजन',
        amount: 35000,
        date: new Date('2026-03-01T10:00:00Z'),
        category: 'sponsorship',
        paymentMethod: 'bank_transfer',
        referenceNumber: 'IMPS3030112938',
        isPublic: true,
        createdBy: adminUser._id,
      },
    ];

    await Income.insertMany(sampleIncome);
    console.log(`✅ Seeded ${sampleIncome.length} sample income records`);

    // 3. Seed Expenses
    const sampleExpenses = [
      {
        title: 'विद्युत देयक भुगतान (Electricity Bill Payment)',
        description: 'मंदिर परिसर एवं धर्मशाला माह जनवरी 2026 का विद्युत बिल',
        amount: 8400,
        date: new Date('2026-01-25T11:00:00Z'),
        category: 'electricity',
        vendor: 'म.प्र. पश्चिम क्षेत्र विद्युत वितरण कंपनी',
        paymentMethod: 'bank_transfer',
        referenceNumber: 'EBILL-JAN-2026',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        title: 'नवरात्रि उत्सव मंडप एवं साउंड व्यवस्था (Tent & Sound)',
        description: 'वार्षिक उत्सव हेतु टेंट, मंच एवं साउंड सिस्टम व्यवस्था',
        amount: 18500,
        date: new Date('2026-02-05T17:00:00Z'),
        category: 'event',
        vendor: 'श्री गणेश टेंट हाउस, खलघाट',
        paymentMethod: 'cash',
        referenceNumber: 'TENT-INV-104',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        title: 'शिखर मरम्मत एवं नक्काशी पत्थर (Stone Masonry Work)',
        description: 'मंदिर शिखर के नक्काशीदार पत्थर एवं मरम्मत कार्य',
        amount: 28000,
        date: new Date('2026-02-22T14:00:00Z'),
        category: 'construction',
        vendor: 'राजपूत स्टोन आर्ट्स, महेश्वर',
        paymentMethod: 'bank_transfer',
        referenceNumber: 'NEFT-STONE-882',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        title: 'परिसर स्वच्छता एवं कीटनाशक सामग्री (Cleaning Supplies)',
        description: 'मंदिर परिसर की नियमित सफाई हेतु फिनाइल, झाड़ू एवं सामग्री',
        amount: 4500,
        date: new Date('2026-03-02T10:30:00Z'),
        category: 'cleaning',
        vendor: 'मां नर्मदा ट्रेडर्स, खलघाट',
        paymentMethod: 'cash',
        referenceNumber: 'CASH-CLEAN-03',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        title: 'पुजारी एवं सेवक मानदेय (Pujari & Staff Honorarium)',
        description: 'माह फरवरी 2026 हेतु मुख्य पुजारी एवं मंदिर सेवक दक्षिणा',
        amount: 22000,
        date: new Date('2026-03-07T12:00:00Z'),
        category: 'salary',
        vendor: 'मंदिर पुजारी समिति',
        paymentMethod: 'cash',
        referenceNumber: 'SAL-FEB-2026',
        isPublic: true,
        createdBy: adminUser._id,
      },
    ];

    await Expense.insertMany(sampleExpenses);
    console.log(`✅ Seeded ${sampleExpenses.length} sample expenses`);

    console.log('🎉 Financial data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding financial data:', error);
    process.exit(1);
  }
};

seedFinancialData();
