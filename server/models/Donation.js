const mongoose = require('mongoose');

/**
 * Donation Schema - Phase 3
 * Manages monetary, item, and mixed donations with server-side value computation
 */
const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
      maxlength: [100, 'Donor name cannot exceed 100 characters'],
      index: true,
    },
    village: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    donationDate: {
      type: Date,
      required: [true, 'Donation date is required'],
      default: Date.now,
      index: true,
    },
    donationType: {
      type: String,
      required: [true, 'Donation type is required'],
      enum: {
        values: ['cash', 'upi', 'bank_transfer', 'other', 'item', 'mixed'],
        message: '{VALUE} is not a valid donation type',
      },
      index: true,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cash', 'upi', 'bank_transfer', 'cheque', 'other'],
        message: '{VALUE} is not a valid payment method',
      },
      index: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Amount cannot be negative'],
    },
    // Item donation fields
    itemName: {
      type: String,
      trim: true,
      default: '',
    },
    itemQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Item quantity cannot be negative'],
    },
    itemUnit: {
      type: String,
      trim: true,
      default: '',
    },
    itemPrice: {
      type: Number,
      default: 0,
      min: [0, 'Item unit price cannot be negative'],
    },
    itemTotalValue: {
      type: Number,
      default: 0,
      min: [0, 'Item total value cannot be negative'],
    },
    // Total Financial Value = Cash Amount + Item Total Value
    totalFinancialValue: {
      type: Number,
      default: 0,
      min: [0, 'Total financial value cannot be negative'],
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected', 'cancelled'],
        message: '{VALUE} is not a valid verification status',
      },
      default: 'pending',
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    purpose: {
      type: String,
      trim: true,
      default: 'सामान्य दान (General Donation)',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculation hook: guarantees total and item values are computed on server
donationSchema.pre('save', function (next) {
  const isItem = this.donationType === 'item' || this.donationType === 'mixed';
  if (isItem) {
    const qty = Number(this.itemQuantity) || 0;
    const price = Number(this.itemPrice) || 0;
    this.itemTotalValue = qty * price;
  } else {
    this.itemQuantity = 0;
    this.itemPrice = 0;
    this.itemTotalValue = 0;
  }

  const monetaryAmount = Number(this.amount) || 0;
  this.totalFinancialValue = monetaryAmount + (this.itemTotalValue || 0);

  next();
});

// Helper to mask donor phone number for public display
donationSchema.methods.getPublicView = function () {
  let maskedMobile = '';
  if (this.mobile && this.mobile.length >= 10) {
    const clean = this.mobile.replace(/[^0-9]/g, '');
    if (clean.length >= 10) {
      maskedMobile = clean.slice(0, 5) + 'XXXXX';
    }
  }

  return {
    id: this._id,
    donorName: this.donorName,
    village: this.village,
    city: this.city,
    donationDate: this.donationDate,
    donationType: this.donationType,
    amount: this.amount,
    itemName: this.itemName,
    itemQuantity: this.itemQuantity,
    itemUnit: this.itemUnit,
    totalFinancialValue: this.totalFinancialValue,
    receiptNumber: this.receiptNumber,
    purpose: this.purpose,
    mobileMasked: maskedMobile,
  };
};

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
