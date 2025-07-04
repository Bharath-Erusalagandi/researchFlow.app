import { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from './callback';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
    }

    // Get stored tokens for this user
    const userSession = tokenStorage.get(sessionId.toString());
    
    if (!userSession || !userSession.tokens) {
      return res.status(200).json({
        success: true,
        connected: false,
        message: 'Gmail not connected for this session'
      });
    }

    // Check if tokens are still valid (basic check)
    const now = new Date();
    const tokenExpiry = userSession.tokens.expiry_date;
    
    if (tokenExpiry && now.getTime() > tokenExpiry) {
      // Tokens are expired, remove them
      tokenStorage.delete(sessionId.toString());
      return res.status(200).json({
        success: true,
        connected: false,
        message: 'Gmail tokens expired, please reconnect'
      });
    }

    return res.status(200).json({
      success: true,
      connected: true,
      userInfo: userSession.userInfo,
      connectedAt: userSession.connectedAt,
      message: `Gmail connected as ${userSession.userInfo.email}`
    });

  } catch (error) {
    console.error('Gmail status check error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to check Gmail status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 