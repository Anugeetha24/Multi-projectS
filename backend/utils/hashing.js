const crypto = require('crypto');

/**
 * Computes a SHA-256 hash of the input text.
 * @param {string} text - Input content to compute hash for.
 * @returns {string} - The hex-encoded SHA-256 hash.
 */
function computeHash(text) {
  if (typeof text !== 'string') {
    text = String(text || '');
  }
  return crypto.createHash('sha256').update(text).digest('hex');
}

module.exports = { computeHash };
