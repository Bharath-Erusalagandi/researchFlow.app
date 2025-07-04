import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIToolSet } from "composio-core";
import Groq from "groq-sdk";

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
    const connectedAccountId = activeGmailConnections[0].id;

    // Check if GROQ_API_KEY is available
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY is not set in environment variables');
      return res.status(500).json({
        success: false,
        error: 'GROQ_API_KEY is not configured. Please add it to your .env.local file.',
        details: 'Missing GROQ_API_KEY environment variable'
      });
    }

    // Initialize Groq AI to enhance the email
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    console.log(`Enhancing and sending email via connected account: ${connectedAccountId}`);

    // Use Groq AI to enhance the email content
    const prompt = `You are an expert academic email writer. Please enhance and polish the following email to make it more professional, engaging, and personalized while maintaining the original intent and key information:

Subject: ${subject}

Email Body:
${body}

Requirements:
1. Keep the same core message and intent
2. Make it more polished and professional
3. Ensure it sounds natural and not overly formal
4. Maintain all specific details mentioned
5. Make it engaging and likely to get a positive response
6. Keep a respectful academic tone

Return ONLY the enhanced email in this exact format:
Subject: [enhanced subject line]

[enhanced email body]

Do not include any other text, explanations, or formatting.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert academic email writer specializing in research collaboration outreach."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const enhancedEmail = completion.choices[0]?.message?.content;
    
    if (!enhancedEmail) {
      // Fall back to original content if AI enhancement fails
      console.log('AI enhancement failed, using original content');
    }

    // Extract enhanced subject and body
    let finalSubject = subject;
    let finalBody = body;

    if (enhancedEmail) {
      const lines = enhancedEmail.split('\n');
      const subjectLine = lines.find(line => line.startsWith('Subject:'));
      if (subjectLine) {
        finalSubject = subjectLine.replace('Subject:', '').trim();
      }
      
      // Extract body (everything after the subject line)
      const subjectIndex = lines.findIndex(line => line.startsWith('Subject:'));
      if (subjectIndex !== -1) {
        finalBody = lines.slice(subjectIndex + 1).join('\n').trim();
      }
    }

    // Send email via Composio
    const result = await toolset.executeAction({
      action: 'GMAIL_SEND_EMAIL',
      entityId: connectedAccountId,
      params: {
        to: to,
        subject: finalSubject,
        body: finalBody
      }
    });

    console.log('Email send result:', result);

    if (result.successful) {
      return res.status(200).json({
        success: true,
        message: `Email sent successfully to ${to}!`,
        enhanced: !!enhancedEmail,
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
    console.error('Error sending email:', error);
    
    // Handle specific Groq API errors
    if (error.status === 401 || error.message?.includes('Invalid API Key') || error.message?.includes('invalid_api_key')) {
      console.error('❌ Groq API Key Invalid:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid GROQ_API_KEY. Please check your API key in .env.local file.',
        details: 'Groq API authentication failed - check your API key',
        needsApiKey: true
      });
    }
    
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