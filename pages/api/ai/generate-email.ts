import { NextApiRequest, NextApiResponse } from 'next';

interface EmailTemplate {
  subject: string;
  body: string;
}

interface ProfessorData {
  name: string;
  field_of_research: string;
  university_name: string;
  email: string;
  title?: string;
  department?: string;
}

interface UserData {
  name: string;
  researchTitle: string;
  researchAbstract: string;
  email?: string;
  affiliation?: string;
}

// Fixed email templates for different scenarios
const EMAIL_TEMPLATES: { [key: string]: EmailTemplate } = {
  collaboration: {
    subject: "Research Collaboration Opportunity - {researchTitle}",
    body: `Dear {professorTitle} {professorName},

I hope this email finds you well. My name is {userName}, and I am writing to express my keen interest in your research work in {professorField} at {professorUniversity}.

I have recently been working on research titled "{researchTitle}". Here is a brief overview of my work:

{researchAbstract}

After reviewing your publications and research contributions, I believe there are significant synergies between our work that could lead to meaningful collaboration opportunities. Your expertise in {professorField} would be invaluable to advancing this research.

I would be honored to discuss potential collaboration opportunities, whether through:
• Joint research projects
• Graduate research opportunities  
• Visiting researcher positions
• Publication collaborations

I have attached my research proposal for your review and would welcome the opportunity to discuss this further at your convenience.

Thank you for your time and consideration. I look forward to the possibility of contributing to your research group and learning from your expertise.

Best regards,
{userName}
{userAffiliation}

P.S. I am particularly interested in how your work on {professorField} could complement my research approach, and I believe together we could make significant contributions to the field.`
  },
  
  mentorship: {
    subject: "Research Mentorship Inquiry - {researchTitle}",
    body: `Dear {professorTitle} {professorName},

I hope this message finds you well. My name is {userName}, and I am reaching out to inquire about potential mentorship opportunities in your research area of {professorField}.

I am currently working on a research project titled "{researchTitle}":

{researchAbstract}

Your extensive expertise and contributions to {professorField} at {professorUniversity} make you an ideal mentor for this research direction. I would be tremendously grateful for any guidance or advice you could provide.

I am particularly interested in:
• Research methodology guidance
• Literature review recommendations
• Potential research directions
• Academic career advice

I understand your time is valuable, and I would be happy to work around your schedule for a brief meeting or phone call. Even a short conversation would be incredibly beneficial for my research journey.

Thank you for considering my request. I look forward to the possibility of learning from your expertise.

Respectfully,
{userName}
{userAffiliation}`
  },

  graduate_inquiry: {
    subject: "Graduate Research Opportunity Inquiry - {userName}",
    body: `Dear {professorTitle} {professorName},

I hope this email finds you well. My name is {userName}, and I am writing to inquire about potential graduate research opportunities in your laboratory at {professorUniversity}.

I am particularly drawn to your work in {professorField}, and I believe my research background aligns well with your group's objectives. My current research focuses on:

Title: "{researchTitle}"

Abstract: {researchAbstract}

I am impressed by your research contributions and would be honored to contribute to your team's ongoing projects. I am seeking opportunities for:
• PhD research positions
• Research assistantships
• Summer research programs
• Collaborative projects

I have a strong academic background and am passionate about advancing knowledge in {professorField}. I would welcome the opportunity to discuss how my skills and research interests could contribute to your laboratory.

Could we schedule a brief meeting or phone call to discuss potential opportunities? I am flexible with timing and happy to accommodate your schedule.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
{userName}
{userAffiliation}

Attachment: Research Proposal and CV`
  }
};

function fillTemplate(template: EmailTemplate, professorData: ProfessorData, userData: UserData): EmailTemplate {
  let subject = template.subject;
  let body = template.body;

  // Replace all template variables
  const replacements = {
    '{professorName}': professorData.name,
    '{professorTitle}': professorData.title || 'Professor',
    '{professorField}': professorData.field_of_research,
    '{professorUniversity}': professorData.university_name,
    '{professorDepartment}': professorData.department || '',
    '{userName}': userData.name,
    '{researchTitle}': userData.researchTitle,
    '{researchAbstract}': userData.researchAbstract,
    '{userAffiliation}': userData.affiliation || '[Your Institution/Affiliation]',
    '{userEmail}': userData.email || '[Your Email]'
  };

  // Apply replacements to both subject and body
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });

  return { subject, body };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { professorData, userData, templateType = 'collaboration' } = req.body;

    if (!professorData || !userData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data',
        message: 'Both professorData and userData are required'
      });
    }

    // Validate required fields
    if (!professorData.name || !professorData.field_of_research || !professorData.university_name) {
      return res.status(400).json({
        success: false,
        error: 'Incomplete professor data',
        message: 'Professor name, field of research, and university are required'
      });
    }

    if (!userData.name || !userData.researchTitle || !userData.researchAbstract) {
      return res.status(400).json({
        success: false,
        error: 'Incomplete user data',
        message: 'User name, research title, and abstract are required'
      });
    }

    // Get the requested template
    const template = EMAIL_TEMPLATES[templateType];
    if (!template) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template type',
        message: `Template type must be one of: ${Object.keys(EMAIL_TEMPLATES).join(', ')}`
      });
    }

    // Fill the template with actual data
    const filledTemplate = fillTemplate(template, professorData, userData);

    return res.status(200).json({
      success: true,
      email: filledTemplate,
      templateType,
      professorInfo: {
        name: professorData.name,
        university: professorData.university_name,
        field: professorData.field_of_research
      },
      generatedAt: new Date().toISOString(),
      message: 'Email template generated successfully'
    });

  } catch (error) {
    console.error('Email generation error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate email',
      details: error instanceof Error ? error.message : 'Unknown error',
      availableTemplates: Object.keys(EMAIL_TEMPLATES)
    });
  }
} 