import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIToolSet } from "composio-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Support both GET and POST methods for flexibility
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get userId and returnPath from query params (for GET) or body (for POST)
    const userId = req.method === 'GET' ? req.query.userId : req.body.userId;
    const returnPath = req.method === 'GET' ? req.query.returnPath : req.body.returnPath;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    // Store return path for the callback
    if (returnPath) {
      // In a real app, you'd store this in a database or cache
      // For now, we'll encode it in the entityId
      console.log('Return path requested:', returnPath);
    }

    if (!process.env.COMPOSIO_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'COMPOSIO_API_KEY is not configured'
      });
    }
    const toolset = new OpenAIToolSet({
      apiKey: process.env.COMPOSIO_API_KEY
    });

    const appName = "gmail";
    const authScheme = "OAUTH2";
    
    // Construct base URL more reliably - auto-detect correct port  
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3001';
    const baseUrl = `${protocol}://${host}`;
    const redirectUrl = `${baseUrl}/api/composio/oauth-callback`;
    
    console.log('Request headers:', {
      origin: req.headers.origin,
      host: req.headers.host,
      'x-forwarded-host': req.headers['x-forwarded-host'],
      'x-forwarded-proto': req.headers['x-forwarded-proto']
    });
    console.log(`Constructed base URL: ${baseUrl}`);

    console.log(`Initiating Gmail connection for user: ${userId}`);
    console.log(`Using redirect URL: ${redirectUrl}`);

    const connectionRequest = await toolset.client.connectedAccounts.initiate({
      appName: appName,
      redirectUri: redirectUrl,
      entityId: userId.toString(),
      authMode: authScheme,
      authConfig: {},
    });

    // Connection request created successfully

    // Return both the connection details and the OAuth URL
    return res.status(200).json({
      success: true,
      connectedAccountId: connectionRequest.connectedAccountId,
      connectionStatus: connectionRequest.connectionStatus,
      redirectUrl: connectionRequest.redirectUrl,
      authUrl: connectionRequest.redirectUrl, // Add authUrl for backward compatibility
      message: 'Gmail connection initiated successfully'
    });

  } catch (error) {
    console.error('Error initiating Gmail connection:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate Gmail connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 