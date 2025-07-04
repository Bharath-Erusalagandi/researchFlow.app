import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, FileText, User, Brain, Sparkles, Edit3, Clock, Trash2, Link, Upload } from 'lucide-react';
import { GmailConnectionButton } from './GmailConnectionButton';

interface Professor {
  id?: number;
  name: string;
  field_of_research?: string;
  university_name?: string;
  email: string;
  title?: string;
  department?: string;
  interests?: string;
}

interface PersonalizedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  professor: Professor;
}

interface UserResearchInfo {
  title: string;
  abstract: string;
  name: string;
  resumeUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  yearOfStudy: string;
  currentUniversity: string;
  specificInterest: string;
}

interface ScheduledEmail {
  id: string;
  professorEmail: string;
  subject: string;
  body: string;
  scheduledTime: Date;
  status: 'scheduled' | 'sent' | 'cancelled';
}

export const PersonalizedEmailModal: React.FC<PersonalizedEmailModalProps> = ({
  isOpen,
  onClose,
  professor
}) => {
  const [userInfo, setUserInfo] = useState<UserResearchInfo>({
    title: '',
    abstract: '',
    name: '',
    resumeUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    yearOfStudy: '',
    currentUniversity: '',
    specificInterest: ''
  });
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [editableEmail, setEditableEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'input' | 'generated' | 'editing'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
  const [connectedAccountEmail, setConnectedAccountEmail] = useState<string | null>(null);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);

  // Load saved user info from localStorage
  useEffect(() => {
    const savedInfo = localStorage.getItem('userResearchInfo');
    if (savedInfo) {
      setUserInfo(JSON.parse(savedInfo));
    }
    
    // Load scheduled emails
    const savedScheduledEmails = localStorage.getItem('scheduledEmails');
    if (savedScheduledEmails) {
      setScheduledEmails(JSON.parse(savedScheduledEmails));
    }
  }, []);

  // Save user info to localStorage when it changes
  useEffect(() => {
    if (userInfo.title || userInfo.abstract || userInfo.name) {
      localStorage.setItem('userResearchInfo', JSON.stringify(userInfo));
    }
  }, [userInfo]);

  // Save scheduled emails to localStorage
  useEffect(() => {
    localStorage.setItem('scheduledEmails', JSON.stringify(scheduledEmails));
  }, [scheduledEmails]);

  // Get connected account info
  useEffect(() => {
    const getConnectedAccountInfo = async () => {
      if (isGmailConnected && connectedAccountId) {
        try {
          const response = await fetch(`/api/composio/connection-status?entityId=${connectedAccountId}`);
          const result = await response.json();
          if (result.success && result.accountEmail) {
            setConnectedAccountEmail(result.accountEmail);
          }
        } catch (error) {
          console.error('Error getting account info:', error);
        }
      }
    };
    
    getConnectedAccountInfo();
  }, [isGmailConnected, connectedAccountId]);

  const generatePersonalizedEmail = async () => {
    setIsGenerating(true);
    
    // Simulate AI email generation (you can replace this with actual AI API call)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const professorTitle = professor.title || 'Professor';
    const professorField = professor.field_of_research || professor.interests || 'your research area';
    const professorUniversity = professor.university_name || professor.department || 'your institution';
    
    // Build custom email with all provided information
    let emailTemplate = `Subject: Research Collaboration Opportunity - ${userInfo.title}

Dear ${professorTitle} ${professor.name},

I hope this email finds you well. My name is ${userInfo.name}`;

    if (userInfo.yearOfStudy && userInfo.currentUniversity) {
      emailTemplate += `, and I am a ${userInfo.yearOfStudy} at ${userInfo.currentUniversity}`;
    }

    emailTemplate += `. I am writing to express my keen interest in your research work in ${professorField} at ${professorUniversity}.

I have recently been working on research titled "${userInfo.title}". Here is a brief overview of my work:

${userInfo.abstract}`;

    if (userInfo.specificInterest) {
      emailTemplate += `

I am particularly interested in ${userInfo.specificInterest} and how it relates to your work in ${professorField}.`;
    }

    emailTemplate += `

After reviewing your publications and research contributions, I believe there are significant synergies between our work that could lead to meaningful collaboration opportunities. Your expertise in ${professorField} would be invaluable to advancing this research.

I would be honored to discuss potential collaboration opportunities, whether through:
- Joint research projects
- Graduate research opportunities
- Visiting researcher positions
- Publication collaborations`;

    // Add links if provided
    if (userInfo.resumeUrl || userInfo.linkedinUrl || userInfo.portfolioUrl) {
      emailTemplate += `

For your reference, I have included links to my professional materials:`;
      
      if (userInfo.resumeUrl) {
        emailTemplate += `
- Resume/CV: ${userInfo.resumeUrl}`;
      }
      if (userInfo.linkedinUrl) {
        emailTemplate += `
- LinkedIn Profile: ${userInfo.linkedinUrl}`;
      }
      if (userInfo.portfolioUrl) {
        emailTemplate += `
- Portfolio/Website: ${userInfo.portfolioUrl}`;
      }
    }

    emailTemplate += `

Thank you for your time and consideration. I look forward to the possibility of contributing to your research group and learning from your expertise.

Best regards,
${userInfo.name}`;

    if (userInfo.currentUniversity) {
      emailTemplate += `
${userInfo.currentUniversity}`;
    }

    emailTemplate += `

P.S. I am particularly interested in how your work on ${professorField} could complement my research approach, and I believe together we could make significant contributions to the field.`;

    setGeneratedEmail(emailTemplate);
    setEditableEmail(emailTemplate);
    setStep('generated');
    setIsGenerating(false);
  };

  const handleEditEmail = () => {
    setStep('editing');
  };

  const handleSaveEdits = () => {
    setGeneratedEmail(editableEmail);
    setStep('generated');
  };

  const scheduleEmail = async (email: string, delayMinutes: number = 4) => {
    const lines = email.split('\n');
    const subjectLine = lines.find(line => line.startsWith('Subject:'));
    const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : `Research Collaboration Opportunity - ${userInfo.title}`;
    const body = lines.slice(lines.findIndex(line => line.startsWith('Subject:')) + 1).join('\n').trim();
    
    try {
      const response = await fetch('/api/composio/schedule-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'schedule',
          to: professor.email,
          subject,
          body,
          delayMinutes
        }),
      });

      const result = await response.json();

      if (result.success) {
        const scheduledTime = new Date(result.scheduledTime);
        const scheduledEmail: ScheduledEmail = {
          id: result.emailId,
          professorEmail: professor.email,
          subject,
          body,
          scheduledTime,
          status: 'scheduled'
        };
        
        setScheduledEmails(prev => [...prev, scheduledEmail]);
        setEmailStatus(`Email scheduled to send in ${delayMinutes} minutes at ${scheduledTime.toLocaleTimeString()}. You can cancel it before then.`);
      } else {
        setEmailStatus(`Failed to schedule email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error scheduling email:', error);
      setEmailStatus('Network error. Failed to schedule email.');
    }
  };

  const cancelScheduledEmail = async (scheduledEmailId: string) => {
    try {
      const response = await fetch('/api/composio/schedule-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          id: scheduledEmailId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setScheduledEmails(prev => prev.map(e => 
          e.id === scheduledEmailId ? { ...e, status: 'cancelled' } : e
        ));
        setEmailStatus(prev => prev + `\n🚫 Scheduled email cancelled`);
      } else {
        setEmailStatus(prev => prev + `\n❌ Failed to cancel email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error cancelling email:', error);
      setEmailStatus(prev => prev + `\n❌ Network error cancelling email`);
    }
  };

  const handleSendEmail = async () => {
    if (!editableEmail && !generatedEmail) {
      alert('Please generate an email first');
      return;
    }

    const emailToSend = editableEmail || generatedEmail;
    
    setIsLoading(true);
    setEmailStatus('');
    
    // Schedule the email with a 4-minute delay
    await scheduleEmail(emailToSend, 4);
    setIsLoading(false);
  };

  const resetModal = () => {
    setStep('input');
    setGeneratedEmail('');
    setEditableEmail('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0CF2A0]/20 rounded-lg">
                <Brain className="h-6 w-6 text-[#0CF2A0]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Personalized Email</h2>
                <p className="text-gray-400">Generate a tailored email for {professor.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {/* Gmail Connection Status */}
          <div className="mb-6">
            <GmailConnectionButton 
              userId={userInfo.name || 'default_user'}
              onConnectionChange={(connected: boolean, accountId?: string) => {
                setIsGmailConnected(connected);
                setConnectedAccountId(accountId || null);
              }}
            />
            {isGmailConnected && connectedAccountEmail && (
              <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  📧 Connected Account: <span className="font-mono font-medium">{connectedAccountEmail}</span>
                </p>
              </div>
            )}
          </div>

          {step === 'input' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* User Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Current University */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Current University
                    </label>
                    <input
                      type="text"
                      value={userInfo.currentUniversity}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, currentUniversity: e.target.value }))}
                      placeholder="e.g., MIT, Stanford University"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Year of Study */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Year of Study/Position
                    </label>
                    <input
                      type="text"
                      value={userInfo.yearOfStudy}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                      placeholder="e.g., PhD student, Senior, Graduate student"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Resume URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Upload className="h-4 w-4 inline mr-2" />
                      Resume/CV Link *
                    </label>
                    <input
                      type="url"
                      value={userInfo.resumeUrl}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, resumeUrl: e.target.value }))}
                      placeholder="https://drive.google.com/file/d/... or your website link"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Please provide a link to your resume (Google Drive, Dropbox, personal website, etc.)
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Research Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Research Paper/Project Title *
                    </label>
                    <input
                      type="text"
                      value={userInfo.title}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your research title"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Specific Interest */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Brain className="h-4 w-4 inline mr-2" />
                      Specific Interest in Professor&apos;s Work
                    </label>
                    <input
                      type="text"
                      value={userInfo.specificInterest}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, specificInterest: e.target.value }))}
                      placeholder="What specifically interests you about their research?"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Link className="h-4 w-4 inline mr-2" />
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={userInfo.linkedinUrl}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Portfolio URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Link className="h-4 w-4 inline mr-2" />
                      Portfolio/Website
                    </label>
                    <input
                      type="url"
                      value={userInfo.portfolioUrl}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                      placeholder="https://your-portfolio.com"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Research Abstract */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Research Abstract/Summary *
                </label>
                <textarea
                  value={userInfo.abstract}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, abstract: e.target.value }))}
                  placeholder="Provide a brief abstract or summary of your research work, methodology, and key findings..."
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a detailed description to generate a more personalized email
                </p>
              </div>

              {/* Professor Info Display */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Email will be sent to:</h3>
                <div className="space-y-1">
                  <p className="text-[#0CF2A0] font-medium">{professor.name}</p>
                  <p className="text-gray-300 text-sm">{professor.email}</p>
                  {(professor.field_of_research || professor.interests) && (
                    <p className="text-gray-400 text-sm">{professor.field_of_research || professor.interests}</p>
                  )}
                  {(professor.university_name || professor.department) && (
                    <p className="text-gray-400 text-sm">{professor.university_name || professor.department}</p>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePersonalizedEmail}
                  disabled={!userInfo.name || !userInfo.title || !userInfo.abstract || !userInfo.resumeUrl || isGenerating}
                  className="px-6 py-3 bg-[#0CF2A0] text-black rounded-lg hover:bg-[#0CF2A0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Email
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'generated' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Generated Email */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Generated Email</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditEmail}
                      className="text-sm text-[#0CF2A0] hover:text-[#0CF2A0]/80 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Email
                    </button>
                    <button
                      onClick={resetModal}
                      className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedEmail}
                  </pre>
                </div>
              </div>

              {/* Scheduled Emails */}
              {scheduledEmails.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Scheduled Emails
                  </h4>
                  <div className="space-y-2">
                    {scheduledEmails.map((email) => (
                      <div key={email.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <div className="text-sm">
                          <p className="text-gray-300">To: {email.professorEmail}</p>
                          <p className="text-gray-400">
                            {email.status === 'scheduled' ? 
                              `Sends at: ${email.scheduledTime.toLocaleString()}` :
                              `Status: ${email.status}`
                            }
                          </p>
                        </div>
                        {email.status === 'scheduled' && (
                          <button
                            onClick={() => cancelScheduledEmail(email.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Status */}
              {emailStatus && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap text-gray-300">
                    {emailStatus}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={resetModal}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isLoading || !isGmailConnected}
                  className="px-6 py-3 bg-[#0CF2A0] text-black rounded-lg hover:bg-[#0CF2A0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5" />
                      Schedule Email (4 min delay)
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'editing' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Edit Email</h3>
                  <p className="text-sm text-gray-400">Make any changes to personalize further</p>
                </div>
                <textarea
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  rows={20}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors resize-none font-mono text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep('generated')}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="px-6 py-3 bg-[#0CF2A0] text-black rounded-lg hover:bg-[#0CF2A0]/90 transition-colors flex items-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 