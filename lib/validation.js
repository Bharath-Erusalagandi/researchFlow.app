// Input validation and sanitization utilities

/**
 * Sanitize a string by removing dangerous characters
 */
export function sanitizeString(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, ''); // Remove potentially dangerous HTML chars
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate search query
 */
export function validateSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query is required' };
  }
  
  const sanitized = sanitizeString(query, 200);
  
  if (sanitized.length < 2) {
    return { valid: false, error: 'Query must be at least 2 characters long' };
  }
  
  if (sanitized.length > 200) {
    return { valid: false, error: 'Query too long' };
  }
  
  return { valid: true, sanitized };
}

/**
 * Validate JWT token format
 */
export function isValidJWTFormat(token) {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Sanitize object for safe JSON response
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
} 