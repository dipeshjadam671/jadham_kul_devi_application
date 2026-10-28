const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const GalleryAlbum = require('../models/GalleryAlbum');
const GalleryMedia = require('../models/GalleryMedia');
const User = require('../models/User');

async function addPhotos() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jadam_kuldevi_mandir');
  console.log('✅ Connected to MongoDB');

  // Find an admin user
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.findOne({});
  }

  if (!admin) {
    console.error('❌ No user found in database.');
    process.exit(1);
  }

  console.log(`Using admin: ${admin.name} (${admin._id})`);

  // 1. Create or Update the new premier Album: "श्री जादम कुलदेवी मंदिर दर्शन एवं पावन प्रांगण"
  const albumName = 'श्री जादम कुलदेवी मंदिर दर्शन एवं पावन प्रांगण';
  const albumSlug = 'shri-jadam-kuldevi-mandir-darshan-evn-pavan-prangan';

  let album = await GalleryAlbum.findOne({ slug: albumSlug });
  if (!album) {
    album = await GalleryAlbum.create({
      name: albumName,
      slug: albumSlug,
      description: 'पवित्र नर्मदा तट, खलघाट स्थित माँ कुलदेवी का नवनिर्मित दिव्य मंदिर, भव्य प्रवेश द्वार, स्वास्तिक शिखर, शुभ-लाभ स्तम्भ, एवं गर्भगृह दर्शन',
      category: 'Temple Event',
      coverImageUrl: '/uploads/gallery/temple_main_entrance.jpg',
      eventDate: new Date('2026-03-21'),
      isPublished: true,
      createdBy: admin._id,
      updatedBy: admin._id,
    });
    console.log(`✅ Created album: "${album.name}" (${album._id})`);
  } else {
    album.coverImageUrl = '/uploads/gallery/temple_main_entrance.jpg';
    album.isPublished = true;
    await album.save();
    console.log(`ℹ️ Album already exists, updated cover: "${album.name}"`);
  }

  // Delete any existing media in this album to prevent duplicates when re-running
  await GalleryMedia.deleteMany({ albumId: album._id });

  // 2. Add media items to this album
  const newMediaItems = [
    {
      albumId: album._id,
      type: 'image',
      title: 'श्री जादम कुलदेवी मंदिर मुख्य प्रवेश द्वार एवं गर्भगृह दर्शन',
      description: 'श्री जादम कुलदेवी मंदिर का भव्य नक्काशीदार प्रवेश द्वार, स्वास्तिक शिखर, शुभ-लाभ कमल स्तम्भ, एवं गर्भगृह में विराजित कुलदेवी मां के पावन दर्शन',
      fileUrl: '/uploads/gallery/temple_main_entrance.jpg',
      thumbnailUrl: '/uploads/gallery/temple_main_entrance.jpg',
      mimeType: 'image/jpeg',
      fileSize: 270336,
      sortOrder: 1,
      isPublished: true,
      eventDate: new Date('2026-03-21'),
      uploadedBy: admin._id,
    },
    {
      albumId: album._id,
      type: 'image',
      title: 'माँ कुलदेवी गर्भगृह एवं अलौकिक दिव्य स्वरूप',
      description: 'स्वर्ण मुकुट, दिव्य आभूषणों एवं पुष्पमालाओं से सुशोभित माँ कुलदेवी के गर्भगृह के पावन दर्शन',
      fileUrl: '/uploads/gallery/mata_ji_sanctum_darshan.jpg',
      thumbnailUrl: '/uploads/gallery/mata_ji_sanctum_darshan.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1153433,
      sortOrder: 2,
      isPublished: true,
      eventDate: new Date('2026-03-21'),
      uploadedBy: admin._id,
    },
    {
      albumId: album._id,
      type: 'image',
      title: 'पवित्र नर्मदा तट - खलघाट संगम एवं मंदिर प्रांगण',
      description: 'सूर्योदय के समय पवित्र नर्मदा नदी, स्नान घाट की सीढ़ियां एवं पृष्ठभूमि में जादम कुलदेवी मंदिर का दिव्य शिखर',
      fileUrl: '/uploads/gallery/narmada_ghat_khalghat.jpg',
      thumbnailUrl: '/uploads/gallery/narmada_ghat_khalghat.jpg',
      mimeType: 'image/jpeg',
      fileSize: 836608,
      sortOrder: 3,
      isPublished: true,
      eventDate: new Date('2026-03-21'),
      uploadedBy: admin._id,
    },
    {
      albumId: album._id,
      type: 'image',
      title: 'संध्या महाआरती एवं दीप प्रज्वलन दर्शन',
      description: 'सैकड़ों दीपकों एवं वेदोक्त मंत्रोच्चार के साथ संपन्न भव्य संध्या महाआरती में सम्मिलित श्रद्धालु',
      fileUrl: '/uploads/gallery/temple_evening_aarti.jpg',
      thumbnailUrl: '/uploads/gallery/temple_evening_aarti.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1153433,
      sortOrder: 4,
      isPublished: true,
      eventDate: new Date('2026-03-21'),
      uploadedBy: admin._id,
    },
  ];

  await GalleryMedia.insertMany(newMediaItems);
  console.log(`✅ Inserted ${newMediaItems.length} photos into album "${album.name}"`);

  // 3. Update the existing "मंदिर जीर्णोद्धार एवं नवनिर्माण कार्य" album as well
  const renovationAlbum = await GalleryAlbum.findOne({ slug: 'mandir-jirnoddhar-evn-nv-nirman-kary' });
  if (renovationAlbum) {
    // Set the user's authentic photo as the cover image!
    renovationAlbum.coverImageUrl = '/uploads/gallery/temple_main_entrance.jpg';
    await renovationAlbum.save();

    // Check if the entrance photo is already in this album
    const existingPhoto = await GalleryMedia.findOne({
      albumId: renovationAlbum._id,
      fileUrl: '/uploads/gallery/temple_main_entrance.jpg',
    });

    if (!existingPhoto) {
      await GalleryMedia.create({
        albumId: renovationAlbum._id,
        type: 'image',
        title: 'मुख्य प्रवेश द्वार निर्माण पूर्णता दर्शन',
        description: 'नवनिर्मित भव्य प्रवेश द्वार, स्वास्तिक शिखर एवं गर्भगृह का पूर्ण स्वरूप',
        fileUrl: '/uploads/gallery/temple_main_entrance.jpg',
        thumbnailUrl: '/uploads/gallery/temple_main_entrance.jpg',
        mimeType: 'image/jpeg',
        fileSize: 270336,
        sortOrder: 1,
        isPublished: true,
        uploadedBy: admin._id,
      });
      console.log(`✅ Added entrance photo to "${renovationAlbum.name}" and updated cover image!`);
    }
  }

  // Print all albums and media count
  const allAlbums = await GalleryAlbum.find({});
  console.log('\n--- Current Gallery Summary ---');
  for (const a of allAlbums) {
    const count = await GalleryMedia.countDocuments({ albumId: a._id, isPublished: true });
    console.log(`- ${a.name} [${a.category}] (Slug: ${a.slug}): ${count} published photos/videos`);
  }

  process.exit(0);
}

addPhotos().catch((err) => {
  console.error('Error adding photos:', err);
  process.exit(1);
});
