import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { GraduationCap, ArrowLeft, Heart, Trash2, Mail, Brain, User, Search as SearchIcon, PenTool, Menu, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface SavedProfessor {
  id: number;
  name: string;
  email: string;
  department: string;
  interests: string;
  savedAt: string;
}

const ProfessorsPage = () => {
  const router = useRouter();
  const [savedProfessors, setSavedProfessors] = useState<SavedProfessor[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Array<{x: number, y: number, radius: number, color: string, vx: number, vy: number}>>([]);
  const animationFrameId = useRef<number | null>(null);
  const mousePositionRef = useRef<{x: number | null, y: number | null}>({ x: null, y: null });
  
  useEffect(() => {
    const savedProfs = JSON.parse(localStorage.getItem('savedProfessors') || '[]');
    setSavedProfessors(savedProfs);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Canvas background effect (same as search page)
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

  const handleRemoveProfessor = (professorId: number) => {
    const updatedProfs = savedProfessors.filter(prof => prof.id !== professorId);
    localStorage.setItem('savedProfessors', JSON.stringify(updatedProfs));
    setSavedProfessors(updatedProfs);
  };

  const handleContactProfessor = (professor: SavedProfessor) => {
    const subject = encodeURIComponent('Research Collaboration Inquiry');
    const body = encodeURIComponent(`Dear ${professor.name},\n\nI hope this email finds you well. I am writing to express my interest in your research work in ${professor.interests}.\n\nI would love to discuss potential research opportunities or collaboration possibilities.\n\nThank you for your time and consideration.\n\nBest regards,`);
    const mailtoLink = `mailto:${professor.email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  };

  const handlePersonalizedEmail = (professor: SavedProfessor) => {
    // Store the selected professor data for the email tab
    const professorForEmail = {
      id: professor.id,
      name: professor.name,
      email: professor.email,
      field_of_research: professor.interests,
      university_name: professor.department,
      department: professor.department
    };
    
    localStorage.setItem('selectedProfessorForEmail', JSON.stringify(professorForEmail));
    
    // Navigate to the personalized email tab
    router.push('/search?tab=email');
  };

  const navLinks = [
    { href: "/search", label: "Search", icon: <SearchIcon className="h-4 w-4" /> },
    { href: "/professors", label: "Professors", icon: <GraduationCap className="h-4 w-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  ];
  
  return (
    <>
      <Head>
        <title>My Professors | Research Connect</title>
        <meta name="description" content="View your saved professors and research contacts" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      
      <div className="relative min-h-screen bg-[#111111] text-gray-300 flex flex-col overflow-x-hidden">
        {/* Interactive Background */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-80" />
        <div className="absolute inset-0 z-1 pointer-events-none" style={{
              background: 'linear-gradient(to bottom, transparent 0%, #111111 90%), radial-gradient(ellipse at center, transparent 40%, #111111 95%)'
        }}></div>
        
        {/* Mobile-First Navigation */}
        <motion.div 
          className="sticky top-0 z-30 bg-[#111111]/90 backdrop-blur-md border-b border-gray-800/50 shadow-md"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-20">
              
              {/* Mobile Layout */}
              <div className="flex items-center md:hidden">
                <Link href="/" className="flex items-center">
                  <img 
                    src="/images/logo new.png" 
                    alt="Research Flow Logo" 
                    className="h-24 w-auto"
                  />
                </Link>
              </div>

              {/* Mobile Page Title */}
              <div className="flex-1 text-center md:hidden">
                <h1 className="text-lg font-semibold text-white">My Professors</h1>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                  }}
                  className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors touch-manipulation"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle navigation menu"
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
                        <Menu className="h-6 w-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-center flex-1">
                <motion.div 
                  className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-700/50 shadow-lg"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 8px 32px rgba(12, 242, 160, 0.15)"
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="flex space-x-2">
                    {navLinks.map((link) => {
                      const isActive = router.pathname === link.href;
                      return (
                        <Link key={link.href} href={link.href}>
                          <motion.div
                            className={cn(
                              "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200",
                              isActive 
                                ? "bg-[#0CF2A0]/20 text-[#0CF2A0] shadow-md" 
                                : "text-gray-300 hover:bg-gray-700/30 hover:text-white"
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {link.icon}
                            <span className="font-medium">{link.label}</span>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
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
              className="md:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ y: '-100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-[#111111]/98 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-3">
                    {navLinks.map((link) => {
                      const isActive = router.pathname === link.href;
                      return (
                        <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                          <motion.div
                            className={cn(
                              "flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 touch-manipulation",
                              isActive 
                                ? "bg-[#0CF2A0]/10 border-[#0CF2A0]/30 text-[#0CF2A0]" 
                                : "bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-700/50"
                            )}
                            whileTap={{ scale: 0.95 }}
                          >
                            {link.icon}
                            <span className="font-medium">{link.label}</span>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <main className="flex-1 relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h1 className="hidden md:block text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Saved Professors
              </h1>
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                {savedProfessors.length === 0 
                  ? "You haven&apos;t saved any professors yet. Start by searching for professors in your research area."
                  : `You have ${savedProfessors.length} saved professor${savedProfessors.length === 1 ? "" : "s"} for future collaboration.`
                }
              </p>
            </motion.div>

            {/* Professors Grid */}
            {savedProfessors.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              >
                {savedProfessors.map((professor, index) => (
                  <motion.div
                    key={professor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <SpotlightCard className="p-6 bg-gray-900/50 border border-gray-700/50 rounded-xl hover:border-[#0CF2A0]/30 transition-all duration-300">
                      <div className="space-y-4">
                        {/* Professor Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-white truncate">
                              {professor.name}
                            </h3>
                            <p className="text-sm text-gray-400 truncate">
                              {professor.department}
                            </p>
                          </div>
                          <motion.button
                            onClick={() => handleRemoveProfessor(professor.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors touch-manipulation"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Remove professor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>

                        {/* Research Interests */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Research Interests</h4>
                          <p className="text-sm text-gray-400 line-clamp-3">
                            {professor.interests}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <motion.button
                            onClick={() => handleContactProfessor(professor)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 touch-manipulation"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Mail className="h-4 w-4" />
                            <span className="text-sm font-medium">Contact</span>
                          </motion.button>
                          
                          <motion.button
                            onClick={() => handlePersonalizedEmail(professor)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#0CF2A0]/10 hover:bg-[#0CF2A0]/20 text-[#0CF2A0] rounded-lg transition-all duration-200 touch-manipulation"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Brain className="h-4 w-4" />
                            <span className="text-sm font-medium">AI Email</span>
                          </motion.button>
                        </div>

                        {/* Saved Date */}
                        <p className="text-xs text-gray-500">
                          Saved on {new Date(professor.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center py-12 sm:py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                    No Professors Saved Yet
                  </h2>
                  <p className="text-gray-400 mb-8">
                    Start exploring and save professors you&apos;re interested in collaborating with.
                  </p>
                  <Link href="/search">
                    <motion.button
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0CF2A0] text-[#111111] rounded-lg font-medium hover:bg-[#0CF2A0]/90 transition-colors touch-manipulation"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SearchIcon className="h-4 w-4" />
                      <span>Start Searching</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* Mobile Safe Area */}
        <div className="h-safe-area-inset-bottom bg-[#111111]" />
      </div>
    </>
  );
};

export default ProfessorsPage; 