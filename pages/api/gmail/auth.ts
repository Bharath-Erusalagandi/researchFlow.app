import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/gmail/callback';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Gmail OAuth not configured',
        message: 'Please set up Google OAuth credentials in environment variables',
        setup: {
          required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'],
          instructions: 'Visit Google Cloud Console → APIs & Services → Credentials to create OAuth 2.0 credentials'
        }
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    // Generate user session ID to track this specific user's auth
    const userSessionId = req.query.sessionId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      state: userSessionId.toString(), // Pass session ID in state
      prompt: 'consent', // Force consent screen to get refresh token
    });

    return res.status(200).json({
      success: true,
      authUrl,
      sessionId: userSessionId,
      message: 'Click the URL to connect your Gmail account',
      scopes: [
        'gmail.send - Send emails from your Gmail account',
        'userinfo.email - Get your email address',
        'userinfo.profile - Get your profile information'
      ]
    });

  } catch (error) {
    console.error('Gmail auth error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate Gmail authorization URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 