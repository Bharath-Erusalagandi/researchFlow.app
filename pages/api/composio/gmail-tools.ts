import { NextApiRequest, NextApiResponse } from 'next';
import { gmailService } from '../../../lib/composio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get Gmail tools from Composio
    const tools = await gmailService.getGmailTools();
    
    res.status(200).json({
      success: true,
      tools: tools,
      count: tools.length,
      message: 'Gmail tools fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching Gmail tools:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Gmail tools',
      details: error instanceof Error ? error.message : 'Unknown error',
      instructions: gmailService.getGmailConnectionInstructions()
    });
  }
} 