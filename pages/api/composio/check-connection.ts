import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIToolSet } from "composio-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, connectedAccountId, entityId } = req.query;

    if (!userId && !connectedAccountId && !entityId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either userId, entityId, or connectedAccountId is required' 
      });
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

    try {
      if (connectedAccountId) {
        // Check specific connected account
        const connectedAccount = await toolset.client.connectedAccounts.get({
          connectedAccountId: connectedAccountId.toString(),
        });

        return res.status(200).json({
          success: true,
          isConnected: connectedAccount?.status === 'ACTIVE',
          connectionStatus: connectedAccount?.status,
          connectedAccountId: connectedAccount?.id,
          entityId: (connectedAccount as any)?.entityId || null,
          appName: connectedAccount?.appName,
          message: `Connection status: ${connectedAccount?.status}`
        });
      } else {
        // Check if user/entity has any Gmail connections
        const searchEntityId = entityId || userId;
        
        const connections = await toolset.client.connectedAccounts.list({
          user_uuid: searchEntityId?.toString(),
        });

        const gmailConnections = connections.items?.filter(conn => 
          conn.appName === 'gmail' && conn.status === 'ACTIVE'
        ) || [];

        if (gmailConnections.length > 0) {
          const activeConnection = gmailConnections[0];
          return res.status(200).json({
            success: true,
            isConnected: true,
            connectionStatus: activeConnection.status,
            connectedAccountId: activeConnection.id,
            entityId: (activeConnection as any).entityId || null,
            appName: activeConnection.appName,
            connections: gmailConnections,
            message: `Found ${gmailConnections.length} active Gmail connections`
          });
        } else {
          return res.status(200).json({
            success: true,
            isConnected: false,
            connections: [],
            message: 'No active Gmail connections found'
          });
        }
      }

    } catch (error) {
      console.error('Error checking connection:', error);
      
      return res.status(500).json({
        success: false,
        isConnected: false,
        error: 'Failed to check connection status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Connection check handler error:', error);
    
    return res.status(500).json({
      success: false,
      isConnected: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 