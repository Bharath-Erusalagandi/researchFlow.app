import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIToolSet } from "composio-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { connectedAccountId, status, error, entityId } = req.query;
    
    // Construct base URL more reliably - auto-detect correct port
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3001';
    const baseUrl = `${protocol}://${host}`;
    
    // OAuth callback processing

    if (error) {
      console.error('OAuth error:', error);
      // Redirect back to the main page with error
      return res.redirect(`${baseUrl}/search?tab=email&oauth_error=${encodeURIComponent(error.toString())}`);
    }

    if (!connectedAccountId) {
      return res.redirect(`${baseUrl}/search?tab=email&oauth_error=Missing connected account ID`);
    }

    if (!process.env.COMPOSIO_API_KEY) {
      return res.redirect(`${baseUrl}/search?tab=email&oauth_error=missing_api_key`);
    }
    const toolset = new OpenAIToolSet({
      apiKey: process.env.COMPOSIO_API_KEY
    });

    try {
      // Get the connected account to verify it's active
      const connectedAccount = await toolset.client.connectedAccounts.get({
        connectedAccountId: connectedAccountId.toString(),
      });

      if (connectedAccount?.status === 'ACTIVE') {
        // Connection successful
        return res.redirect(`${baseUrl}/search?tab=email&oauth_success=true&connected_account_id=${connectedAccountId}&entity_id=${connectedAccount?.entityId || entityId || ''}`);
      }

      if (connectedAccount?.status && connectedAccount.status.toString().toUpperCase().includes('PROGRESS')) {
        // Still establishing connection
        return res.redirect(`${baseUrl}/search?tab=email&oauth_pending=true&connected_account_id=${connectedAccountId}&entity_id=${connectedAccount?.entityId || entityId || ''}`);
      }

      // Connection failed or other status
      return res.redirect(`${baseUrl}/search?tab=email&oauth_error=Connection failed with status: ${connectedAccount?.status}`);

    } catch (accountError) {
      console.error('Error checking connected account:', accountError);
      
      // If we can't verify the account, it might still be valid - redirect with a warning
      return res.redirect(`${baseUrl}/search?tab=email&oauth_success=true&connected_account_id=${connectedAccountId}&verification_warning=true`);
    }

  } catch (error) {
    console.error('OAuth callback error:', error);
    const baseUrl = (req.headers.origin as string | undefined) || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return res.redirect(`${baseUrl}/search?tab=email&oauth_error=Callback processing failed`);
  }
} 