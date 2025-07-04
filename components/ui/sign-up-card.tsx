'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, BookOpen } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { cn } from "@/lib/utils"
import { GradientButton } from '@/components/ui/gradient-button';
import { CustomGoogleButton } from '@/components/ui/custom-google-button';
import Image from 'next/image';

// Dynamic import no longer needed as we're using custom Google button

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to check if Supabase is properly configured
const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'https://placeholder-url.supabase.co' && key !== 'placeholder-key');
};

export function SignUpCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // For 3D card effect - disable on mobile for better performance
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if window is defined (client-side)
  const [isMounted, setIsMounted] = useState(false);
  
  // Check if Google Client ID is available
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    setIsGoogleConfigured(!!googleClientId);
    setSupabaseConfigured(isSupabaseConfigured());
    
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable 3D effect on mobile
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      if (!supabaseConfigured) {
        // In development without proper Supabase config, simulate success
        setTimeout(() => {
          router.push('/search');
        }, 1000);
        return;
      }
      
      // Exchange Google ID token for Supabase session
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to search page on successful signup
      router.push('/search');
    } catch (error) {
      console.error('Google signup failed:', error);
      setAuthError('Google sign-up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate form fields
    if (!fullName.trim()) {
      setAuthError('Please enter your full name');
      return;
    }
    
    if (!email.trim()) {
      setAuthError('Please enter your email address');
      return;
    }
    
    if (!isValidEmail(email)) {
      setAuthError('Please enter a valid email address');
      return;
    }
    
    if (!password) {
      setAuthError('Please enter a password');
      return;
    }
    
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    
    if (!role) {
      setAuthError('Please select your academic role');
      return;
    }
    
    if (!termsAgreed) {
      setAuthError('Please agree to the terms and conditions');
      return;
    }
    
    try {
      setIsLoading(true);
      setAuthError(null);
      
      if (!supabaseConfigured) {
        // In development without proper Supabase config, simulate success
        // Store user info in localStorage for development
        localStorage.setItem('userInfo', JSON.stringify({
          name: fullName,
          email: email,
          role: role,
          signedUpAt: new Date().toISOString()
        }));
        
        setTimeout(() => {
          router.push('/search');
        }, 1000);
        return;
      }
      
      // Sign up with email and password using Supabase - disable email confirmation for development
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
            role: role
          }
        }
      });
      
      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('Email address') && error.message.includes('invalid')) {
          setAuthError('Please enter a valid email address. Make sure it\'s in the correct format (e.g., user@example.com)');
        } else if (error.message.includes('Password')) {
          setAuthError('Password must be at least 6 characters long and contain valid characters');
        } else if (error.message.includes('User already registered')) {
          setAuthError('An account with this email already exists. Please try signing in instead.');
        } else {
          setAuthError(error.message || 'Sign up failed. Please try again.');
        }
        return;
      }
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation is enabled - provide helpful message and option to continue without confirmation
        setAuthError(
                      `Confirmation email sent to ${email}. Check your inbox and spam folder. ` +
          `If you don't receive it, you can continue to the app and confirm later.`
        );
        
        // For development, allow user to continue after a delay
        setTimeout(() => {
          // Store user info in localStorage for development
          localStorage.setItem('userInfo', JSON.stringify({
            name: fullName,
            email: email,
            role: role,
            signedUpAt: new Date().toISOString(),
            emailConfirmed: false
          }));
          router.push('/search');
        }, 3000);
        return;
      }
      
      // If we have a session, sign-up was successful without confirmation required
      if (data.session) {
        router.push('/search');
      }
      
    } catch (error) {
      console.error('Signup failed:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background gradient effect - Changed to match academic theme with blue/teal colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0CF2A0]/30 via-[#0CF2A0]/20 to-black" />
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-[#0CF2A0]/20 blur-[80px]" />
      <motion.div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-[#0CF2A0]/20 blur-[60px]"
        animate={{ 
          opacity: [0.15, 0.3, 0.15],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />

      {/* Animated glow spots */}
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card glow effect */}
            <motion.div 
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  "0 0 10px 2px rgba(12,242,160,0.03)",
                  "0 0 15px 5px rgba(12,242,160,0.05)",
                  "0 0 10px 2px rgba(12,242,160,0.03)"
                ],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut", 
                repeatType: "mirror" 
              }}
            />

            {/* Card border glow */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-[#0CF2A0]/10 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
            
            {/* Glass card background */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
              {/* Logo and header */}
              <div className="text-center space-y-1 mb-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
                >
                  {/* Logo placeholder */}
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">A</span>
                  
                  {/* Inner lighting effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0CF2A0]/20 to-transparent opacity-50" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                >
                  Welcome back
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 text-xs"
                >
                  Sign in to continue to Uniflow
                </motion.p>
              </div>

              {/* Custom Google Sign-Up Button */}
              <div className="mb-4">
                <div className="relative w-full">
                  {!isMounted ? (
                    // Show a placeholder during server-side rendering
                    <div className="bg-gray-800 text-white p-3 text-center text-sm rounded-lg border border-gray-700 h-14 flex items-center justify-center">
                      Loading sign-up options...
                    </div>
                  ) : isGoogleConfigured ? (
                    <CustomGoogleButton
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        setAuthError('Google sign-up failed. Please try again.');
                      }}
                      isLoading={isLoading}
                      text="signup"
                      className="w-full"
                    />
                  ) : (
                    <div className="bg-gray-800 text-white p-3 text-center text-sm rounded-lg border border-gray-700">
                      <p className="mb-1">⚠️ Google Sign-Up not configured</p>
                      <p>Missing Google Client ID in environment variables.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider with "or" text */}
              <div className="flex items-center my-4">
                <div className="flex-grow h-px bg-white/10"></div>
                <div className="mx-3 text-white/40 text-xs">or</div>
                <div className="flex-grow h-px bg-white/10"></div>
              </div>

              {/* Error message */}
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-2 text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg"
                >
                  {authError}
                </motion.div>
              )}

              {/* Registration form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <motion.div className="space-y-3">
                  {/* Full Name Input */}
                  <motion.div 
                    className={`relative ${focusedInput === "fullName" ? 'z-10' : ''}`}
                    whileFocus={{ scale: isMobile ? 1 : 1.02 }}
                    whileHover={{ scale: isMobile ? 1 : 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-[#0CF2A0]/10 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        focusedInput === "fullName" ? 'text-white' : 'text-white/40'
                      }`} />
                      
                      <Input
                        type="text"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onFocus={() => setFocusedInput("fullName")}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border-transparent focus:border-[#0CF2A0]/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10 touch-manipulation"
                        autoComplete="name"
                        autoCapitalize="words"
                        autoCorrect="off"
                        spellCheck="false"
                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                      />
                      
                      {/* Input highlight effect */}
                      {focusedInput === "fullName" && (
                        <motion.div 
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-white/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Email input */}
                  <motion.div 
                    className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                    whileFocus={{ scale: isMobile ? 1 : 1.02 }}
                    whileHover={{ scale: isMobile ? 1 : 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-[#0CF2A0]/10 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        focusedInput === "email" ? 'text-white' : 'text-white/40'
                      }`} />
                      
                      <Input
                        type="email"
                        placeholder="Academic email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border-transparent focus:border-[#0CF2A0]/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10 touch-manipulation"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                      />
                      
                      {/* Input highlight effect */}
                      {focusedInput === "email" && (
                        <motion.div 
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-white/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Academic Role input */}
                  <motion.div 
                    className={`relative ${focusedInput === "role" ? 'z-10' : ''}`}
                    whileFocus={{ scale: 1.02 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-[#0CF2A0]/10 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <BookOpen className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        focusedInput === "role" ? 'text-white' : 'text-white/40'
                      }`} />
                      
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        onFocus={() => setFocusedInput("role")}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border-transparent focus:border-[#0CF2A0]/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10 appearance-none rounded-md outline-none"
                      >
                        <option value="" disabled className="bg-gray-900">Select your role</option>
                        <option value="student" className="bg-gray-900">Student</option>
                        <option value="researcher" className="bg-gray-900">Researcher</option>
                        <option value="professor" className="bg-gray-900">Professor</option>
                        <option value="professional" className="bg-gray-900">Academic Professional</option>
                      </select>
                      
                      {/* Custom dropdown arrow */}
                      <div className="absolute right-3 pointer-events-none">
                        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                      
                      {/* Input highlight effect */}
                      {focusedInput === "role" && (
                        <motion.div 
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-white/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Password input */}
                  <motion.div 
                    className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                    whileFocus={{ scale: 1.02 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-[#0CF2A0]/10 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        focusedInput === "password" ? 'text-white' : 'text-white/40'
                      }`} />
                      
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border-transparent focus:border-[#0CF2A0]/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10 touch-manipulation"
                        autoComplete="new-password"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                      />
                      
                      {/* Toggle password visibility */}
                      <div 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 cursor-pointer"
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                        )}
                      </div>
                      
                      {/* Input highlight effect */}
                      {focusedInput === "password" && (
                        <motion.div 
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-white/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Confirm Password input */}
                  <motion.div 
                    className={`relative ${focusedInput === "confirmPassword" ? 'z-10' : ''}`}
                    whileFocus={{ scale: 1.02 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-[#0CF2A0]/10 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        focusedInput === "confirmPassword" ? 'text-white' : 'text-white/40'
                      }`} />
                      
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedInput("confirmPassword")}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border-transparent focus:border-[#0CF2A0]/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                      />
                      
                      {/* Toggle password visibility */}
                      <div 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute right-3 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                        )}
                      </div>
                      
                      {/* Input highlight effect */}
                      {focusedInput === "confirmPassword" && (
                        <motion.div 
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-white/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2 pt-1">
                  <div className="relative">
                    <input
                      id="terms-agree"
                      name="terms-agree"
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={() => setTermsAgreed(!termsAgreed)}
                      className="appearance-none h-4 w-4 rounded border border-white/20 bg-white/5 checked:bg-[#0CF2A0] checked:border-[#0CF2A0] focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/30 transition-all duration-200"
                    />
                    {termsAgreed && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center text-black pointer-events-none"
                      >
                        {/* Checkmark */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <label htmlFor="terms-agree" className="text-xs text-white/60 hover:text-white/80 transition-colors duration-200">
                    I agree to the <Link href="/terms" className="text-[#0CF2A0] hover:underline">Terms</Link> and <Link href="/privacy" className="text-[#0CF2A0] hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                {/* Sign up button */}
                <GradientButton
                  type="submit"
                  disabled={isLoading || !termsAgreed}
                  className="w-full mt-5 py-4 rounded-xl touch-manipulation min-h-[48px]"
                  variant="default"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <div className="w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="button-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2 text-base font-medium"
                      >
                        Create Account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </GradientButton>

                {/* Sign in link */}
                <motion.p 
                  className="text-center text-xs text-white/60 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="relative inline-block group/signin"
                  >
                    <span className="relative z-10 text-[#0CF2A0] group-hover/signin:text-[#0CF2A0]/70 transition-colors duration-300 font-medium">
                      Sign in
                    </span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#0CF2A0] group-hover/signin:w-full transition-all duration-300" />
                  </Link>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 