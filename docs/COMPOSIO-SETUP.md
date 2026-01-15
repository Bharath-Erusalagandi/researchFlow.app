# 🚀 Composio Gmail Integration Setup Guide

This guide will help you set up Composio integration with Gmail functionality for your Research Connect application.

## 📋 Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Composio account and API key

## 🔧 Setup Steps

### 1. Install Dependencies

The Composio SDK has already been installed in your project:
```bash
npm install composio-core
```

### 2. Environment Configuration

Your `.env.local` file has been updated with the Composio API key:
```bash
COMPOSIO_API_KEY=<your-composio-api-key>
```

**Important**: For the Composio CLI to work, you also need to set this as a global environment variable:
```bash
export COMPOSIO_API_KEY=<your-composio-api-key>
echo 'export COMPOSIO_API_KEY=<your-composio-api-key>' >> ~/.zshrc
```

### 3. Gmail Integration Setup

To connect Gmail with Composio, you need to authenticate your Gmail account:

#### Using Composio CLI (Recommended)
1. Make sure the API key is set globally (see step 2)

2. Connect Gmail:
```bash
composio add gmail
```
This will open a browser window for Gmail authentication.

3. Follow the prompts:
   - Choose "yes" for Composio Auth
   - Enter an integration name (e.g., "researchflow")
   - Complete Gmail OAuth in the browser

#### Alternative: Manual Setup
1. Visit [Composio Dashboard](https://app.composio.dev)
2. Navigate to "Connected Accounts"
3. Click "Add Account" and select Gmail
4. Complete the OAuth flow

### 4. Verify Integration

Test the integration by calling our API endpoint (note the trailing slash):
```bash
curl http://localhost:3000/api/composio/gmail-tools/
```

Expected response:
```json
{
  "success": true,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "GMAIL_SEND_EMAIL",
        "description": "Send an email using gmail's api.",
        "parameters": { ... }
      }
    },
    {
      "type": "function", 
      "function": {
        "name": "GMAIL_GET_PROFILE",
        "description": "Get the profile of the authenticated user.",
        "parameters": { ... }
      }
    }
  ],
  "count": 2,
  "message": "Gmail tools fetched successfully"
}
```

## 🎯 How It Works

### 1. Available Features

- ✅ **Gmail Tools Integration**: Access to Gmail send, draft, and profile tools
- ✅ **Personalized Email Generation**: AI-powered email composition
- ✅ **Direct Gmail Sending**: Send emails through your Gmail account
- ✅ **Error Handling**: Graceful fallbacks when integration isn't available

### 2. API Endpoints

#### `/api/composio/gmail-tools/` (GET)
Fetches available Gmail tools from Composio.

#### `/api/composio/send-email/` (POST)
Prepares email sending with Composio Gmail tools.

Request body:
```json
{
  "to": "professor@university.edu",
  "subject": "Research Collaboration Opportunity",
  "body": "Email content here..."
}
```

### 3. Frontend Integration

The "Personalized Email" tab now includes:
- **Generate Email** button: Creates personalized content
- **Send via Gmail** button: Uses Composio integration
- **Copy** button: Copies email to clipboard
- **Open in Email Client** button: Fallback for manual sending

## 🔍 Testing the Integration

### 1. Check Gmail Tools
Navigate to `/search?tab=email` and click "Send via Gmail" on any generated email.

### 2. Expected Behavior
- ✅ If Gmail is connected: "Gmail integration is ready!" message
- ❌ If not connected: Setup instructions displayed

### 3. Debug Information
Check browser console for detailed logs about:
- Tool availability
- Connection status
- Error messages

## 🚨 Troubleshooting

### Gmail Not Connected
**Error**: "Gmail tools not available"
**Solution**: 
1. Set global environment variable: `export COMPOSIO_API_KEY=<your-composio-api-key>`
2. Run `composio add gmail` and complete authentication

### API Key Issues
**Error**: "🔑 API Key is not provided"
**Solution**: 
1. Verify `COMPOSIO_API_KEY` in `.env.local`
2. Set global environment variable: `export COMPOSIO_API_KEY=<your-composio-api-key>`
3. Add to shell profile: `echo 'export COMPOSIO_API_KEY=<your-composio-api-key>' >> ~/.zshrc`

### API Endpoint Issues
**Error**: 404 or connection refused
**Solution**: 
1. Ensure development server is running: `npm run dev`
2. Use correct URL with trailing slash: `/api/composio/gmail-tools/`
3. Check server logs for compilation errors

### Network Issues
**Error**: Failed to fetch tools
**Solution**: Check internet connection and Composio service status

## 🔒 Security Notes

- ✅ API key is stored securely in environment variables
- ✅ Gmail authentication uses OAuth 2.0
- ✅ No email credentials are stored locally
- ✅ All communications use HTTPS

## 📚 Additional Resources

- [Composio Documentation](https://docs.composio.dev)
- [Gmail Integration Guide](https://docs.composio.dev/apps/gmail)
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)

## 🎉 What's Next?

After completing this setup:

1. **Generate Personalized Emails**: Use the AI-powered email generator
2. **Send via Gmail**: Send emails directly through your Gmail account
3. **Track Interactions**: Monitor email sending status and responses
4. **Expand Integration**: Add more Composio tools (Slack, GitHub, etc.)

## 💡 Pro Tips

- Test with a personal email first before sending to professors
- Keep your Composio API key secure and never share it
- Monitor your Gmail sending limits to avoid rate limiting
- Use the copy feature as a backup for important emails
- The API endpoints require trailing slashes: `/api/composio/gmail-tools/`

---

🚀 **Ready to send emails!** Your Composio Gmail integration is now set up and ready to use. 