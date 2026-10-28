/**
 * Phase 6 Seed Data Script
 * DEVELOPMENT / DEMO ONLY
 *
 * Populates sample Mata Ji Puja records, confidential Restricted Person records,
 * and pre-provisioned committee members.
 *
 * Usage: node server/scripts/seedPhase6Data.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const PujaRecord = require('../models/PujaRecord');
const RestrictedPerson = require('../models/RestrictedPerson');
const { generatePujaRecordNumber } = require('../services/pujaRecordNumberService');
const { generateRestrictedRecordNumber } = require('../services/restrictedRecordNumberService');
const PERMISSIONS = require('../constants/permissions');

const seedPhase6Data = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';
    await mongoose.connect(mongoUri);
    console.log('🌱 Connected to MongoDB for Phase 6 Seeding...');

    // Find an admin to use as createdBy
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'मुख्य प्रशासक (Admin)',
        mobile: '+919876543210',
        role: 'admin',
        status: 'active',
        isActive: true,
        permissions: Object.values(PERMISSIONS),
      });
      console.log('👑 Created default admin user for seeding.');
    }

    console.log('\n--- 1. Seeding Committee Members (Pre-provisioned) ---');
    const committeeUsers = [
      {
        name: 'सुरेश पटेल (पूजा समिति)',
        mobile: '+919800000001',
        role: 'committee',
        status: 'active',
        isActive: true,
        permissions: [
          PERMISSIONS.PUJA_VIEW,
          PERMISSIONS.PUJA_CREATE,
          PERMISSIONS.PUJA_UPDATE,
          PERMISSIONS.PUJA_REPORT_VIEW,
          PERMISSIONS.PUJA_EXPORT,
        ],
        createdBy: admin._id,
      },
      {
        name: 'विक्रम राठौर (सुरक्षा एवं व्यवस्था)',
        mobile: '+919800000002',
        role: 'committee',
        status: 'active',
        isActive: true,
        permissions: [
          PERMISSIONS.PUJA_VIEW,
          PERMISSIONS.RESTRICTED_VIEW,
          PERMISSIONS.RESTRICTED_CREATE,
          PERMISSIONS.RESTRICTED_UPDATE,
          PERMISSIONS.RESTRICTED_REVOKE,
          PERMISSIONS.RESTRICTED_EXPORT,
        ],
        createdBy: admin._id,
      },
    ];

    for (const cUser of committeeUsers) {
      const existing = await User.findOne({ mobile: cUser.mobile });
      if (!existing) {
        await User.create(cUser);
        console.log(`  + Created committee user: ${cUser.name} (${cUser.mobile})`);
      } else {
        console.log(`  ~ Committee user already exists: ${cUser.name}`);
      }
    }

    console.log('\n--- 2. Seeding Sample Puja Records ---');
    const samplePujas = [
      {
        year: 2026,
        pujaDate: new Date('2026-03-25'),
        pujaType: 'annual_puja',
        familyName: 'जादम परिवार (बड़ा खेड़ा)',
        primaryPersonName: 'राजेश जादम',
        mobile: '9826011111',
        village: 'खलघाट',
        city: 'धार',
        address: 'मेन रोड, खलघाट',
        numberOfPeople: 12,
        numberOfCouples: 4,
        couples: [
          { husbandName: 'राजेश जादम', wifeName: 'सुनीता जादम', village: 'खलघाट', mobile: '9826011111', notes: 'मुख्य यजमान' },
          { husbandName: 'दिनेश जादम', wifeName: 'अनिता जादम', village: 'खलघाट', mobile: '9826011112', notes: '' },
          { husbandName: 'कमल जादम', wifeName: 'पूजा जादम', village: 'इंदौर', mobile: '9826011113', notes: '' },
          { husbandName: 'संजय जादम', wifeName: 'ममता जादम', village: 'धामनोद', mobile: '9826011114', notes: '' },
        ],
        jamalCount: 2,
        jamalDetails: [
          { name: 'राजेश जादम', village: 'खलघाट', date: new Date('2026-03-25'), quantity: 1, notes: 'वार्षिक जमाल निकासी' },
          { name: 'दिनेश जादम', village: 'खलघाट', date: new Date('2026-03-25'), quantity: 1, notes: 'वार्षिक जमाल निकासी' },
        ],
        jamalNotes: 'सकुशल संपन्न, कुल 2 जमाल निकासी',
        pujaStatus: 'completed',
        paymentStatus: 'paid',
        amount: 2100,
        paymentMethod: 'cash',
        notes: 'वार्षिक कुलदेवी हवन एवं पूजा पूर्ण विधि-विधान से संपन्न।',
        isPublic: true,
      },
      {
        year: 2026,
        pujaDate: new Date('2026-04-10'),
        pujaType: 'navratri_puja',
        familyName: 'सोलंकी परिवार',
        primaryPersonName: 'मुकेश सोलंकी',
        mobile: '9826022222',
        village: 'धामनोद',
        city: 'धार',
        address: 'वार्ड क्र. 4, धामनोद',
        numberOfPeople: 6,
        numberOfCouples: 2,
        couples: [
          { husbandName: 'मुकेश सोलंकी', wifeName: 'रेखा सोलंकी', village: 'धामनोद', mobile: '9826022222', notes: '' },
          { husbandName: 'अशोक सोलंकी', wifeName: 'गीता सोलंकी', village: 'धामनोद', mobile: '9826022223', notes: '' },
        ],
        jamalCount: 1,
        jamalDetails: [
          { name: 'मुकेश सोलंकी', village: 'धामनोद', date: new Date('2026-04-10'), quantity: 1, notes: 'नवरात्रि निकासी' },
        ],
        jamalNotes: 'नवरात्रि विशेष',
        pujaStatus: 'registered',
        paymentStatus: 'pending',
        amount: 1100,
        paymentMethod: 'upi',
        notes: 'चैत्र नवरात्रि अष्टमी विशेष पूजा संकल्प।',
        isPublic: true,
      },
      {
        year: 2026,
        pujaDate: new Date('2026-05-05'),
        pujaType: 'ashtami_puja',
        familyName: 'जादम',
        primaryPersonName: 'संजय जादम',
        mobile: '9826033333',
        village: 'महेश्वर',
        city: 'खरगोन',
        address: 'नर्मदा तट, महेश्वर',
        numberOfPeople: 4,
        numberOfCouples: 1,
        couples: [
          { husbandName: 'संजय जादम', wifeName: 'कविता जादम', village: 'महेश्वर', mobile: '9826033333', notes: '' },
        ],
        jamalCount: 0,
        jamalDetails: [],
        jamalNotes: '',
        pujaStatus: 'scheduled',
        paymentStatus: 'not_required',
        amount: 0,
        paymentMethod: 'none',
        notes: 'मासिक दुर्गाष्टमी विशेष अर्चन।',
        isPublic: false,
      },
      {
        year: 2025,
        pujaDate: new Date('2025-10-15'),
        pujaType: 'annual_puja',
        familyName: 'जादम (मध्य क्षेत्र)',
        primaryPersonName: 'दिनेश जादम',
        mobile: '9826044444',
        village: 'खलघाट',
        city: 'धार',
        address: 'किला रोड, खलघाट',
        numberOfPeople: 20,
        numberOfCouples: 8,
        couples: [],
        jamalCount: 5,
        jamalDetails: [],
        jamalNotes: '2025 वार्षिक महापूजा',
        pujaStatus: 'completed',
        paymentStatus: 'paid',
        amount: 5100,
        paymentMethod: 'bank_transfer',
        notes: '2025 की वार्षिक कुलदेवी पूजा सफलतापूर्वक आयोजित।',
        isPublic: true,
      },
      {
        year: 2025,
        pujaDate: new Date('2025-08-20'),
        pujaType: 'special_puja',
        familyName: 'जादम',
        primaryPersonName: 'कमलेश जादम',
        mobile: '9826055555',
        village: 'मंडलेश्वर',
        city: 'खरगोन',
        address: 'मेन मार्केट',
        numberOfPeople: 5,
        numberOfCouples: 1,
        couples: [],
        jamalCount: 1,
        jamalDetails: [],
        jamalNotes: '',
        pujaStatus: 'completed',
        paymentStatus: 'paid',
        amount: 1500,
        paymentMethod: 'cash',
        notes: 'मनौती पूर्ण होने पर विशेष पूजन।',
        isPublic: false,
      },
    ];

    for (const pData of samplePujas) {
      const existing = await PujaRecord.findOne({
        year: pData.year,
        primaryPersonName: pData.primaryPersonName,
        pujaDate: pData.pujaDate,
      });

      if (!existing) {
        const recordNumber = await generatePujaRecordNumber(pData.year);
        await PujaRecord.create({
          ...pData,
          recordNumber,
          createdBy: admin._id,
        });
        console.log(`  + Seeded Puja record [${recordNumber}] for ${pData.primaryPersonName} (${pData.year})`);
      } else {
        console.log(`  ~ Puja record already exists for ${pData.primaryPersonName} (${pData.year})`);
      }
    }

    console.log('\n--- 3. Seeding Confidential Restricted Records (DEV ONLY) ---');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);

    const sampleRestricted = [
      {
        name: 'रमेश शर्मा (डेमो)',
        mobile: '+919999900001',
        village: 'धामनोद',
        city: 'धार',
        address: 'अज्ञात',
        reason: 'अभद्र व्यवहार एवं मंदिर परिसर में शांति भंग',
        description: 'वार्षिक मेले के दौरान सुरक्षा नियमों का उल्लंघन एवं वाद-विवाद उत्पन्न करने का प्रयास।',
        restrictionType: 'temporary_restriction',
        status: 'active',
        startDate: new Date(),
        endDate: futureDate,
        notes: 'कार्यकारिणी बैठक प्रस्ताव क्र. 14 के तहत 60 दिन हेतु प्रतिबंधित।',
      },
      {
        name: 'अमित कुमार (डेमो - कालबाधित)',
        mobile: '+919999900002',
        village: 'इंदौर',
        city: 'इंदौर',
        address: 'अज्ञात',
        reason: 'अनाधिकृत चंदा वसूली का प्रयास',
        description: 'फर्जी रसीद कट्टे के माध्यम से भक्तों से चंदा एकत्रित करने का संदिग्ध प्रयास।',
        restrictionType: 'temporary_restriction',
        status: 'active',
        startDate: new Date('2025-01-01'),
        endDate: pastDate, // in the past to verify expired check
        notes: 'अवधि समाप्त हो चुकी है, स्वतः निष्प्रभावी।',
      },
    ];

    for (const rData of sampleRestricted) {
      const existing = await RestrictedPerson.findOne({ name: rData.name });
      if (!existing) {
        const recordNumber = await generateRestrictedRecordNumber();
        await RestrictedPerson.create({
          ...rData,
          recordNumber,
          createdBy: admin._id,
        });
        console.log(`  + Seeded Restricted record [${recordNumber}] for ${rData.name} (100% PRIVATE)`);
      } else {
        console.log(`  ~ Restricted record already exists for ${rData.name}`);
      }
    }

    console.log('\n✅ Phase 6 Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 6 Seed Error:', err);
    process.exit(1);
  }
};

seedPhase6Data();
