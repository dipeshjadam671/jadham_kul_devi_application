const express = require('express');
const router = express.Router();
const {
  getTempleRules,
  createTempleRule,
  updateTempleRule,
  deleteTempleRule,
  reorderTempleRules,
} = require('../controllers/templeRuleController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Temple Rules Routes - Phase 4
 */

// Public endpoint (also works for authenticated users querying all)
router.get('/', (req, res, next) => {
  // Optional auth middleware so req.user is populated if token is present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateUser(req, res, next);
  }
  next();
}, getTempleRules);

// Protected Admin Endpoints
router.use(authenticateUser);

router.post('/', requirePermission(PERMISSIONS.TEMPLE_RULE_MANAGE), createTempleRule);
router.patch('/reorder', requirePermission(PERMISSIONS.TEMPLE_RULE_MANAGE), reorderTempleRules);
router.put('/:id', requirePermission(PERMISSIONS.TEMPLE_RULE_MANAGE), updateTempleRule);
router.delete('/:id', requirePermission(PERMISSIONS.TEMPLE_RULE_MANAGE), deleteTempleRule);

module.exports = router;
