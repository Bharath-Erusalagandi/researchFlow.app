import { NextApiRequest, NextApiResponse } from 'next';
import { Composio } from "composio-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, error } = req.query;
    
    // Use the correct base URL
    const baseUrl = (req.headers.origin as string | undefined) || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005';

    if (error) {
      // Handle OAuth error
      return res.redirect(`${baseUrl}/search?tab=email&oauth_error=${encodeURIComponent(error.toString())}`);
    }

    if (!code) {
      return res.redirect(`${baseUrl}/search?tab=email&oauth_error=no_code`);
    }

    // Get composio client
    if (!process.env.COMPOSIO_API_KEY) {
      return res.redirect(`${baseUrl}/search?tab=email&oauth_error=missing_api_key`);
    }
    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

    // Complete the OAuth flow
    const result = await composio.connectedAccounts.get({
      connectedAccountId: code as string,
    });

    console.log('Gmail connection completed:', {
      id: result.id,
      status: result.status,
      appName: result.appName
    });

    // Redirect back to the search page with success
    return res.redirect(`${baseUrl}/search?tab=email&oauth_success=true&connected_account_id=${result.id}&entity_id=${result.entityId || state || ''}`);

  } catch (error) {
    console.error('Error in OAuth callback:', error);
    
    const baseUrl = (req.headers.origin as string | undefined) || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005';
    // Redirect back with error
    return res.redirect(`${baseUrl}/search?tab=email&oauth_error=callback_failed`);
  }
} 