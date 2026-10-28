const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TempleInfo = require('../models/TempleInfo');
const TempleRule = require('../models/TempleRule');
const Notice = require('../models/Notice');
const GalleryAlbum = require('../models/GalleryAlbum');
const GalleryMedia = require('../models/GalleryMedia');
const { generateUniqueSlug, generateSlug } = require('../utils/slugify');
const { validateMediaFile } = require('../services/uploadService');

const runTests = async () => {
  console.log('🧪 Starting Phase 4 Temple Content & Gallery Verification Suite...\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jadam_kuldevi_mandir';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      testsFailed++;
    }
  };

  try {
    // 1. Test TempleInfo Singleton
    console.log('\n--- 1. Testing TempleInfo Model & Singleton Data ---');
    const info = await TempleInfo.findOne();
    assert(info !== null, 'TempleInfo singleton exists in database');
    assert(info.title.includes('जादम परिवार कुलदेवी'), `Temple title is correct: "${info.title}"`);
    assert(info.templeTimings && info.templeTimings.days.length === 7, `Temple weekly timings has 7 days (Actual: ${info.templeTimings.days.length})`);
    assert(info.templeTimings.morningAarti === '07:00 AM', `Morning Aarti is configured: ${info.templeTimings.morningAarti}`);
    assert(info.mataJiHistory && info.mataJiHistory.length > 50, 'Mata Ji History is present and rich');
    assert(info.templeIntroduction && info.templeIntroduction.length > 50, 'Temple Introduction is present and rich');
    assert(info.contactMobile && info.contactEmail, `Contact info present (${info.contactMobile}, ${info.contactEmail})`);

    // 2. Test Temple Rules & 15-Rule Cap
    console.log('\n--- 2. Testing Temple Rules & 15-Cap Boundary ---');
    const rules = await TempleRule.find({ isActive: true }).sort({ order: 1 });
    assert(rules.length === 15, `Exactly 15 Temple Rules are present (Actual: ${rules.length})`);
    
    // Check ordering is sequential 1 to 15
    let orderValid = true;
    for (let i = 0; i < rules.length; i++) {
      if (rules[i].order !== i + 1) {
        orderValid = false;
        break;
      }
    }
    assert(orderValid, 'Rules are sequentially ordered from 1 to 15');

    // Attempting to create a 16th rule should fail validation (order max is 15)
    let rule16Failed = false;
    try {
      const invalidRule = new TempleRule({
        title: 'Rule 16 Test',
        order: 16,
        createdBy: info.updatedBy,
      });
      await invalidRule.validate();
    } catch (err) {
      rule16Failed = true;
    }
    assert(rule16Failed, 'Validation rejects rule order > 15 (max 15 enforced)');

    // 3. Test Hindi Slugify & Unique Collision Generation
    console.log('\n--- 3. Testing Hindi Slugify & Collision Avoidance ---');
    const hindiTitle = 'चैत्र नवरात्रि महापर्व एवं शतचंडी महायज्ञ 2026';
    const slug1 = generateSlug(hindiTitle);
    assert(slug1.includes('navratri'), `Hindi text transliterated to Latin slug: "${slug1}"`);

    const uniqueSlug = await generateUniqueSlug(Notice, hindiTitle);
    assert(typeof uniqueSlug === 'string' && uniqueSlug.length > 0, `Unique slug generated: "${uniqueSlug}"`);

    // 4. Test Public vs Draft Notice Isolation & Pin Ordering
    console.log('\n--- 4. Testing Notice Public Isolation & Pinning ---');
    const totalNotices = await Notice.countDocuments();
    const publicNotices = await Notice.find({ status: 'published', isPublic: true })
      .sort({ isPinned: -1, eventDate: 1, createdAt: -1 });

    assert(totalNotices === 4, `Total notices in database is 4 (Actual: ${totalNotices})`);
    assert(publicNotices.length === 3, `Public notices is exactly 3; drafts excluded (Actual: ${publicNotices.length})`);
    
    const draftNotice = await Notice.findOne({ status: 'draft' });
    assert(draftNotice !== null, 'Draft notice exists in database');
    const draftInPublic = publicNotices.some(n => n._id.toString() === draftNotice._id.toString());
    assert(!draftInPublic, 'Draft notice is strictly excluded from public list');

    assert(publicNotices[0].isPinned === true, `First public notice is pinned: "${publicNotices[0].title}"`);

    // 5. Test Gallery Album & Media Isolation
    console.log('\n--- 5. Testing Gallery Albums & Media Public Isolation ---');
    const publishedAlbums = await GalleryAlbum.find({ isPublished: true });
    assert(publishedAlbums.length >= 2, `Found published albums (Actual: ${publishedAlbums.length})`);

    const navratriAlbum = publishedAlbums.find(a => a.name.includes('नवरात्रि'));
    assert(navratriAlbum !== undefined, 'Navratri album found');

    // Total media items for this album
    const totalMedia = await GalleryMedia.find({ albumId: navratriAlbum._id });
    assert(totalMedia.length === 4, `Total media for Navratri album in DB is 4 (Actual: ${totalMedia.length})`);

    // Public query: only published items
    const publicMedia = await GalleryMedia.find({ albumId: navratriAlbum._id, isPublished: true })
      .sort({ sortOrder: 1, createdAt: -1 });
    assert(publicMedia.length === 3, `Public media query returns only 3 published items (Actual: ${publicMedia.length})`);

    const hasUnpublished = publicMedia.some(m => !m.isPublished);
    assert(!hasUnpublished, 'Unpublished media is strictly excluded from public media response');

    const videoMedia = publicMedia.find(m => m.type === 'video');
    assert(videoMedia !== undefined && videoMedia.duration > 0, `Video media present with duration: ${videoMedia ? videoMedia.duration : 0}s`);

    // 6. Test File Upload Validation Service
    console.log('\n--- 6. Testing Upload Service Size & MIME Validation ---');
    // Test valid image
    const validImage = { buffer: Buffer.from('mock'), originalname: 'test.jpg', mimetype: 'image/jpeg', size: 5 * 1024 * 1024 };
    let valImgPassed = false;
    try {
      const res = validateMediaFile(validImage);
      valImgPassed = res.mediaType === 'image';
    } catch (e) {
      valImgPassed = false;
    }
    assert(valImgPassed, '5MB JPEG image passes media validation');

    // Test oversize image (>10MB)
    const oversizeImage = { buffer: Buffer.from('mock'), originalname: 'large.jpg', mimetype: 'image/jpeg', size: 12 * 1024 * 1024 };
    let overImgRejected = false;
    try {
      validateMediaFile(oversizeImage);
    } catch (e) {
      overImgRejected = e.message.includes('exceeds limit of 10 MB');
    }
    assert(overImgRejected, '12MB JPEG image rejected (10MB limit)');

    // Test valid video
    const validVideo = { buffer: Buffer.from('mock'), originalname: 'clip.mp4', mimetype: 'video/mp4', size: 50 * 1024 * 1024 };
    let valVidPassed = false;
    try {
      const res = validateMediaFile(validVideo);
      valVidPassed = res.mediaType === 'video';
    } catch (e) {
      valVidPassed = false;
    }
    assert(valVidPassed, '50MB MP4 video passes media validation');

    // Test oversize video (>100MB)
    const oversizeVideo = { buffer: Buffer.from('mock'), originalname: 'long.mp4', mimetype: 'video/mp4', size: 105 * 1024 * 1024 };
    let overVidRejected = false;
    try {
      validateMediaFile(oversizeVideo);
    } catch (e) {
      overVidRejected = e.message.includes('exceeds limit of 100 MB');
    }
    assert(overVidRejected, '105MB MP4 video rejected (100MB limit)');

    // Test unsupported mime type (e.g. PDF)
    const pdfFile = { buffer: Buffer.from('mock'), originalname: 'doc.pdf', mimetype: 'application/pdf', size: 1024 * 1024 };
    let pdfRejected = false;
    try {
      validateMediaFile(pdfFile);
    } catch (e) {
      pdfRejected = e.message.includes('Unsupported file format');
    }
    assert(pdfRejected, 'PDF document rejected for gallery media upload');

    // Summary
    console.log('\n======================================');
    console.log(`Phase 4 Backend Suite: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('======================================\n');

    if (testsFailed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
