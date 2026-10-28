/**
 * Formatters and UI Helpers - Phase 3
 * Standardized currency formatting, dates, phone masking, and dictionary badges
 */

/**
 * Format currency in Indian Rupees (INR)
 * e.g., 25000 -> ₹25,000
 */
export const formatINR = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format ISO date string into readable Indian format
 * e.g., 2026-02-15T... -> 15 Feb 2026
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

/**
 * Format date for input elements (YYYY-MM-DD)
 */
export const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

/**
 * Mask mobile numbers for public transparency
 * e.g., 9826012345 -> 98260XXXXX
 */
export const maskMobile = (mobile) => {
  if (!mobile) return '—';
  const clean = String(mobile).replace(/\D/g, '');
  if (clean.length >= 10) {
    return clean.slice(0, 5) + 'XXXXX';
  }
  return clean.length > 3 ? clean.slice(0, 3) + '***' : '***';
};

/**
 * Human-readable donation type labels with Hindi translation
 */
export const DONATION_TYPES = {
  cash: { label: 'नगद (Cash)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  upi: { label: 'यूपीआई (UPI)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  bank_transfer: { label: 'बैंक ट्रांसफर (NEFT/RTGS)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  item: { label: 'वस्तु दान (Item)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  mixed: { label: 'मिश्रित (Cash + Item)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  other: { label: 'अन्य (Other)', color: 'bg-stone-50 text-stone-700 border-stone-200' },
};

/**
 * Human-readable payment method labels
 */
export const PAYMENT_METHODS = {
  cash: 'नगद (Cash)',
  upi: 'UPI / क्यूआर कोड',
  bank_transfer: 'बैंक ट्रांसफर (NEFT / IMPS)',
  cheque: 'चेक (Cheque)',
  other: 'अन्य / वस्तु (Other)',
};

/**
 * Income category labels
 */
export const INCOME_CATEGORIES = {
  donation: 'दान सहयोग (Donation)',
  event_income: 'उत्सव एवं बोली (Event Income)',
  rental: 'धर्मशाला / भवन सहयोग (Hall Seva)',
  sponsorship: 'अन्नक्षेत्र प्रायोजन (Sponsorship)',
  other: 'विविध आय (Other Income)',
};

/**
 * Expense category labels
 */
export const EXPENSE_CATEGORIES = {
  temple_maintenance: 'मंदिर रख-रखाव (Maintenance)',
  electricity: 'विद्युत देयक (Electricity)',
  water: 'जल व्यवस्था (Water)',
  construction: 'निर्माण एवं जीर्णोद्धार (Construction)',
  decoration: 'श्रृंगार एवं सजावट (Decoration)',
  event: 'उत्सव एवं आयोजन (Festival / Event)',
  travel: 'यात्रा एवं परिवहन (Travel)',
  food: 'प्रसाद एवं अन्नक्षेत्र (Food / Prasad)',
  cleaning: 'सफाई एवं स्वच्छता (Cleaning)',
  salary: 'पुजारी एवं मानदेय (Honorarium / Salary)',
  equipment: 'उपकरण एवं सामग्री (Equipment)',
  other: 'अन्य व्यय (Other)',
};

/**
 * Verification status badge helper
 */
export const getStatusBadge = (status) => {
  switch (status) {
    case 'verified':
      return {
        label: 'सत्यापित (Verified)',
        bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'pending':
      return {
        label: 'लंबित (Pending)',
        bgClass: 'bg-amber-100 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'rejected':
      return {
        label: 'अस्वीकृत (Rejected)',
        bgClass: 'bg-rose-100 text-rose-800 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'cancelled':
      return {
        label: 'रद्द (Cancelled)',
        bgClass: 'bg-gray-100 text-gray-800 border-gray-200',
        dotClass: 'bg-gray-500',
      };
    default:
      return {
        label: status || 'अज्ञात',
        bgClass: 'bg-gray-100 text-gray-700 border-gray-200',
        dotClass: 'bg-gray-400',
      };
  }
};
