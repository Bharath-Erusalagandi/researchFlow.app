'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, User, Mail, BookOpen, Award, ArrowUp, Square, Tag, Home, FileText, Search as SearchIcon, Settings, LogOut, AlertCircle, Check, Heart, Brain, PenTool, Send, Copy, Loader2, ExternalLink, Upload, Link as LinkIcon, Edit3, Clock, Trash2 } from 'lucide-react';
import { IconSend, IconMail, IconLoader2 as TablerLoader2 } from '@tabler/icons-react';
import { getTimeBasedGreeting } from '@/lib/utils';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction
} from '@/components/ui/prompt-input';
import { Button as RegularButton } from '@/components/ui/button';
import { Button as Button3D } from '@/components/ui/3d-button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { ProfessorCard } from '@/components/ui/professor-card';



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


  // Load state from localStorage on initial render
  useEffect(() => {
    const savedQuery = localStorage.getItem('researchConnect_searchQuery');
    const savedProfessors = localStorage.getItem('researchConnect_professors');
    const savedSuggestion = localStorage.getItem('researchConnect_aiSuggestion');
    const savedHasSearched = localStorage.getItem('researchConnect_hasSearched');
    const savedSelectedProfessor = localStorage.getItem('selectedProfessorForEmail');
    
    if (savedQuery) setSearchQuery(savedQuery);
    if (savedProfessors) setFilteredProfessors(JSON.parse(savedProfessors));
    if (savedSuggestion) setAISuggestion(savedSuggestion);
    if (savedHasSearched === 'true') setHasSearched(true);
    
    // Load selected professor and switch to email tab if professor was selected
    if (savedSelectedProfessor) {
      const professor = JSON.parse(savedSelectedProfessor);
      setSelectedProfessorForEmail(professor);
      setActiveTab('email');
    }

    // Load user research data
    const userInfo = localStorage.getItem('userInfo');
    const researchData = localStorage.getItem('researchConnect_userResearchData');
    const enhancedUserData = localStorage.getItem('userResearchInfo');
    if (userInfo) {
      const userData = JSON.parse(userInfo);
      setUserFullName(userData.name || '');
    }
    
    if (researchData) {
      const research = JSON.parse(researchData);
      setResearchTitle(research.title || '');
      setResearchAbstract(research.abstract || '');
    }

    if (enhancedUserData) {
      const enhanced = JSON.parse(enhancedUserData);
      setResumeUrl(enhanced.resumeUrl || '');
      setCurrentUniversity(enhanced.currentUniversity || '');
      setYearOfStudy(enhanced.yearOfStudy || '');
      setSpecificInterest(enhanced.specificInterest || '');
      setResearchInterest(enhanced.researchInterest || '');
      setResearchQuestions(enhanced.researchQuestions || '');
      setOpportunityType(enhanced.opportunityType || '');
      setResearchFieldConnection(enhanced.researchFieldConnection || '');
    }

    // Handle OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
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
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname + '?tab=email');
      setActiveTab('email'); // Switch to email tab after successful connection
    } else if (oauthError) {
      setIsGmailConnected(false);
      setIsConnectingGmail(false); // Reset loading state
      setEmailSentStatus({ 
        success: false, 
        message: `OAuth Error: ${oauthError}. Please try connecting Gmail again.` 
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname + '?tab=email');
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

  // Check which professors are already saved
  useEffect(() => {
    const savedProfs = JSON.parse(localStorage.getItem('savedProfessors') || '[]');
    const savedIds = savedProfs.map((p: any) => p.id.toString());
    setSavedProfessors(savedIds);
  }, []);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    
    // If empty search, don't run the search
    if (!searchTerm.trim()) {
      return;
    }
    
    setIsLoading(true);
    setSearchQuery(searchTerm); // Update search input if tag is clicked
    
    // Save search query to localStorage
    localStorage.setItem('researchConnect_searchQuery', searchTerm);
    
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
    } catch (error) {
      console.error('Error searching professors:', error);
      setFilteredProfessors([]);
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
    
    // Switch to the email tab
    setActiveTab('email');
    
    // Scroll to top of the page after a small delay to ensure tab content is rendered
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
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

  const navLinks = [
    { href: "/professors", label: "Professors", icon: <GraduationCap className="h-4 w-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  ];

  // Reset search state when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      setSearchQuery("");
      setFilteredProfessors([]);
      setHasSearched(false);
      setAISuggestion("");
      localStorage.removeItem('researchConnect_searchQuery');
      localStorage.removeItem('researchConnect_professors');
      localStorage.removeItem('researchConnect_aiSuggestion');
      localStorage.removeItem('researchConnect_hasSearched');
    };

    const handleRouteChange = () => {
      handleBeforeUnload();
    };

    // Listen for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Listen for route changes (if using Next.js router)
    const router = require('next/router').default;
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  // Add this section to render the AI suggestion
  const renderAISuggestion = () => {
    if (!filteredProfessors.length || !hasSearched) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#1a1a1a]/80 border border-[#0CF2A0]/20 rounded-xl p-6 mb-8 max-w-4xl mx-auto w-full shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="bg-[#0CF2A0]/20 rounded-full p-3 mt-1">
            <SearchIcon className="h-6 w-6 text-[#0CF2A0]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-3">Professor Recommendation</h3>
            <p className="text-gray-300 text-base leading-relaxed">
              {aiSuggestion || "Here are some professors that match your search criteria. Consider reaching out to those whose research interests align with your goals."}
            </p>
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
          connectedAccountId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEmailSentStatus({
          success: true,
          message: `Email sent successfully to ${selectedProfessorForEmail.name}! 🎉`
        });
      } else {
        setEmailSentStatus({
          success: false,
          message: `Failed to send email: ${result.error || 'Unknown error'}`
        });
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

  // Save form data to localStorage whenever form fields change
  useEffect(() => {
    const formData = {
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
    };
    
    if (userFullName || researchTitle || researchAbstract || resumeUrl || currentUniversity || yearOfStudy || specificInterest || researchInterest || researchQuestions || opportunityType || researchFieldConnection) {
      localStorage.setItem('userResearchInfo', JSON.stringify(formData));
    }
  }, [userFullName, researchTitle, researchAbstract, resumeUrl, resumeFile, currentUniversity, yearOfStudy, specificInterest, researchInterest, researchQuestions, opportunityType, researchFieldConnection]);

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
          <div className="flex items-center justify-center h-20">
            <motion.div 
              className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-700/50 shadow-lg"
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
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('email')}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
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
                </motion.button>

              </div>
            </motion.div>
            
            {/* Mobile menu button */}
            <div className="md:hidden absolute right-4 flex items-center">
              <motion.button 
                className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0CF2A0] p-2 rounded-lg"
                onClick={() => alert('Mobile menu placeholder')}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

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
                  className="flex justify-center w-full max-w-4xl mx-auto"
                >
                  <PromptInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    isLoading={isLoading}
                    onSubmit={handleSearch}
                    className="w-full border-gray-700 hover:border-[#0CF2A0]/50 focus:border-[#0CF2A0] bg-[#1a1a1a]/80 backdrop-blur relative"
                  >
                    <PromptInputTextarea 
                      placeholder="Search research topics, professors, or universities..." 
                      className="text-white placeholder:text-gray-400 text-lg text-center"
                    />
                    
                    {/* Loading animation overlay */}
                    <AnimatePresence>
                      {isLoading && (
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-3xl z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div 
                            className="flex items-center space-x-3"
                            animate={{ scale: [0.95, 1.05, 0.95] }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 1.5,
                              ease: "easeInOut" 
                            }}
                          >
                            <motion.div 
                              className="w-3 h-3 bg-[#0CF2A0] rounded-full"
                              animate={{ 
                                opacity: [0.5, 1, 0.5],
                                scale: [0.8, 1.2, 0.8]
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 1, 
                                delay: 0,
                                ease: "easeInOut"
                              }}
                            />
                            <motion.div 
                              className="w-3 h-3 bg-[#0CF2A0] rounded-full"
                              animate={{ 
                                opacity: [0.5, 1, 0.5],
                                scale: [0.8, 1.2, 0.8]
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 1, 
                                delay: 0.2,
                                ease: "easeInOut"
                              }}
                            />
                            <motion.div 
                              className="w-3 h-3 bg-[#0CF2A0] rounded-full"
                              animate={{ 
                                opacity: [0.5, 1, 0.5],
                                scale: [0.8, 1.2, 0.8]
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 1, 
                                delay: 0.4,
                                ease: "easeInOut"
                              }}
                            />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <PromptInputActions className="justify-end pt-2">
                      <PromptInputAction
                        tooltip={isLoading ? "Searching..." : "Search now"}
                      >
                        <RegularButton
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-full bg-[#0CF2A0] text-black hover:bg-[#0CF2A0]/90 hover:text-black touch-manipulation mobile-touch-target"
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSearch();
                          }}
                          onTouchEnd={(e: React.TouchEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          disabled={isLoading}
                          type="button"
                        >
                          {isLoading ? (
                            <Square className="h-5 w-5" />
                          ) : (
                            <ArrowUp className="h-5 w-5" />
                          )}
                        </RegularButton>
                      </PromptInputAction>
                    </PromptInputActions>
                  </PromptInput>
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
                        ? searchQuery.trim() 
                          ? `Found ${filteredProfessors.length} professors for "${searchQuery}"`
                          : `Found ${filteredProfessors.length} professors`
                        : `No professors found${searchQuery.trim() ? ` for "${searchQuery}"` : ''}`
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

                {/* Gmail Connection Status - Sleek New Design */}
                {isGmailConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
                    className="relative mb-8 group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0CF2A0]/20 via-[#0CF2A0]/30 to-[#0CF2A0]/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-r from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border border-[#0CF2A0]/40 rounded-2xl p-6 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#0CF2A0] to-[#0CF2A0]/70 rounded-2xl shadow-lg">
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-6 h-6"
                              >
                                <Check className="h-6 w-6 text-black" />
                              </motion.div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0CF2A0] rounded-full animate-pulse"></div>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              Gmail Connected
                              <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-[#0CF2A0]"
                              >
 
                              </motion.span>
                            </h3>
                            <p className="text-gray-400 text-sm">
                              Ready to send personalized emails instantly
                            </p>
                            {connectedAccountEmail && (
                              <p className="text-blue-300 text-xs font-mono mt-1">
                                📧 {connectedAccountEmail}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex items-center gap-2 bg-[#0CF2A0]/10 border border-[#0CF2A0]/30 rounded-lg px-3 py-1.5">
                            <div className="w-2 h-2 bg-[#0CF2A0] rounded-full animate-pulse"></div>
                            <span className="text-[#0CF2A0] text-xs font-medium">ACTIVE</span>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Enhanced Features Strip */}
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#0CF2A0] rounded-full"></div>
                            <span>Direct Send</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#0CF2A0] rounded-full"></div>
                            <span>Smart Templates</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#0CF2A0] rounded-full"></div>
                            <span>Instant Delivery</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Research Information Form */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative mb-8"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-gray-600/20 rounded-2xl blur-sm"></div>
                  <div className="relative bg-[#1a1a1a]/90 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
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
                                  <span className="text-[#0CF2A0] font-medium">{resumeFile.name}</span>
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
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          {/* Gmail Status Badge */}
                          {isGmailConnected && (
                            <motion.div 
                              className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-xl px-4 py-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-green-400 text-sm font-medium">Ready to Send</span>
                            </motion.div>
                          )}
                          
                          {/* Edit Button */}
                          <motion.button
                            onClick={handleEditEmail}
                            className="bg-blue-800/50 hover:bg-blue-700/50 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm border border-blue-600/50 hover:border-blue-500/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit Email
                          </motion.button>

                          {/* Copy Button */}
                          <motion.button
                            onClick={copyEmailToClipboard}
                            className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm border border-gray-600/50 hover:border-gray-500/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </motion.button>
                          
                          {/* Send/Connect Button - 3D Style */}
                          <Button3D
                            onClick={isGmailConnected ? handleSendEmailWithAI : handleConnectGmail}
                            disabled={isConnectingGmail || isSendingEmail || !userFullName.trim() || !resumeUrl.trim()}
                            variant={isGmailConnected ? "default" : "ai"}
                            size="lg"
                            supportIcon={isConnectingGmail ? TablerLoader2 as any : isSendingEmail ? Clock as any : isGmailConnected ? Clock as any : IconMail}
                            isLoading={isConnectingGmail || isSendingEmail}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="shadow-xl"
                          >
                            {isConnectingGmail ? (
                              "Connecting..."
                            ) : isSendingEmail ? (
                              "Sending..."
                            ) : isGmailConnected ? (
                              <>Send Email Now</>
                            ) : (
                              "Connect Gmail"
                            )}
                          </Button3D>
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
              className="w-full max-w-6xl mx-auto"
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