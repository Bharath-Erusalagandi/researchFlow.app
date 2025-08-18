import { NextApiRequest, NextApiResponse } from 'next';
import { Composio } from "composio-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get composio client
    if (!process.env.COMPOSIO_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'COMPOSIO_API_KEY is not configured'
      });
    }
    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

    // Get Gmail integrations
    const integrations = await composio.integrations.list({
      appName: "gmail",
    });

    // Check if there are any active Gmail integrations
    const integrationItems = integrations?.items || [];
    const hasGmailIntegration = integrationItems.length > 0;
    
    // Get more details about the integrations if they exist
    const integrationDetails = integrationItems.map((integration: any) => ({
      id: integration.id,
      status: integration.status,
      appName: integration.appName,
      connectedAccountId: integration.connectedAccountId,
      createdAt: integration.createdAt,
    }));

    return res.status(200).json({
      success: true,
      isConnected: hasGmailIntegration,
      integrations: integrationDetails,
      totalIntegrations: integrationItems.length,
      message: hasGmailIntegration 
        ? 'Gmail integration is active' 
        : 'No Gmail integration found'
    });

  } catch (error) {
    console.error('Error checking Gmail integration:', error);
    
    return res.status(500).json({
      success: false,
      isConnected: false,
      error: 'Failed to check Gmail integration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 