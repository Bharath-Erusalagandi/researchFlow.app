'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, User, Mail, BookOpen, Award, ArrowUp, Square, Home, FileText, Search as SearchIcon, Settings, LogOut, AlertCircle, Check, Heart, Brain, PenTool, Send, Copy, Loader2, ExternalLink, Upload, Link as LinkIcon, Edit3, Clock, Trash2, ChevronRight, ChevronLeft, Shuffle, X, Info, AlertTriangle, XCircle } from 'lucide-react';
import { IconSend, IconMail, IconLoader2 as TablerLoader2 } from '@tabler/icons-react';
import { getTimeBasedGreeting } from '@/lib/utils';
// Removed PromptInput components - now using AIInputWithLoading
import { Button as RegularButton } from '@/components/ui/button';
import { Button as Button3D } from '@/components/ui/3d-button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { ProfessorCard } from '@/components/ui/professor-card';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { AIInputWithLoading } from '@/components/ui/ai-input-with-loading';
import { Progress } from '@/components/ui/progress';
import { EnhancedTutorialOverlay } from '@/components/ui/enhanced-tutorial-overlay';
import { EnhancedEmailTutorialOverlay } from '@/components/ui/enhanced-email-tutorial';
import { enhancedSearchPageTutorialSteps, enhancedPostSearchTutorialSteps, quickStartTutorialSteps } from '@/lib/enhanced-tutorial-steps';
import { cookies } from '@/lib/cookies';
import { userPrefsService } from '@/lib/userPreferences';
import withAuth from '../components/withAuth';



// Popular tags removed as per request

// Professor interface matching our data structure
interface Professor {
  id?: number;
  name: string;
  field_of_research: string;
  university_name: string;
  email: string;
  official_url: string;
  image?: string;
  publications?: number;
  citations?: number;
  title?: string;
  researchAreas?: string[];
}

// Tab types
type TabType = 'search' | 'email';

// Progress Bar Form Component
const ProgressBarForm = ({ 
  userFullName, setUserFullName,
  researchTitle, setResearchTitle,
  researchAbstract, setResearchAbstract,
  currentUniversity, setCurrentUniversity,
  academicLevel, setAcademicLevel,
  resumeUrl, setResumeUrl,
  onCancel, onComplete 
}: {
  userFullName: string, setUserFullName: (value: string) => void,
  researchTitle: string, setResearchTitle: (value: string) => void,
  researchAbstract: string, setResearchAbstract: (value: string) => void,
  currentUniversity: string, setCurrentUniversity: (value: string) => void,
  academicLevel: string, setAcademicLevel: (value: string) => void,
  resumeUrl: string, setResumeUrl: (value: string) => void,
  onCancel: () => void,
  onComplete: () => void
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dataRestored, setDataRestored] = useState(false);

  // Save progress to localStorage whenever step changes
  useEffect(() => {
    const progressData = {
      currentStep,
      formData: {
        userFullName,
        researchTitle,
        researchAbstract,
        currentUniversity,
        academicLevel,
        resumeUrl
      }
    };
    localStorage.setItem('researchConnect_progressForm', JSON.stringify(progressData));
  }, [currentStep, userFullName, researchTitle, researchAbstract, currentUniversity, academicLevel, resumeUrl]);

  // Restore progress from localStorage on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('researchConnect_progressForm');
    if (savedProgress) {
      try {
        const progressData = JSON.parse(savedProgress);
        
        // Restore form data
        const formData = progressData.formData;
        if (formData) {
          if (formData.userFullName && formData.userFullName !== userFullName) {
            setUserFullName(formData.userFullName);
          }
          if (formData.researchTitle && formData.researchTitle !== researchTitle) {
            setResearchTitle(formData.researchTitle);
          }
          if (formData.researchAbstract && formData.researchAbstract !== researchAbstract) {
            setResearchAbstract(formData.researchAbstract);
          }
          if (formData.currentUniversity && formData.currentUniversity !== currentUniversity) {
            setCurrentUniversity(formData.currentUniversity);
          }
          if (formData.academicLevel && formData.academicLevel !== academicLevel) {
            setAcademicLevel(formData.academicLevel);
          }
          if (formData.resumeUrl && formData.resumeUrl !== resumeUrl) {
            setResumeUrl(formData.resumeUrl);
          }
        }

        // Restore current step (but don't go beyond what's valid)
        if (progressData.currentStep !== undefined) {
          setCurrentStep(progressData.currentStep);
        }

        // Show restoration notification if any data was restored
        const hasData = formData && (
          formData.userFullName || 
          formData.researchTitle || 
          formData.researchAbstract || 
          formData.currentUniversity || 
          formData.academicLevel || 
          formData.resumeUrl
        );
        
        if (hasData) {
          setDataRestored(true);
          setTimeout(() => setDataRestored(false), 4000);
        }
      } catch (error) {
        console.log('Error loading progress from localStorage:', error);
      }
    }
  }, []); // Only run on mount

  const steps = [
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Tell us about yourself',
      icon: <User className="h-6 w-6" />,
      fields: [
        {
          label: 'Full Name',
          required: true,
          value: userFullName,
          setValue: setUserFullName,
          type: 'text',
          placeholder: 'Enter your full name',
          autoComplete: 'name'
        }
      ]
    },
    {
      id: 'research',
      title: 'Research Interest',
      subtitle: 'What field excites you?',
      icon: <Brain className="h-6 w-6" />,
      fields: [
        {
          label: 'Research Interest',
          required: true,
          value: researchTitle,
          setValue: setResearchTitle,
          type: 'text',
          placeholder: 'e.g., Machine Learning in Healthcare, Climate Change Research'
        }
      ]
    },
    {
      id: 'background',
      title: 'Research Background',
      subtitle: 'Share your research experience',
      icon: <BookOpen className="h-6 w-6" />,
      fields: [
        {
          label: 'Research Abstract',
          required: true,
          value: researchAbstract,
          setValue: setResearchAbstract,
          type: 'textarea',
          placeholder: 'Describe your research interests and background...',
          rows: 4
        }
      ]
    },
    {
      id: 'academic',
      title: 'Academic Details',
      subtitle: 'Your academic information',
      icon: <GraduationCap className="h-6 w-6" />,
      fields: [
        {
          label: 'Current University',
          required: false,
          value: currentUniversity,
          setValue: setCurrentUniversity,
          type: 'text',
          placeholder: 'e.g., MIT, Stanford University'
        },
        {
          label: 'Academic Level',
          required: false,
          value: academicLevel,
          setValue: setAcademicLevel,
          type: 'select',
          options: [
            'High School Student',
            'Undergraduate Student',
            'Graduate Student (Master\'s)',
            'Graduate Student (PhD)',
            'Postdoctoral Researcher',
            'Research Professional'
          ]
        }
      ]
    },
    {
      id: 'resume',
      title: 'Resume/CV',
      subtitle: 'Share your professional profile',
      icon: <FileText className="h-6 w-6" />,
      fields: [
        {
          label: 'Resume/CV URL',
          required: true,
          value: resumeUrl,
          setValue: setResumeUrl,
          type: 'url',
          placeholder: 'https://your-resume-link.com'
        }
      ]
    }
  ];

  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex];
    return step.fields.every(field => !field.required || field.value.trim() !== '');
  };

  const canProceed = () => isStepValid(currentStep);
  const canComplete = () => steps.every((_, index) => isStepValid(index));

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1 && canComplete()) {
      // Clear progress data when completing
      localStorage.removeItem('researchConnect_progressForm');
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Data Restored Notification */}
      <AnimatePresence>
        {dataRestored && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-[#0CF2A0]/20 border border-[#0CF2A0]/30 rounded-xl text-[#0CF2A0] text-sm flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Your progress has been restored from your last session
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0CF2A0]/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-sm"></div>
        
        <div className="relative bg-gradient-to-br from-[#1a1a1a]/95 to-[#0a0a0a]/95 border border-[#0CF2A0]/30 rounded-2xl p-8 backdrop-blur-xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Setup Progress</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{currentStep + 1}/{steps.length}</span>
                <span className="text-sm text-[#0CF2A0] font-semibold">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
            </div>
            
            {/* Progress Bar Visual */}
            <div className="w-full bg-gray-800/50 rounded-full h-3 mb-4">
              <motion.div
                className="bg-gradient-to-r from-[#0CF2A0] to-[#0CF2A0]/80 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-[#0CF2A0] shadow-lg shadow-[#0CF2A0]/50' 
                      : 'bg-gray-600'
                  }`} />
                  <span className={`text-xs transition-colors ${
                    index <= currentStep 
                      ? 'text-[#0CF2A0]' 
                      : 'text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#0CF2A0]/20 rounded-xl text-[#0CF2A0]">
                  {currentStepData.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{currentStepData.title}</h3>
                  <p className="text-gray-400">{currentStepData.subtitle}</p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                  {currentStep + 1} / {steps.length}
                </div>
              </div>

              {/* Step Fields */}
              <div className="space-y-6 mb-8">
                {currentStepData.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        value={field.value}
                        onChange={(e) => field.setValue(e.target.value)}
                        placeholder={field.placeholder}
                        rows={'rows' in field ? field.rows : 4}
                        className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-6 py-4 text-white text-lg placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200 resize-none"
                        required={field.required}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={field.value}
                        onChange={(e) => field.setValue(e.target.value)}
                        className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-6 py-4 text-white text-lg focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                        required={field.required}
                      >
                        <option value="">Select your level...</option>
                        {'options' in field && field.options?.map((option) => (
                          <option key={option} value={option} className="bg-[#1a1a1a]">
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => field.setValue(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-6 py-4 text-white text-lg placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                        autoComplete={'autoComplete' in field ? field.autoComplete : undefined}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={currentStep === 0 ? () => {
                // Clear progress when canceling
                localStorage.removeItem('researchConnect_progressForm');
                onCancel();
              } : handlePrev}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {currentStep === 0 ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </>
              )}
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-[#0CF2A0] to-[#0CF2A0]/80 hover:from-[#0CF2A0]/90 hover:to-[#0CF2A0]/70 text-black px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="h-4 w-4" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function SearchPage() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchedTerm, setLastSearchedTerm] = useState(""); // Track the actual searched term
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Array<{x: number, y: number, radius: number, color: string, vx: number, vy: number}>>([]);
  const animationFrameId = useRef<number | null>(null);
  const mousePositionRef = useRef<{x: number | null, y: number | null}>({ x: null, y: null });
  const [aiSuggestion, setAISuggestion] = useState<string>("");
  const [savedProfessors, setSavedProfessors] = useState<string[]>([]);
  
  // Search History State - Chat-like functionality
  type SearchSession = {
    id: string;
    query: string;
    timestamp: number;
    professors: Professor[];
    aiSuggestion: string;
  };
  
  const [searchHistory, setSearchHistory] = useState<SearchSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialType, setTutorialType] = useState<'full' | 'quick'>('full');
  const [tutorialSteps, setTutorialSteps] = useState(enhancedSearchPageTutorialSteps);

  // Email tutorial state
  const [showEmailTutorial, setShowEmailTutorial] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    icon?: React.ReactNode;
  }>>([]);
  
  // Custom modal state
  const [showTabSwitchModal, setShowTabSwitchModal] = useState(false);
  const [modalProfessor, setModalProfessor] = useState<Professor | null>(null);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [processingEmailForProfessor, setProcessingEmailForProfessor] = useState<string | null>(null); // Track which professor is being processed

  
  // Personalized email tab state
  const [userFullName, setUserFullName] = useState("");
  const [researchTitle, setResearchTitle] = useState("");
  const [researchAbstract, setResearchAbstract] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState(""); // Fallback for URL if no file uploaded
  const [currentUniversity, setCurrentUniversity] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [specificInterest, setSpecificInterest] = useState("");
  const [researchInterest, setResearchInterest] = useState(""); // Paper/work title
  const [researchQuestions, setResearchQuestions] = useState(""); // What fascinated them + questions
  const [opportunityType, setOpportunityType] = useState(""); // User location
  const [researchFieldConnection, setResearchFieldConnection] = useState(""); // Research field connection
  const [selectedProfessorForEmail, setSelectedProfessorForEmail] = useState<Professor | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [connectedAccountEmail, setConnectedAccountEmail] = useState<string | null>(null);
  
  // Gmail integration state
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<{success: boolean, message: string} | null>(null);
  
  // Email composer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Card-based question system state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());
  const [showCardSystem, setShowCardSystem] = useState(true); // Default to true

  // Load state from localStorage on initial render
  useEffect(() => {
    // First, check URL parameters to determine intended tab
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get('tab');
    const sessionId = urlParams.get('session');
    
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('researchConnect_searchHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history);
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
    
    // If there's a specific session ID in URL, load that session
    if (sessionId && savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        const session = history.find((s: SearchSession) => s.id === sessionId);
        if (session) {
          setCurrentSessionId(sessionId);
          setSearchQuery(session.query);
          setLastSearchedTerm(session.query);
          setFilteredProfessors(session.professors);
          setAISuggestion(session.aiSuggestion);
          setHasSearched(true);
        }
      } catch (error) {
        console.error('Error loading specific session:', error);
      }
    } else {
      // Always start with blank search for new sessions
      setSearchQuery("");
      setLastSearchedTerm("");
      setFilteredProfessors([]);
      setAISuggestion("");
      setHasSearched(false);
      setCurrentSessionId(null);
    }
    
    const savedSelectedProfessor = localStorage.getItem('selectedProfessorForEmail');
    const savedActiveTab = localStorage.getItem('researchConnect_activeTab');
    
    // Load saved/bookmarked professors from database
    const loadSavedProfessors = async () => {
      try {
        if (userPrefsService.isUserInitialized()) {
          const savedProfs = userPrefsService.getSavedProfessors();
          const savedIds = savedProfs.map(prof => prof.id);
          setSavedProfessors(savedIds);
        } else {
          // Fallback to localStorage
          const savedBookmarkedProfs = JSON.parse(localStorage.getItem('savedProfessors') || '[]');
          const savedIds = savedBookmarkedProfs.map((prof: any) => prof.id?.toString() || '');
          setSavedProfessors(savedIds);
        }
      } catch (error) {
        console.error('Error loading saved professors:', error);
        // Fallback to localStorage
        const savedBookmarkedProfs = JSON.parse(localStorage.getItem('savedProfessors') || '[]');
        const savedIds = savedBookmarkedProfs.map((prof: any) => prof.id?.toString() || '');
        setSavedProfessors(savedIds);
      }
    };
    
    loadSavedProfessors();
    
    // Load selected professor but DON'T force tab switch
    if (savedSelectedProfessor) {
      const professor = JSON.parse(savedSelectedProfessor);
      setSelectedProfessorForEmail(professor);
    }

    // Determine which tab to show (priority: URL > saved tab > default)
    let targetTab: TabType = 'search'; // Default
    if (urlTab === 'email' || urlTab === 'search') {
      targetTab = urlTab;
    } else if (savedActiveTab === 'email' || savedActiveTab === 'search') {
      targetTab = savedActiveTab as TabType;
    }
    
    setActiveTab(targetTab);

    // Check if this is a first-time user and show tutorial
    const checkAndShowTutorial = async (retryCount = 0) => {
      try {
        if (!userPrefsService.isUserInitialized()) {
          // Prevent infinite retries - max 10 attempts (5 seconds)
          if (retryCount < 10) {
            setTimeout(() => checkAndShowTutorial(retryCount + 1), 500);
            return;
          } else {
            console.warn('User preferences initialization timeout, falling back to localStorage');
            // Fall through to localStorage fallback
          }
        }
        
        const hasSeenTutorial = await userPrefsService.getTutorialStatus('main_search_tutorial');
        const hasSeenAnyTutorial = await userPrefsService.hasSeenAnyTutorial();
        const skipTutorial = urlParams.get('skip_tutorial') === 'true';
        
        // Only show tutorial for completely new users
        if (!hasSeenTutorial && !hasSeenAnyTutorial && !skipTutorial) {
          // Delay tutorial to let the page load completely
          setTimeout(() => {
            setShowTutorial(true);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
        // Fallback to localStorage
        const hasSeenTutorial = localStorage.getItem('researchConnect_hasSeenTutorial');
        const isFirstVisitEver = localStorage.getItem('researchConnect_firstVisit') === null;
        const skipTutorial = urlParams.get('skip_tutorial') === 'true';
        
        if (!hasSeenTutorial && isFirstVisitEver && !skipTutorial) {
          localStorage.setItem('researchConnect_firstVisit', 'true');
          setTimeout(() => {
            setShowTutorial(true);
          }, 2000);
        }
      }
    };
    
    checkAndShowTutorial();

    // Form data is now loaded in a separate useEffect to avoid conflicts and ensure persistence

    // Handle OAuth callback parameters
    const oauthSuccess = urlParams.get('oauth_success');
    const oauthError = urlParams.get('oauth_error');
    const connectedAccountIdFromUrl = urlParams.get('connected_account_id');
    const entityIdFromUrl = urlParams.get('entity_id');
    const verificationWarning = urlParams.get('verification_warning');
    
    if (oauthSuccess === 'true') {
      setIsGmailConnected(true);
      setIsConnectingGmail(false); // Reset loading state
      
      if (connectedAccountIdFromUrl) {
        setConnectedAccountId(connectedAccountIdFromUrl);
        // Store both connected account ID and entity ID for persistence
        localStorage.setItem('composio_connected_account_id', connectedAccountIdFromUrl);
        if (entityIdFromUrl) {
          localStorage.setItem('composio_entity_id', entityIdFromUrl);
        }
        
        // Store connection in our status manager
        if (entityIdFromUrl) {
          fetch('/api/composio/connection-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entityId: entityIdFromUrl,
              connectedAccountId: connectedAccountIdFromUrl,
              status: 'ACTIVE'
            })
          }).catch(console.error);
        }
      }
      
              const successMessage = verificationWarning 
          ? 'Gmail connected but verification pending. Connection should work normally.'
                                : 'Gmail connected successfully! You can now send emails directly from the website.';
      
      addNotification({
        type: 'success',
        title: 'Gmail Connected!',
        message: successMessage,
        icon: <Check className="h-5 w-5" />
      });
      
      // Clean up URL parameters but preserve the current tab
      const currentTabParam = targetTab ? `?tab=${targetTab}` : '';
      window.history.replaceState({}, document.title, window.location.pathname + currentTabParam);
      // DON'T force tab switch - respect user's current location
    } else if (oauthError) {
      setIsGmailConnected(false);
      setIsConnectingGmail(false); // Reset loading state
      addNotification({
        type: 'error',
        title: 'OAuth Error',
        message: `OAuth Error: ${oauthError}. Please try connecting Gmail again.`,
        icon: <XCircle className="h-5 w-5" />
      });
      // Clean up URL parameters but preserve the current tab
      const currentTabParam = targetTab ? `?tab=${targetTab}` : '';
      window.history.replaceState({}, document.title, window.location.pathname + currentTabParam);
    }

    // Check for existing connection on page load
    const storedConnectedAccountId = localStorage.getItem('composio_connected_account_id');
    const storedEntityId = localStorage.getItem('composio_entity_id');
    
    if (storedConnectedAccountId) {
      setConnectedAccountId(storedConnectedAccountId);
      // Check if the connection is still active using our improved status checker
      checkConnectionStatus(storedConnectedAccountId, storedEntityId);
    }
  }, []);

  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Canvas background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initializeDots();
      }
    };

    const initializeDots = () => {
      const dots = [];
      const numDots = Math.floor((canvas.width * canvas.height) / 15000);
      
      for (let i = 0; i < numDots; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          color: `rgba(12, 242, 160, ${Math.random() * 0.5 + 0.1})`,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3
        });
      }
      
      dotsRef.current = dots;
    };

    const render = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update dots
      dotsRef.current.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        // Boundary check and bounce
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
        
        // Mouse interaction
        const mouseX = mousePositionRef.current.x;
        const mouseY = mousePositionRef.current.y;
        
        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - dot.x;
          const dy = mouseY - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            // Move away from mouse
            const angle = Math.atan2(dy, dx);
            const repelForce = (100 - distance) / 1000;
            dot.vx -= Math.cos(angle) * repelForce;
            dot.vy -= Math.sin(angle) * repelForce;
          }
        }
      });
      
      animationFrameId.current = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mousePositionRef.current = { x: null, y: null };
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    
    render();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Load user name from local storage
  useEffect(() => {
    // In a real app, this would come from authentication
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
    
    // Set greeting based on time of day
    setGreeting(getTimeBasedGreeting(storedUserName || undefined));
    
    // Update greeting every hour
    const intervalId = setInterval(() => {
      setGreeting(getTimeBasedGreeting(storedUserName || undefined));
    }, 60 * 60 * 1000); // every hour
    
    return () => clearInterval(intervalId);
  }, []);



  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    
    // If empty search, don't run the search
    if (!searchTerm.trim()) {
      return;
    }
    
    setIsLoading(true);
    setSearchQuery(searchTerm); // Update search input if tag is clicked
    setLastSearchedTerm(searchTerm); // Store the actual searched term
    
    // Save search query to localStorage
    localStorage.setItem('researchConnect_searchQuery', searchTerm);
    localStorage.setItem('researchConnect_lastSearchedTerm', searchTerm);
    
    try {
      // Call our API endpoint
      const response = await axios.get(`/api/professor-search?query=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });
      
      // Validate response is JSON
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      // Process the professors data
      let professors = response.data.professors;
      
      // Get the AI suggestion
      const suggestion = response.data.aiSuggestion;
      setAISuggestion(suggestion);
      localStorage.setItem('researchConnect_aiSuggestion', suggestion);
      
      // Clear any previous suggestion display status since this is a new suggestion
      if (suggestion) {
        const suggestionKey = `researchConnect_aiSuggestionDisplayed_${btoa(suggestion.substring(0, 50))}`;
        localStorage.removeItem(suggestionKey);
      }
      
      // Add some mock data for UI display purposes
      professors = professors.map((prof: Professor, index: number) => ({
        ...prof,
        id: prof.id || (prof.name + prof.university_name + prof.field_of_research).split('').reduce((a, b) => a + b.charCodeAt(0), 0), // Generate consistent ID based on professor data
        publications: Math.floor(Math.random() * 100) + 10,
        citations: Math.floor(Math.random() * 5000) + 500,
        title: `Professor of ${prof.field_of_research.split(';')[0]}`,
        image: `https://source.unsplash.com/random/256x256/?professor&${prof.name}`, // Use professor name for consistent image
        researchAreas: prof.field_of_research.split(';').map(area => area.trim())
      }));
      
      setFilteredProfessors(professors);
      setHasSearched(true);
      
      // Create new search session and save to history
      const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newSession: SearchSession = {
        id: sessionId,
        query: searchTerm,
        timestamp: Date.now(),
        professors: professors,
        aiSuggestion: suggestion
      };
      
      // Update search history (keep last 20 searches)
      setSearchHistory(prevHistory => {
        const updatedHistory = [newSession, ...prevHistory.slice(0, 19)];
        localStorage.setItem('researchConnect_searchHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });
      
      setCurrentSessionId(sessionId);

      // Save to database as well
      try {
        if (userPrefsService.isUserInitialized()) {
          await userPrefsService.addToSearchHistory(searchTerm, professors.length);
          await userPrefsService.saveSearchSession({
            session_id: sessionId,
            query: searchTerm,
            results_count: professors.length,
            ai_suggestion: suggestion,
            professors_found: professors
          });
        }
      } catch (error) {
        console.error('Error saving search to database:', error);
        // Continue anyway - don't break the search flow
      }
      
      // Update URL to include session ID
      const url = new URL(window.location.href);
      url.searchParams.set('session', sessionId);
      window.history.replaceState({}, document.title, url.toString());
      
      // Save results to localStorage (keeping for backwards compatibility)
      localStorage.setItem('researchConnect_professors', JSON.stringify(professors));
      localStorage.setItem('researchConnect_hasSearched', 'true');
      
      // Continue tutorial if user just searched during tutorial
      if (showTutorial && professors && professors.length > 0) {
        // Replace the initial tutorial steps with the complete flow including post-search steps
        setTimeout(() => {
          setTutorialSteps([...enhancedSearchPageTutorialSteps, ...enhancedPostSearchTutorialSteps]);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error searching professors:', error);
      
      // Handle different types of errors
      if (error.message?.includes('JSON') || error.message?.includes('Unexpected token')) {
        // JSON parsing error - likely server returned HTML error page
        setAISuggestion(`Server error occurred. Please refresh the page and try again. If the problem persists, check your internet connection.`);
        setFilteredProfessors([]);
        setHasSearched(true);
      } else if (error.response?.status === 400 && error.response?.data?.suggestion) {
        // Display helpful validation message
        const errorSuggestion = error.response.data.suggestion;
        setAISuggestion(errorSuggestion);
        
        // Clear any previous suggestion display status since this is a new suggestion
        if (errorSuggestion) {
          const suggestionKey = `researchConnect_aiSuggestionDisplayed_${btoa(errorSuggestion.substring(0, 50))}`;
          localStorage.removeItem(suggestionKey);
        }
        setFilteredProfessors([]);
        setHasSearched(true);
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        // Timeout error
        setAISuggestion(`Request timed out. Please check your internet connection and try again.`);
        setFilteredProfessors([]);
        setHasSearched(true);
      } else if (error.response?.status >= 500) {
        // Server error
        setAISuggestion(`Server is temporarily unavailable. Please try again in a few moments.`);
        setFilteredProfessors([]);
        setHasSearched(true);
      } else {
        // Handle other errors
        setAISuggestion(`Sorry, I couldn't search for "${searchTerm}". Please try again with a different research topic or check your internet connection.`);
        setFilteredProfessors([]);
        setHasSearched(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load a previous search session
  const loadSearchSession = (session: SearchSession) => {
    setCurrentSessionId(session.id);
    setSearchQuery(session.query);
    setLastSearchedTerm(session.query);
    setFilteredProfessors(session.professors);
    setAISuggestion(session.aiSuggestion);
    setHasSearched(true);
    
    // Update URL to include session ID
    const url = new URL(window.location.href);
    url.searchParams.set('session', session.id);
    window.history.replaceState({}, document.title, url.toString());
    
    // Close search history sidebar on mobile
    setShowSearchHistory(false);
  };

  // Function to start a new search (clear current session)
  const startNewSearch = () => {
    setCurrentSessionId(null);
    setSearchQuery("");
    setLastSearchedTerm("");
    setFilteredProfessors([]);
    setAISuggestion("");
    setHasSearched(false);
    
    // Update URL to remove session ID
    const url = new URL(window.location.href);
    url.searchParams.delete('session');
    window.history.replaceState({}, document.title, url.toString());
    
    // Close search history sidebar on mobile
    setShowSearchHistory(false);
  };

  // Function to delete a search session
  const deleteSearchSession = (sessionId: string) => {
    setSearchHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(session => session.id !== sessionId);
      localStorage.setItem('researchConnect_searchHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
    
    // If the deleted session is the current one, start a new search
    if (currentSessionId === sessionId) {
      startNewSearch();
    }
  };

  // Tutorial control functions
  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    
    try {
      await userPrefsService.markTutorialCompleted('main_search_tutorial');
    } catch (error) {
      console.error('Error saving tutorial completion:', error);
      // Fallback to localStorage
      localStorage.setItem('researchConnect_hasSeenTutorial', 'true');
    }
    
    addNotification({
      type: 'success',
      title: 'Tutorial Complete!',
      message: 'You\'re ready to start finding amazing professors. Happy researching!',
      icon: <GraduationCap className="h-5 w-5" />
    });
  };

  const handleTutorialSkip = async () => {
    setShowTutorial(false);
    
    try {
      await userPrefsService.markTutorialCompleted('main_search_tutorial');
    } catch (error) {
      console.error('Error saving tutorial skip:', error);
      // Fallback to localStorage
      localStorage.setItem('researchConnect_hasSeenTutorial', 'true');
    }
    
    addNotification({
      type: 'info',
      title: 'Tutorial Skipped',
      message: 'You can always restart the tutorial from your profile settings.',
      icon: <Info className="h-5 w-5" />
    });
  };

  // Function to manually start tutorial (for settings)
  const startTutorial = (type: 'full' | 'quick' = 'full') => {
    setTutorialType(type);
    // Reset tutorial steps to initial state when starting tutorial
    setTutorialSteps(type === 'quick' ? quickStartTutorialSteps : enhancedSearchPageTutorialSteps);
    setShowTutorial(true);
  };

  const handleSaveProfessor = async (professor: Professor) => {
    try {
      const professorData = {
        id: professor.id?.toString() || `${professor.name}-${professor.university_name}`,
        name: professor.name,
        university: professor.university_name
      };
      
      // Check if already saved
      const isAlreadySaved = userPrefsService.isUserInitialized() 
        ? userPrefsService.isProfessorSaved(professorData.id)
        : savedProfessors.includes(professorData.id);
      
      if (!isAlreadySaved) {
        if (userPrefsService.isUserInitialized()) {
          await userPrefsService.saveProfessor(professorData);
          // Refresh saved professors list from updated database
          const savedProfs = userPrefsService.getSavedProfessors();
          const savedIds = savedProfs.map(prof => prof.id);
          setSavedProfessors(savedIds);
        } else {
          // Fallback to localStorage
          const savedProfs = JSON.parse(localStorage.getItem('savedProfessors') || '[]');
          const fullProfessorData = {
            ...professorData,
            email: professor.email,
            department: professor.field_of_research.split(';')[0] || professor.field_of_research,
            interests: professor.field_of_research,
            savedAt: new Date().toISOString()
          };
          savedProfs.push(fullProfessorData);
          localStorage.setItem('savedProfessors', JSON.stringify(savedProfs));
          setSavedProfessors([...savedProfessors, professorData.id]);
        }
        
        // Show beautiful success notification
        addNotification({
          type: 'success',
          title: 'Professor Saved!',
          message: `${professor.name} has been added to your saved professors.`,
          icon: <Heart className="h-5 w-5" />
        });
      } else {
        // Show info notification for already saved
        addNotification({
          type: 'info',
          title: 'Already Saved',
          message: `${professor.name} is already in your saved professors.`,
          icon: <Check className="h-5 w-5" />
        });
      }
    } catch (error) {
      console.error('Error saving professor:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save professor. Please try again.',
        icon: <XCircle className="h-5 w-5" />
      });
    }
  };

  const handlePersonalizedEmail = (professor: Professor) => {
    const professorId = professor.id?.toString() || professor.name;
    
    // Prevent multiple triggers for the same professor
    if (processingEmailForProfessor === professorId) {
      return;
    }
    
    setProcessingEmailForProfessor(professorId);
    
    // Store the selected professor data for the email tab
    setSelectedProfessorForEmail(professor);
    localStorage.setItem('selectedProfessorForEmail', JSON.stringify(professor));
    
    // Show a beautiful notification with longer duration
    addNotification({
      type: 'success',
      title: 'Professor Selected!',
      message: `${professor.name} has been selected for personalized email composition.`,
      icon: <Mail className="h-5 w-5" />
    });
    
    // Check user preference for auto-switching
    const autoSwitchPreference = localStorage.getItem('researchConnect_autoSwitchToEmail');
    
    if (autoSwitchPreference === 'true') {
      // Auto-switch to email tab after a longer delay
      setTimeout(() => {
        setActiveTab('email');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        // Reset processing state after a longer cooldown
        setTimeout(() => {
          setProcessingEmailForProfessor(null);
        }, 3000);
      }, 3000); // Increased from 1500ms to 3000ms
    } else if (autoSwitchPreference === 'false') {
      // Don't show modal, just stay on current tab
      setTimeout(() => {
        setProcessingEmailForProfessor(null);
      }, 3000);
    } else {
      // Show custom modal after a longer delay to let user read the notification
      setTimeout(() => {
        // Only show modal if it's not already showing and we're still processing
        if (!showTabSwitchModal && processingEmailForProfessor === professorId) {
          setModalProfessor(professor);
          setShowTabSwitchModal(true);
        }
      }, 4000); // Increased from 2500ms to 4000ms for longer cooldown
    }
  };

  // ShinyText component from the home page
  const ShinyText = ({ text, className = "" }: { text: string; className?: string }) => (
    <div className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <div className="absolute inset-0 w-full h-full overflow-hidden rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0">
        <div className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine z-0" />
      </div>
    </div>
  );

  // Card-based question system
  const questionCards = [
    {
      id: 'name',
      title: 'What\'s your full name?',
      subtitle: 'This will be used in your email signature',
      icon: <User className="h-6 w-6" />,
      value: userFullName,
      setValue: setUserFullName,
      type: 'text',
      placeholder: 'Enter your full name',
      required: true
    },
    {
      id: 'research-title',
      title: 'What\'s your research interest?',
      subtitle: 'This should align with the professor\'s work area',
      icon: <Brain className="h-6 w-6" />,
      value: researchTitle,
      setValue: setResearchTitle,
      type: 'text',
      placeholder: 'e.g., Machine Learning in Healthcare, Climate Change Research',
      required: true,
      tip: 'Search the professor on Google Scholar and find their recent papers for inspiration!'
    },
    {
      id: 'research-abstract',
      title: 'Describe your research interest',
      subtitle: 'What specifically interests you about this area?',
      icon: <FileText className="h-6 w-6" />,
      value: researchAbstract,
      setValue: setResearchAbstract,
      type: 'textarea',
      placeholder: 'Describe what fascinates you about this research area...',
      required: true,
      tip: 'Pro tip: Copy an abstract from their recent paper and explain what questions you have!'
    },
    {
      id: 'university',
      title: 'What university do you attend?',
      subtitle: 'Your current educational institution',
      icon: <GraduationCap className="h-6 w-6" />,
      value: currentUniversity,
      setValue: setCurrentUniversity,
      type: 'text',
      placeholder: 'e.g., Stanford University, Austin High School',
      required: true
    },
    {
      id: 'year',
      title: 'What\'s your academic level?',
      subtitle: 'This helps professors understand your background',
      icon: <BookOpen className="h-6 w-6" />,
      value: yearOfStudy,
      setValue: setYearOfStudy,
      type: 'select',
      options: ['High School Student', 'Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student', 'PhD Student'],
      required: true
    },
    {
      id: 'location',
      title: 'Where are you located?',
      subtitle: 'This helps with collaboration logistics',
      icon: <Home className="h-6 w-6" />,
      value: opportunityType,
      setValue: setOpportunityType,
      type: 'text',
      placeholder: 'e.g., Austin, TX or Boston, MA',
      required: true
    },
    {
      id: 'resume',
      title: 'Share your resume',
      subtitle: 'Upload a file or provide a link to your portfolio',
      icon: <Upload className="h-6 w-6" />,
      value: resumeUrl,
      setValue: setResumeUrl,
      type: 'file-or-url',
      placeholder: 'https://your-portfolio.com or upload file',
      required: true
    }
  ];

  const calculateProgress = () => {
    return Math.round((completedCards.size / questionCards.length) * 100);
  };

  const isCardComplete = (card: any) => {
    if (card.type === 'file-or-url') {
      return card.value.trim() || resumeFile;
    }
    return card.value.trim();
  };

  const handleCardNext = () => {
    const currentCard = questionCards[currentCardIndex];
    if (isCardComplete(currentCard)) {
      setCompletedCards(prev => {
        const newSet = new Set(prev);
        newSet.add(currentCardIndex);
        return newSet;
      });
    }
    
    if (currentCardIndex < questionCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // All cards completed!
      setShowCardSystem(false);
      // Clear saved progress since setup is complete
      localStorage.removeItem('cardSystemProgress');
      // Show success message
      setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Setup Complete!',
          message: 'Your information has been saved and you can now generate personalized emails.',
          icon: <GraduationCap className="h-5 w-5" />
        });
      }, 500);
    }
  };

  const handleCardPrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleCardSkip = () => {
    if (currentCardIndex < questionCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setShowCardSystem(false);
    }
  };

  const startCardFlow = () => {
    setCurrentCardIndex(0);
    setCompletedCards(new Set());
    setShowCardSystem(true);
    // Clear any saved progress when starting fresh
    localStorage.removeItem('cardSystemProgress');
  };

  // Keyboard navigation for cards
  useEffect(() => {
    if (!showCardSystem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with typing in input fields
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        // Only handle Escape key when in input fields
        if (e.key === 'Escape') {
          target.blur(); // Remove focus from input
          return;
        }
        return; // Let the input handle all other keys normally
      }

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        const currentCard = questionCards[currentCardIndex];
        if (!currentCard.required || isCardComplete(currentCard)) {
          handleCardNext();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleCardPrevious();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCardSystem(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCardSystem, currentCardIndex, questionCards]);

  // Auto-save progress to localStorage
  useEffect(() => {
    if (showCardSystem) {
      localStorage.setItem('cardSystemProgress', JSON.stringify({
        currentCardIndex,
        completedCards: Array.from(completedCards),
        showCardSystem
      }));
    }
  }, [currentCardIndex, completedCards, showCardSystem]);

  // Auto-save form data to localStorage whenever it changes
  useEffect(() => {
    const formData = {
      userFullName,
      researchTitle,
      researchAbstract,
      resumeUrl,
      currentUniversity,
      academicLevel,
      yearOfStudy,
      specificInterest,
      researchInterest,
      researchQuestions,
      opportunityType,
      researchFieldConnection
    };
    localStorage.setItem('researchConnect_formData', JSON.stringify(formData));
    
    // Also save to a backup key for better persistence
    localStorage.setItem('researchConnect_formData_backup', JSON.stringify(formData));
  }, [userFullName, researchTitle, researchAbstract, resumeUrl, currentUniversity, academicLevel, yearOfStudy, specificInterest, researchInterest, researchQuestions, opportunityType, researchFieldConnection]);

  // Load card progress and form data on component mount
  useEffect(() => {
    // Load form data with backup
    const savedFormData = localStorage.getItem('researchConnect_formData') || localStorage.getItem('researchConnect_formData_backup');
    if (savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        setUserFullName(formData.userFullName || '');
        setResearchTitle(formData.researchTitle || '');
        setResearchAbstract(formData.researchAbstract || '');
        setResumeUrl(formData.resumeUrl || '');
        setCurrentUniversity(formData.currentUniversity || '');
        setAcademicLevel(formData.academicLevel || '');
        setYearOfStudy(formData.yearOfStudy || '');
        setSpecificInterest(formData.specificInterest || '');
        setResearchInterest(formData.researchInterest || '');
        setResearchQuestions(formData.researchQuestions || '');
        setOpportunityType(formData.opportunityType || '');
        setResearchFieldConnection(formData.researchFieldConnection || '');
      } catch (error) {
        console.log('Error loading form data from localStorage:', error);
      }
    }

    // Load card progress
    const savedProgress = localStorage.getItem('cardSystemProgress');
    if (savedProgress) {
      try {
        const { currentCardIndex: savedIndex, completedCards: savedCompleted, showCardSystem: savedShow } = JSON.parse(savedProgress);
        if (savedShow && savedIndex !== undefined) {
          setCurrentCardIndex(savedIndex);
          setCompletedCards(new Set(savedCompleted));
          // Don't auto-restore showCardSystem to avoid interrupting user
        }
      } catch (error) {
        console.log('Error loading card progress:', error);
      }
    }
  }, []);

  // Optimized QuestionCard component with stable references
  const QuestionCard = ({ card, isActive }: { card: any; isActive: boolean }) => {
    if (!isActive) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="relative">
          {/* Static background */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#0CF2A0]/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-sm"></div>
          
          <div className="relative bg-gradient-to-br from-[#1a1a1a]/95 to-[#0a0a0a]/95 border border-[#0CF2A0]/30 rounded-2xl p-8 backdrop-blur-xl">
            {/* Card header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[#0CF2A0]/20 rounded-xl text-[#0CF2A0]">
                {card.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-400">{card.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                {completedCards.has(currentCardIndex) && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#0CF2A0]/20 text-[#0CF2A0] px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Complete
                  </motion.div>
                )}
                <div className="text-sm text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                  {currentCardIndex + 1} / {questionCards.length}
                </div>
              </div>
            </div>

            {/* Tip section */}
            {card.tip && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-300 text-sm">💡 {card.tip}</p>
              </div>
            )}

            {/* Input field */}
            <div className="mb-8">
              {card.type === 'text' && (
                <input
                  type="text"
                  value={card.value}
                  onChange={(e) => {
                    console.log('Input change:', e.target.value);
                    card.setValue(e.target.value);
                  }}
                  onFocus={() => console.log('Input focused')}
                  onBlur={() => console.log('Input blurred')}
                  onClick={() => console.log('Input clicked')}
                  placeholder={card.placeholder}
                  className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-6 py-4 text-white text-lg placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                  autoComplete="off"
                  spellCheck="false"
                />
              )}
              
              {card.type === 'textarea' && (
                <textarea
                  value={card.value}
                  onChange={(e) => card.setValue(e.target.value)}
                  placeholder={card.placeholder}
                  rows={6}
                  className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-6 py-4 text-white text-lg placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200 resize-none"
                />
              )}
              
              {card.type === 'select' && (
                <select
                  value={card.value}
                  onChange={(e) => card.setValue(e.target.value)}
                  className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-6 py-4 text-white text-lg focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                >
                  <option value="">Select your level...</option>
                  {card.options?.map((option: string) => (
                    <option key={option} value={option} className="bg-[#1a1a1a]">
                      {option}
                    </option>
                  ))}
                </select>
              )}
              
              {card.type === 'file-or-url' && (
                <div className="space-y-4">
                  <input
                    type="url"
                    value={card.value}
                    onChange={(e) => card.setValue(e.target.value)}
                    placeholder={card.placeholder}
                    className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-6 py-4 text-white text-lg placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                  />
                  <div className="text-center text-gray-400">or</div>
                  <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 text-center hover:border-[#0CF2A0]/50 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setResumeFile(file);
                          setResumeUrl('');
                        }
                      }}
                      className="hidden"
                      id={`resume-upload-${currentCardIndex}`}
                      accept=".pdf,.doc,.docx"
                    />
                    <label htmlFor={`resume-upload-${currentCardIndex}`} className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Click to upload resume</p>
                      {resumeFile && (
                        <p className="text-[#0CF2A0] mt-2 text-sm">📄 {resumeFile.name}</p>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleCardPrevious}
                disabled={currentCardIndex === 0}
                className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCardSkip}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
                
                <button
                  onClick={handleCardNext}
                  disabled={card.required && !isCardComplete(card)}
                  className="bg-gradient-to-r from-[#0CF2A0] to-[#0CF2A0]/80 text-black px-8 py-3 rounded-xl font-semibold hover:from-[#0CF2A0]/90 hover:to-[#0CF2A0]/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {currentCardIndex === questionCards.length - 1 ? 'Complete' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Beautiful macOS-style notification component
  const Notification = ({ notification, onRemove }: { 
    notification: { id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string; icon?: React.ReactNode }; 
    onRemove: (id: string) => void 
  }) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return <Check className="h-5 w-5" />;
        case 'info':
          return <Info className="h-5 w-5" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5" />;
        case 'error':
          return <XCircle className="h-5 w-5" />;
        default:
          return notification.icon || <Check className="h-5 w-5" />;
      }
    };

    const getIconColor = () => {
      switch (notification.type) {
        case 'success':
          return 'text-green-400';
        case 'info':
          return 'text-blue-400';
        case 'warning':
          return 'text-yellow-400';
        case 'error':
          return 'text-red-400';
        default:
          return 'text-[#0CF2A0]';
      }
    };

    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5 transition-all duration-300 hover:bg-white/8 hover:border-white/20"
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
        
        {/* Content */}
        <div className="relative flex items-start gap-3 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <div className={`p-2 rounded-xl bg-white/10 backdrop-blur-sm ${getIconColor()}`}>
              {getIcon()}
            </div>
          </div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm leading-tight mb-1 text-white">
              {notification.title}
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {notification.message}
            </p>
          </div>
          
          {/* Close button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(notification.id);
            }}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/15 transition-colors duration-150 group cursor-pointer transform-gpu will-change-transform active:scale-90"
            type="button"
          >
            <X className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-150" />
          </button>
        </div>
        
        {/* Progress bar */}
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 10, ease: "linear" }}
          className="h-0.5 bg-white/20"
        />
      </div>
    );
  };

  // Notification manager functions
  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-remove after 10 seconds (even longer duration for better UX)
    setTimeout(() => {
      removeNotification(id);
    }, 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Beautiful custom modal component
  const TabSwitchModal = () => {
    if (!showTabSwitchModal || !modalProfessor) return null;

    const handleConfirm = () => {
      setActiveTab('email');
      setShowTabSwitchModal(false);
      setModalProfessor(null);
      setProcessingEmailForProfessor(null); // Reset processing state
      // Save preference if "don't ask again" is checked
      if (dontAskAgain) {
        localStorage.setItem('researchConnect_autoSwitchToEmail', 'true');
      }
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    };

    const handleCancel = () => {
      setShowTabSwitchModal(false);
      setModalProfessor(null);
      setProcessingEmailForProfessor(null); // Reset processing state
      // Save preference if "don't ask again" is checked
      if (dontAskAgain) {
        localStorage.setItem('researchConnect_autoSwitchToEmail', 'false');
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleCancel}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5 transition-all duration-300 hover:bg-white/8 hover:border-white/20"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
          >
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-2xl bg-[#0CF2A0]/20 backdrop-blur-sm">
                  <Mail className="h-8 w-8 text-[#0CF2A0]" />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold text-white text-center mb-2">
                Switch to Email Tab?
              </h3>
              
              {/* Message */}
              <p className="text-white/80 text-center mb-4 leading-relaxed">
                Would you like to switch to the Email tab to compose a personalized message to{' '}
                <span className="text-[#0CF2A0] font-medium">{modalProfessor.name}</span>?
              </p>
              
              {/* Don't ask again checkbox */}
              <div className="flex items-center justify-center mb-6">
                <label className="flex items-center gap-2 text-white/70 hover:text-white/90 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontAskAgain}
                    onChange={(e) => setDontAskAgain(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 checked:bg-[#0CF2A0] checked:border-[#0CF2A0] focus:ring-[#0CF2A0] focus:ring-2 transition-all"
                  />
                  <span className="text-sm">Don't ask again</span>
                </label>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#0CF2A0] text-black font-semibold hover:bg-[#0CF2A0]/90 transition-all duration-200 shadow-lg"
                >
                  Switch Tab
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const navLinks = [
    { href: "/professors", label: "Professors", icon: <GraduationCap className="h-4 w-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  ];

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('researchConnect_activeTab', activeTab);
    
    // Update URL without causing navigation
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, document.title, url.toString());
    
    // Debug: Log tab changes to help identify reloading issues
    console.log('Tab changed to:', activeTab, 'Professors count:', filteredProfessors.length);
  }, [activeTab]);

  // Add this section to render the AI suggestion
  // Typing animation component - fixed to not restart on tab switch or page refresh
  const TypingText = ({ text, speed = 30 }: { text: string; speed?: number }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    
    useEffect(() => {
      if (!text) return;
      
      // Create a hash of the text to detect actual changes
      const currentHash = btoa(text.substring(0, 50));
      
      // Check if this specific AI suggestion was already fully displayed before
      const suggestionKey = `researchConnect_aiSuggestionDisplayed_${currentHash}`;
      const wasAlreadyDisplayed = localStorage.getItem(suggestionKey) === 'true';
      
      if (wasAlreadyDisplayed) {
        // If already displayed before, show immediately without animation
        setDisplayedText(text);
        setIsComplete(true);
        return;
      }
      
      // Start typing animation
      setDisplayedText('');
      setIsComplete(false);
      let i = 0;
      
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          // Mark this suggestion as fully displayed
          localStorage.setItem(suggestionKey, 'true');
          clearInterval(timer);
        }
      }, speed);
      
      return () => clearInterval(timer);
    }, [text, speed]);
    
    return (
      <span className="text-white text-base leading-relaxed">
        {displayedText}
        {!isComplete && (
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-[#0CF2A0] ml-1"
          >
            |
          </motion.span>
        )}
      </span>
    );
  };

  const renderAISuggestion = () => {
    if (!filteredProfessors.length || !hasSearched) return null;
    
    console.log('Rendering AI suggestion with', filteredProfessors.length, 'professors');
    
    const suggestionText = aiSuggestion || "Here are some professors that match your search criteria. Consider reaching out to those whose research interests align with your goals.";
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-8 max-w-4xl mx-auto w-full"
        data-tutorial="ai-recommendation"
      >
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-white mb-3">Professor Recommendation</h3>
          <div className="text-base leading-relaxed">
            <TypingText text={suggestionText} speed={8} />
          </div>
        </div>
      </motion.div>
    );
  };

  // Generate personalized email using PROVEN TEMPLATE
  const generatePersonalizedEmail = async () => {
    if (!selectedProfessorForEmail || !userFullName.trim() || (!resumeFile && !resumeUrl.trim())) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in your name and upload a resume or provide a resume link before generating an email.',
        icon: <AlertTriangle className="h-5 w-5" />
      });
      return;
    }

    setIsGeneratingEmail(true);
    
    try {
      // Save all research data to localStorage
      localStorage.setItem('researchConnect_userResearchData', JSON.stringify({
        title: researchTitle,
        abstract: researchAbstract
      }));

      localStorage.setItem('userResearchInfo', JSON.stringify({
        name: userFullName,
        title: researchTitle,
        abstract: researchAbstract,
        resumeUrl,
        resumeFile: resumeFile?.name || null,
        currentUniversity,
        yearOfStudy,
        specificInterest,
        researchInterest,
        researchQuestions,
        opportunityType,
        researchFieldConnection
      }));

      // Use the EXACT proven template
      const professorName = selectedProfessorForEmail.name;
      const userLocation = opportunityType || 'Austin, TX';
      const researchField = researchFieldConnection || selectedProfessorForEmail.field_of_research?.split(';')[0] || 'your research area';
      const paperTitle = researchInterest || `your recent work`;
      const fascinatingAspects = researchQuestions || `your contributions to ${researchField}`;

      // Use the proven high school student template
      const emailContent = `Subject: ${paperTitle} - question from ${userLocation}

Dear Professor ${professorName},

I hope this email finds you well. My name is ${userFullName}, and I'm a ${yearOfStudy || 'high school student'} based in ${userLocation}. While exploring ${researchField}, I came across ${paperTitle}. I was really fascinated by ${fascinatingAspects}

After reading your work, I had a few questions and thoughts. ${researchQuestions || `One thing that stood out was your innovative approach. I was curious about potential applications and future directions of this research.`}

I&apos;ve done some research before, but I&apos;m especially excited about how ${researchField} can advance our understanding. I&apos;d love the chance to support your lab&apos;s work—whether it&apos;s helping with data analysis, reading papers, or learning hands-on over the summer as a volunteer intern. I promise to give it my all and contribute with the dedication of a college student. I really believe this would help me grow in ${researchField} and related fields.

If you're open to it, I&apos;d love to speak with you more about how I could get involved${specificInterest ? `, especially regarding ${specificInterest}` : ''}. And if your lab doesn&apos;t have space, I would really appreciate any recommendations for other labs doing similar work that might be open to mentoring ${yearOfStudy || 'high school students'}.

You can view my resume here:
${resumeFile ? `Resume: ${resumeFile.name} (attached)` : resumeUrl}

Thank you so much for your time, and I hope to hear from you soon.

Best regards,
${userFullName}`;

      setGeneratedEmail(emailContent);
      setEditableEmail(emailContent);
      
      addNotification({
        type: 'success',
        title: 'Email Generated!',
        message: `Personalized email for ${selectedProfessorForEmail.name} has been created successfully.`,
        icon: <Mail className="h-5 w-5" />
      });
    } catch (error) {
      console.error('Error generating email:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate personalized email. Please try again.',
        icon: <XCircle className="h-5 w-5" />
      });
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Copy email to clipboard
  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableEmail || generatedEmail);
      
      // Show beautiful success notification
      addNotification({
        type: 'success',
        title: 'Email Copied!',
        message: 'The email has been copied to your clipboard.',
        icon: <Copy className="h-5 w-5" />
      });
    } catch (error) {
      console.error('Failed to copy email:', error);
      
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy email to clipboard. Please try again.',
        icon: <XCircle className="h-5 w-5" />
      });
    }
  };

  // Handle resume file upload
  const handleResumeUpload = (file: File) => {
    setResumeFile(file);
    setResumeUrl(""); // Clear URL when file is uploaded
  };

  const removeResumeFile = () => {
    setResumeFile(null);
  };

  // Handle email editing
  const handleEditEmail = () => {
    setIsEditingEmail(true);
  };

  const handleSaveEdits = () => {
    setGeneratedEmail(editableEmail);
    setIsEditingEmail(false);
  };

  const handleCancelEdit = () => {
    setEditableEmail(generatedEmail);
    setIsEditingEmail(false);
  };

  // Generate a simple email template for quick use
  const generateQuickTemplate = () => {
    const professorName = selectedProfessorForEmail?.name || '[Professor Name]';
    
    const template = `Subject: Interest in your research on [specific research topic/method]

Dear Professor ${professorName},

I hope this email finds you well. My name is [Your Name], and I'm a [high school/undergraduate] student from [Your Location]. I recently came across your research on [specific paper/work title], and I was really fascinated by [what specifically interested you about their work].

After reading your work, I had a few thoughtful questions: [Your specific questions about their research].

I have some research experience in [relevant area], and I'm particularly excited about how [research field] can advance our understanding of [specific application]. I'd love the opportunity to contribute to your lab's work—whether helping with data analysis, literature reviews, or learning hands-on as a volunteer research assistant.

I'm committed to bringing the dedication and work ethic of a graduate student to any opportunity. This experience would be invaluable for my growth in [research field] and related areas.

If your lab has space, I'd be thrilled to discuss how I could contribute. If not, I would greatly appreciate any recommendations for other researchers doing similar work who might be open to mentoring students.

You can find my resume at: [Your Resume Link]

Thank you very much for your time and consideration.

Best regards,
[Your Name]
[Your Email]
[Your University/School]`;

    return template;
  };

  // Check connection status
  // Generate email using EXACT proven template
  const generateSimpleEmailBody = () => {
    const professorName = selectedProfessorForEmail?.name || 'Professor';
    const userLocation = opportunityType || 'Austin, TX';
    const researchField = researchFieldConnection || selectedProfessorForEmail?.field_of_research?.split(';')[0] || 'your research area';
    const paperTitle = researchInterest || `your recent work`;
    const fascinatingAspects = researchQuestions || `your contributions to ${researchField}`;
    
    return `Dear Professor ${professorName},

I hope this email finds you well. My name is ${userFullName}, and I'm a high school student based in ${userLocation}. While exploring ${researchField}, I came across ${paperTitle}. I was really fascinated by ${fascinatingAspects}

After reading your paper, I had a few questions and thoughts. ${researchQuestions || `One thing that stood out was your innovative approach. I was curious about potential applications and future directions of this research.`}

I&apos;ve done some research before, but I&apos;m especially excited about how ${researchField} can advance our understanding. I&apos;d love the chance to support your lab&apos;s work—whether it&apos;s helping with data, reading papers, or learning hands-on over the summer as a volunteer intern. I promise to give it my all and work as hard as any college student. I really believe this would help me grow in ${researchField} and related fields.

If you're open to it, I&apos;d love to speak with you more about how I could get involved, even just as a volunteer intern. And if your lab doesn&apos;t have space, I would really appreciate any recommendations for other labs doing similar work that might be open to mentoring high school students.

You can view my website and resume here:
https://bharath-erusalagandi-portfolio.netlify.app/

Thank you so much for your time, and I hope to hear from you soon.

Best regards,
${userFullName}`;
  };

  const checkConnectionStatus = async (connectedAccountId: string, entityId?: string | null) => {
    try {
      // Use our improved connection status API
      const params = new URLSearchParams();
      if (connectedAccountId) params.append('connectedAccountId', connectedAccountId);
      if (entityId) params.append('entityId', entityId);
      
      const response = await fetch(`/api/composio/connection-status?${params.toString()}`);
      const result = await response.json();
      
      if (result.success && result.isConnected) {
        setIsGmailConnected(true);
        setConnectedAccountId(connectedAccountId);
        if (result.accountEmail) {
          setConnectedAccountEmail(result.accountEmail);
        }
        // Update stored entity ID if we got one back
        if (result.entityId) {
          localStorage.setItem('composio_entity_id', result.entityId);
        }
      } else {
        setIsGmailConnected(false);
        setConnectedAccountId(null);
        setConnectedAccountEmail(null);
        localStorage.removeItem('composio_connected_account_id');
        localStorage.removeItem('composio_entity_id');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setIsGmailConnected(false);
    }
  };

  // Handle sending email directly (no scheduling)
  const handleSendEmailWithAI = async () => {
    if (!selectedProfessorForEmail || !userFullName.trim() || (!resumeFile && !resumeUrl.trim()) || !connectedAccountId) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all required fields: professor, name, resume, and Gmail connection.',
        icon: <XCircle className="h-5 w-5" />
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      // Use the enhanced email content (editable if edited, otherwise generated)
      const emailToSend = editableEmail || generatedEmail;
      
      // Parse email content
      const lines = emailToSend.split('\n');
      const subjectLine = lines.find(line => line.startsWith('Subject:'));
      const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : `Research Collaboration Inquiry`;
      const body = lines.slice(lines.findIndex(line => line.startsWith('Subject:')) + 1).join('\n').trim();
      
      // Get the stored entity ID for proper authentication
      const storedEntityId = localStorage.getItem('composio_entity_id');
      
      // Send email directly using the simple send endpoint
      const response = await fetch('/api/composio/send-email-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedProfessorForEmail.email,
          subject,
          body,
          connectedAccountId,
          entityId: storedEntityId
        }),
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Email Sent Successfully!',
          message: `Your personalized email has been sent to ${selectedProfessorForEmail.name}.`,
          icon: <Mail className="h-5 w-5" />
        });
        
      } else {
        addNotification({
          type: 'error',
          title: 'Email Send Failed',
          message: `Failed to send email: ${result.error || 'Unknown error'}`,
          icon: <XCircle className="h-5 w-5" />
        });
        
        // If it's an authentication error, suggest reconnecting
        if (result.needsAuth) {
          setIsGmailConnected(false);
          setConnectedAccountId(null);
          localStorage.removeItem('composio_connected_account_id');
          localStorage.removeItem('composio_entity_id');
          
          addNotification({
            type: 'warning',
            title: 'Authentication Required',
            message: 'Please reconnect your Gmail account to send emails.',
            icon: <AlertTriangle className="h-5 w-5" />
          });
        }
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Network error while sending email. Please try again.',
        icon: <XCircle className="h-5 w-5" />
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle Gmail connection
  const handleConnectGmail = async () => {
    if (!selectedProfessorForEmail) {
      addNotification({
        type: 'warning',
        title: 'No Professor Selected',
        message: 'Please select a professor first before connecting Gmail.',
        icon: <AlertTriangle className="h-5 w-5" />
      });
      return;
    }

    setIsConnectingGmail(true);
    setEmailSentStatus(null);

    try {
      // Generate a unique user ID based on browser session
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/composio/connect-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        }),
      });

      const result = await response.json();

      if (result.success && result.redirectUrl) {
        // Store the connection details for later use
        setConnectedAccountId(result.connectedAccountId);
        localStorage.setItem('composio_connected_account_id', result.connectedAccountId);
        localStorage.setItem('composio_user_id', userId);
        
        // Open OAuth URL in a popup window
        const popup = window.open(
          result.redirectUrl,
          'gmail_auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Monitor the popup for completion
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            setIsConnectingGmail(false);
            
            // Check if the OAuth was successful by looking at the URL params
            // (This will be handled by the useEffect watching for OAuth results)
          }
        }, 1000);

        // Timeout after 10 minutes
        setTimeout(() => {
          if (popup && !popup.closed) {
            popup.close();
            setIsConnectingGmail(false);
            addNotification({
              type: 'error',
              title: 'Connection Timeout',
              message: 'Gmail connection timed out. Please try again.',
              icon: <XCircle className="h-5 w-5" />
            });
          }
          clearInterval(checkPopup);
        }, 600000);

      } else {
        throw new Error(result.error || 'Failed to initiate Gmail connection');
      }

    } catch (error) {
      console.error('Error connecting Gmail:', error);
      addNotification({
        type: 'error',
        title: 'Gmail Connection Failed',
        message: `Failed to connect Gmail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        icon: <XCircle className="h-5 w-5" />
      });
      setIsConnectingGmail(false);
    }
  };



  // Scroll to top when switching to email tab
  useEffect(() => {
    if (activeTab === 'email') {
      // Use a longer delay to ensure all content is fully rendered
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    }
  }, [activeTab]);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mobile-menu-container') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="relative min-h-screen bg-[#111111] text-gray-300 flex flex-col overflow-x-hidden">
      {/* Interactive Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-80" />
      <div className="absolute inset-0 z-1 pointer-events-none" style={{
            background: 'linear-gradient(to bottom, transparent 0%, #111111 90%), radial-gradient(ellipse at center, transparent 40%, #111111 95%)'
      }}></div>
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification, index) => (
            <motion.div 
              key={notification.id} 
              className="pointer-events-auto"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.3 
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Notification 
                notification={notification} 
                onRemove={removeNotification} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Search History Sidebar */}
      <AnimatePresence>
        {showSearchHistory && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowSearchHistory(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-[#1a1a1a]/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Search History</h2>
                  <button
                    onClick={() => setShowSearchHistory(false)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* New Search Button */}
                <button
                  onClick={startNewSearch}
                  className="w-full mt-3 flex items-center gap-2 px-3 py-2 bg-[#0CF2A0] text-black rounded-lg hover:bg-[#0CF2A0]/90 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Search
                </button>
                
                {/* Tutorial Button */}
                <button
                  onClick={() => startTutorial('full')}
                  className="w-full mt-2 flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tutorial
                </button>
              </div>
              
              {/* Search History List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {searchHistory.length === 0 ? (
                  <div className="text-center text-white/40 py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>No search history yet</p>
                    <p className="text-sm mt-1">Your searches will appear here</p>
                  </div>
                ) : (
                  searchHistory.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                        currentSessionId === session.id
                          ? 'bg-[#0CF2A0]/20 border-[#0CF2A0]/30 text-white'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80 hover:text-white'
                      }`}
                      onClick={() => loadSearchSession(session)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{session.query}</p>
                          <p className="text-sm opacity-60 mt-1">
                            {session.professors.length} professors found
                          </p>
                          <p className="text-xs opacity-40 mt-1">
                            {new Date(session.timestamp).toLocaleDateString()} at {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSearchSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded text-white/40 hover:text-red-400 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Custom Modal */}
      <AnimatePresence>
        <TabSwitchModal />
      </AnimatePresence>
      
      {/* Combined Navigation */}
      <motion.div 
        className="sticky top-0 z-30 bg-[#111111]/90 backdrop-blur-md border-b border-gray-800/50 shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-20 relative">
            {/* Mobile Logo */}
            <div className="md:hidden absolute left-4 flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/logo without text.png" 
                  alt="Research Flow Logo" 
                  className="h-24 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <motion.div 
              className="hidden md:block bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-700/50 shadow-lg"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 8px 32px rgba(12, 242, 160, 0.15)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex space-x-2">
                {/* Main Navigation Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105",
                      link.href === "/search" 
                        ? "bg-[#0CF2A0]/15 text-[#0CF2A0]" 
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
                
                {/* Animated Divider */}
                <div className="flex items-center px-2">
                  <div className="w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent h-8" />
                </div>
                
                {/* Tab Navigation for Search Page */}
                <motion.button
                  onClick={() => setActiveTab('search')}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'search'
                      ? 'bg-[#0CF2A0] text-black shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <SearchIcon className="h-4 w-4" />
                  Search Professors
                  {hasSearched && filteredProfessors.length > 0 && (
                    <span className="ml-2 bg-[#0CF2A0] text-black text-xs px-2 py-1 rounded-full font-bold">
                      {filteredProfessors.length}
                    </span>
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('email')}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 relative ${
                    activeTab === 'email'
                      ? 'bg-[#0CF2A0] text-black shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  data-tutorial="email-tab"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <PenTool className="h-4 w-4" />
                  Personalized Email
                </motion.button>

              </div>
            </motion.div>
            
            {/* Mobile menu button */}
            <div className="md:hidden absolute right-4 flex items-center">
              <motion.button 
                className="mobile-menu-button text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0CF2A0] p-2 rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-20 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {/* Mobile Menu Panel */}
                         <motion.div
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="mobile-menu-container absolute right-0 top-0 h-full w-80 max-w-[80vw] bg-[#111111]/95 backdrop-blur-xl border-l border-gray-800/50 shadow-2xl"
               onClick={(e) => e.stopPropagation()}
             >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="p-6 border-b border-gray-800/50">
                  <h2 className="text-lg font-semibold text-white">Navigation</h2>
                </div>

                {/* Search Tab Buttons */}
                <div className="p-4 border-b border-gray-800/50">
                  <div className="space-y-2">
                    <motion.button
                      onClick={() => {
                        setActiveTab('search');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        activeTab === 'search'
                          ? 'bg-[#0CF2A0]/20 text-[#0CF2A0] border border-[#0CF2A0]/30'
                          : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SearchIcon className="h-5 w-5" />
                      <span className="font-medium">Search Professors</span>
                      {hasSearched && filteredProfessors.length > 0 && (
                        <span className="ml-auto bg-[#0CF2A0] text-black text-xs px-2 py-1 rounded-full font-bold">
                          {filteredProfessors.length}
                        </span>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setActiveTab('email');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        activeTab === 'email'
                          ? 'bg-[#0CF2A0]/20 text-[#0CF2A0] border border-[#0CF2A0]/30'
                          : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PenTool className="h-5 w-5" />
                      <span className="font-medium">Personalized Email</span>
                    </motion.button>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4">
                  <nav className="space-y-1 px-4">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div
                          className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 transition-all duration-200 touch-manipulation"
                          whileTap={{ scale: 0.95 }}
                        >
                          {link.icon}
                          <span className="font-medium">{link.label}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Menu Footer */}
                <div className="p-6 border-t border-gray-800/50">
                  <div className="flex items-center text-sm text-gray-400">
                    <span>Research Flow Platform</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-12 pb-16 relative z-10">
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'search' ? (
            <motion.div
              key="search-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-6xl mx-auto"
            >
              {/* Hero Section with Search */}
              <section className="w-full">

              
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-[60px] font-bold mb-6 text-white leading-tight"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Find Professors for Your <span className="text-[#0CF2A0] italic">Research</span>
                </motion.h1>
                
                <motion.p 
                  className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  Go on then, type in your research field.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-center justify-center w-full max-w-4xl mx-auto relative gap-4"
                >
                  {/* Search History Button */}
                  <motion.button
                    onClick={() => setShowSearchHistory(true)}
                    className="flex-shrink-0 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#0CF2A0]/30 transition-all duration-300 text-white/60 hover:text-white group relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Search History"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {searchHistory.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#0CF2A0] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {searchHistory.length}
                      </span>
                    )}
                  </motion.button>



                  <AIInputWithLoading
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={handleSearch}
                    disabled={isLoading}
                    isLoading={isLoading}
                    placeholder="Search research topics, professors, or universities..."
                    className="flex-1"
                    minHeight={60}
                    maxHeight={120}
                  />
                </motion.div>
                
                {/* Popular Topics section removed */}
              </section>

              {/* Results Section */}
              {hasSearched && (
                <motion.section 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="py-12 px-6 max-w-6xl mx-auto w-full"
                >
                    <h2 className="text-2xl font-bold mb-6 text-white">{
                      filteredProfessors.length > 0 
                        ? lastSearchedTerm.trim() 
                          ? `Found ${filteredProfessors.length} professors for "${lastSearchedTerm}"`
                          : `Found ${filteredProfessors.length} professors`
                        : `No professors found${lastSearchedTerm.trim() ? ` for "${lastSearchedTerm}"` : ''}`
                    }</h2>
                    
                    {/* AI Suggestion */}
                    {renderAISuggestion()}
                    
                    {/* Professor Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 professor-cards-container" data-tutorial="professor-cards-container">
                      {filteredProfessors.map((professor, index) => {
                        const isSaved = savedProfessors.includes(professor.id?.toString() || '');
                        
                        return (
                          <ProfessorCard
                            key={professor.id}
                            professor={professor}
                            index={index}
                            isSaved={isSaved}
                            isProcessing={processingEmailForProfessor === (professor.id?.toString() || professor.name)}
                            onSave={handleSaveProfessor}
                            onPersonalizedEmail={handlePersonalizedEmail}
                          />
                        );
                      })}
                    </div>
                    
                    {/* More Professors Coming Soon Message */}
                    {hasSearched && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mt-10 bg-[#1a1a1a]/50 border border-gray-800 rounded-lg p-6 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="h-8 w-8 text-[#0CF2A0]/70 mb-3" />
                          <h3 className="text-xl text-white mb-2">More Professors Coming Soon</h3>
                          <p className="text-gray-400 max-w-lg mx-auto">
                            We&apos;re continuously adding more professors to our database. Check back soon for an expanded selection of research experts in your field of interest.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.section>
                )}
            </motion.div>
          ) : activeTab === 'email' ? (
            <motion.div
              key="email-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl mx-auto"
            >
              {/* Personalized Email Section */}
              <section className="w-full">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <ShinyText text="AI-Powered Email Generation" className="bg-[#1a1a1a] border border-gray-700 text-[#0CF2A0] px-4 py-1 rounded-full text-xs sm:text-sm font-medium cursor-pointer hover:border-[#0CF2A0]/50 transition-colors" />
                </motion.div>


              
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-[60px] font-bold mb-6 text-white leading-tight"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {selectedProfessorForEmail ? (
                    <>Send an Email to <span className="text-[#0CF2A0]">{selectedProfessorForEmail.name}</span></>
                  ) : (
                    <>Write <span className="text-[#0CF2A0]">Personalized</span> Emails</>
                  )}
                </motion.h1>
                
                <motion.p 
                  className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {selectedProfessorForEmail ? (
                    <>
                      Craft a personalized research collaboration email to <span className="text-[#0CF2A0] font-medium">{selectedProfessorForEmail.name}</span> from <span className="text-[#0CF2A0] font-medium">{selectedProfessorForEmail.university_name}</span>. Share your research details to create a compelling outreach message tailored to their expertise in {selectedProfessorForEmail.field_of_research.split(';')[0]}.
                    </>
                  ) : (
                    "Provide your research details and we&apos;ll generate personalized emails to professors. Share your research title and abstract to create compelling outreach messages."
                  )}
                </motion.p>

                {/* Email Tutorial Trigger Button */}
                {!selectedProfessorForEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-10 max-w-4xl mx-auto"
                  >
                    <div className="bg-gradient-to-br from-[#0CF2A0]/10 to-blue-500/10 border border-[#0CF2A0]/20 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#0CF2A0]/20 rounded-full flex items-center justify-center mt-1">
                          <Info className="h-4 w-4 text-[#0CF2A0]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            How to Use This Feature
                          </h3>
                          <p className="text-gray-300 text-base mb-6">
                            Learn how to create and send personalized emails to professors with our step-by-step tutorial.
                          </p>
                          <motion.button
                            onClick={() => setShowEmailTutorial(true)}
                            className="bg-gradient-to-r from-[#0CF2A0] to-[#0CF2A0]/80 text-black px-6 py-3 rounded-xl font-semibold hover:from-[#0CF2A0]/90 hover:to-[#0CF2A0]/70 transition-all duration-300 flex items-center gap-3 shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Info className="h-5 w-5" />
                            Start Tutorial
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Selected Professor Info Card */}
                {selectedProfessorForEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative mb-8 group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0CF2A0]/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-[#1a1a1a]/95 to-[#0a0a0a]/95 border border-[#0CF2A0]/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <div className="w-4 h-4 bg-[#0CF2A0] rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 w-4 h-4 bg-[#0CF2A0] rounded-full animate-ping opacity-75"></div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">Selected Professor</h3>
                          <p className="text-gray-400">Ready to create personalized email</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Professor Info */}
                        <div className="lg:col-span-2 space-y-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-3xl font-bold text-[#0CF2A0] mb-3">{selectedProfessorForEmail.name}</h4>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[#0CF2A0]/10 rounded-xl">
                                  <GraduationCap className="h-5 w-5 text-[#0CF2A0]" />
                                </div>
                                <span className="text-lg font-semibold text-gray-200">{selectedProfessorForEmail.university_name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#0CF2A0]/10 rounded-xl">
                                  <Mail className="h-4 w-4 text-[#0CF2A0]" />
                                </div>
                                <a 
                                  href={`mailto:${selectedProfessorForEmail.email}`}
                                  className="text-gray-400 hover:text-[#0CF2A0] transition-colors text-sm group flex items-center gap-2"
                                >
                                  {selectedProfessorForEmail.email}
                                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                              </div>
                            </div>
                            
                            <div className="bg-[#0a0a0a]/50 border border-gray-700/30 rounded-2xl p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[#0CF2A0]/10 rounded-xl">
                                  <Brain className="h-5 w-5 text-[#0CF2A0]" />
                                </div>
                                <span className="text-[#0CF2A0] font-semibold text-lg">Research Focus</span>
                              </div>
                              <p className="text-gray-300 leading-relaxed text-base">
                                {selectedProfessorForEmail.field_of_research}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Stats */}
                        <div className="lg:col-span-1">
                          <h5 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Award className="h-5 w-5 text-[#0CF2A0]" />
                            Academic Metrics
                          </h5>
                          <div className="space-y-4">
                            <motion.div 
                              className="relative bg-gradient-to-br from-[#0CF2A0]/10 to-[#0CF2A0]/5 border border-[#0CF2A0]/20 rounded-2xl p-6 hover:from-[#0CF2A0]/15 hover:to-[#0CF2A0]/10 transition-all duration-300"
                              whileHover={{ scale: 1.02, y: -2 }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#0CF2A0]/20 rounded-2xl">
                                  <BookOpen className="h-6 w-6 text-[#0CF2A0]" />
                                </div>
                                <div>
                                  <div className="text-3xl font-bold text-[#0CF2A0]">{selectedProfessorForEmail.publications}</div>
                                  <div className="text-gray-400 text-sm font-medium">Publications</div>
                                </div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="relative bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6 hover:from-blue-500/15 hover:to-blue-500/10 transition-all duration-300"
                              whileHover={{ scale: 1.02, y: -2 }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-2xl">
                                  <Award className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                  <div className="text-3xl font-bold text-blue-400">{selectedProfessorForEmail.citations}</div>
                                  <div className="text-gray-400 text-sm font-medium">Citations</div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Compact Gmail Status Indicator */}
                <div className="absolute top-6 right-6 z-10">
                  {isGmailConnected ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="relative group"
                    >
                      <div className="flex items-center gap-2 bg-[#0CF2A0]/10 border border-[#0CF2A0]/30 rounded-full px-3 py-2 backdrop-blur-sm">
                        <div className="w-2 h-2 bg-[#0CF2A0] rounded-full animate-pulse"></div>
                        <Check className="h-4 w-4 text-[#0CF2A0]" />
                        <span className="text-[#0CF2A0] text-xs font-medium">Gmail</span>
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        <p className="text-white text-xs font-medium">Gmail Connected</p>
                        <p className="text-gray-400 text-xs">Ready to send emails</p>
                        {connectedAccountEmail && (
                          <p className="text-blue-300 text-xs">{connectedAccountEmail}</p>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      onClick={handleConnectGmail}
                      disabled={isConnectingGmail}
                      className="flex items-center gap-2 bg-gray-800/50 border border-gray-600/50 rounded-full px-3 py-2 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mail className="h-4 w-4" />
                      <span className="text-xs font-medium">Connect Gmail</span>
                    </motion.button>
                  )}
                </div>

                {/* Main Interactive Card System */}
                <div className="mb-8">
                  {showCardSystem ? (
                    /* Progress Bar Form */
                    <ProgressBarForm 
                      userFullName={userFullName}
                      setUserFullName={setUserFullName}
                      researchTitle={researchTitle}
                      setResearchTitle={setResearchTitle}
                      researchAbstract={researchAbstract}
                      setResearchAbstract={setResearchAbstract}
                      currentUniversity={currentUniversity}
                      setCurrentUniversity={setCurrentUniversity}
                      academicLevel={academicLevel}
                      setAcademicLevel={setAcademicLevel}
                      resumeUrl={resumeUrl}
                      setResumeUrl={setResumeUrl}
                      onCancel={() => setShowCardSystem(false)}
                      onComplete={() => {
                        setShowCardSystem(false);
                        // Show success message
                        const notification = document.createElement('div');
                        notification.className = 'fixed top-4 right-4 bg-[#0CF2A0] text-black px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
                        notification.innerHTML = `
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Setup completed successfully!
                        `;
                        document.body.appendChild(notification);
                        setTimeout(() => notification.remove(), 3000);
                      }}
                    />
                  ) : (
                    /* Alternative Quick Form Option */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        className="bg-gradient-to-br from-[#1a1a1a]/90 to-[#0a0a0a]/90 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#0CF2A0] to-[#0CF2A0]/70 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <Check className="h-8 w-8 text-black" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Setup Complete!</h3>
                          <p className="text-gray-400">All your information has been saved.</p>
                        </div>
                        
                        <div className="space-y-4">
                          <motion.button
                            onClick={startCardFlow}
                            className="bg-gradient-to-r from-[#0CF2A0] to-[#0CF2A0]/80 text-black px-8 py-4 rounded-2xl font-semibold hover:from-[#0CF2A0]/90 hover:to-[#0CF2A0]/70 transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Shuffle className="h-5 w-5" />
                            Update Information
                          </motion.button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>

                {/* Hidden Traditional Form - for fallback only */}
                {false && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative mb-8"
                  >
                    {/* Start Card Flow Button */}
                    <div className="text-center mb-8">
                      {/* Check if there's saved progress */}
                      {(() => {
                        let hasProgress = false;
                        try {
                          const savedProgressStr = localStorage.getItem('cardSystemProgress');
                          if (savedProgressStr) {
                            const parsed = JSON.parse(savedProgressStr as string);
                            hasProgress = parsed?.currentCardIndex > 0;
                          }
                        } catch (e) {
                          // Invalid JSON or localStorage access, ignore
                          hasProgress = false;
                        }
                        
                        return hasProgress ? (
                          <div className="space-y-4">
                            <motion.button
                              onClick={() => {
                                const savedProgressData = localStorage.getItem('cardSystemProgress');
                                const progress = savedProgressData ? JSON.parse(savedProgressData) : {};
                                setCurrentCardIndex(progress.currentCardIndex || 0);
                                setCompletedCards(new Set(progress.completedCards || []));
                                setShowCardSystem(true);
                              }}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-blue-500/25"
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ArrowUp className="h-5 w-5" />
                              Resume Setup
                            </motion.button>
                            <motion.button
                              onClick={startCardFlow}
                              className="bg-gradient-to-r from-[#0CF2A0] to-[#0CF2A0]/80 text-black px-6 py-3 rounded-xl font-medium hover:from-[#0CF2A0]/90 hover:to-[#0CF2A0]/70 transition-all duration-300 flex items-center gap-2 mx-auto"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Shuffle className="h-4 w-4" />
                              Start Over
                            </motion.button>
                          </div>
                        ) : (
                          <motion.button
                            onClick={startCardFlow}
                            className="bg-gradient-to-r from-[#0CF2A0] to-[#0CF2A0]/80 text-black px-8 py-4 rounded-2xl font-semibold hover:from-[#0CF2A0]/90 hover:to-[#0CF2A0]/70 transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-[#0CF2A0]/25"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Shuffle className="h-5 w-5" />
                            Start Interactive Setup
                          </motion.button>
                        );
                      })()}
                      <p className="text-gray-400 text-sm mt-3">
                        Get guided through personalized questions with progress tracking
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        💡 Use arrow keys to navigate • ESC to exit
                      </p>
                    </div>

                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-gray-600/20 rounded-2xl blur-sm"></div>
                    <div className="relative bg-[#1a1a1a]/90 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Quick Form</h3>
                        <p className="text-gray-400 text-sm">Or fill out the traditional form below</p>
                      </div>
                      <div className="space-y-6">
                      {/* User Name Input */}
                      <div className="space-y-3">
                        <label className="text-white text-sm font-semibold block text-left flex items-center gap-2">
                          <User className="h-4 w-4 text-[#0CF2A0]" />
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          value={userFullName}
                          onChange={(e) => setUserFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                        />
                      </div>

                      {/* Research Title Input */}
                      <div className="space-y-3">
                        <label className="text-white text-sm font-semibold block text-left flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-[#0CF2A0]" />
                          Research Interest/Topic
                        </label>
                        <input
                          type="text"
                          value={researchTitle}
                          onChange={(e) => setResearchTitle(e.target.value)}
                          placeholder="e.g., Machine Learning in Healthcare, Climate Change Research"
                          className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                        />
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-blue-300 text-xs leading-relaxed">
                            💡 <strong>Important:</strong> This should align with the professor&apos;s research area! Search the professor on Google Scholar, find their recent papers, and either copy a paper title that interests you OR enter a broad topic that matches their work (like &quot;Machine Learning in Healthcare&quot; if they work on AI + medicine).
                          </p>
                        </div>
                      </div>

                      {/* Research Abstract Input */}
                      <div className="space-y-3">
                        <label className="text-white text-sm font-semibold block text-left flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#0CF2A0]" />
                          Research Description/Interest
                        </label>
                        <textarea
                          value={researchAbstract}
                          onChange={(e) => setResearchAbstract(e.target.value)}
                          placeholder="Describe your research interests or copy a professor's abstract that you find interesting..."
                          rows={6}
                          className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200 resize-none"
                        />
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <p className="text-green-300 text-xs leading-relaxed">
                            📝 <strong>Easy method:</strong> Go to Google Scholar, search the professor&apos;s name, find their most recent paper that interests you, and copy their abstract here. Then explain why it interests you and what questions you have about their work.
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            {researchAbstract.length}/1000 characters
                          </span>
                        </div>
                      </div>



                                              {/* Resume Upload Section */}
                      <div className="space-y-4 bg-[#0a0a0a]/30 border border-[#0CF2A0]/20 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Upload className="h-5 w-5 text-[#0CF2A0]" />
                          <h3 className="text-white text-lg font-semibold">Resume/CV *</h3>
                        </div>
                        
                        {/* File Upload Button */}
                        <div className="space-y-4">
                          <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleResumeUpload(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="resume-upload"
                            className="w-full bg-[#0CF2A0] text-black px-6 py-4 rounded-xl font-semibold cursor-pointer hover:bg-[#0CF2A0]/90 transition-all duration-200 text-center flex items-center justify-center gap-3 text-lg"
                          >
                            <Upload className="h-5 w-5" />
                            {resumeFile ? 'Change Resume' : 'Upload Resume/CV'}
                          </label>
                          
                          {/* Show uploaded file or URL input */}
                          {resumeFile ? (
                            <div className="bg-[#0a0a0a]/50 border border-gray-600/30 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-[#0CF2A0]" />
                                  <span className="text-[#0CF2A0] font-medium">{resumeFile?.name}</span>
                                </div>
                                <button
                                  onClick={removeResumeFile}
                                  className="text-red-400 hover:text-red-300 transition-colors text-lg font-bold"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-gray-400 text-center text-sm">Or paste a resume link:</p>
                              <input
                                type="url"
                                value={resumeUrl}
                                onChange={(e) => setResumeUrl(e.target.value)}
                                placeholder="https://drive.google.com/file/d/... or your website link"
                                className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                              />
                              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                <p className="text-orange-300 text-xs leading-relaxed">
                                  📋 <strong>Don&apos;t have a formal resume?</strong> Create a simple one with: your name, school, GPA (if good), any relevant courses, projects, or activities. Use Google Docs or Canva for free templates.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Professional Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current University */}
                        <div className="space-y-3">
                          <label className="text-white text-sm font-semibold block text-left flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-[#0CF2A0]" />
                            Current University
                          </label>
                          <input
                            type="text"
                            value={currentUniversity}
                            onChange={(e) => setCurrentUniversity(e.target.value)}
                            placeholder="e.g., MIT, Stanford University, Community College"
                            className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                          />
                          <p className="text-gray-400 text-xs">
                            💭 Include your school name - it helps professors understand your academic level
                          </p>
                        </div>

                        {/* Year of Study */}
                        <div className="space-y-3">
                          <label className="text-white text-sm font-semibold block text-left flex items-center gap-2">
                            <User className="h-4 w-4 text-[#0CF2A0]" />
                            Year of Study/Position
                          </label>
                          <input
                            type="text"
                            value={yearOfStudy}
                            onChange={(e) => setYearOfStudy(e.target.value)}
                            placeholder="e.g., High school senior, College freshman, PhD student"
                            className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                          />
                          <p className="text-gray-400 text-xs">
                            🎓 Be specific about your current academic level (high school, undergraduate, graduate, etc.)
                          </p>
                        </div>
                      </div>

                      {/* Specific Research Interest */}
                      <div className="space-y-3">
                        <label className="text-white text-sm font-semibold block text-left flex items-center gap-2">
                          <Brain className="h-4 w-4 text-[#0CF2A0]" />
                          Specific Interest in Professor&apos;s Work
                        </label>
                        <input
                          type="text"
                          value={specificInterest}
                          onChange={(e) => setSpecificInterest(e.target.value)}
                          placeholder="e.g., your machine learning applications in drug discovery"
                          className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                        />
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                          <p className="text-purple-300 text-xs leading-relaxed">
                            🎯 <strong>Quick tip:</strong> Look at the professor&apos;s recent papers and mention something specific like &quot;your work on neural networks for protein folding&quot; or &quot;your research on renewable energy storage systems.&quot;
                          </p>
                        </div>
                      </div>

                      {/* Professor Email Input */}
                      {selectedProfessorForEmail && (
                        <div className="space-y-3">
                          <label className="text-white text-sm font-semibold block text-left flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#0CF2A0]" />
                            Professor&apos;s Email Address
                          </label>
                          <input
                            type="email"
                            value={selectedProfessorForEmail?.email || ''}
                            onChange={(e) => {
                              if (selectedProfessorForEmail) {
                                setSelectedProfessorForEmail({
                                  ...selectedProfessorForEmail,
                                  email: e.target.value
                                });
                              }
                            }}
                            placeholder="Enter professor's email address"
                            className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                          />
                        </div>
                      )}

                                            {/* Template Customization Questions */}
                      <div className="space-y-4 bg-[#0a0a0a]/50 border border-[#0CF2A0]/20 rounded-xl p-6">
                        <h4 className="text-white text-lg font-semibold flex items-center gap-2">
                          <Brain className="h-5 w-5 text-[#0CF2A0]" />
                          Template Customization
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Fill in these details to customize your proven email template for this professor:
                        </p>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium block">
                              📄 Paper/work title you found (be specific!)
                            </label>
                            <input
                              type="text"
                              value={researchInterest}
                              onChange={(e) => setResearchInterest(e.target.value)}
                              placeholder='e.g., &quot;Continuous Nicotine Monitors for Personal Nicotine Pharmacokinetics&quot;'
                              className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium block">
                              💭 What fascinated you? What questions came up?
                            </label>
                            <textarea
                              value={researchQuestions}
                              onChange={(e) => setResearchQuestions(e.target.value)}
                              placeholder="e.g., One thing that stood out was how you outlined the potential of a continuous nicotine monitor (CNM) to resolve real-time nicotine dynamics. I was wondering if CNMs could also help in early detection of addiction patterns? Also, can your method be adapted for other substances?"
                              rows={4}
                              className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/20 transition-all duration-200 resize-none"
                            />
                            <p className="text-xs text-gray-500">
                              Tip: Be specific about what caught your attention and ask genuine questions about their work
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium block">
                              📍 Your location (City, State)
                            </label>
                            <input
                              type="text"
                              value={opportunityType}
                              onChange={(e) => setOpportunityType(e.target.value)}
                              placeholder="e.g., Austin, TX or San Francisco, CA"
                              className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                            />
                            <p className="text-xs text-gray-500">
                              This appears in the subject line to show you&apos;re local/accessible
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium block">
                              🔬 Your research field/interest area
                            </label>
                            <input
                              type="text"
                              value={researchFieldConnection}
                              onChange={(e) => setResearchFieldConnection(e.target.value)}
                              placeholder="e.g., sensor technologies, computational biology, neuroscience, machine learning"
                              className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/20 transition-all duration-200"
                            />
                            <p className="text-xs text-gray-500">
                              What field are you exploring? This shows the connection to their work.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                )}

                {/* Enhanced Generate Email Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-col items-center gap-4 mb-8"
                >
                  <motion.button
                    onClick={generatePersonalizedEmail}
                    disabled={!userFullName.trim() || (!resumeFile && !resumeUrl.trim()) || !researchTitle.trim() || !researchAbstract.trim() || !selectedProfessorForEmail || isGeneratingEmail}
                    className="relative group bg-gradient-to-r from-[#0CF2A0] to-[#0CF2A0]/80 text-black px-10 py-4 rounded-2xl font-semibold hover:from-[#0CF2A0]/90 hover:to-[#0CF2A0]/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-[#0CF2A0]/25 disabled:hover:shadow-none"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0CF2A0]/40 to-[#0CF2A0]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      {isGeneratingEmail ? (
                        <>
                          <motion.div 
                            className="w-5 h-5 border-2 border-black/70 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Generating Magic...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5" />
                          <span>
                            {selectedProfessorForEmail 
                              ? `Generate Email to ${selectedProfessorForEmail.name}`
                              : 'Generate Personalized Email'
                            }
                          </span>

                        </>
                      )}
                    </div>
                  </motion.button>

                  {/* Quick Template Alternative */}
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-3">Don&apos;t have time to fill everything out?</p>
                    <motion.button
                      onClick={() => {
                        const quickTemplate = `Subject: Interest in your research on [specific research topic/method]

Dear Professor ${selectedProfessorForEmail?.name || '[Professor Name]'},

I hope you are doing well. My name is [Your Name], and I am a [your academic level] based in [Your City, State]. While researching [research area you're exploring], I came across your recent paper titled "[Copy exact paper title here]." I found your work really fascinating, especially [specific aspect that caught your attention].

After reading your paper, I had a few questions and thoughts. One thing that really stood out to me was [specific finding/method/result from the paper]. I was wondering if you think that [thoughtful question about applications/extensions]. Also, [second thoughtful question about the work]?

I have some prior research experience, but I&apos;m especially interested about how [research field] can [broader impact/application]. I would love the opportunity to assist in your lab&apos;s ongoing work, whether through review, data annotation, or gaining hands-on experience as a volunteer intern during the summer. I promise that if you give me this opportunity, I will work as hard or even harder than postgraduate or graduate students. I believe this would be a valuable opportunity for me to grow in both [relevant field 1] and [relevant field 2].

If you are open to it, I would love to speak with you further about how I can get involved—even as a volunteer intern. If working with you is not possible, I would greatly appreciate any referrals to colleagues working on related problems who may be open to mentoring [your academic level] students.

Please feel free to visit my website to view my resume:
[Your resume/portfolio link]

Thank you very much for considering my request, and I hope to hear from you soon.

Best regards,
[Your Full Name]

---
INSTRUCTIONS:
1. Go to Google Scholar, search the professor's name
2. Find their most recent paper that interests you
3. Copy the EXACT paper title and replace [Copy exact paper title here]
4. Read the abstract and mention specific findings/methods
5. Ask thoughtful questions showing you understand the work
6. Replace ALL [bracketed] text with your specific information
7. Make sure your questions show genuine curiosity about their research`;

                        navigator.clipboard.writeText(quickTemplate);
                        alert('📋 Template copied to clipboard! Just fill in the [brackets] with your info.');
                      }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Quick Template Instead
                    </motion.button>
                  </div>
                </motion.div>

                {/* Enhanced Generated Email Display */}
                {generatedEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0CF2A0]/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-lg"></div>
                    <div className="relative bg-[#0a0a0a]/90 border border-gray-700/50 rounded-3xl p-8 backdrop-blur-xl">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-[#0CF2A0]/20 rounded-xl">
                              <Mail className="h-6 w-6 text-[#0CF2A0]" />
                            </div>
                            Generated Email
                          </h3>
                          <p className="text-gray-400">Ready to send your personalized message</p>
                        </div>
                        
                        {/* Action Buttons - All on same line */}
                        <div className="flex items-center gap-2 flex-nowrap">
                          {/* Gmail Status Badge */}
                          {isGmailConnected && (
                            <motion.div 
                              className="flex items-center gap-1 bg-green-500/15 border border-green-500/30 rounded-lg px-2 py-1 flex-shrink-0"
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-green-400 text-xs font-medium whitespace-nowrap">Ready</span>
                            </motion.div>
                          )}
                          
                          {/* Edit Button */}
                          <motion.button
                            onClick={handleEditEmail}
                            className="bg-blue-800/50 hover:bg-blue-700/50 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs border border-blue-600/50 hover:border-blue-500/50 flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit3 className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </motion.button>

                          {/* Copy Button */}
                          <motion.button
                            onClick={copyEmailToClipboard}
                            className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs border border-gray-600/50 hover:border-gray-500/50 flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Copy className="h-3 w-3" />
                            <span className="hidden sm:inline">Copy</span>
                          </motion.button>
                          
                          {/* Send Email Now Button - Right next to Copy */}
                          <motion.button
                            onClick={isGmailConnected ? handleSendEmailWithAI : handleConnectGmail}
                            disabled={isConnectingGmail || isSendingEmail || !userFullName.trim() || !resumeUrl.trim()}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                              isGmailConnected 
                                ? 'bg-[#0CF2A0] hover:bg-[#0CF2A0]/90 text-black border border-[#0CF2A0]/50' 
                                : 'bg-blue-600/50 hover:bg-blue-500/50 text-white border border-blue-500/50'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isConnectingGmail ? (
                              <>
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span className="hidden sm:inline">Connecting...</span>
                              </>
                            ) : isSendingEmail ? (
                              <>
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span className="hidden sm:inline">Sending...</span>
                              </>
                            ) : isGmailConnected ? (
                              <>
                                <Send className="h-3 w-3" />
                                <span className="hidden sm:inline">Send Now</span>
                                <span className="sm:hidden">Send</span>
                              </>
                            ) : (
                              <>
                                <Mail className="h-3 w-3" />
                                <span className="hidden sm:inline">Connect</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Email Status Message */}
                      {emailSentStatus && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mb-6 p-4 rounded-2xl border backdrop-blur-sm ${
                            emailSentStatus.success 
                              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                              emailSentStatus.success ? 'bg-green-500/20' : 'bg-yellow-500/20'
                            }`}>
                              {emailSentStatus.success ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <AlertCircle className="h-5 w-5" />
                              )}
                            </div>
                            <span className="font-medium">{emailSentStatus.message}</span>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Email Content - Editing or Preview */}
                      {isEditingEmail ? (
                        <div className="space-y-4">
                          <div className="bg-[#111111]/80 border border-blue-600/30 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-600/30">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="ml-4 text-blue-400 text-sm font-mono">Edit Mode</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 text-xs bg-gray-600/50 hover:bg-gray-500/50 text-gray-300 rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveEdits}
                                  className="px-3 py-1 text-xs bg-blue-600/50 hover:bg-blue-500/50 text-blue-300 rounded-lg transition-colors"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                            <textarea
                              value={editableEmail}
                              onChange={(e) => setEditableEmail(e.target.value)}
                              rows={20}
                              className="w-full bg-transparent text-white text-sm font-mono leading-relaxed resize-none focus:outline-none"
                              placeholder="Edit your email content here..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#111111]/80 border border-gray-600/30 rounded-2xl p-6 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-600/30">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="ml-4 text-gray-400 text-sm font-mono">Email Preview</span>
                          </div>
                          <pre className="text-white text-sm whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-96">
                            {editableEmail || generatedEmail}
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Note: Scheduled emails section removed - emails now send directly */}
              </section>
            </motion.div>
          ) : activeTab === 'email' ? (
            <motion.div
              key="email-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl mx-auto"
            >
              {/* Email Content Will Go Here */}
              <div className="text-center text-white">
                Email tab content
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Tutorial Overlay */}
      <EnhancedTutorialOverlay
        steps={tutorialSteps}
        isVisible={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
        tutorialKey="search-page"
        autoAdvance={true}
      />

      {/* Email Tutorial Overlay */}
      <EnhancedEmailTutorialOverlay
        isVisible={showEmailTutorial}
        onComplete={() => setShowEmailTutorial(false)}
        onSkip={() => setShowEmailTutorial(false)}
      />

    </div>
  );
}

export default withAuth(SearchPage); 