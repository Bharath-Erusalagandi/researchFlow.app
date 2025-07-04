# Gmail API Direct Integration Setup Guide

This guide will help you set up direct Gmail API integration for sending emails in-browser without any third-party services.

## 🔧 Setup Requirements

### 1. Google Cloud Console Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Note down your Project ID

2. **Enable Gmail API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3001/api/gmail/callback` (for development)
     - `https://yourdomain.com/api/gmail/callback` (for production)

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Fill required fields (App name, User support email, etc.)
   - Add test users for development
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`

### 2. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/gmail/callback

# For production, use your domain:
# GOOGLE_REDIRECT_URI=https://yourdomain.com/api/gmail/callback
```

### 3. Required Dependencies

The following packages are already installed:
- `googleapis` - Google APIs client library
- `@google-cloud/local-auth` - Local authentication helper

## 📧 How It Works

### User Flow:
1. User clicks "Connect Gmail Account"
2. OAuth popup opens with Google consent screen
3. User grants Gmail send permissions
4. User is redirected back to app with tokens
5. User can now send emails directly from their Gmail

### Technical Implementation:

#### Authentication Flow:
- `/api/gmail/auth` - Generates OAuth URL
- `/api/gmail/callback` - Handles OAuth callback and stores tokens
- `/api/gmail/status` - Checks connection status

#### Email Features:
- `/api/ai/generate-email` - AI-powered email generation with templates
- `/api/gmail/send` - Direct Gmail API email sending
- In-browser email composer with preview/edit

#### Templates Available:
- **Research Collaboration** - For partnership opportunities
- **Mentorship Inquiry** - For seeking guidance
- **Graduate Opportunity** - For PhD/research positions

## 🔒 Security Features

- **Secure Token Storage**: Tokens stored server-side with session tracking
- **Automatic Expiry**: Expired tokens automatically cleaned up
- **User-Specific**: Each user connects their own Gmail account
- **No Email Client Popups**: All email composition happens in-browser

## 🚀 Usage

1. **Connect Gmail**:
   ```javascript
   // User clicks connect button
   // Popup opens for OAuth
   // Returns with connection status
   ```

2. **Generate Email**:
   ```javascript
   const emailData = {
     professorData: { name, field_of_research, university_name, email },
     userData: { name, researchTitle, researchAbstract, affiliation },
     templateType: 'collaboration' // or 'mentorship' or 'graduate_inquiry'
   };
   ```

3. **Send Email**:
   ```javascript
   const result = await fetch('/api/gmail/send', {
     method: 'POST',
     body: JSON.stringify({
       to: professor.email,
       subject: generatedEmail.subject,
       body: generatedEmail.body,
       sessionId: userSessionId
     })
   });
   ```

## 🎯 Features

### ✅ In-Browser Email Composition
- No new tabs or redirects
- Real-time preview and editing
- Professional email templates

### ✅ AI-Powered Generation
- Fixed template structures
- Variable substitution
- Multiple email types (collaboration, mentorship, graduate inquiry)

### ✅ Direct Gmail Sending
- Emails sent from user's Gmail account
- Appears in user's "Sent" folder
- No third-party email services

### ✅ User Experience
- Form data persistence (localStorage)
- Connection status indicators
- Success/failure notifications
- Rate limiting and error handling

## 🔧 Troubleshooting

### Common Issues:

1. **"OAuth not configured" error**
   - Check environment variables are set
   - Verify Google Cloud Console setup

2. **"Permission denied" error**
   - Ensure Gmail API is enabled
   - Check OAuth consent screen configuration

3. **"Redirect URI mismatch" error**
   - Verify redirect URI in Google Cloud Console
   - Check GOOGLE_REDIRECT_URI environment variable

4. **Popup blocked**
   - User needs to allow popups for OAuth
   - Alternative: direct redirect (breaks in-browser requirement)

### Production Deployment:

1. **Update OAuth Settings**:
   - Add production domain to authorized origins
   - Update redirect URI to production URL
   - Publish OAuth consent screen

2. **Environment Variables**:
   - Set production GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - Update GOOGLE_REDIRECT_URI to production domain

3. **Security Considerations**:
   - Use secure token storage (Redis/database)
   - Implement proper session management
   - Add rate limiting per user

## 📋 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/gmail/auth` | GET | Generate OAuth URL |
| `/api/gmail/callback` | GET | Handle OAuth callback |
| `/api/gmail/status` | GET | Check connection status |
| `/api/gmail/send` | POST | Send email via Gmail API |
| `/api/ai/generate-email` | POST | Generate AI email templates |

## 🎉 Benefits

- **No Email Service Costs**: Uses user's own Gmail
- **Professional Appearance**: Emails sent from user's account
- **Complete Control**: Full customization of email templates
- **User Privacy**: Each user uses their own Gmail connection
- **Seamless UX**: Everything happens in the browser

## 📝 Notes

- **Rate Limits**: Gmail API has usage quotas
- **OAuth Compliance**: Follow Google's OAuth policies
- **Token Security**: Implement secure storage for production
- **User Consent**: Clear privacy policy for Gmail access

---

This implementation provides a complete, professional email system that uses Gmail API directly without any third-party email services, maintaining full user control and privacy. 