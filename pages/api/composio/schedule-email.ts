import type { NextApiRequest, NextApiResponse } from 'next';

interface ScheduledEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  scheduledTime: Date;
  status: 'scheduled' | 'sent' | 'cancelled';
}

// In-memory storage for scheduled emails (in production, use a database)
const scheduledEmails = new Map<string, ScheduledEmail>();
const emailTimeouts = new Map<string, NodeJS.Timeout>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { action, id, to, subject, body, delayMinutes } = req.body;

    if (action === 'schedule') {
      try {
        const scheduledTime = new Date(Date.now() + (delayMinutes || 4) * 60 * 1000);
        const emailId = id || Date.now().toString();
        
        const scheduledEmail: ScheduledEmail = {
          id: emailId,
          to,
          subject,
          body,
          scheduledTime,
          status: 'scheduled'
        };

        scheduledEmails.set(emailId, scheduledEmail);

        // Set timeout to send the email
        const timeout = setTimeout(async () => {
          const email = scheduledEmails.get(emailId);
          if (email && email.status === 'scheduled') {
            await sendEmailNow(email);
          }
        }, (delayMinutes || 4) * 60 * 1000);

        emailTimeouts.set(emailId, timeout);

        res.status(200).json({
          success: true,
          message: `Email scheduled to send in ${delayMinutes || 4} minutes`,
          emailId,
          scheduledTime: scheduledTime.toISOString()
        });
      } catch (error) {
        console.error('Error scheduling email:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to schedule email'
        });
      }
    } else if (action === 'cancel') {
      try {
        const email = scheduledEmails.get(id);
        if (!email) {
          return res.status(404).json({
            success: false,
            error: 'Scheduled email not found'
          });
        }

        if (email.status !== 'scheduled') {
          return res.status(400).json({
            success: false,
            error: 'Email cannot be cancelled (already sent or cancelled)'
          });
        }

        // Clear the timeout
        const timeout = emailTimeouts.get(id);
        if (timeout) {
          clearTimeout(timeout);
          emailTimeouts.delete(id);
        }

        // Update status
        email.status = 'cancelled';
        scheduledEmails.set(id, email);

        res.status(200).json({
          success: true,
          message: 'Email cancelled successfully'
        });
      } catch (error) {
        console.error('Error cancelling email:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to cancel email'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid action. Use "schedule" or "cancel"'
      });
    }
  } else if (req.method === 'GET') {
    // Get status of scheduled emails
    const { emailId } = req.query;
    
    if (emailId) {
      const email = scheduledEmails.get(emailId as string);
      if (email) {
        res.status(200).json({
          success: true,
          email
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Email not found'
        });
      }
    } else {
      // Return all scheduled emails
      const emails = Array.from(scheduledEmails.values());
      res.status(200).json({
        success: true,
        emails
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

async function sendEmailNow(email: ScheduledEmail) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/composio/send-email-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email.to,
        subject: email.subject,
        body: email.body
      }),
    });

    const result = await response.json();

    if (result.success) {
      email.status = 'sent';
      // Email sent successfully
    } else {
      email.status = 'cancelled';
      console.error(`❌ Failed to send scheduled email to ${email.to}:`, result.error);
    }
  } catch (error) {
    email.status = 'cancelled';
    console.error(`❌ Network error sending scheduled email to ${email.to}:`, error);
  }

  scheduledEmails.set(email.id, email);
  emailTimeouts.delete(email.id);
} 