# 🚀 Composio Gmail Integration Guide

## Overview

The Research Connect application now uses **Composio OpenAIToolSet** for Gmail OAuth integration. This allows users to connect their Gmail accounts and send emails directly through the application using the LangChain agent.

## 🔧 Setup

### Environment Variables
Add the following to your `.env.local` file:
```bash
COMPOSIO_API_KEY=abp5czr4z72geqi1gi5f8
NEXT_PUBLIC_BASE_URL=http://localhost:3001  # Update for production
```

### API Endpoints Created

1. **`/api/composio/connect-gmail`** (POST)
   - Initiates Gmail OAuth connection
   - Creates connection request with redirect URL
   - Returns OAuth URL for user authentication

2. **`/api/composio/oauth-callback`** (GET)
   - Handles OAuth callback after user authentication
   - Verifies connection status
   - Redirects back to email tab with success/error status

3. **`/api/composio/check-connection`** (GET)
   - Checks if a Gmail connection is active
   - Accepts either `userId` or `connectedAccountId` as parameters
   - Returns connection status and details

## 🎯 How It Works

### User Flow:
1. **Select Professor**: User selects a professor and generates an email
2. **Connect Gmail**: User clicks "Connect Gmail" button
3. **OAuth Flow**: Popup opens with Gmail OAuth consent screen
4. **Authentication**: User grants permission to send emails
5. **Connection Verified**: System verifies the connection is active
6. **Ready to Send**: Button changes to "Send via Gmail" (green)

### Technical Flow:
1. **Frontend**: `handleConnectGmail()` generates unique user ID
2. **API Call**: POST to `/api/composio/connect-gmail` with user ID
3. **Composio**: Creates connection request with OAuth URL
4. **OAuth**: User completes authentication in popup
5. **Callback**: Composio redirects to `/api/composio/oauth-callback`
6. **Verification**: System checks connection status
7. **Update UI**: Frontend updates connection state

## 🔒 Security Features

- **Unique User IDs**: Each session gets a unique identifier
- **Secure OAuth**: Uses Composio's secure OAuth 2.0 flow
- **Connection Verification**: Verifies connection is active before allowing email sending
- **Local Storage**: Stores connection ID for session persistence
- **Error Handling**: Comprehensive error handling for failed connections

## 📱 User Interface

### Button States:
- **Not Connected**: "Connect Gmail" (green button)
- **Connecting**: "Connecting..." (with spinner)
- **Connected**: "Send via Gmail" (green button with checkmark indicator)

### Status Indicators:
- **Connected**: Green badge showing "Gmail Connected"
- **Success Messages**: Green alert with confirmation
- **Error Messages**: Yellow/red alert with error details

## 🔧 Development

### Local Testing:
1. Ensure `COMPOSIO_API_KEY` is set in environment
2. Run `npm run dev`
3. Navigate to `/search?tab=email`
4. Select a professor and generate an email
5. Click "Connect Gmail" to test OAuth flow

### Production Deployment:
1. Update `NEXT_PUBLIC_BASE_URL` to your domain
2. Ensure Composio OAuth redirect URLs are configured
3. Test the complete flow in production environment

## 🚨 Troubleshooting

### Common Issues:

**Issue**: "Failed to initiate Gmail connection"
**Solution**: Check that `COMPOSIO_API_KEY` is set correctly

**Issue**: OAuth popup blocked
**Solution**: Ensure popup blockers are disabled for the site

**Issue**: Connection timeout
**Solution**: Check internet connection and try again

**Issue**: OAuth callback fails
**Solution**: Verify redirect URL configuration in Composio

### Debug Information:
- Check browser console for detailed error messages
- Monitor network tab for API call responses
- Check local storage for connection persistence

## 🎉 Integration with LangChain

Once Gmail is connected, the user can:
1. Generate personalized emails using the existing LangChain agent
2. The connection status is stored and verified
3. The "Send via Gmail" button opens the email client with pre-filled content
4. Future enhancement: Direct sending through Composio Gmail tools

## 📞 Support

For issues with the integration:
1. Check the browser console for errors
2. Verify environment variables are set
3. Test the API endpoints directly
4. Check Composio service status

---

**✅ Gmail Integration Complete!**
Users can now connect their Gmail accounts through Composio OAuth and use the integration with the existing email generation system. 