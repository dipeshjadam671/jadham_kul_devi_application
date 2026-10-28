/**
 * Sanitization and text formatting utilities - Phase 4
 */

/**
 * Escapes HTML characters to prevent XSS injection
 * @param {string} str 
 * @returns {string} Safe escaped string
 */
export const escapeHtml = (str = '') => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Converts multiline text into paragraphs or safe line breaks
 * @param {string} text 
 * @returns {string[]} Array of non-empty paragraphs
 */
export const splitParagraphs = (text = '') => {
  if (!text || typeof text !== 'string') return [];
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
};

/**
 * Formats date into Hindi/Indian local date string
 * @param {string|Date} dateVal 
 * @param {boolean} includeTime
 * @returns {string} Formatted date
 */
export const formatIndianDate = (dateVal, includeTime = false) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return d.toLocaleDateString('hi-IN', options);
  } catch (err) {
    return '';
  }
};
