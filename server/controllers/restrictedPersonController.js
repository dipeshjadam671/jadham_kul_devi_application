const restrictedPersonService = require('../services/restrictedPersonService');

/**
 * Restricted Person Controller - Phase 6
 * Manages strictly confidential administrative restricted records.
 */

const createRestrictedPerson = async (req, res) => {
  try {
    const record = await restrictedPersonService.createRestrictedPerson(
      req.body,
      req.user?._id
    );
    return res.status(201).json({
      success: true,
      message: 'प्रतिबंधित व्यक्ति रिकॉर्ड सफलतापूर्वक दर्ज किया गया (Restricted person record created)',
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'प्रतिबंधित रिकॉर्ड दर्ज करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getRestrictedPersons = async (req, res) => {
  try {
    const result = await restrictedPersonService.getRestrictedPersons(req.query);
    return res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'प्रतिबंधित रिकॉर्ड्स प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getRestrictedPersonById = async (req, res) => {
  try {
    const record = await restrictedPersonService.getRestrictedPersonById(req.params.id);
    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'प्रतिबंधित रिकॉर्ड नहीं मिला',
      errors: [error.message],
    });
  }
};

const updateRestrictedPerson = async (req, res) => {
  try {
    const updated = await restrictedPersonService.updateRestrictedPerson(
      req.params.id,
      req.body,
      req.user?._id
    );
    return res.status(200).json({
      success: true,
      message: 'प्रतिबंधित रिकॉर्ड सफलतापूर्वक अद्यतित किया गया',
      data: updated,
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'अपडेट करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const revokeRestriction = async (req, res) => {
  try {
    const { revocationReason } = req.body;
    const revoked = await restrictedPersonService.revokeRestriction(
      req.params.id,
      revocationReason,
      req.user?._id
    );
    return res.status(200).json({
      success: true,
      message: 'प्रतिबंध सफलतापूर्वक निरस्त (Revoked) किया गया',
      data: revoked,
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'प्रतिबंध निरस्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const archiveRestrictedPerson = async (req, res) => {
  try {
    const archived = await restrictedPersonService.archiveRestrictedPerson(
      req.params.id,
      req.user?._id
    );
    return res.status(200).json({
      success: true,
      message: 'प्रतिबंधित रिकॉर्ड सफलतापूर्वक संग्रहीत (Archived) किया गया',
      data: archived,
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'रिकॉर्ड संग्रहीत करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getRestrictedCount = async (req, res) => {
  try {
    const counts = await restrictedPersonService.getRestrictedCount();
    return res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'प्रतिबंधित रिकॉर्ड गणना प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const exportRestrictedCsv = async (req, res) => {
  try {
    const csvData = await restrictedPersonService.generateRestrictedCsv(req.query);
    const filename = `restricted-records-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'CSV निर्यात करने में त्रुटि',
      errors: [error.message],
    });
  }
};

module.exports = {
  createRestrictedPerson,
  getRestrictedPersons,
  getRestrictedPersonById,
  updateRestrictedPerson,
  revokeRestriction,
  archiveRestrictedPerson,
  getRestrictedCount,
  exportRestrictedCsv,
};
