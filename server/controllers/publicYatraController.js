const YatraRegistration = require('../models/YatraRegistration');
const { generateYatraRegistrationNumber } = require('../services/yatraRegistrationNumberService');
const { checkDuplicateRegistration } = require('../services/yatraService');

/**
 * Public Yatra Controller - Phase 5
 * Public devotee registrations and privacy-safe status verification.
 */

// POST /api/v1/public/yatra/register
const registerPublicYatra = async (req, res, next) => {
  try {
    const {
      yatraType,
      primaryName,
      mobile,
      village,
      city,
      address,
      travelDate,
      numberOfTravelers = 1,
      travelers = [],
      paymentMethod = 'cash',
      notes = '',
      // Mansarovar fields
      travelOrganizer,
      organizerMobile,
      departureLocation,
      expectedReturnDate,
    } = req.body;

    // 1. Mandatory Input Validation
    if (!yatraType || !['RAM_NAVAMI', 'MANSAROVAR'].includes(yatraType)) {
      return res.status(400).json({
        success: false,
        message: 'कृपया वैध यात्रा प्रकार (रामनवमी अथवा मानसरोवर) का चयन करें।',
        errors: ['Invalid yatra type'],
      });
    }

    if (!primaryName || primaryName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'कृपया मुख्य यात्री / परिवार प्रमुख का मान्य नाम दर्ज करें।',
        errors: ['Primary name is required'],
      });
    }

    const cleanedMobile = (mobile || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।',
        errors: ['Invalid 10-digit Indian mobile number'],
      });
    }

    if (!travelDate) {
      return res.status(400).json({
        success: false,
        message: 'कृपया यात्रा दिनांक का चयन करें।',
        errors: ['Travel date is required'],
      });
    }

    const tDate = new Date(travelDate);
    if (isNaN(tDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'यात्रा दिनांक अमान्य है।',
        errors: ['Invalid travel date'],
      });
    }

    // Travel date cannot be in the past for public registration
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (tDate < today) {
      return res.status(400).json({
        success: false,
        message: 'यात्रा दिनांक आज अथवा भविष्य की होनी चाहिए।',
        errors: ['Travel date cannot be in the past'],
      });
    }

    const year = tDate.getFullYear();

    // 2. Traveler Count Limits (1 to 50)
    const count = parseInt(numberOfTravelers, 10) || 1;
    if (count < 1 || count > 50) {
      return res.status(400).json({
        success: false,
        message: 'यात्रियों की संख्या कम से कम 1 एवं अधिकतम 50 होनी चाहिए।',
        errors: ['Travelers count must be between 1 and 50'],
      });
    }

    // 3. Duplicate Registration Detection
    const duplicateCheck = await checkDuplicateRegistration({
      mobile: cleanedMobile,
      yatraType,
      year,
      travelDate: tDate,
      primaryName: primaryName.trim(),
    });

    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        message:
          'इस मोबाइल नंबर पर इस वर्ष के लिए एक समान पंजीकरण पहले से उपलब्ध है। अधिक जानकारी अथवा बदलाव हेतु मंदिर समिति से संपर्क करें।',
        errors: ['Duplicate registration detected'],
      });
    }

    // 4. Generate Unique Sequential Registration Number
    const registrationNumber = await generateYatraRegistrationNumber(yatraType, tDate);

    // 5. Structure Travelers Subdocuments
    let travelerList = Array.isArray(travelers) && travelers.length > 0 ? travelers : [];
    if (travelerList.length === 0) {
      travelerList = [
        {
          name: primaryName.trim(),
          mobile: cleanedMobile,
          village: village ? village.trim() : '',
          city: city ? city.trim() : '',
        },
      ];
    } else {
      // Sanitize traveler records
      travelerList = travelerList.slice(0, count).map((t) => ({
        name: (t.name || primaryName).trim(),
        age: t.age ? Number(t.age) : null,
        gender: ['male', 'female', 'other'].includes(t.gender) ? t.gender : 'male',
        mobile: t.mobile ? t.mobile.replace(/\D/g, '') : '',
        village: t.village ? t.village.trim() : village || '',
        city: t.city ? t.city.trim() : city || '',
        idType: t.idType || 'none',
        idLastFourDigits: t.idLastFourDigits ? String(t.idLastFourDigits).slice(-4) : '',
        notes: t.notes || '',
      }));
    }

    // 6. Create Registration Record
    const registration = await YatraRegistration.create({
      registrationNumber,
      yatraType,
      year,
      primaryName: primaryName.trim(),
      mobile: cleanedMobile,
      village: village ? village.trim() : '',
      city: city ? city.trim() : '',
      address: address ? address.trim() : '',
      travelDate: tDate,
      numberOfTravelers: count,
      travelers: travelerList,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      paymentAmount: 0,
      paymentMethod: paymentMethod || 'cash',
      notes: notes ? notes.trim() : '',
      isPublic: true,
      travelOrganizer: travelOrganizer ? travelOrganizer.trim() : '',
      organizerMobile: organizerMobile ? organizerMobile.trim() : '',
      departureLocation: departureLocation || 'श्री जादम कुलदेवी मंदिर प्रांगण, खलघाट',
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
      createdBy: null,
    });

    res.status(201).json({
      success: true,
      message: `पंजीकरण सफलतापूर्वक स्वीकार कर लिया गया है! आपका पंजीकरण क्रमांक: ${registrationNumber}`,
      data: {
        registrationNumber: registration.registrationNumber,
        primaryName: registration.primaryName,
        yatraType: registration.yatraType,
        travelDate: registration.travelDate,
        numberOfTravelers: registration.numberOfTravelers,
        bookingStatus: registration.bookingStatus,
        paymentStatus: registration.paymentStatus,
        departureLocation: registration.departureLocation,
        createdAt: registration.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/public/yatra/check?registrationNumber=...&mobile=...
const checkPublicRegistrationStatus = async (req, res, next) => {
  try {
    const { registrationNumber, mobile } = req.query;

    if (!registrationNumber || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'कृपया पंजीकरण क्रमांक एवं पंजीकृत 10-अंकीय मोबाइल नंबर दोनों प्रदान करें।',
        errors: ['Both registrationNumber and mobile are required for status lookup'],
      });
    }

    const regNo = registrationNumber.trim().toUpperCase();
    const cleanedMobile = mobile.trim().replace(/\D/g, '');

    const registration = await YatraRegistration.findOne({
      registrationNumber: regNo,
      mobile: cleanedMobile,
      isArchived: { $ne: true },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'प्रदान किया गया पंजीकरण क्रमांक अथवा मोबाइल नंबर मेल नहीं खाता। कृपया जांच कर पुनः प्रयास करें।',
        errors: ['Registration record not found or mobile mismatch'],
      });
    }

    // Return safe public details with mobile masked and internal notes omitted
    res.status(200).json({
      success: true,
      data: registration.getPublicView(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPublicYatra,
  checkPublicRegistrationStatus,
};
