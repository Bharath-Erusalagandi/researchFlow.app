import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { tokenStorage } from './callback';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/gmail/callback';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, subject, body, sessionId } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, body'
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required',
        message: 'Please connect your Gmail account first',
        needsAuth: true
      });
    }

    // Get stored tokens for this user
    const userSession = tokenStorage.get(sessionId);
    if (!userSession || !userSession.tokens) {
      return res.status(401).json({
        success: false,
        error: 'Gmail not connected',
        message: 'Please connect your Gmail account to send emails',
        needsAuth: true
      });
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Gmail OAuth not configured',
        message: 'Gmail API credentials not set up'
      });
    }

    // Create OAuth client with stored tokens
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    oauth2Client.setCredentials(userSession.tokens);

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create email message in RFC2822 format
    const emailMessage = [
      'Content-Type: text/plain; charset="UTF-8"\r\n',
      'MIME-Version: 1.0\r\n',
      `To: ${to}\r\n`,
      `Subject: ${subject}\r\n`,
      '\r\n',
      body
    ].join('');

    // Encode the email message in base64url format
    const encodedMessage = Buffer.from(emailMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    if (!result.data.id) {
      throw new Error('Failed to send email - no message ID returned');
    }

    return res.status(200).json({
      success: true,
      message: `Email sent successfully from ${userSession.userInfo.email}!`,
      messageId: result.data.id,
      threadId: result.data.threadId,
      emailData: { to, subject, body },
      sender: userSession.userInfo.email,
      service: 'Gmail API Direct'
    });

  } catch (error: any) {
    console.error('Gmail send error:', error);

    // Handle specific Gmail API errors
    if (error.code === 401) {
      return res.status(401).json({
        success: false,
        error: 'Gmail authentication expired',
        message: 'Please reconnect your Gmail account',
        needsAuth: true
      });
    }

    if (error.code === 403) {
      return res.status(403).json({
        success: false,
        error: 'Gmail permission denied',
        message: 'Please ensure Gmail send permission is granted',
        needsAuth: true
      });
    }

    if (error.code === 429) {
      return res.status(429).json({
        success: false,
        error: 'Gmail rate limit exceeded',
        message: 'Too many emails sent. Please wait and try again.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message || 'Unknown error',
      troubleshooting: {
        commonIssues: [
          'Gmail authentication expired',
          'Insufficient permissions',
          'Rate limiting',
          'Invalid email format'
        ],
        solutions: [
          'Reconnect Gmail account',
          'Ensure gmail.send scope is granted',
          'Wait before sending more emails',
          'Verify recipient email address'
        ]
      }
    });
  }
} 