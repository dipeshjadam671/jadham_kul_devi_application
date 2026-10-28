#!/usr/bin/env node

/**
 * Admin Bootstrap CLI Script - Phase 2
 *
 * Safe backend-only script to promote or create the FIRST temple administrator.
 *
 * Usage:
 *   node scripts/bootstrapAdmin.js --mobile="+919876543210" --name="Trustee Head"
 *   node scripts/bootstrapAdmin.js --uid="FIREBASE_UID_HERE" --name="Admin User"
 *
 * Security:
 *   Must be run with direct access to backend server and MongoDB.
 *   Cannot be invoked via public web endpoints.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, val] = arg.substring(2).split('=');
      if (val !== undefined) {
        parsed[key] = val;
      } else if (args[i + 1] && !args[i + 1].startsWith('--')) {
        parsed[key] = args[i + 1];
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
};

const bootstrapAdmin = async () => {
  const args = parseArgs();
  const mobile = args.mobile || process.env.ADMIN_BOOTSTRAP_MOBILE;
  const uid = args.uid || process.env.ADMIN_BOOTSTRAP_UID;
  const name = args.name || 'Temple Trustee / मुख्य प्रशासक';

  if (!mobile && !uid) {
    console.error('❌ Error: You must specify --mobile="+91XXXXXXXXXX" or --uid="FIREBASE_UID"');
    console.log('\nUsage Examples:');
    console.log('  node scripts/bootstrapAdmin.js --mobile="+919876543210" --name="Chief Trustee"');
    console.log('  node scripts/bootstrapAdmin.js --uid="wK73x..." --name="System Administrator"\n');
    process.exit(1);
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB.');

    let user;
    if (uid) {
      user = await User.findOne({ firebaseUid: uid });
    } else if (mobile) {
      user = await User.findOne({ mobile });
    }

    if (user) {
      user.role = 'admin';
      user.isActive = true;
      if (name) user.name = name;
      await user.save();
      console.log('\n🎉 SUCCESS: Existing user successfully promoted to ADMIN:');
    } else {
      user = await User.create({
        firebaseUid: uid || `bootstrap_admin_${Date.now()}`,
        name: name,
        mobile: mobile || '',
        role: 'admin',
        permissions: ['ALL'],
        isActive: true,
      });
      console.log('\n🎉 SUCCESS: New ADMINISTRATOR profile created in MongoDB:');
    }

    console.log('---------------------------------------------------------');
    console.log(`ID:           ${user._id}`);
    console.log(`Name:         ${user.name}`);
    console.log(`Mobile:       ${user.mobile || '(Not set)'}`);
    console.log(`Role:         ${user.role}`);
    console.log(`Firebase UID: ${user.firebaseUid}`);
    console.log(`Active:       ${user.isActive}`);
    console.log('---------------------------------------------------------');
    console.log('✨ This user will now have full administrator access to /admin/dashboard.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Bootstrap Failed: ${error.message}`);
    process.exit(1);
  }
};

bootstrapAdmin();
