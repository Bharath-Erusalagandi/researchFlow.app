'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, User, Mail, BookOpen, Award, ArrowUp, Square, Tag, Home, FileText, Search as SearchIcon, Settings, LogOut, AlertCircle, Check, Heart, Brain, PenTool, Send, Copy, Loader2, ExternalLink, Upload, Link as LinkIcon, Edit3, Clock, Trash2, ChevronRight, ChevronLeft, Shuffle, X } from 'lucide-react';
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



// Popular search tags
const SUGGESTED_TAGS = [
  "Machine Learning",
  "Genetics",
  "Climate Science",
  "Neuroscience",
  "Quantum Physics",
  "Computer Vision",
  "Biotechnology",
  "Artificial Intelligence",
  "Sociology",
  "Psychology",
  "CRISPR"
];

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

export default function SearchPage() {
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

  
  // Personalized email tab state
  const [userFullName, setUserFullName] = useState("");
  const [researchTitle, setResearchTitle] = useState("");
  const [researchAbstract, setResearchAbstract] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState(""); // Fallback for URL if no file uploaded
  const [currentUniversity, setCurrentUniversity] = useState("");
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
    
    const savedQuery = localStorage.getItem('researchConnect_searchQuery');
    const savedLastSearchedTerm = localStorage.getItem('researchConnect_lastSearchedTerm');
    const savedProfessorsResults = localStorage.getItem('researchConnect_professors');
    const savedSuggestion = localStorage.getItem('researchConnect_aiSuggestion');
    const savedHasSearched = localStorage.getItem('researchConnect_hasSearched');
    const savedSelectedProfessor = localStorage.getItem('selectedProfessorForEmail');
    const savedActiveTab = localStorage.getItem('researchConnect_activeTab');
    
    if (savedQuery) setSearchQuery(savedQuery);
    if (savedLastSearchedTerm) setLastSearchedTerm(savedLastSearchedTerm);
    if (savedProfessorsResults) setFilteredProfessors(JSON.parse(savedProfessorsResults));
    if (savedSuggestion) setAISuggestion(savedSuggestion);
    if (savedHasSearched === 'true') setHasSearched(true);
    
    // Load saved/bookmarked professors
    const savedBookmarkedProfs = JSON.parse(localStorage.getItem('savedProfessors') || '[]');
    const savedIds = savedBookmarkedProfs.map((prof: any) => prof.id?.toString() || '');
    setSavedProfessors(savedIds);
    
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
      
      setEmailSentStatus({ 
        success: true, 
        message: successMessage
      });
      
      // Clean up URL parameters but preserve the current tab
      const currentTabParam = targetTab ? `?tab=${targetTab}` : '';
      window.history.replaceState({}, document.title, window.location.pathname + currentTabParam);
      // DON'T force tab switch - respect user's current location
    } else if (oauthError) {
      setIsGmailConnected(false);
      setIsConnectingGmail(false); // Reset loading state
      setEmailSentStatus({ 
        success: false, 
        message: `OAuth Error: ${oauthError}. Please try connecting Gmail again.` 
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
      const response = await axios.get(`/api/professor-search?query=${encodeURIComponent(searchTerm)}`);
      
      // Process the professors data
      let professors = response.data.professors;
      
      // Get the AI suggestion
      const suggestion = response.data.aiSuggestion;
      setAISuggestion(suggestion);
      localStorage.setItem('researchConnect_aiSuggestion', suggestion);
      
      // Add some mock data for UI display purposes
      professors = professors.map((prof: Professor) => ({
        ...prof,
        id: Math.floor(Math.random() * 10000),
        publications: Math.floor(Math.random() * 100) + 10,
        citations: Math.floor(Math.random() * 5000) + 500,
        title: `Professor of ${prof.field_of_research.split(';')[0]}`,
        image: `https://source.unsplash.com/random/256x256/?professor&${Math.random()}`,
        researchAreas: prof.field_of_research.split(';').map(area => area.trim())
      }));
      
      setFilteredProfessors(professors);
      setHasSearched(true);
      
      // Save results to localStorage
      localStorage.setItem('researchConnect_professors', JSON.stringify(professors));
      localStorage.setItem('researchConnect_hasSearched', 'true');
    } catch (error: any) {
      console.error('Error searching professors:', error);
      
      // Handle smart validation errors
      if (error.response?.status === 400 && error.response?.data?.suggestion) {
        // Display helpful validation message
        setAISuggestion(error.response.data.suggestion);
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

  const handleSaveProfessor = (professor: Professor) => {
    const savedProfs = JSON.parse(localStorage.getItem('savedProfessors') || '[]');
    const professorData = {
      id: professor.id,
      name: professor.name,
      email: professor.email,
      department: professor.field_of_research.split(';')[0] || professor.field_of_research,
      interests: professor.field_of_research,
      savedAt: new Date().toISOString()
    };
    
    // Check if already saved
    const isAlreadySaved = savedProfs.some((p: any) => p.id === professor.id);
    
    if (!isAlreadySaved) {
      savedProfs.push(professorData);
      localStorage.setItem('savedProfessors', JSON.stringify(savedProfs));
      setSavedProfessors([...savedProfessors, professor.id?.toString() || '']);
      
      // Show success message
      alert(`${professor.name} has been saved to your professors!`);
    } else {
      alert(`${professor.name} is already saved!`);
    }
  };

  const handlePersonalizedEmail = (professor: Professor) => {
    // Store the selected professor data for the email tab
    setSelectedProfessorForEmail(professor);
    localStorage.setItem('selectedProfessorForEmail', JSON.stringify(professor));
    
    // Show a user-friendly notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-[#0CF2A0] text-black px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    notification.innerHTML = `
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span class="font-medium">Professor ${professor.name} selected!</span>
      <button onclick="this.parentElement.remove()" class="ml-2 hover:bg-black/10 rounded p-1">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
    
    // Ask if user wants to switch tabs (less intrusive)
    setTimeout(() => {
      const confirmSwitch = window.confirm(
        `Would you like to switch to the Email tab to compose a message to ${professor.name}?`
      );
      
      if (confirmSwitch) {
        setActiveTab('email');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }, 1000);
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
      icon: <Tag className="h-6 w-6" />,
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
        alert('🎉 Setup complete! Your information has been saved and you can now generate personalized emails.');
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
      yearOfStudy,
      specificInterest,
      researchInterest,
      researchQuestions,
      opportunityType,
      researchFieldConnection
    };
    localStorage.setItem('researchConnect_formData', JSON.stringify(formData));
  }, [userFullName, researchTitle, researchAbstract, resumeUrl, currentUniversity, yearOfStudy, specificInterest, researchInterest, researchQuestions, opportunityType, researchFieldConnection]);

  // Load card progress and form data on component mount
  useEffect(() => {
    // Load form data
    const savedFormData = localStorage.getItem('researchConnect_formData');
    if (savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        setUserFullName(formData.userFullName || '');
        setResearchTitle(formData.researchTitle || '');
        setResearchAbstract(formData.researchAbstract || '');
        setResumeUrl(formData.resumeUrl || '');
        setCurrentUniversity(formData.currentUniversity || '');
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
                  onChange={(e) => card.setValue(e.target.value)}
                  placeholder={card.placeholder}
                  className="w-full bg-[#0a0a0a]/80 border border-gray-600/50 rounded-xl px-6 py-4 text-white text-lg placeholder:text-gray-500 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20 transition-all duration-200"
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
  }, [activeTab]);

  // Add this section to render the AI suggestion
  // Typing animation component
  const TypingText = ({ text, speed = 30 }: { text: string; speed?: number }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    
    useEffect(() => {
      if (!text) return;
      
      setDisplayedText('');
      setIsComplete(false);
      let i = 0;
      
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
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
    
    const suggestionText = aiSuggestion || "Here are some professors that match your search criteria. Consider reaching out to those whose research interests align with your goals.";
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 max-w-4xl mx-auto w-full"
      >
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-white mb-3">Professor Recommendation</h3>
          <div className="text-base leading-relaxed">
            <TypingText text={suggestionText} speed={12} />
          </div>
        </div>
      </motion.div>
    );
  };

  // Generate personalized email using PROVEN TEMPLATE
  const generatePersonalizedEmail = async () => {
    if (!selectedProfessorForEmail || !userFullName.trim() || (!resumeFile && !resumeUrl.trim())) {
      alert('Please fill in your name and upload a resume or provide a resume link before generating an email.');
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
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Copy email to clipboard
  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableEmail || generatedEmail);
      // You could add a toast notification here
      alert('Email copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy email:', error);
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
      setEmailSentStatus({
        success: false,
        message: 'Missing required information: professor, name, resume, or Gmail connection'
      });
      return;
    }

    setIsSendingEmail(true);
    setEmailSentStatus(null);

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
        setEmailSentStatus({
          success: true,
          message: `Email sent successfully to ${selectedProfessorForEmail.name}!`
        });
        
        // Clear the email generation form or reset for next use
        setTimeout(() => {
          setEmailSentStatus(null);
        }, 5000); // Auto-clear success message after 5 seconds
        
      } else {
        setEmailSentStatus({
          success: false,
          message: `Failed to send email: ${result.error || 'Unknown error'}`
        });
        
        // If it's an authentication error, suggest reconnecting
        if (result.needsAuth) {
          setIsGmailConnected(false);
          setConnectedAccountId(null);
          localStorage.removeItem('composio_connected_account_id');
          localStorage.removeItem('composio_entity_id');
        }
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailSentStatus({
        success: false,
        message: 'Network error while sending email. Please try again.'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle Gmail connection
  const handleConnectGmail = async () => {
    if (!selectedProfessorForEmail) {
      alert('Please select a professor first');
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
            setEmailSentStatus({
              success: false,
              message: 'Connection timeout. Please try again.'
            });
          }
          clearInterval(checkPopup);
        }, 600000);

      } else {
        throw new Error(result.error || 'Failed to initiate Gmail connection');
      }

    } catch (error) {
      console.error('Error connecting Gmail:', error);
      setEmailSentStatus({
        success: false,
        message: `Failed to connect Gmail: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      
      {/* Combined Navigation */}
      <motion.div 
        className="sticky top-0 z-30 bg-[#111111]/90 backdrop-blur-md border-b border-gray-800/50 shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-20 relative">
            {/* Mobile Logo */}
            <div className="md:hidden absolute left-4 flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/images/RF Full Image from Slack.png" 
                  alt="Research Flow Logo" 
                  className="h-8 w-auto"
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <PenTool className="h-4 w-4" />
                  Personalized Email
                  {selectedProfessorForEmail && (
                    <div className="ml-2 flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#0CF2A0] rounded-full animate-pulse"></div>
                      <span className="text-xs opacity-75">Ready</span>
                    </div>
                  )}
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
                      {selectedProfessorForEmail && (
                        <div className="ml-auto flex items-center gap-1">
                          <div className="w-2 h-2 bg-[#0CF2A0] rounded-full animate-pulse"></div>
                          <span className="text-xs opacity-75">Ready</span>
                        </div>
                      )}
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <ShinyText text="Find Academic Excellence" className="bg-[#1a1a1a] border border-gray-700 text-[#0CF2A0] px-4 py-1 rounded-full text-xs sm:text-sm font-medium cursor-pointer hover:border-[#0CF2A0]/50 transition-colors" />
                </motion.div>
              
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-[60px] font-bold mb-6 text-white leading-tight"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Find Professors for Your <span className="text-[#0CF2A0]">Research</span>
                </motion.h1>
                
                <motion.p 
                  className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Connect with leading professors in your field of interest. Enter a research topic to find experts who can mentor or collaborate with you.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex justify-center w-full max-w-4xl mx-auto relative"
                >
                  <AIInputWithLoading
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={handleSearch}
                    disabled={isLoading}
                    isLoading={isLoading}
                    placeholder="Search research topics, professors, or universities..."
                    className="w-full"
                    minHeight={60}
                    maxHeight={120}
                  />
                </motion.div>
                
                {/* Suggested Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex justify-center flex-wrap gap-3 mt-8 max-w-4xl mx-auto px-2 text-center"
                >
                  <div className="w-full flex justify-center items-center mb-3">
                    <Tag className="h-5 w-5 text-[#0CF2A0] mr-2" />
                    <span className="text-base text-gray-300">Popular Topics</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 w-full">
                    {SUGGESTED_TAGS.map((tag, index) => (
                      <motion.button
                        key={tag}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSearch(tag);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="text-base font-medium text-gray-300 bg-[#1a1a1a] border border-gray-700/50 px-4 py-3 rounded-full hover:border-[#0CF2A0]/50 hover:text-[#0CF2A0] hover:bg-[#0CF2A0]/10 transition-all touch-manipulation mobile-touch-target"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.3,
                          delay: 0.45 + (index * 0.03),
                          type: "spring",
                          stiffness: 400
                        }}
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Results Section */}
              <AnimatePresence mode="wait">
                {hasSearched && (
                  <motion.section 
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {filteredProfessors.map((professor, index) => {
                        const isSaved = savedProfessors.includes(professor.id?.toString() || '');
                        
                        return (
                          <ProfessorCard
                            key={professor.id}
                            professor={professor}
                            index={index}
                            isSaved={isSaved}
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
              </AnimatePresence>
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
                  transition={{ duration: 0.5 }}
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
                  className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {selectedProfessorForEmail ? (
                    <>
                      Craft a personalized research collaboration email to <span className="text-[#0CF2A0] font-medium">{selectedProfessorForEmail.name}</span> from <span className="text-[#0CF2A0] font-medium">{selectedProfessorForEmail.university_name}</span>. Share your research details to create a compelling outreach message tailored to their expertise in {selectedProfessorForEmail.field_of_research.split(';')[0]}.
                    </>
                  ) : (
                    "Provide your research details and we&apos;ll generate personalized emails to professors. Share your research title and abstract to create compelling outreach messages."
                  )}
                </motion.p>

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
                    <>
                      {/* Progress Bar */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Setup Progress</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{completedCards.size}/{questionCards.length} completed</span>
                            <span className="text-sm text-[#0CF2A0] font-semibold">{calculateProgress()}%</span>
                          </div>
                        </div>
                        <Progress 
                          value={calculateProgress()} 
                          className="h-3 bg-gray-800/50" 
                          indicatorClassName="bg-gradient-to-r from-[#0CF2A0] to-[#0CF2A0]/80 transition-all duration-500"
                        />
                        <div className="flex justify-between mt-4">
                          {questionCards.map((card, index) => (
                            <div key={card.id} className="flex flex-col items-center gap-1">
                              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                completedCards.has(index) 
                                  ? 'bg-[#0CF2A0] shadow-lg shadow-[#0CF2A0]/50' 
                                  : index === currentCardIndex 
                                    ? 'bg-blue-500 animate-pulse' 
                                    : 'bg-gray-600'
                              }`} />
                              <span className={`text-xs transition-colors ${
                                completedCards.has(index) 
                                  ? 'text-[#0CF2A0]' 
                                  : index === currentCardIndex 
                                    ? 'text-blue-400' 
                                    : 'text-gray-500'
                              }`}>
                                {index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Question Card */}
                      <AnimatePresence mode="wait">
                        <QuestionCard 
                          card={questionCards[currentCardIndex]} 
                          isActive={true}
                        />
                      </AnimatePresence>
                    </>
                  ) : (
                    /* Alternative Quick Form Option */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
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
                    transition={{ duration: 0.5 }}
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
      

    </div>
  );
} 