const TempleRule = require('../models/TempleRule');

/**
 * Temple Rule Controller - Phase 4
 * Manages up to 15 prioritized sacred rules and decorum guidelines
 */

/**
 * Get Temple Rules (Public or Admin)
 * GET /api/v1/temple-rules
 */
const getTempleRules = async (req, res) => {
  try {
    const { all } = req.query;
    const query = {};

    // Only return active rules unless explicitly querying 'all' with authorized context
    if (all !== 'true' || !req.user) {
      query.isActive = true;
    }

    const rules = await TempleRule.find(query)
      .sort({ order: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error('Error fetching temple rules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve temple rules.',
      errors: [error.message],
    });
  }
};

/**
 * Create a new rule
 * POST /api/v1/temple-rules
 */
const createTempleRule = async (req, res) => {
  try {
    const { title, description, order, isActive } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rule title is required.',
        errors: ['title cannot be empty'],
      });
    }

    const totalRules = await TempleRule.countDocuments();
    if (totalRules >= 15) {
      return res.status(400).json({
        success: false,
        message: 'Maximum limit of 15 temple rules reached.',
        errors: ['Cannot create more than 15 rules'],
      });
    }

    // Default order to next available index
    const nextOrder = order ? Number(order) : totalRules + 1;

    const rule = new TempleRule({
      title: title.trim(),
      description: description ? description.trim() : '',
      order: Math.min(15, Math.max(1, nextOrder)),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy: req.user._id,
    });

    await rule.save();

    return res.status(201).json({
      success: true,
      message: 'Temple rule created successfully.',
      data: rule,
    });
  } catch (error) {
    console.error('Error creating temple rule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create temple rule.',
      errors: [error.message],
    });
  }
};

/**
 * Update rule
 * PUT /api/v1/temple-rules/:id
 */
const updateTempleRule = async (req, res) => {
  try {
    const rule = await TempleRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Temple rule not found.',
      });
    }

    if (req.body.title !== undefined) rule.title = req.body.title.trim();
    if (req.body.description !== undefined) rule.description = req.body.description.trim();
    if (req.body.order !== undefined) rule.order = Math.min(15, Math.max(1, Number(req.body.order)));
    if (req.body.isActive !== undefined) rule.isActive = Boolean(req.body.isActive);

    rule.updatedBy = req.user._id;
    await rule.save();

    return res.status(200).json({
      success: true,
      message: 'Temple rule updated successfully.',
      data: rule,
    });
  } catch (error) {
    console.error('Error updating temple rule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update temple rule.',
      errors: [error.message],
    });
  }
};

/**
 * Delete rule
 * DELETE /api/v1/temple-rules/:id
 */
const deleteTempleRule = async (req, res) => {
  try {
    const rule = await TempleRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Temple rule not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Temple rule deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting temple rule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete temple rule.',
      errors: [error.message],
    });
  }
};

/**
 * Reorder rules in bulk
 * PATCH /api/v1/temple-rules/reorder
 */
const reorderTempleRules = async (req, res) => {
  try {
    const { items } = req.body; // array of { id, order }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array with id and order is required.',
      });
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: {
          $set: {
            order: Math.min(15, Math.max(1, Number(item.order))),
            updatedBy: req.user._id,
          },
        },
      },
    }));

    await TempleRule.bulkWrite(bulkOps);

    const updatedRules = await TempleRule.find().sort({ order: 1 });

    return res.status(200).json({
      success: true,
      message: 'Temple rules reordered successfully.',
      data: updatedRules,
    });
  } catch (error) {
    console.error('Error reordering temple rules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reorder temple rules.',
      errors: [error.message],
    });
  }
};

module.exports = {
  getTempleRules,
  createTempleRule,
  updateTempleRule,
  deleteTempleRule,
  reorderTempleRules,
};
