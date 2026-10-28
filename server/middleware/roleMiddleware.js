/**
 * Role & Permission Authorization Middleware - Phase 2
 *
 * Rules:
 * - Checks the trusted role and permissions stored in the MongoDB User document.
 * - NEVER trusts any role supplied by the client or in the request body.
 */

/**
 * Require one of the specified roles to proceed
 * @param {...string} allowedRoles - Allowed roles, e.g. 'admin', 'committee'
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No user context found.',
        errors: ['User is not authenticated'],
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${userRole}' is not authorized to access this resource.`,
        errors: [
          `Your role (${userRole}) does not have permission. Required role(s): ${allowedRoles.join(', ')}`,
        ],
      });
    }

    next();
  };
};

/**
 * Require specific permission(s) to proceed
 * Admins automatically bypass permission checks.
 * @param {...string} requiredPermissions - Permissions required for the action
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        errors: ['User is not authenticated'],
      });
    }

    // Admins have all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];

    // Default committee base permissions for routine operational entry
    const committeeBase = [
      'DONATION_VIEW',
      'DONATION_CREATE',
      'DONATION_UPDATE',
      'INCOME_VIEW',
      'INCOME_CREATE',
      'INCOME_UPDATE',
      'EXPENSE_VIEW',
      'EXPENSE_CREATE',
      'EXPENSE_UPDATE',
      'FINANCIAL_REPORT_VIEW',
    ];

    const effectivePermissions =
      req.user.role === 'committee'
        ? Array.from(new Set([...userPermissions, ...committeeBase]))
        : userPermissions;

    const hasAllPermissions = requiredPermissions.every((perm) => effectivePermissions.includes(perm));

    if (!hasAllPermissions) {
      const missing = requiredPermissions.filter((perm) => !effectivePermissions.includes(perm));
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not possess the necessary permissions.',
        errors: [`Missing required permissions: ${missing.join(', ')}`],
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
  requirePermission,
};
