const pujaService = require('../services/pujaService');

/**
 * Puja Controller - Phase 6
 */

const createPujaRecord = async (req, res) => {
  try {
    const record = await pujaService.createPujaRecord(req.body, req.user?._id);
    return res.status(201).json({
      success: true,
      message: 'पूजा रिकॉर्ड सफलतापूर्वक दर्ज किया गया (Puja record created successfully)',
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'पूजा रिकॉर्ड दर्ज करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getPujaRecords = async (req, res) => {
  try {
    const result = await pujaService.getPujaRecords(req.query);
    return res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'पूजा रिकॉर्ड्स प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getPujaRecordById = async (req, res) => {
  try {
    const record = await pujaService.getPujaRecordById(req.params.id);
    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'रिकॉर्ड नहीं मिला',
      errors: [error.message],
    });
  }
};

const updatePujaRecord = async (req, res) => {
  try {
    const updated = await pujaService.updatePujaRecord(
      req.params.id,
      req.body,
      req.user?._id
    );
    return res.status(200).json({
      success: true,
      message: 'पूजा रिकॉर्ड सफलतापूर्वक अद्यतित किया गया (Puja record updated successfully)',
      data: updated,
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'पूजा रिकॉर्ड अपडेट करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const archivePujaRecord = async (req, res) => {
  try {
    const archived = await pujaService.archivePujaRecord(
      req.params.id,
      req.user?._id
    );
    return res.status(200).json({
      success: true,
      message: 'पूजा रिकॉर्ड सफलतापूर्वक संग्रहीत (Archived) किया गया',
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

const getPujaStats = async (req, res) => {
  try {
    const { year } = req.query;
    const stats = await pujaService.getPujaStats(year);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'सांख्यिकी प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getYearlySummary = async (req, res) => {
  try {
    const summary = await pujaService.getYearlySummary();
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'वार्षिक सारांश प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const { year } = req.query;
    const monthly = await pujaService.getMonthlySummary(year);
    return res.status(200).json({
      success: true,
      data: monthly,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'मासिक सारांश प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const exportPujaCsv = async (req, res) => {
  try {
    const csvData = await pujaService.generatePujaCsv(req.query);
    const filename = `puja-records-${new Date().toISOString().split('T')[0]}.csv`;

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
  createPujaRecord,
  getPujaRecords,
  getPujaRecordById,
  updatePujaRecord,
  archivePujaRecord,
  getPujaStats,
  getYearlySummary,
  getMonthlySummary,
  exportPujaCsv,
};
