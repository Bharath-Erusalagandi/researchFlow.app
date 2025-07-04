// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated rate limiting service

const rateLimitMap = new Map();

export function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress || 'unknown'
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [entryKey, requests] of rateLimitMap.entries()) {
      if (requests.length === 0 || requests[0] < windowStart) {
        rateLimitMap.delete(entryKey);
      }
    }

    // Get current requests for this key
    const requests = rateLimitMap.get(key) || [];
    
    // Remove requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: message,
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    validRequests.push(now);
    rateLimitMap.set(key, validRequests);

    // Continue to next middleware/handler
    if (typeof next === 'function') {
      next();
    }
  };
}

// Wrapper for API routes
export function withRateLimit(handler, options = {}) {
  const limiter = rateLimit(options);
  
  return (req, res) => {
    limiter(req, res, () => {
      // Ensure proper async handling
      Promise.resolve(handler(req, res)).catch(error => {
        console.error('Handler error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    });
  };
} 