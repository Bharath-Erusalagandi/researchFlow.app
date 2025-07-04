import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIToolSet } from "composio-core";
import Groq from "groq-sdk";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      professorEmail, 
      professorName, 
      professorField, 
      professorUniversity,
      userFullName,
      researchTitle, 
      researchAbstract, 
      connectedAccountId 
    } = req.body;

    if (!professorEmail || !connectedAccountId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: professorEmail, connectedAccountId' 
      });
    }

    // Initialize Groq AI
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

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

    console.log(`Sending AI-enhanced email via connected account: ${connectedAccountId}`);

    // Check if the connected account is still active
    const connectedAccount = await toolset.client.connectedAccounts.get({
      connectedAccountId: connectedAccountId,
    });

    if (connectedAccount.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Gmail connection is not active. Please reconnect your Gmail account.',
        status: connectedAccount.status
      });
    }

    // Use Groq AI to generate a personalized email
    const prompt = `You are an expert academic email writer. Generate a professional, personalized research collaboration email with the following details:

To: Professor ${professorName}
Professor's Field: ${professorField}
Professor's University: ${professorUniversity}
From: ${userFullName}
Research Title: ${researchTitle}
Research Abstract: ${researchAbstract}

Requirements:
1. Create a compelling subject line
2. Write a professional, personalized email body
3. Highlight synergies between the research and professor's expertise
4. Request collaboration opportunities (research partnerships, mentorship, etc.)
5. Keep it concise but engaging
6. Make it sound genuine and not template-like

Return ONLY the email in this exact format:
Subject: [subject line]

[email body]

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

    const generatedEmail = completion.choices[0]?.message?.content;
    
    if (!generatedEmail) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate email content'
      });
    }

    // Extract subject and body from generated email
    const lines = generatedEmail.split('\n');
    const subjectLine = lines.find(line => line.startsWith('Subject:'));
    const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : `Research Collaboration Opportunity - ${researchTitle}`;
    
    // Extract body (everything after the subject line)
    const subjectIndex = lines.findIndex(line => line.startsWith('Subject:'));
    const body = lines.slice(subjectIndex + 1).join('\n').trim();

    // Send email via Composio
    const result = await toolset.executeAction({
      action: 'GMAIL_SEND_EMAIL',
      entityId: connectedAccountId,
      params: {
        to: professorEmail,
        subject: subject,
        body: body
      }
    });

    console.log('Email send result:', result);

    if (result.successful) {
      return res.status(200).json({
        success: true,
        message: `✅ AI-enhanced email sent successfully to ${professorName}!`,
        generatedEmail: generatedEmail,
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
    console.error('Error sending email with Groq AI:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while sending email',
      details: error.response?.data || error
    });
  }
} 