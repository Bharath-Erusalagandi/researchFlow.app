import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, FileText, User, Brain, Sparkles, Edit3, Clock, Trash2, Link, Upload, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
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

type WizardStep = 'personal' | 'research' | 'links' | 'generated' | 'editing';

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
  const [currentStep, setCurrentStep] = useState<WizardStep>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
  const [connectedAccountEmail, setConnectedAccountEmail] = useState<string | null>(null);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);

  // Load saved user info from localStorage
  useEffect(() => {
    // Use the same consolidated form data key as search.tsx
    const savedFormData = localStorage.getItem('researchConnect_formData');
    if (savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        setUserInfo({
          title: formData.researchTitle || '',
          abstract: formData.researchAbstract || '',
          name: formData.userFullName || '',
          resumeUrl: formData.resumeUrl || '',
          linkedinUrl: formData.linkedinUrl || '',
          portfolioUrl: formData.portfolioUrl || '',
          yearOfStudy: formData.yearOfStudy || '',
          currentUniversity: formData.currentUniversity || '',
          specificInterest: formData.specificInterest || ''
        });
      } catch (error) {
        console.log('Error loading form data:', error);
      }
    }
    
    // Load scheduled emails
    const savedScheduledEmails = localStorage.getItem('scheduledEmails');
    if (savedScheduledEmails) {
      setScheduledEmails(JSON.parse(savedScheduledEmails));
    }
  }, []);

  // Save user info to localStorage when it changes - use consolidated approach
  useEffect(() => {
    if (userInfo.title || userInfo.abstract || userInfo.name) {
      // Get existing form data and update with modal data
      const existingFormData = JSON.parse(localStorage.getItem('researchConnect_formData') || '{}');
      const updatedFormData = {
        ...existingFormData,
        userFullName: userInfo.name,
        researchTitle: userInfo.title,
        researchAbstract: userInfo.abstract,
        resumeUrl: userInfo.resumeUrl,
        yearOfStudy: userInfo.yearOfStudy,
        currentUniversity: userInfo.currentUniversity,
        specificInterest: userInfo.specificInterest
      };
      localStorage.setItem('researchConnect_formData', JSON.stringify(updatedFormData));
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
    setCurrentStep('generated');
    setIsGenerating(false);
  };

  const handleEditEmail = () => {
    setCurrentStep('editing');
  };

  const handleSaveEdits = () => {
    setGeneratedEmail(editableEmail);
    setCurrentStep('generated');
  };

  const scheduleEmail = async (email: string, delayMinutes: number = 4) => {
    const scheduledTime = new Date(Date.now() + delayMinutes * 60000);
    const emailId = Date.now().toString();
    
    const scheduledEmail: ScheduledEmail = {
      id: emailId,
      professorEmail: professor.email,
      subject: `Research Collaboration Opportunity - ${userInfo.title}`,
      body: email,
      scheduledTime: scheduledTime,
      status: 'scheduled'
    };

    setScheduledEmails(prev => [...prev, scheduledEmail]);

    try {
      const response = await fetch('/api/composio/schedule-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityId: connectedAccountId,
          to: professor.email,
          subject: `Research Collaboration Opportunity - ${userInfo.title}`,
          body: email,
          scheduledTime: scheduledTime.toISOString()
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setEmailStatus(`Email scheduled successfully! It will be sent at ${scheduledTime.toLocaleString()}.`);
      } else {
        setEmailStatus(`Error scheduling email: ${result.error}`);
        // Remove from scheduled emails if API call failed
        setScheduledEmails(prev => prev.filter(e => e.id !== emailId));
      }
    } catch (error) {
      setEmailStatus(`Error scheduling email: ${error}`);
      // Remove from scheduled emails if API call failed
      setScheduledEmails(prev => prev.filter(e => e.id !== emailId));
    }
  };

  const cancelScheduledEmail = async (scheduledEmailId: string) => {
    try {
      const response = await fetch('/api/composio/cancel-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId: scheduledEmailId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setScheduledEmails(prev => prev.filter(email => email.id !== scheduledEmailId));
        setEmailStatus('Email cancelled successfully.');
      } else {
        setEmailStatus(`Error cancelling email: ${result.error}`);
      }
    } catch (error) {
      setEmailStatus(`Error cancelling email: ${error}`);
    }
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    setEmailStatus('');
    
    await scheduleEmail(generatedEmail);
    
    setIsLoading(false);
  };

  const resetModal = () => {
    setCurrentStep('personal');
    setGeneratedEmail('');
    setEditableEmail('');
    setEmailStatus('');
  };

  const nextStep = () => {
    if (currentStep === 'personal') setCurrentStep('research');
    else if (currentStep === 'research') setCurrentStep('links');
  };

  const previousStep = () => {
    if (currentStep === 'research') setCurrentStep('personal');
    else if (currentStep === 'links') setCurrentStep('research');
  };

  const canProceedFromPersonal = () => {
    return userInfo.name.trim() !== '';
  };

  const canProceedFromResearch = () => {
    return userInfo.title.trim() !== '' && userInfo.abstract.trim() !== '';
  };

  const canGenerateEmail = () => {
    return userInfo.resumeUrl.trim() !== '';
  };

  const getStepStatus = (step: WizardStep) => {
    if (step === 'personal') return canProceedFromPersonal() ? 'completed' : 'current';
    if (step === 'research') return canProceedFromResearch() ? 'completed' : 'current';
    if (step === 'links') return canGenerateEmail() ? 'completed' : 'current';
    return 'pending';
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
          className="bg-[#1a1a1a] border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
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

          {/* Progress Steps */}
          {(currentStep === 'personal' || currentStep === 'research' || currentStep === 'links') && (
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${getStepStatus('personal') === 'completed' ? 'text-[#0CF2A0]' : currentStep === 'personal' ? 'text-white' : 'text-gray-500'}`}>
                    {getStepStatus('personal') === 'completed' ? <CheckCircle className="h-5 w-5" /> : <div className="h-5 w-5 border-2 border-current rounded-full" />}
                    <span className="text-sm font-medium">Personal Info</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <div className={`flex items-center gap-2 ${getStepStatus('research') === 'completed' ? 'text-[#0CF2A0]' : currentStep === 'research' ? 'text-white' : 'text-gray-500'}`}>
                    {getStepStatus('research') === 'completed' ? <CheckCircle className="h-5 w-5" /> : <div className="h-5 w-5 border-2 border-current rounded-full" />}
                    <span className="text-sm font-medium">Research Details</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <div className={`flex items-center gap-2 ${getStepStatus('links') === 'completed' ? 'text-[#0CF2A0]' : currentStep === 'links' ? 'text-white' : 'text-gray-500'}`}>
                    {getStepStatus('links') === 'completed' ? <CheckCircle className="h-5 w-5" /> : <div className="h-5 w-5 border-2 border-current rounded-full" />}
                    <span className="text-sm font-medium">Links & Generate</span>
                  </div>
                </div>
              </div>
              
              {/* Gmail Connection */}
              <div className="mb-4">
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
                      Connected: <span className="font-medium">{connectedAccountEmail}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Professor Info */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Email Recipient</h3>
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
            </div>
          )}

          {/* Step Content */}
          <div className="p-6">
            {currentStep === 'personal' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Personal Information</h3>
                  <p className="text-gray-400 text-sm mb-6">Let&apos;s start with your basic information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current University
                    </label>
                    <input
                      type="text"
                      value={userInfo.currentUniversity}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, currentUniversity: e.target.value }))}
                      placeholder="e.g., MIT, Stanford University"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Academic Status
                    </label>
                    <input
                      type="text"
                      value={userInfo.yearOfStudy}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                      placeholder="e.g., PhD student, Senior, Graduate student, Research Associate"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={nextStep}
                    disabled={!canProceedFromPersonal()}
                    className="px-6 py-3 bg-[#0CF2A0] text-black rounded-lg hover:bg-[#0CF2A0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Continue
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 'research' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Research Details</h3>
                  <p className="text-gray-400 text-sm mb-6">Tell us about your research work.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Research Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={userInfo.title}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your research project or paper title"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Research Abstract/Summary <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={userInfo.abstract}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, abstract: e.target.value }))}
                      placeholder="Provide a clear summary of your research work, methodology, and key findings. This will help generate a more personalized email."
                      rows={8}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#0CF2A0] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Specific Interest in Professor&apos;s Work
                    </label>
                    <input
                      type="text"
                      value={userInfo.specificInterest}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, specificInterest: e.target.value }))}
                      placeholder="What specifically interests you about their research?"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={previousStep}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!canProceedFromResearch()}
                    className="px-6 py-3 bg-[#0CF2A0] text-black rounded-lg hover:bg-[#0CF2A0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Continue
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 'links' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Professional Links</h3>
                  <p className="text-gray-400 text-sm mb-6">Add your professional materials (at least resume is required).</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Resume/CV Link <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={userInfo.resumeUrl}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, resumeUrl: e.target.value }))}
                      placeholder="https://drive.google.com/file/d/... or your website link"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Google Drive, Dropbox, personal website, or any public link
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        value={userInfo.linkedinUrl}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/your-profile"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Portfolio/Website
                      </label>
                      <input
                        type="url"
                        value={userInfo.portfolioUrl}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                        placeholder="https://your-portfolio.com"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#0CF2A0] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={previousStep}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Back
                  </button>
                  <button
                    onClick={generatePersonalizedEmail}
                    disabled={!canGenerateEmail() || isGenerating}
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

            {currentStep === 'generated' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Generated Email</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditEmail}
                      className="text-sm text-[#0CF2A0] hover:text-[#0CF2A0]/80 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={resetModal}
                      className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      Start Over
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto relative">
                  <pre className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedEmail}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedEmail);
                      // You could add a toast notification here
                    }}
                    className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors opacity-70 hover:opacity-100"
                    title="Copy to clipboard"
                  >
                    <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
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
                    <p className="text-sm text-gray-300">{emailStatus}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-gray-700 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {isGmailConnected ? (
                        <span className="flex items-center gap-2 text-green-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Gmail Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-yellow-400">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          Connect Gmail to send
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedEmail);
                        }}
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={isLoading || !isGmailConnected}
                        className="px-6 py-2 bg-[#0CF2A0] text-black rounded-lg hover:bg-[#0CF2A0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4" />
                            Schedule Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'editing' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Edit Email</h3>
                  <p className="text-sm text-gray-400">Make any changes to personalize further</p>
                </div>
                
                <textarea
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  rows={20}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0CF2A0] focus:outline-none transition-colors resize-none font-mono text-sm"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setCurrentStep('generated')}
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 