const crypto = require('crypto');

/**
 * Hindi to Latin character and word mapping dictionary
 */
const HINDI_MAP = {
  'नवरात्रि': 'navratri',
  'महोत्सव': 'mahotsav',
  'रामनवमी': 'ram-navami',
  'अष्टमी': 'ashtami',
  'नवमी': 'navami',
  'पूर्णिमा': 'purnima',
  'आरती': 'aarti',
  'महाआरती': 'maha-aarti',
  'पूजा': 'puja',
  'हवन': 'havan',
  'अन्नक्षेत्र': 'annakshetra',
  'भंडारा': 'bhandara',
  'मंदिर': 'mandir',
  'कुलदेवी': 'kuldevi',
  'जादम': 'jadam',
  'खलघाट': 'khalghat',
  'नर्मदा': 'narmada',
  'उत्सव': 'utsav',
  'दर्शन': 'darshan',
  'यात्रा': 'yatra',
  'वार्षिक': 'varshik',
  'बैठक': 'baithak',
  'निर्माण': 'nirman',
  'जीर्णोद्धार': 'jirnoddhar',
  'सूचना': 'suchna',
  'घोषणा': 'ghoshna',
};

// Hindi vowels and consonants transliteration
const CHAR_MAP = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', '्': '',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

/**
 * Generate clean URL-safe slug from text
 * Supports Hindi and English mix
 */
const generateSlug = (text = '', addRandomSuffix = false) => {
  if (!text || typeof text !== 'string') {
    text = 'notice';
  }

  let str = text.trim().toLowerCase();

  // Replace recognized Hindi keywords
  Object.keys(HINDI_MAP).forEach((word) => {
    str = str.replace(new RegExp(word, 'g'), ` ${HINDI_MAP[word]} `);
  });

  // Replace individual characters
  let transliterated = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (CHAR_MAP[char] !== undefined) {
      transliterated += CHAR_MAP[char];
    } else {
      transliterated += char;
    }
  }

  // Sanitize to alphanumeric and hyphens
  let slug = transliterated
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .trim()
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores to single hyphen
    .replace(/^-+|-+$/g, ''); // trim leading and trailing hyphens

  if (!slug) {
    slug = 'item';
  }

  if (addRandomSuffix) {
    const randomHex = crypto.randomBytes(3).toString('hex');
    slug = `${slug}-${randomHex}`;
  }

  return slug;
};

/**
 * Ensure uniqueness of slug against a Mongoose model
 */
const generateUniqueSlug = async (model, text, currentDocId = null) => {
  let baseSlug = generateSlug(text, false);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentDocId) {
      query._id = { $ne: currentDocId };
    }

    const existing = await model.findOne(query).select('_id').lean();
    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

module.exports = {
  generateSlug,
  generateUniqueSlug,
};
