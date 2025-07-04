import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIToolSet } from "composio-core";

// In-memory storage for connection status (use Redis/database in production)
const connectionCache = new Map<string, {
  connectedAccountId: string;
  entityId: string;
  status: string;
  lastChecked: Date;
  appName: string;
}>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!process.env.COMPOSIO_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'COMPOSIO_API_KEY is not configured'
      });
    }
    const toolset = new OpenAIToolSet({
      apiKey: process.env.COMPOSIO_API_KEY
    });

    if (req.method === 'GET') {
      // Check connection status
      const { entityId, connectedAccountId } = req.query;
      
      if (!entityId && !connectedAccountId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Either entityId or connectedAccountId is required' 
        });
      }

      try {
        let connection = null;

        if (connectedAccountId) {
          // Check specific connected account
          connection = await toolset.client.connectedAccounts.get({
            connectedAccountId: connectedAccountId.toString(),
          });
        } else if (entityId) {
          // Get all connections for entity and find active Gmail one
          const connections = await toolset.client.connectedAccounts.list({});
          const gmailConnections = connections.items?.filter(conn => 
            conn.appName === 'gmail' && 
            conn.status === 'ACTIVE' &&
            (conn as any).entityId === entityId.toString()
          ) || [];
          
          if (gmailConnections.length > 0) {
            connection = gmailConnections[0];
          }
        }

        if (connection && connection.status === 'ACTIVE') {
          // Try to get account email if available
          let accountEmail = null;
          try {
            // Check if connection has email information
            if ((connection as any).integrationAccount?.accountDisplayName) {
              accountEmail = (connection as any).integrationAccount.accountDisplayName;
            } else if ((connection as any).memberEmail) {
              accountEmail = (connection as any).memberEmail;
            } else if ((connection as any).userAccount?.email) {
              accountEmail = (connection as any).userAccount.email;
            }
          } catch (error) {
            console.log('Could not extract email from connection:', error);
          }

          // Cache the active connection
          const cacheKey = (connection as any).entityId || entityId?.toString() || 'unknown';
          connectionCache.set(cacheKey, {
            connectedAccountId: connection.id,
            entityId: (connection as any).entityId || entityId?.toString() || '',
            status: connection.status,
            lastChecked: new Date(),
            appName: connection.appName
          });

          return res.status(200).json({
            success: true,
            isConnected: true,
            connectionStatus: connection.status,
            connectedAccountId: connection.id,
            entityId: (connection as any).entityId,
            appName: connection.appName,
            accountEmail: accountEmail,
            message: 'Gmail connection is active'
          });
        } else {
          return res.status(200).json({
            success: true,
            isConnected: false,
            connectionStatus: connection?.status || 'NOT_FOUND',
            message: 'No active Gmail connection found'
          });
        }

      } catch (error) {
        console.error('Error checking connection status:', error);
        return res.status(500).json({
          success: false,
          isConnected: false,
          error: 'Failed to check connection status',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } 
    
    else if (req.method === 'POST') {
      // Store/update connection status
      const { entityId, connectedAccountId, status } = req.body;
      
      if (!entityId || !connectedAccountId) {
        return res.status(400).json({ 
          success: false, 
          error: 'entityId and connectedAccountId are required' 
        });
      }

      // Store in cache
      connectionCache.set(entityId, {
        connectedAccountId,
        entityId,
        status: status || 'ACTIVE',
        lastChecked: new Date(),
        appName: 'gmail'
      });

      return res.status(200).json({
        success: true,
        message: 'Connection status updated',
        cached: true
      });
    }
    
    else if (req.method === 'DELETE') {
      // Clear connection status
      const { entityId } = req.query;
      
      if (entityId) {
        connectionCache.delete(entityId.toString());
        return res.status(200).json({
          success: true,
          message: 'Connection status cleared',
          cleared: true
        });
      } else {
        // Clear all cached connections
        connectionCache.clear();
        return res.status(200).json({
          success: true,
          message: 'All connection statuses cleared',
          cleared: true
        });
      }
    }
    
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Connection status handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 