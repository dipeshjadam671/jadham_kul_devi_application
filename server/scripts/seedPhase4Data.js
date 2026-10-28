const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const TempleInfo = require('../models/TempleInfo');
const TempleRule = require('../models/TempleRule');
const Notice = require('../models/Notice');
const GalleryAlbum = require('../models/GalleryAlbum');
const GalleryMedia = require('../models/GalleryMedia');
const { generateUniqueSlug } = require('../utils/slugify');

const seedPhase4Data = async () => {
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

    // 2. Seed TempleInfo (Singleton)
    console.log('Seeding Temple Information...');
    await TempleInfo.deleteMany({});
    const templeInfo = await TempleInfo.create({
      title: 'श्री जादम परिवार कुलदेवी माताजी मंदिर, खलघाट',
      shortDescription: 'पवित्र नर्मदा तट पर विराजित कुलदेवी माँ का पावन धाम एवं आस्था का केंद्र',
      description: 'श्री जादम समाज कुलदेवी मंदिर चेरिटेबल ट्रस्ट (पंजीकृत) - MP/DHR/TRUST/2018/0421',
      templeIntroduction: `मध्य प्रदेश के पावन नर्मदा तट पर खलघाट में स्थित श्री जादम परिवार कुलदेवी माताजी मंदिर समस्त जादम वंशजों एवं श्रद्धालुओं की आस्था का केंद्र है। यह पवित्र धाम न केवल हमारी समृद्ध सांस्कृतिक एवं आध्यात्मिक धरोहर का प्रतीक है, बल्कि जादम कुल के समस्त परिवारों को एकता के सूत्र में पिरोने वाला पावन तीर्थ भी है। प्रतिवर्ष नवरात्रि, पाटोत्सव तथा विभिन्न धार्मिक पर्वों पर यहाँ देश-विदेश से श्रद्धालु माँ के चरणों में शीश नवाने आते हैं।`,
      history: `मंदिर निर्माण का संकल्प जादम समाज के वरिष्ठ पूर्वजों द्वारा लिया गया था। नर्मदा मैया के पावन प्रवाह के समीप खलघाट की इस पवित्र धरा पर भव्य पाषाण मंदिर का निर्माण कार्य जनसहयोग एवं समाज के दानदाताओं के सहयोग से संपन्न हुआ।`,
      mataJiHistory: `जादम वंश की आराध्य कुलदेवी माँ भगवती की कृपा से जादम कुल अनादिकाल से धर्म, परोपकार और राष्ट्र सेवा के मार्ग पर अग्रसर रहा है। जनश्रुतियों और प्राचीन अभिलेखों के अनुसार, पूर्वजों ने माँ भगवती की कठोर तपस्या कर कुल की रक्षा, वंश वृद्धि और संकट निवारण का वरदान प्राप्त किया था। नर्मदा मैया के पावन प्रवाह के समीप खलघाट की इस पवित्र भूमि पर कुलदेवी माताजी की प्राण-प्रतिष्ठा की गई, जहाँ माँ सदैव जागृत रूप में अपने भक्तों की हर मनोकामना पूर्ण करती हैं।`,
      location: 'नर्मदा तट, खलघाट, जिला धार (म.प्र.)',
      address: 'नर्मदा तट, मुख्य राष्ट्रीय राजमार्ग 52, खलघाट',
      village: 'खलघाट',
      city: 'धरमपुरी / खलघाट',
      district: 'धार',
      state: 'मध्य प्रदेश',
      pincode: '454552',
      contactMobile: '+91 9977788693',
      contactEmail: 'dipeshjadam671@gmail.com',
      googleMapsUrl: 'https://maps.google.com/?q=Khalghat+Dhar+Madhya+Pradesh',
      coverImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1600&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80',
      templeTimings: {
        days: [
          { day: 'Monday', dayHindi: 'सोमवार', morningOpen: '06:00 AM', morningClose: '12:00 PM', eveningOpen: '04:00 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Tuesday', dayHindi: 'मंगलवार', morningOpen: '05:30 AM', morningClose: '12:30 PM', eveningOpen: '04:00 PM', eveningClose: '09:30 PM', isOpen: true },
          { day: 'Wednesday', dayHindi: 'बुधवार', morningOpen: '06:00 AM', morningClose: '12:00 PM', eveningOpen: '04:00 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Thursday', dayHindi: 'गुरुवार', morningOpen: '06:00 AM', morningClose: '12:00 PM', eveningOpen: '04:00 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Friday', dayHindi: 'शुक्रवार', morningOpen: '05:30 AM', morningClose: '12:30 PM', eveningOpen: '04:00 PM', eveningClose: '09:30 PM', isOpen: true },
          { day: 'Saturday', dayHindi: 'शनिवार', morningOpen: '06:00 AM', morningClose: '12:00 PM', eveningOpen: '04:00 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Sunday', dayHindi: 'रविवार', morningOpen: '05:30 AM', morningClose: '01:00 PM', eveningOpen: '03:30 PM', eveningClose: '10:00 PM', isOpen: true },
        ],
        morningAarti: '07:00 AM',
        sandhyaAarti: '07:30 PM',
        shayanAarti: '09:00 PM',
        specialNote: 'मंगलवार व शुक्रवार को माँ भगवती का विशेष श्रृंगार एवं कुंकुम अर्चन होता है।',
        festivalTimings: 'नवरात्रि पर्व के दौरान मंदिर के पट श्रद्धालुओं के लिए अनवरत खुले रहते हैं।',
      },
      isPublished: true,
      updatedBy: adminUser._id,
    });
    console.log('✅ TempleInfo created:', templeInfo.title);

    // 3. Seed TempleRules (15 Authentic Rules)
    console.log('Seeding 15 Temple Rules...');
    await TempleRule.deleteMany({});
    const rulesData = [
      { order: 1, title: 'शराब एवं नशा पूर्ण प्रतिबंध', description: 'कृपया शराब पीकर अन्दर आना सख्त मना है।' },
      { order: 2, title: 'शराब पीने पर 5 वर्ष का मढ़ बहिष्कार', description: 'शराब पीकर मंदिर में पकड़े जाने पर उसको और उसके परिवार को 5 साल तक मढ़ से बहिष्कार कर दिया जायेगा।' },
      { order: 3, title: 'बटवारा केवल अष्मी–नवमी को मान्य', description: 'बटवारा सिर्फ अष्मी–नवमी को ही लिया जायेगा, उसके पहले या बाद में नहीं।' },
      { order: 4, title: 'अष्मी–नवमी पूजा सामग्री व्यवस्था', description: 'माता जी अष्मी–नवमी की पूजा सामग्री बटवारे के पैसों से ही आयेगी, किसी एक व्यक्ति के पैसों से नहीं।' },
      { order: 5, title: 'माता जी की अष्मी–नवमी की मान निषेध', description: 'माता जी की अष्मी–नवमी की मान ना लें, माता जी इस पूजा को स्वीकार नहीं करती है। माता जी केवल बटवारे के पैसों से लाई हुई पूजा सामग्री ही स्वीकार करती है। जैसे—कंकू, चावल से लेकर पिलका–पिलकी मेण्डी तक।' },
      { order: 6, title: 'भैरवान बाबा की मान स्वीकार्य', description: 'भैरवान बाबा की मान लें, भैरवान बाबा इस पूजा को स्वीकार करते हैं।' },
      { order: 7, title: 'नवमी जोड़े, उपवास एवं मर्यादा', description: 'नवमी के दिन जोड़े लगाये जाते हैं और उन जोड़ों को उपवास रखना होगा, जोड़े लगाने वाली महिला को सफेद कपड़े पहनना है, श्रृंगार नहीं करना है।' },
      { order: 8, title: 'नाते वाले जोड़े एवं नेवज–पाती नियम', description: 'नाते वाले जोड़े की महिला को अष्मी–नवमी का नेवज एवं पाती नहीं दिया जायेगा, अष्मी–नवमी का नेवज एवं पाती पहला लड़का होने पर ही दिया जायेगा अन्यथा नहीं।' },
      { order: 9, title: 'जमाल की शुरुआत', description: 'जमाल की शुरुआत केवल दशहरे के दिन से ही चालू होगी।' },
      { order: 10, title: 'बकरा अर्पण मर्यादा (10 किलो से ऊपर)', description: 'बकरा 10 किलो से ऊपर का ही स्वीकार होगा।' },
      { order: 11, title: 'सूतक संबंधी मढ़ मर्यादा (सवा महीना)', description: 'जिस जादम व्यक्ति के घर सूतक होगा वो व्यक्ति सवा महीने के बाद ही आवे, उससे पहले आने पर और पता लगने पर उसे मढ़ से बाहर कर दिया जायेगा।' },
      { order: 12, title: 'जमाल भोजन जवाबदारी एवं जादम गोत्र कन्याती नेवज मर्यादा', description: 'जो व्यक्ति जमाल में निमंत्रण देकर लाये हुए व्यक्तियों को भोजन कराने की जवाबदारी स्वयं की रहेगी। जादम गोत्र कन्याती के अलावा किसी दूसरे गोत्र के व्यक्ति को नेवज व बिजोरा नहीं दिया जायेगा।' },
      { order: 13, title: 'अष्मी–नवमी पूर्व या पश्चात पूजा नियम', description: 'अष्मी–नवमी के पहले या बाद में मढ़ में पूजा करने आवे तो केवल नारियल और अगरबत्ती ही लावे।' },
      { order: 14, title: 'जमाल आयु मर्यादा (7 महीने पश्चात)', description: 'जमाल बच्चों के 7 महीने होने के बाद ही लिया जायेगा।' },
      { order: 15, title: 'जमाल से पूर्व मान–मनते पूर्ति', description: 'बच्चे के जमाल से पहले जितने भी मान मनते हो वो देने के बाद ही जमाल निकाले जायेंगे।' },
    ];

    for (const r of rulesData) {
      await TempleRule.create({
        ...r,
        isActive: true,
        createdBy: adminUser._id,
      });
    }
    console.log(`✅ Seeded ${rulesData.length} Temple Rules successfully`);

    // 4. Seed Notices (Events & Announcements)
    console.log('Seeding Notices & Events...');
    await Notice.deleteMany({});
    const noticesData = [
      {
        title: 'चैत्र नवरात्रि महापर्व एवं शतचंडी महायज्ञ 2026',
        shortDescription: '9 दिवसीय भव्य शतचंडी महायज्ञ, अखंड ज्योत प्रज्वलन तथा प्रतिदिन सायं काल भव्य महाआरती का आयोजन।',
        description: `समस्त जादम परिवार एवं माँ के भक्तों को सूचित किया जाता है कि आगामी चैत्र नवरात्रि महापर्व के पावन अवसर पर मंदिर प्रांगण में 9 दिवसीय भव्य शतचंडी महायज्ञ, अखंड ज्योत प्रज्वलन तथा प्रतिदिन सायं काल भव्य महाआरती का आयोजन किया जाएगा। सभी स्वजातीय बंधु सपरिवार सादर आमंत्रित हैं। यजमान बनने हेतु ट्रस्ट कार्यालय में संपर्क करें।`,
        isPinned: true,
        status: 'published',
        isPublic: true,
        eventDate: new Date(Date.now() + 15 * 86400000),
        startTime: '06:00 AM',
        endTime: '10:00 PM',
        location: 'श्री जादम कुलदेवी मंदिर मुख्य प्रांगण, खलघाट',
        bannerImageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80',
        publishedAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        title: 'वार्षिक कुलदेवी पाटोत्सव एवं महाप्रसादी (विशाल भंडारा)',
        shortDescription: 'वार्षिक पाटोत्सव के उपलक्ष्य में प्रातः 09 बजे से हवन, 11 बजे पूर्णाहूति एवं दोपहर 12 बजे से विशाल भंडारा।',
        description: `श्री जादम कुलदेवी माताजी के वार्षिक पाटोत्सव के पावन उपलक्ष्य में विशाल भंडारे एवं महाप्रसादी का आयोजन सुनिश्चित हुआ है। प्रातः 09 बजे से हवन, 11 बजे पूर्णाहूति एवं दोपहर 12 बजे से प्रभु इच्छा तक आम भंडारा अनवरत चलेगा। सभी श्रद्धालु पधारकर धर्मलाभ प्राप्त करें।`,
        isPinned: false,
        status: 'published',
        isPublic: true,
        eventDate: new Date(Date.now() + 30 * 86400000),
        startTime: '11:00 AM',
        endTime: '06:00 PM',
        location: 'अन्नपूर्णा भवन एवं परिसर, खलघाट',
        bannerImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
        publishedAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        title: 'जादम समाज ट्रस्टी एवं कार्यकारिणी की आवश्यक बैठक',
        shortDescription: 'आगामी वर्ष के विकास कार्यों एवं मंदिर धर्मशाला विस्तार हेतु कार्यकारिणी की बैठक।',
        description: `आगामी वर्ष के विकास कार्यों, मंदिर धर्मशाला विस्तार तथा वार्षिक आय-व्यय के अनुमोदन हेतु कार्यकारिणी की महत्वपूर्ण बैठक आहूत की गई है। समस्त सम्मानीय ट्रस्टीगण एवं सदस्य समय पर उपस्थित होने का कष्ट करें।`,
        isPinned: false,
        status: 'published',
        isPublic: true,
        eventDate: new Date(Date.now() + 7 * 86400000),
        startTime: '03:00 PM',
        endTime: '06:00 PM',
        location: 'ट्रस्ट कार्यालय सभागार, खलघाट',
        publishedAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        title: 'अतिवृष्टि के चलते नर्मदा तट पर विशेष सतर्कता निर्देश (प्रारूप)',
        shortDescription: 'नर्मदा नदी के जलस्तर में वृद्धि को देखते हुए घाट की सीढ़ियों पर जाने से बचें।',
        description: `नर्मदा नदी के जलस्तर में वृद्धि को देखते हुए घाट की सीढ़ियों पर जाने से बचें। सुरक्षा दल की चेतावनी का पालन करें।`,
        isPinned: false,
        status: 'draft', // Draft notice to test public filtering
        isPublic: false,
        createdBy: adminUser._id,
      }
    ];

    for (const n of noticesData) {
      const slug = await generateUniqueSlug(Notice, n.title);
      await Notice.create({
        ...n,
        slug,
      });
    }
    console.log(`✅ Seeded ${noticesData.length} Notices (including 1 draft notice)`);

    // 5. Seed Albums & Media
    console.log('Seeding Gallery Albums & Media...');
    await GalleryAlbum.deleteMany({});
    await GalleryMedia.deleteMany({});

    // Album 1: Navratri Mahotsav
    const album1Name = 'चैत्र नवरात्रि एवं शतचंडी यज्ञ 2025';
    const album1Slug = await generateUniqueSlug(GalleryAlbum, album1Name);
    const album1 = await GalleryAlbum.create({
      name: album1Name,
      slug: album1Slug,
      description: 'गत वर्ष आयोजित भव्य नवरात्रि महोत्सव, दीपदान एवं शतचंडी हवन की पावन स्मृतियां',
      category: 'Navratri',
      coverImageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80',
      isPublished: true,
      eventDate: new Date('2025-04-10'),
      createdBy: adminUser._id,
    });

    const media1Items = [
      {
        albumId: album1._id,
        type: 'image',
        title: 'माँ कुलदेवी का भव्य नवरात्रि श्रृंगार',
        description: 'स्वर्ण मुकुट एवं दिव्य अलौकिक आभूषणों में माताजी के प्रथम दर्शन',
        fileUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=400&q=80',
        mimeType: 'image/jpeg',
        fileSize: 1024 * 650,
        sortOrder: 1,
        isPublished: true,
        uploadedBy: adminUser._id,
      },
      {
        albumId: album1._id,
        type: 'image',
        title: 'शतचंडी महायज्ञ पूर्णाहूति',
        description: 'विद्वान ब्राह्मणों द्वारा वेदोक्त मंत्रोच्चार के साथ आहुति एवं परिक्रमा',
        fileUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
        mimeType: 'image/jpeg',
        fileSize: 1024 * 820,
        sortOrder: 2,
        isPublished: true,
        uploadedBy: adminUser._id,
      },
      {
        albumId: album1._id,
        type: 'video',
        title: 'संध्या महाआरती की दिव्य झलकियाँ',
        description: 'शंखनाद एवं आरती दर्शन - खलघाट धाम',
        fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80',
        mimeType: 'video/mp4',
        fileSize: 1024 * 1024 * 5,
        duration: 120,
        sortOrder: 3,
        isPublished: true,
        uploadedBy: adminUser._id,
      },
      {
        albumId: album1._id,
        type: 'image',
        title: 'अप्रकाशित पूर्वावलोकन छवि',
        description: 'यह छवि केवल एडमिन के लिए है',
        fileUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
        mimeType: 'image/jpeg',
        fileSize: 1024 * 300,
        sortOrder: 4,
        isPublished: false, // Unpublished to test public filtering
        uploadedBy: adminUser._id,
      }
    ];

    await GalleryMedia.insertMany(media1Items);
    album1.mediaCount = 3; // published count
    album1.photoCount = 2;
    album1.videoCount = 1;
    await album1.save();

    // Album 2: Mandir Jirnoddhar
    const album2Name = 'मंदिर जीर्णोद्धार एवं नवनिर्माण कार्य';
    const album2Slug = await generateUniqueSlug(GalleryAlbum, album2Name);
    const album2 = await GalleryAlbum.create({
      name: album2Name,
      slug: album2Slug,
      description: 'पवित्र नर्मदा तट पर नवीन शिखर, सभा मंडप एवं प्रवेश द्वार का भव्य निर्माण',
      category: 'Temple Event',
      coverImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      isPublished: true,
      eventDate: new Date('2025-01-20'),
      createdBy: adminUser._id,
    });

    const media2Items = [
      {
        albumId: album2._id,
        type: 'image',
        title: 'नवीन संगमरमर सभा मंडप',
        description: 'कलात्मक स्तंभ एवं नक्काशीदार छत का विहंगम दृश्य',
        fileUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
        mimeType: 'image/jpeg',
        fileSize: 1024 * 740,
        sortOrder: 1,
        isPublished: true,
        uploadedBy: adminUser._id,
      },
      {
        albumId: album2._id,
        type: 'image',
        title: 'मुख्य प्रवेश द्वार निर्माण',
        description: 'भव्य सिंह द्वार एवं स्वागत प्रांगण',
        fileUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=400&q=80',
        mimeType: 'image/jpeg',
        fileSize: 1024 * 890,
        sortOrder: 2,
        isPublished: true,
        uploadedBy: adminUser._id,
      },
    ];

    await GalleryMedia.insertMany(media2Items);
    album2.mediaCount = 2;
    album2.photoCount = 2;
    album2.videoCount = 0;
    await album2.save();

    // Album 3: Shri Jadam Kuldevi Mandir Darshan
    const album3Name = 'श्री जादम कुलदेवी मंदिर दर्शन एवं पावन प्रांगण';
    const album3Slug = await generateUniqueSlug(GalleryAlbum, album3Name);
    const album3 = await GalleryAlbum.create({
      name: album3Name,
      slug: album3Slug,
      description: 'पवित्र नर्मदा तट, खलघाट स्थित माँ कुलदेवी का नवनिर्मित दिव्य मंदिर, भव्य प्रवेश द्वार, स्वास्तिक शिखर, शुभ-लाभ स्तम्भ, एवं गर्भगृह दर्शन',
      category: 'Temple Event',
      coverImageUrl: '/uploads/gallery/temple_main_entrance.jpg',
      isPublished: true,
      eventDate: new Date('2026-03-21'),
      createdBy: adminUser._id,
    });

    const media3Items = [
      {
        albumId: album3._id,
        type: 'image',
        title: 'श्री जादम कुलदेवी मंदिर मुख्य प्रवेश द्वार एवं गर्भगृह दर्शन',
        description: 'श्री जादम कुलदेवी मंदिर का भव्य नक्काशीदार प्रवेश द्वार, स्वास्तिक शिखर, शुभ-लाभ कमल स्तम्भ, एवं गर्भगृह में विराजित कुलदेवी मां के पावन दर्शन',
        fileUrl: '/uploads/gallery/temple_main_entrance.jpg',
        thumbnailUrl: '/uploads/gallery/temple_main_entrance.jpg',
        mimeType: 'image/jpeg',
        fileSize: 270336,
        sortOrder: 1,
        isPublished: true,
        uploadedBy: adminUser._id,
      },
      {
        albumId: album3._id,
        type: 'image',
        title: 'माँ कुलदेवी गर्भगृह एवं अलौकिक दिव्य स्वरूप',
        description: 'स्वर्ण मुकुट, दिव्य आभूषणों एवं पुष्पमालाओं से सुशोभित माँ कुलदेवी के गर्भगृह के पावन दर्शन',
        fileUrl: '/uploads/gallery/mata_ji_sanctum_darshan.jpg',
        thumbnailUrl: '/uploads/gallery/mata_ji_sanctum_darshan.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1153433,
        sortOrder: 2,
        isPublished: true,
        uploadedBy: adminUser._id,
      },
      {
        albumId: album3._id,
        type: 'image',
        title: 'पवित्र नर्मदा तट - खलघाट संगम एवं मंदिर प्रांगण',
        description: 'सूर्योदय के समय पवित्र नर्मदा नदी, स्नान घाट की सीढ़ियां एवं पृष्ठभूमि में जादम कुलदेवी मंदिर का दिव्य शिखर',
        fileUrl: '/uploads/gallery/narmada_ghat_khalghat.jpg',
        thumbnailUrl: '/uploads/gallery/narmada_ghat_khalghat.jpg',
        mimeType: 'image/jpeg',
        fileSize: 836608,
        sortOrder: 3,
        isPublished: true,
        uploadedBy: adminUser._id,
      },
      {
        albumId: album3._id,
        type: 'image',
        title: 'संध्या महाआरती एवं दीप प्रज्वलन दर्शन',
        description: 'सैकड़ों दीपकों एवं वेदोक्त मंत्रोच्चार के साथ संपन्न भव्य संध्या महाआरती में सम्मिलित श्रद्धालु',
        fileUrl: '/uploads/gallery/temple_evening_aarti.jpg',
        thumbnailUrl: '/uploads/gallery/temple_evening_aarti.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1153433,
        sortOrder: 4,
        isPublished: true,
        uploadedBy: adminUser._id,
      },
    ];

    await GalleryMedia.insertMany(media3Items);
    album3.mediaCount = 4;
    album3.photoCount = 4;
    album3.videoCount = 0;
    await album3.save();

    console.log('✅ Seeded 3 Albums and associated Media items');
    console.log('🎉 PHASE 4 SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Phase 4 data:', error);
    process.exit(1);
  }
};

seedPhase4Data();
