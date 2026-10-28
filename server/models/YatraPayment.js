const mongoose = require('mongoose');

/**
 * Yatra Payment Schema - Phase 5
 * Ledger records for partial payments, installments, and payment history per registration.
 * Keeps Yatra payments cleanly separated from Phase 3 temple donation/income models.
 */
const yatraPaymentSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'YatraRegistration',
      required: [true, 'Registration ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be greater than 0'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'upi', 'bank_transfer', 'cheque', 'other'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'cash',
    },
    transactionId: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['received', 'pending', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'received',
      index: true,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

yatraPaymentSchema.index({ registrationId: 1, paymentDate: -1 });

const YatraPayment = mongoose.model('YatraPayment', yatraPaymentSchema);

module.exports = YatraPayment;
