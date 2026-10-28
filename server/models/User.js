const mongoose = require('mongoose');

/**
 * User Schema - Extended for Phase 6
 * Stores application-level profile, committee roles, and authorization information.
 * All authentication credentials (passwords, OTPs, session keys) are managed
 * exclusively through Firebase Authentication.
 * 
 * Supports pre-provisioning committee members by mobile number before their
 * first Firebase Phone OTP authentication.
 */
const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
      trim: true,
    },
    username: {
      type: String,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      default: 'Devotee / सदस्य',
    },
    mobile: {
      type: String,
      trim: true,
      index: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['public', 'committee', 'admin'],
        message: '{VALUE} is not a valid role. Allowed roles: public, committee, admin',
      },
      default: 'public',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended'],
        message: '{VALUE} is not a valid status. Allowed statuses: active, inactive, suspended',
      },
      default: 'active',
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize status and isActive before saving
userSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.isActive = this.status === 'active';
  } else if (this.isModified('isActive')) {
    this.status = this.isActive ? 'active' : 'inactive';
  }
  next();
});

// Method to format user data safely for client consumption
userSchema.methods.toSafeObject = function (options = {}) {
  const safeObj = {
    id: this._id.toString(),
    username: this.username || null,
    name: this.name,
    mobile: this.mobile,
    email: this.email,
    role: this.role,
    status: this.status || (this.isActive ? 'active' : 'inactive'),
    permissions: this.permissions || [],
    isActive: this.isActive !== false && this.status === 'active',
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  if (options.includeFirebaseUid && this.firebaseUid) {
    safeObj.firebaseUid = this.firebaseUid;
  }

  return safeObj;
};

// Helpful role check methods
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

userSchema.methods.isCommittee = function () {
  return this.role === 'committee' || this.role === 'admin';
};

userSchema.methods.hasPermission = function (permission) {
  if (this.role === 'admin') return true;
  return Array.isArray(this.permissions) && this.permissions.includes(permission);
};

/**
 * Checks if the current admin user can be deactivated safely.
 * Self-protection: Prevents deactivating the only remaining active admin.
 */
userSchema.methods.canBeDeactivated = async function () {
  if (this.role !== 'admin') {
    return { canDeactivate: true };
  }

  const activeAdminCount = await mongoose.model('User').countDocuments({
    role: 'admin',
    status: 'active',
    _id: { $ne: this._id },
  });

  if (activeAdminCount === 0) {
    return {
      canDeactivate: false,
      reason: 'Cannot deactivate the last active administrator account.',
    };
  }

  return { canDeactivate: true };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
