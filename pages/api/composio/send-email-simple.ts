import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIToolSet } from "composio-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, body } = req.body;

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

    // First, check if we have any active Gmail connections
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
    const connectedAccountId = connection.id;
    const entityId = connection.clientUniqueUserId; // Use the actual entity ID, not connection ID

    console.log(`Sending email (without AI enhancement) via entity: ${entityId}, connection: ${connectedAccountId}`);

    // Send email via Composio directly (no AI enhancement)
    const result = await toolset.executeAction({
      action: 'GMAIL_SEND_EMAIL',
      entityId: entityId, // Use the correct entity ID
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
        message: `Email sent successfully to ${to}! (No AI enhancement)`,
        enhanced: false,
        result: result.data
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