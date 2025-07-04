import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/gmail/callback';

// In-memory token storage (use Redis/database in production)
const tokenStorage = new Map<string, any>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('OAuth error:', error);
      return res.redirect(`${req.headers.origin || 'http://localhost:3001'}/search?tab=email&gmail_error=${encodeURIComponent(error.toString())}`);
    }

    if (!code) {
      return res.redirect(`${req.headers.origin || 'http://localhost:3001'}/search?tab=email&gmail_error=no_auth_code`);
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.redirect(`${req.headers.origin || 'http://localhost:3001'}/search?tab=email&gmail_error=oauth_not_configured`);
    }

    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code.toString());
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Set credentials
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const userSessionId = state?.toString() || 'unknown';
    
    // Store tokens with user session ID (use secure storage in production)
    tokenStorage.set(userSessionId, {
      tokens,
      userInfo: userInfo.data,
      connectedAt: new Date().toISOString()
    });

    // Gmail connected successfully

    // Redirect back to the app with success
    return res.redirect(`${req.headers.origin || 'http://localhost:3001'}/search?tab=email&gmail_connected=true&session=${userSessionId}`);

  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect(`${req.headers.origin || 'http://localhost:3001'}/search?tab=email&gmail_error=callback_failed`);
  }
}

// Export token storage for use in other API routes
export { tokenStorage }; 