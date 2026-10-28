const TempleInfo = require('../models/TempleInfo');

/**
 * Temple Info Controller - Phase 4
 * Manages singleton document containing temple details, history, timings, and contact
 */

/**
 * Get Published Temple Information (Public)
 * GET /api/v1/temple-info
 */
const getTempleInfo = async (req, res) => {
  try {
    let temple = await TempleInfo.findOne({ isPublished: true }).lean();

    // Fallback if not seeded yet
    if (!temple) {
      temple = await TempleInfo.findOne().lean();
    }

    if (!temple) {
      return res.status(200).json({
        success: true,
        data: {
          title: 'जादम परिवार कुलदेवी मंदिर, खलघाट',
          shortDescription: 'पवित्र नर्मदा तट पर स्थापित जादम कुल की कुलदेवी मां का पावन धाम',
          location: 'नर्मदा तट, खलघाट, मध्य प्रदेश',
          address: 'जादम परिवार कुलदेवी मंदिर, नर्मदा घाट मार्ग, खलघाट',
          contactMobile: '+91 9977788693',
          contactEmail: 'dipeshjadam671@gmail.com',
          googleMapsUrl: 'https://maps.google.com/?q=Khalghat+Narmada+Ghat',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: temple,
    });
  } catch (error) {
    console.error('Error in getTempleInfo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve temple information.',
      errors: [error.message],
    });
  }
};

/**
 * Update / Upsert Temple Information (Admin / Committee)
 * PUT /api/v1/temple-info
 */
const updateTempleInfo = async (req, res) => {
  try {
    const updatableFields = [
      'title',
      'shortDescription',
      'description',
      'templeIntroduction',
      'history',
      'mataJiHistory',
      'location',
      'address',
      'village',
      'city',
      'district',
      'state',
      'pincode',
      'contactMobile',
      'contactEmail',
      'googleMapsUrl',
      'coverImageUrl',
      'logoUrl',
      'templeTimings',
      'isPublished',
    ];

    let temple = await TempleInfo.findOne();

    if (!temple) {
      temple = new TempleInfo();
    }

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        temple[field] = req.body[field];
      }
    });

    temple.updatedBy = req.user._id;
    await temple.save();

    return res.status(200).json({
      success: true,
      message: 'Temple information updated successfully.',
      data: temple,
    });
  } catch (error) {
    console.error('Error updating temple information:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update temple information.',
      errors: [error.message],
    });
  }
};

module.exports = {
  getTempleInfo,
  updateTempleInfo,
};
