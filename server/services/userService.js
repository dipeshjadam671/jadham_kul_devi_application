const User = require('../models/User');
const { normalizePhone } = require('../middleware/authMiddleware');

/**
 * User & Committee Management Service - Phase 6
 * Handles user directory, committee pre-provisioning, role/permission assignment,
 * and admin self-protection.
 */

/**
 * Retrieves paginated list of users
 */
const getUsers = async (query = {}) => {
  const {
    role,
    status,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (status) {
    filter.status = status;
  }

  if (search && search.trim()) {
    const s = search.trim();
    const regex = new RegExp(s, 'i');
    filter.$or = [
      { name: regex },
      { mobile: regex },
      { email: regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [rawUsers, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name mobile')
      .populate('updatedBy', 'name mobile'),
    User.countDocuments(filter),
  ]);

  const users = rawUsers.map((u) => u.toSafeObject());

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Retrieves a single user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id)
    .populate('createdBy', 'name mobile')
    .populate('updatedBy', 'name mobile');

  if (!user) {
    throw new Error('User not found');
  }

  return user.toSafeObject({ includeFirebaseUid: true });
};

/**
 * Creates / Pre-provisions a Committee Member
 * Validates mobile number and assigns initial permissions.
 * Does not require passwords — user will authenticate via Firebase Phone OTP.
 */
const createCommitteeMember = async (data, adminUserId) => {
  const { name, mobile, email, permissions = [], notes } = data;

  if (!name || !name.trim()) {
    throw new Error('Committee member name is required');
  }
  if (!mobile || !mobile.trim()) {
    throw new Error('Valid mobile number is required for committee member');
  }

  const rawPhone = mobile.trim();
  const normalized = normalizePhone(rawPhone);
  const rawDigits = rawPhone.replace(/\D/g, '').slice(-10);

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { mobile: rawPhone },
      { mobile: normalized },
      { mobile: rawDigits },
      { mobile: `+91${rawDigits}` },
    ],
  });

  if (existingUser) {
    if (existingUser.role === 'committee' || existingUser.role === 'admin') {
      throw new Error(`User with mobile ${rawPhone} is already registered as ${existingUser.role}.`);
    }

    // Upgrade existing public devotee to committee
    existingUser.name = name.trim();
    existingUser.role = 'committee';
    existingUser.status = 'active';
    existingUser.isActive = true;
    existingUser.permissions = Array.isArray(permissions) ? permissions : [];
    existingUser.updatedBy = adminUserId || null;
    if (email) existingUser.email = email.trim();

    const saved = await existingUser.save();
    return saved.toSafeObject();
  }

  // Pre-create new committee record
  const newMember = new User({
    name: name.trim(),
    mobile: normalized,
    email: email ? email.trim() : '',
    role: 'committee',
    status: 'active',
    isActive: true,
    permissions: Array.isArray(permissions) ? permissions : [],
    createdBy: adminUserId || null,
    updatedBy: adminUserId || null,
  });

  const saved = await newMember.save();
  return saved.toSafeObject();
};

/**
 * Updates user profile, role, status, and permissions
 * Enforces admin self-protection rules.
 */
const updateUser = async (id, data, adminUserId) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error('User not found');
  }

  // Prevent modifying firebaseUid directly
  delete data.firebaseUid;
  delete data.createdBy;

  // Check admin self-protection if altering role or deactivating
  const isDemotingAdmin =
    user.role === 'admin' && data.role && data.role !== 'admin';
  const isDeactivatingAdmin =
    user.role === 'admin' &&
    ((data.status && data.status !== 'active') || data.isActive === false);

  if (isDemotingAdmin || isDeactivatingAdmin) {
    const { canDeactivate, reason } = await user.canBeDeactivated();
    if (!canDeactivate) {
      throw new Error(reason || 'Cannot deactivate or demote the last active administrator.');
    }
  }

  if (data.name) user.name = data.name.trim();
  if (data.mobile) user.mobile = data.mobile.trim();
  if (data.email !== undefined) user.email = data.email.trim();
  if (data.role) user.role = data.role;
  if (data.status) {
    user.status = data.status;
    user.isActive = data.status === 'active';
  }
  if (data.permissions !== undefined && Array.isArray(data.permissions)) {
    user.permissions = data.permissions;
  }

  user.updatedBy = adminUserId || null;

  const saved = await user.save();
  return saved.toSafeObject();
};

/**
 * Activates a user account
 */
const activateUser = async (id, adminUserId) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }

  user.status = 'active';
  user.isActive = true;
  user.updatedBy = adminUserId || null;

  const saved = await user.save();
  return saved.toSafeObject();
};

/**
 * Deactivates a user account with admin self-protection
 */
const deactivateUser = async (id, adminUserId) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }

  const { canDeactivate, reason } = await user.canBeDeactivated();
  if (!canDeactivate) {
    throw new Error(reason || 'Cannot deactivate the last active administrator.');
  }

  user.status = 'inactive';
  user.isActive = false;
  user.updatedBy = adminUserId || null;

  const saved = await user.save();
  return saved.toSafeObject();
};

/**
 * Updates permissions for a user
 */
const updateUserPermissions = async (id, permissions, adminUserId) => {
  if (!Array.isArray(permissions)) {
    throw new Error('Permissions must be an array of permission strings');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }

  user.permissions = permissions;
  user.updatedBy = adminUserId || null;

  const saved = await user.save();
  return saved.toSafeObject();
};

/**
 * Retrieves all committee members
 */
const getCommitteeMembers = async () => {
  const members = await User.find({
    role: { $in: ['committee', 'admin'] },
  }).sort({ role: 1, name: 1 });

  return members.map((m) => m.toSafeObject());
};

/**
 * Computes dashboard user statistics
 */
const getUserCounts = async () => {
  const [total, active, committee, admin] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active', isActive: true }),
    User.countDocuments({ role: 'committee', status: 'active' }),
    User.countDocuments({ role: 'admin', status: 'active' }),
  ]);

  return { total, active, committee, admin };
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
