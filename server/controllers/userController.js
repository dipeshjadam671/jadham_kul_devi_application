const userService = require('../services/userService');

/**
 * User & Committee Controller - Phase 6
 */

const getUsers = async (req, res) => {
  try {
    const result = await userService.getUsers(req.query);
    return res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'उपयोगकर्ता सूची प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'उपयोगकर्ता नहीं मिला',
      errors: [error.message],
    });
  }
};

const createCommitteeMember = async (req, res) => {
  try {
    const member = await userService.createCommitteeMember(
      req.body,
      req.user?._id
    );
    return res.status(201).json({
      success: true,
      message: 'समिति सदस्य सफलतापूर्वक जोड़ा गया (Committee member added successfully)',
      data: member,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'समिति सदस्य जोड़ने में त्रुटि',
      errors: [error.message],
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updated = await userService.updateUser(
      req.params.id,
      req.body,
      req.user?._id
    );
    return res.status(200).json({
      success: true,
      message: 'उपयोगकर्ता विवरण अद्यतित किया गया',
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'अपडेट करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const activateUser = async (req, res) => {
  try {
    const activated = await userService.activateUser(req.params.id, req.user?._id);
    return res.status(200).json({
      success: true,
      message: 'खाता सफलतापूर्वक सक्रिय किया गया (Account activated)',
      data: activated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'खाता सक्रिय करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const deactivated = await userService.deactivateUser(
      req.params.id,
      req.user?._id
    );
    return res.status(200).json({
      success: true,
      message: 'खाता सफलतापूर्वक निष्क्रिय किया गया (Account deactivated)',
      data: deactivated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'खाता निष्क्रिय करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const updateUserPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const updated = await userService.updateUserPermissions(
      req.params.id,
      permissions,
      req.user?._id
    );
    return res.status(200).json({
      success: true,
      message: 'अनुमतियां सफलतापूर्वक अद्यतित की गईं (Permissions updated)',
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'अनुमति अपडेट करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getCommitteeMembers = async (req, res) => {
  try {
    const members = await userService.getCommitteeMembers();
    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'समिति सदस्य सूची प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

const getUserCounts = async (req, res) => {
  try {
    const counts = await userService.getUserCounts();
    return res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'उपयोगकर्ता गणना प्राप्त करने में त्रुटि',
      errors: [error.message],
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createCommitteeMember,
  updateUser,
  activateUser,
  deactivateUser,
  updateUserPermissions,
  getCommitteeMembers,
  getUserCounts,
};
