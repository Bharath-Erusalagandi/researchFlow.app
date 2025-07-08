import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIToolSet } from "composio-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, body, connectedAccountId, entityId } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, body' 
      });
    }

    // Initialize Composio
    if (!process.env.COMPOSIO_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'COMPOSIO_API_KEY is not configured'
      });
    }
    
    const toolset = new OpenAIToolSet({
      apiKey: process.env.COMPOSIO_API_KEY
    });

    let targetEntityId = entityId;
    let targetConnectedAccountId = connectedAccountId;

    // If we have a specific connectedAccountId, use it and get the entityId
    if (connectedAccountId && !entityId) {
      try {
        const connection = await toolset.client.connectedAccounts.get({
          connectedAccountId: connectedAccountId,
        });
        
        if (connection && connection.status === 'ACTIVE' && connection.appName === 'gmail') {
          targetEntityId = (connection as any).entityId || (connection as any).clientUniqueUserId;
          targetConnectedAccountId = connection.id;
        } else {
          return res.status(400).json({
            success: false,
            error: 'Specified Gmail connection is not active or not found',
            needsAuth: true
          });
        }
      } catch (error) {
        console.error('Error getting specific connection:', error);
        return res.status(400).json({
          success: false,
          error: 'Failed to verify Gmail connection',
          needsAuth: true
        });
      }
    } 
    // If no specific connection provided, find any active Gmail connection
    else if (!connectedAccountId && !entityId) {
      const connections = await toolset.client.connectedAccounts.list({});
      const activeGmailConnections = connections.items?.filter(conn => 
        conn.appName === 'gmail' && 
        conn.status === 'ACTIVE'
      ) || [];

      if (activeGmailConnections.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Gmail not authenticated',
          authInstructions: 'Please connect your Gmail account first using the Gmail Connection button.',
          needsAuth: true
        });
      }

      // Use the first active Gmail connection
      const connection = activeGmailConnections[0];
      targetConnectedAccountId = connection.id;
      targetEntityId = (connection as any).entityId || (connection as any).clientUniqueUserId;
    }

    if (!targetEntityId) {
      return res.status(400).json({
        success: false,
        error: 'Could not determine entity ID for Gmail connection',
        needsAuth: true
      });
    }

    console.log(`Sending email (without AI enhancement) via entity: ${targetEntityId}, connection: ${targetConnectedAccountId}`);

    // Send email via Composio directly (no AI enhancement)
    const result = await toolset.executeAction({
      action: 'GMAIL_SEND_EMAIL',
      entityId: targetEntityId,
      params: {
        recipient_email: to, // Gmail API expects 'recipient_email' not 'to'
        subject: subject,
        body: body
      }
    });

    console.log('Email send result:', result);

    if (result.successful) {
      return res.status(200).json({
        success: true,
        message: `Email sent successfully to ${to}!`,
        enhanced: false,
        result: result.data,
        entityId: targetEntityId,
        connectedAccountId: targetConnectedAccountId
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to send email',
        details: result
      });
    }

  } catch (error: any) {
    console.error('Error sending simple email:', error);
    
    // Handle specific Composio errors
    if (error.message?.includes('not authenticated') || error.message?.includes('not authorized')) {
      return res.status(400).json({
        success: false,
        error: 'Gmail not authenticated',
        authInstructions: 'Please connect your Gmail account first using the Gmail Connection button.',
        needsAuth: true
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while sending email',
      details: error.response?.data || error
    });
  }
} 