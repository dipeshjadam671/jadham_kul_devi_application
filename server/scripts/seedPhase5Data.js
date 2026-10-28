const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const YatraRegistration = require('../models/YatraRegistration');
const YatraPayment = require('../models/YatraPayment');
const YatraInfo = require('../models/YatraInfo');
const { generateYatraRegistrationNumber } = require('../services/yatraRegistrationNumberService');

const seedPhase5Data = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // 1. Get or create Admin user
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
      console.log('Created admin user for seeding:', adminUser._id);
    }

    // 2. Seed YatraInfo
    console.log('Seeding Yatra Information & Instructions...');
    await YatraInfo.deleteMany({});

    await YatraInfo.create({
      yatraType: 'RAM_NAVAMI',
      title: 'श्री राम नवमी पावन दर्शन एवं पदयात्रा - २०२६',
      description: 'जादम परिवार कुलदेवी मंदिर, खलघाट के तत्वावधान में आयोजित भव्य राम नवमी दर्शन एवं पदयात्रा महोत्सव।',
      guidelines: `१. सभी श्रद्धालु यात्रा के दौरान सात्विक आचरण बनाए रखें एवं मंदिर समिति के निर्देशों का पालन करें।
२. यात्रा में हल्का सामान, आवश्यक व्यक्तिगत दवाइयाँ और पहचान पत्र (मूल प्रति) साथ रखें।
३. किसी भी आपात स्थिति में तुरंत यात्रा प्रभारी अथवा नजदीकी स्वयंसेवक से संपर्क करें।
४. प्लास्टिक का कम से कम उपयोग करें एवं स्वच्छता का पूर्ण ध्यान रखें।
५. यात्रा के दौरान अनुशासन और समय की पाबंदी अनिवार्य है।`,
      departureGuidelines: `१. प्रस्थान स्थल: श्री जादम परिवार कुलदेवी मंदिर प्रांगण, खलघाट।
२. रिपोर्टिंग समय: प्रस्थान दिवस को प्रातः ०६:०० बजे।
३. बस / वाहन आवंटन टोकन सत्यापन के पश्चात प्रस्थान से १ घंटा पूर्व किया जाएगा।
४. प्रस्थान से पूर्व मंदिर प्रांगण में कुलदेवी माताजी की विशेष मंगल आरती एवं ध्वजारोहण होगा।`,
      contactPersons: [
        { name: 'श्री रमेशचंद्र जादम', phone: '9826012345', designation: 'यात्रा प्रमुख' },
        { name: 'श्री कैलाश जादम', phone: '9425098765', designation: 'व्यवस्थापक' },
      ],
      departureLocation: 'श्री जादम परिवार कुलदेवी मंदिर प्रांगण, खलघाट',
      destination: 'श्री राम जन्मभूमि तीर्थ क्षेत्र, अयोध्या धाम',
      isRegistrationOpen: true,
      registrationStartDate: new Date('2026-01-01'),
      registrationEndDate: new Date('2026-05-30'),
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-04-22'),
      feePerPerson: 3500,
      updatedBy: adminUser._id,
    });

    await YatraInfo.create({
      yatraType: 'MANSAROVAR',
      title: 'पवित्र कैलाश मानसरोवर दर्शन एवं परिक्रमा यात्रा - २०२६',
      description: 'जादम परिवार कुलदेवी मंदिर समिति द्वारा प्रबंधित पावन मानसरोवर झील एवं देवाधिदेव महादेव कैलाश परिक्रमा यात्रा।',
      guidelines: `१. वैध पासपोर्ट (न्यूनतम ६ माह की वैधता) एवं आवश्यक वीज़ा दस्तावेज़ अनिवार्य हैं।
२. अधिक ऊंचाई एवं कठिन मौसम के कारण स्वास्थ्य परीक्षण (Medical Fitness Certificate) आवश्यक है।
३. आवश्यक गर्म ऊनी वस्त्र, थर्मल इनर, वॉटरप्रूफ जूते और व्यक्तिगत प्राथमिक चिकित्सा किट अनिवार्य है।
४. यात्रा के दौरान विदेशी मुद्रा एवं आवश्यक नियम-शर्तों का पालन करें।
५. समूह नेता एवं अधिकृत टूर गाइड के दिशा-निर्देशों का सदैव पालन करें।`,
      departureGuidelines: `१. एकत्र होने का मुख्य केंद्र: नई दिल्ली अंतर्राष्ट्रीय हवाई अड्डा / काठमांडू।
२. प्रथम समूह ब्रीफिंग एवं मेडिकल चेकअप प्रस्थान से एक दिन पूर्व काठमांडू में होगा।
३. सामान का अधिकतम वजन एयरलाइंस एवं पोर्टर के नियमों के अनुसार सीमित रखा जाए।`,
      contactPersons: [
        { name: 'श्री सुरेश जादम', phone: '9826055555', designation: 'कैलाश यात्रा संयोजक' },
        { name: 'श्री महेंद्र जादम', phone: '9826077777', designation: 'दस्तावेज़ समन्वयक' },
      ],
      departureLocation: 'काठमांडू / नई दिल्ली',
      destination: 'कैलाश पर्वत एवं मानसरोवर झील (तिब्बत)',
      isRegistrationOpen: true,
      registrationStartDate: new Date('2026-01-01'),
      registrationEndDate: new Date('2026-06-30'),
      startDate: new Date('2026-07-10'),
      endDate: new Date('2026-07-25'),
      feePerPerson: 185000,
      updatedBy: adminUser._id,
    });

    console.log('✅ YatraInfo seeded for RAM_NAVAMI and MANSAROVAR');

    // 3. Clear existing registrations and payments
    await YatraRegistration.deleteMany({});
    await YatraPayment.deleteMany({});

    // 4. Create sample registrations
    console.log('Seeding Sample Registrations & Payments...');

    // Registration 1: Ram Navami - Single Devotee, Confirmed, Paid
    const regNum1 = await generateYatraRegistrationNumber('RAM_NAVAMI');
    const reg1 = await YatraRegistration.create({
      registrationNumber: regNum1,
      yatraType: 'RAM_NAVAMI',
      year: 2026,
      primaryName: 'मोहनलाल जादम',
      mobile: '9826011111',
      village: 'खलघाट',
      city: 'खलघाट',
      address: '१२, नर्मदा मार्ग, खलघाट',
      travelDate: new Date('2026-04-15'),
      numberOfTravelers: 1,
      travelers: [
        {
          name: 'मोहनलाल जादम',
          age: 48,
          gender: 'male',
          mobile: '9826011111',
          village: 'खलघाट',
          city: 'खलघाट',
          idType: 'aadhaar',
          idLastFourDigits: '4589',
          notes: 'परिवार प्रमुख',
        },
      ],
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentAmount: 3500,
      paymentMethod: 'cash',
      transactionId: 'CASH-REC-01',
      departureLocation: 'श्री जादम परिवार कुलदेवी मंदिर प्रांगण, खलघाट',
      notes: 'वरिष्ठ समाज बंधु - अग्रिम पंक्ति सीट वरीयता',
      createdBy: adminUser._id,
    });

    await YatraPayment.create({
      registrationId: reg1._id,
      amount: 3500,
      paymentMethod: 'cash',
      transactionId: 'CASH-REC-01',
      notes: 'पूर्ण भुगतान नकद प्राप्त हुआ',
      receivedBy: adminUser._id,
      status: 'received',
    });

    // Registration 2: Ram Navami - Family of 4, Pending, Partial Payment
    const regNum2 = await generateYatraRegistrationNumber('RAM_NAVAMI');
    const reg2 = await YatraRegistration.create({
      registrationNumber: regNum2,
      yatraType: 'RAM_NAVAMI',
      year: 2026,
      primaryName: 'राजेश जादम',
      mobile: '9826033333',
      village: '',
      city: 'इंदौर',
      address: '४५, तिलक पथ, इंदौर',
      travelDate: new Date('2026-04-15'),
      numberOfTravelers: 4,
      travelers: [
        {
          name: 'राजेश जादम',
          age: 42,
          gender: 'male',
          mobile: '9826033333',
          city: 'इंदौर',
          idType: 'voter_id',
          idLastFourDigits: '7821',
        },
        {
          name: 'सुनीता जादम',
          age: 38,
          gender: 'female',
          city: 'इंदौर',
          idType: 'aadhaar',
          idLastFourDigits: '1245',
        },
        {
          name: 'आयुष जादम',
          age: 16,
          gender: 'male',
          city: 'इंदौर',
          idType: 'other',
          idLastFourDigits: '9982',
        },
        {
          name: 'रिया जादम',
          age: 12,
          gender: 'female',
          city: 'इंदौर',
          idType: 'none',
        },
      ],
      bookingStatus: 'pending',
      paymentStatus: 'partial',
      paymentAmount: 5000,
      paymentMethod: 'upi',
      transactionId: 'UPI-REF-998822',
      departureLocation: 'इंदौर बायपास',
      notes: 'शेष राशि ₹9,000 यात्रा से १ सप्ताह पूर्व देय होगी',
      createdBy: adminUser._id,
    });

    await YatraPayment.create({
      registrationId: reg2._id,
      amount: 5000,
      paymentMethod: 'upi',
      transactionId: 'UPI-REF-998822',
      notes: 'ऑनलाइन अग्रिम राशि प्राप्त',
      receivedBy: adminUser._id,
      status: 'received',
    });

    // Registration 3: Mansarovar Yatra - 2 Devotees, Confirmed, Partial Payment with Organizer
    const regNum3 = await generateYatraRegistrationNumber('MANSAROVAR');
    const reg3 = await YatraRegistration.create({
      registrationNumber: regNum3,
      yatraType: 'MANSAROVAR',
      year: 2026,
      primaryName: 'दिलीप जादम',
      mobile: '9826044444',
      village: '',
      city: 'उज्जैन',
      address: '७८, पटेल नगर, उज्जैन',
      travelDate: new Date('2026-07-10'),
      numberOfTravelers: 2,
      travelers: [
        {
          name: 'दिलीप जादम',
          age: 52,
          gender: 'male',
          mobile: '9826044444',
          city: 'उज्जैन',
          idType: 'passport',
          idLastFourDigits: '9876',
        },
        {
          name: 'मंजुला जादम',
          age: 49,
          gender: 'female',
          city: 'उज्जैन',
          idType: 'passport',
          idLastFourDigits: '5432',
        },
      ],
      travelOrganizer: 'कैलाश सेवा ट्रस्ट (सह-आयोजक)',
      organizerMobile: '9811122233',
      bookingStatus: 'confirmed',
      paymentStatus: 'partial',
      paymentAmount: 100000,
      paymentMethod: 'bank_transfer',
      transactionId: 'NEFT-AXIS-009988',
      departureLocation: 'काठमांडू एयरपोर्ट',
      notes: 'पासपोर्ट एवं फिटनेस प्रमाण पत्र सत्यापित',
      createdBy: adminUser._id,
    });

    await YatraPayment.create({
      registrationId: reg3._id,
      amount: 100000,
      paymentMethod: 'bank_transfer',
      transactionId: 'NEFT-AXIS-009988',
      notes: 'प्रथम किस्त बैंक ट्रांसफर द्वारा प्राप्त',
      receivedBy: adminUser._id,
      status: 'received',
    });

    // Registration 4: Ram Navami - Completed registration
    const regNum4 = await generateYatraRegistrationNumber('RAM_NAVAMI');
    const reg4 = await YatraRegistration.create({
      registrationNumber: regNum4,
      yatraType: 'RAM_NAVAMI',
      year: 2026,
      primaryName: 'विनोद जादम',
      mobile: '9826055555',
      village: 'मंडलेश्वर',
      city: 'मंडलेश्वर',
      address: '१०, ग्राम मंडलेश्वर, जिला खरगोन',
      travelDate: new Date('2026-04-15'),
      numberOfTravelers: 2,
      travelers: [
        {
          name: 'विनोद जादम',
          age: 40,
          gender: 'male',
          mobile: '9826055555',
          village: 'मंडलेश्वर',
          idType: 'aadhaar',
          idLastFourDigits: '6655',
        },
        {
          name: 'रेखा जादम',
          age: 36,
          gender: 'female',
          village: 'मंडलेश्वर',
          idType: 'aadhaar',
          idLastFourDigits: '1122',
        },
      ],
      bookingStatus: 'completed',
      paymentStatus: 'paid',
      paymentAmount: 7000,
      paymentMethod: 'cash',
      transactionId: 'CASH-04',
      departureLocation: 'खलघाट',
      notes: 'यात्रा पूर्ण - पूर्ण भुगतान सत्यापित',
      createdBy: adminUser._id,
    });

    await YatraPayment.create({
      registrationId: reg4._id,
      amount: 7000,
      paymentMethod: 'cash',
      transactionId: 'CASH-04',
      notes: 'यात्रा पूर्ण - पूर्ण भुगतान सत्यापित',
      receivedBy: adminUser._id,
      status: 'received',
    });

    // Registration 5: Ram Navami - Cancelled
    const regNum5 = await generateYatraRegistrationNumber('RAM_NAVAMI');
    await YatraRegistration.create({
      registrationNumber: regNum5,
      yatraType: 'RAM_NAVAMI',
      year: 2026,
      primaryName: 'अनिल जादम',
      mobile: '9826066666',
      village: 'धामनोद',
      city: 'धामनोद',
      address: 'धामनोद, धार',
      travelDate: new Date('2026-04-15'),
      numberOfTravelers: 1,
      travelers: [
        {
          name: 'अनिल जादम',
          age: 35,
          gender: 'male',
          mobile: '9826066666',
          village: 'धामनोद',
          idType: 'aadhaar',
          idLastFourDigits: '8899',
        },
      ],
      bookingStatus: 'cancelled',
      paymentStatus: 'pending',
      paymentAmount: 0,
      paymentMethod: 'cash',
      departureLocation: 'धामनोद चौराहा',
      notes: 'पारिवारिक आकस्मिक कार्य के कारण असमर्थता',
      createdBy: adminUser._id,
    });

    console.log('✅ Seeded 5 sample Yatra registrations with payments and varying statuses');
    console.log('Phase 5 seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during Phase 5 data seeding:', err);
    process.exit(1);
  }
};

seedPhase5Data();
