import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { User, LogOut, ArrowLeft, GraduationCap, Search as SearchIcon, PenTool } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import withAuth from '../components/withAuth';
import { supabase } from '@/lib/supabase';

const Profile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Array<{x: number, y: number, radius: number, color: string, vx: number, vy: number}>>([]);
  const animationFrameId = useRef<number | null>(null);
  const mousePositionRef = useRef<{x: number | null, y: number | null}>({ x: null, y: null });

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check for missing environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Supabase environment variables are missing. Using mock data in development.');
            // In development, provide mock user data
            setUserData({
              email: 'mock.user@example.com',
              user_metadata: {
                full_name: 'Development User',
                avatar_url: 'https://i.pravatar.cc/150?u=development'
              }
            });
            setIsMockData(true);
            setLoading(false);
            return;
          }
        }

        // Get user data from Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (user) {
          setUserData(user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      if (!isMockData) {
        await supabase.auth.signOut();
      }
      // Clear any local storage data
      localStorage.clear();
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Extract user information with fallbacks
  const fullName = userData?.user_metadata?.full_name || userData?.user_metadata?.name || 'User Profile';
  const userEmail = userData?.email || '';
  const avatarUrl = userData?.user_metadata?.avatar_url || userData?.user_metadata?.picture || '';

  const navLinks = [
    { href: "/professors", label: "Professors", icon: <GraduationCap className="h-4 w-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <>
      <Head>
        <title>Profile | Research Connect</title>
        <meta name="description" content="View your profile information" />
      </Head>
      
      <div className="relative min-h-screen bg-[#111111] text-gray-300 flex flex-col overflow-x-hidden">
        {/* Interactive Background */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-80" />
        <div className="absolute inset-0 z-1 pointer-events-none" style={{
              background: 'linear-gradient(to bottom, transparent 0%, #111111 90%), radial-gradient(ellipse at center, transparent 40%, #111111 95%)'
        }}></div>
        
        {/* Enhanced Navigation */}
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
                        link.href === "/profile" 
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
                  
                  {/* Search Navigation */}
                  <motion.button
                    onClick={() => router.push('/search')}
                    className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SearchIcon className="h-4 w-4" />
                    Search Professors
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/search?tab=email')}
                    className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/5"
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

        {/* Environment warning for mock data */}
        {isMockData && (
          <div className="bg-yellow-900/80 border-b border-yellow-600 text-yellow-200 px-4 py-2 text-sm relative z-10">
            ⚠️ Showing mock profile data. Set up Supabase environment variables for real authentication.
          </div>
        )}
        
        {/* Main Content */}
        <div className="container mx-auto px-6 py-8 flex-grow flex items-center justify-center relative z-10">
          {loading ? (
            <motion.div 
              className="flex justify-center items-center h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-8 h-8 border-2 border-[#0CF2A0] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : error ? (
            <motion.div 
              className="bg-red-900/20 border border-red-800/30 p-4 rounded-lg text-red-400 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {error}
            </motion.div>
          ) : (
            <motion.div 
              className="w-full max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-8 text-center backdrop-blur-sm">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3 mb-4">
                    <User className="h-8 w-8 text-[#0CF2A0]" />
                    My Profile
                  </h1>
                </div>
                
                {/* Profile Picture */}
                <div className="flex justify-center mb-6">
                  {avatarUrl ? (
                    <motion.img 
                      src={avatarUrl} 
                      alt={fullName} 
                      className="w-24 h-24 rounded-full object-cover border border-gray-800"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  ) : (
                    <motion.div 
                      className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center text-[#0CF2A0]"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <User className="h-12 w-12" />
                    </motion.div>
                  )}
                </div>
                
                {/* User Information */}
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <p className="text-lg font-semibold text-white">{fullName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <p className="text-lg text-gray-300">{userEmail}</p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(Profile); 