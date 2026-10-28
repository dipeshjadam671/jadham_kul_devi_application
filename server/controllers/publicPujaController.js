const pujaService = require('../services/pujaService');

/**
 * Public Puja Controller - Phase 6
 * Serves only aggregated, non-sensitive summary information to the general public.
 * Zero personal devotee or participant data is exposed.
 */
const getPublicPujaSummary = async (req, res) => {
  try {
    const { year } = req.query;
    const summary = await pujaService.getPublicPujaSummary(year);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'पूजा सारांश प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

module.exports = {
  getPublicPujaSummary,
};
