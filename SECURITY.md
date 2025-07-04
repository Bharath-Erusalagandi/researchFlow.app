# Security Guide

## Environment Variables Setup

### Required Server-Side Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# External APIs
GROQ_API_KEY=your-groq-api-key

# Client-side variables (these are safe to be public)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## Security Features Implemented

### 1. **Authentication & Authorization**
- Supabase-based authentication with Google OAuth
- Protected routes and proper session management
- Secure token handling

### 2. **Input Validation & Sanitization**
- All user inputs are validated and sanitized
- Query length limits enforced
- Dangerous characters removed from inputs
- Type checking on all API parameters

### 3. **Rate Limiting**
- API endpoints protected against abuse
- 30 requests per 15 minutes for search endpoints
- Graceful handling of rate limit exceeded scenarios

### 4. **Security Headers**
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy for browser features

### 5. **Error Handling**
- Sensitive information not exposed in error messages
- Proper error logging for debugging
- Generic error responses to prevent information disclosure

## Security Checklist for Deployment

### Pre-Deployment
- [ ] All environment variables are set up correctly
- [ ] API keys are stored as secrets (not in code)
- [ ] Dependencies are updated to latest secure versions
- [ ] No hardcoded credentials in source code

### Production Security
- [ ] HTTPS enabled for all traffic

## Known Limitations

1. **Rate Limiting**: Currently uses in-memory storage. For production scale, consider Redis.
2. **CSRF Protection**: Implement CSRF tokens for forms if adding state-changing operations.
3. **Content Security Policy**: Add CSP headers for enhanced XSS protection.

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not create public GitHub issues for security vulnerabilities
2. Contact the development team directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure 