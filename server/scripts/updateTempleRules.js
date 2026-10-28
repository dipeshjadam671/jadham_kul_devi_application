const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const TempleRule = require('../models/TempleRule');
const User = require('../models/User');

const authenticRules = [
  {
    order: 1,
    title: 'शराब एवं नशा पूर्ण प्रतिबंध',
    description: 'कृपया शराब पीकर अन्दर आना सख्त मना है।',
  },
  {
    order: 2,
    title: 'शराब पीने पर 5 वर्ष का मढ़ बहिष्कार',
    description: 'शराब पीकर मंदिर में पकड़े जाने पर उसको और उसके परिवार को 5 साल तक मढ़ से बहिष्कार कर दिया जायेगा।',
  },
  {
    order: 3,
    title: 'बटवारा केवल अष्मी–नवमी को मान्य',
    description: 'बटवारा सिर्फ अष्मी–नवमी को ही लिया जायेगा, उसके पहले या बाद में नहीं।',
  },
  {
    order: 4,
    title: 'अष्मी–नवमी पूजा सामग्री व्यवस्था',
    description: 'माता जी अष्मी–नवमी की पूजा सामग्री बटवारे के पैसों से ही आयेगी, किसी एक व्यक्ति के पैसों से नहीं।',
  },
  {
    order: 5,
    title: 'माता जी की अष्मी–नवमी की मान निषेध',
    description: 'माता जी की अष्मी–नवमी की मान ना लें, माता जी इस पूजा को स्वीकार नहीं करती है। माता जी केवल बटवारे के पैसों से लाई हुई पूजा सामग्री ही स्वीकार करती है। जैसे—कंकू, चावल से लेकर पिलका–पिलकी मेण्डी तक।',
  },
  {
    order: 6,
    title: 'भैरवान बाबा की मान स्वीकार्य',
    description: 'भैरवान बाबा की मान लें, भैरवान बाबा इस पूजा को स्वीकार करते हैं।',
  },
  {
    order: 7,
    title: 'नवमी जोड़े, उपवास एवं मर्यादा',
    description: 'नवमी के दिन जोड़े लगाये जाते हैं और उन जोड़ों को उपवास रखना होगा, जोड़े लगाने वाली महिला को सफेद कपड़े पहनना है, श्रृंगार नहीं करना है।',
  },
  {
    order: 8,
    title: 'नाते वाले जोड़े एवं नेवज–पाती नियम',
    description: 'नाते वाले जोड़े की महिला को अष्मी–नवमी का नेवज एवं पाती नहीं दिया जायेगा, अष्मी–नवमी का नेवज एवं पाती पहला लड़का होने पर ही दिया जायेगा अन्यथा नहीं।',
  },
  {
    order: 9,
    title: 'जमाल की शुरुआत',
    description: 'जमाल की शुरुआत केवल दशहरे के दिन से ही चालू होगी।',
  },
  {
    order: 10,
    title: 'बकरा अर्पण मर्यादा (10 किलो से ऊपर)',
    description: 'बकरा 10 किलो से ऊपर का ही स्वीकार होगा।',
  },
  {
    order: 11,
    title: 'सूतक संबंधी मढ़ मर्यादा (सवा महीना)',
    description: 'जिस जादम व्यक्ति के घर सूतक होगा वो व्यक्ति सवा महीने के बाद ही आवे, उससे पहले आने पर और पता लगने पर उसे मढ़ से बाहर कर दिया जायेगा।',
  },
  {
    order: 12,
    title: 'जमाल भोजन जवाबदारी एवं जादम गोत्र कन्याती नेवज मर्यादा',
    description: 'जो व्यक्ति जमाल में निमंत्रण देकर लाये हुए व्यक्तियों को भोजन कराने की जवाबदारी स्वयं की रहेगी। जादम गोत्र कन्याती के अलावा किसी दूसरे गोत्र के व्यक्ति को नेवज व बिजोरा नहीं दिया जायेगा।',
  },
  {
    order: 13,
    title: 'अष्मी–नवमी पूर्व या पश्चात पूजा नियम',
    description: 'अष्मी–नवमी के पहले या बाद में मढ़ में पूजा करने आवे तो केवल नारियल और अगरबत्ती ही लावे।',
  },
  {
    order: 14,
    title: 'जमाल आयु मर्यादा (7 महीने पश्चात)',
    description: 'जमाल बच्चों के 7 महीने होने के बाद ही लिया जायेगा।',
  },
  {
    order: 15,
    title: 'जमाल से पूर्व मान–मनते पूर्ति',
    description: 'बच्चे के जमाल से पहले जितने भी मान मनते हो वो देने के बाद ही जमाल निकाले जायेंगे।',
  },
];

async function updateRules() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jadam_kuldevi_mandir';
  console.log('Connecting to MongoDB at:', mongoURI);

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    // Find or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'व्यवस्थापक (Admin)',
        mobile: '+919644492671',
        role: 'admin',
        status: 'active',
      });
      console.log('Created default admin user for rules update.');
    }

    // Delete existing rules
    await TempleRule.deleteMany({});
    console.log('Cleared existing temple rules.');

    // Insert new authentic rules
    for (const rule of authenticRules) {
      await TempleRule.create({
        ...rule,
        isActive: true,
        createdBy: admin._id,
      });
    }

    console.log(`✅ Successfully inserted all ${authenticRules.length} authentic temple rules!`);
    const count = await TempleRule.countDocuments();
    console.log(`Verified total rules in DB: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update rules:', error.message);
    process.exit(1);
  }
}

updateRules();
