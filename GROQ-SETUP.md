# 🤖 Groq AI Integration Setup

## Overview

This integration uses **Groq AI** (ultra-fast LLM inference) with **Composio** to generate and send intelligent, personalized academic collaboration emails.

## 🔧 Setup Instructions

### 1. Get Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click **"Create API Key"**
5. Copy your API key (starts with `gsk_...`)

### 2. Add API Key to Environment

Open your `.env.local` file and update the Groq API key:

```bash
COMPOSIO_API_KEY=<your-composio-api-key>
NEXT_PUBLIC_BASE_URL=http://localhost:3002
GROQ_API_KEY=<your-groq-api-key>
```

### 3. Restart Development Server

```bash
npm run dev
```

## 🚀 Features

### AI-Enhanced Email Generation
- **Smart Personalization**: Groq AI analyzes professor's field and research to create tailored emails
- **Professional Tone**: Automatically maintains academic standards and professionalism  
- **Contextual Relevance**: Highlights synergies between your research and professor's expertise
- **Dynamic Content**: Each email is uniquely generated, not template-based

### Integration Flow
1. **User fills research details** → Professor selection
2. **Groq AI generates personalized email** → Uses LLaMA 3.1 8B model
3. **Composio sends via Gmail** → Direct integration with connected Gmail account
4. **Real-time feedback** → Success/error status with detailed messages

### Technical Details
- **Model**: `llama-3.1-8b-instant` (ultra-fast inference)
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max Tokens**: 1000 (comprehensive emails)
- **Integration**: Direct Groq → Composio → Gmail flow

## 🔐 Security & Privacy

- **API Keys**: Stored securely in environment variables
- **Gmail Auth**: OAuth 2.0 with proper scope limitations
- **Data Privacy**: No email content stored permanently
- **Rate Limits**: Groq free tier provides generous limits for research use

## 🆓 Pricing

- **Groq**: Free tier includes substantial usage
- **Composio**: Free tier for personal/research use
- **Total Cost**: $0 for typical research collaboration needs

## 🛠️ Troubleshooting

### Common Issues:

1. **"Groq API Key not configured"**
   - Ensure `GROQ_API_KEY` is properly set in `.env.local`
   - Restart the development server

2. **"Failed to generate email content"**
   - Check Groq API key validity
   - Verify internet connection

3. **"Gmail connection not active"**
   - Reconnect Gmail through the Connect Gmail button
   - Check OAuth callback URL configuration

## 📚 API Endpoints

- **`/api/composio/groq-send-email`**: AI email generation + sending
- **Payload**:
  ```json
  {
    "professorEmail": "prof@university.edu",
    "professorName": "Dr. Jane Smith", 
    "professorField": "Machine Learning",
    "professorUniversity": "MIT",
    "userFullName": "Your Name",
    "researchTitle": "Your Research Title",
    "researchAbstract": "Your research description...",
    "connectedAccountId": "composio-connection-id"
  }
  ```

The system now provides intelligent, personalized outreach that significantly improves response rates from professors! 🎯 