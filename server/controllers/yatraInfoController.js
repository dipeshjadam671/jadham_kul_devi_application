const YatraInfo = require('../models/YatraInfo');

/**
 * Yatra Info & Instructions Controller - Phase 5
 * Manages official guidelines, departure locations, and reporting instructions.
 */

// GET /api/v1/yatra/info/:yatraType (Public)
const getYatraInfo = async (req, res, next) => {
  try {
    const yatraType = req.params.yatraType.toUpperCase();
    let info = await YatraInfo.findOne({ yatraType });

    if (!info) {
      // Provide authentic defaults if not yet customized in database
      const defaultTitle =
        yatraType === 'RAM_NAVAMI'
          ? 'श्री रामनवमी भव्य तीर्थ यात्रा 2026 - दिशा-निर्देश'
          : 'पवित्र मान सरोवर दर्शन यात्रा 2026 - दिशा-निर्देश';

      const defaultInstructions =
        yatraType === 'RAM_NAVAMI'
          ? [
              'सभी श्रद्धालु निर्धारित समय से 30 मिनट पूर्व मंदिर प्रांगण में रिपोर्ट करें।',
              'यात्रा के दौरान अपने साथ पहचान पत्र (आधार अथवा वोटर कार्ड) की प्रति अवश्य रखें।',
              'वरिष्ठ नागरिकों एवं बच्चों के स्वास्थ्य संबंधी आवश्यक दवाएं साथ रखें।',
              'अनुशासन एवं यात्रा प्रभारी के निर्देशों का कड़ाई से पालन करें।',
            ]
          : [
              'मानसरोवर यात्रा हेतु शारीरिक स्वास्थ्य परीक्षण एवं पंजीयन प्रमाण पत्र आवश्यक है।',
              'पर्वतीय यात्रा हेतु गर्म वस्त्र एवं आवश्यक निजी सामग्री साथ लाएं।',
              'यात्रा दल के व्यवस्थापक के मोबाइल नंबर पर पूर्व सूचना देकर ही प्रस्थान करें।',
            ];

      info = {
        yatraType,
        title: defaultTitle,
        description:
          yatraType === 'RAM_NAVAMI'
            ? 'पवित्र नर्मदा तट खलघाट से प्रारंभ होने वाली वार्षिक रामनवमी तीर्थ यात्रा का पावन आयोजन।'
            : 'जादम समाज के श्रद्धालुओं हेतु आयोजित पावन मानसरोवर एवं तीर्थ यात्रा।',
        instructions: defaultInstructions,
        departureLocation: 'श्री जादम कुलदेवी मंदिर प्रांगण, मुख्य मार्ग, खलघाट',
        reportingTime: 'प्रातः 06:00 AM',
        contactMobile: '+91 9826012345',
        isPublished: true,
      };
    }

    res.status(200).json({
      success: true,
      data: info,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/yatra/info/:yatraType (Admin / Authorized Committee)
const updateYatraInfo = async (req, res, next) => {
  try {
    const yatraType = req.params.yatraType.toUpperCase();
    const {
      title,
      description,
      instructions,
      departureLocation,
      reportingTime,
      contactMobile,
      isPublished = true,
    } = req.body;

    const info = await YatraInfo.findOneAndUpdate(
      { yatraType },
      {
        title,
        description,
        instructions: Array.isArray(instructions) ? instructions : [],
        departureLocation,
        reportingTime,
        contactMobile,
        isPublished,
        updatedBy: req.user?._id || null,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'यात्रा निर्देश एवं सूचना सफलतापूर्वक सुरक्षित कर दी गई!',
      data: info,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getYatraInfo,
  updateYatraInfo,
};
