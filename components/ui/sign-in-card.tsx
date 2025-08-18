'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
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

export function SignInCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // For 3D card effect - disable on mobile for better performance
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  const [isMobile, setIsMobile] = useState(false);

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

  // Check if window is defined (client-side)
  const [isMounted, setIsMounted] = useState(false);
  
  // Check if Google Client ID is available
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    setIsGoogleConfigured(!!googleClientId);
    
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // Check if environment variables are missing
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Supabase environment variables are missing. Using mock authentication in development.');
          // In development, we'll simulate a successful login
          setTimeout(() => {
            router.push('/search');
          }, 1000);
          return;
        } else {
          throw new Error('Authentication configuration is missing. Please contact the administrator.');
        }
      }
      
      // Exchange Google ID token for Supabase session
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to search page on successful login
      router.push('/search');
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // Check if environment variables are missing
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Supabase environment variables are missing. Using mock authentication in development.');
          // In development, we'll simulate a successful login
          setTimeout(() => {
            router.push('/search');
          }, 1000);
          return;
        } else {
          throw new Error('Authentication configuration is missing. Please contact the administrator.');
        }
      }
      
      // Sign in with email and password using Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to search page on successful login
      router.push('/search');
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
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
        className="w-full max-w-sm sm:max-w-md relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={isMobile ? {} : { rotateX, rotateY }}
          onMouseMove={isMobile ? undefined : handleMouseMove}
          onMouseLeave={isMobile ? undefined : handleMouseLeave}
          whileHover={isMobile ? {} : { z: 10 }}
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
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/[0.05] shadow-2xl overflow-hidden">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img 
                  src="/logo without text.png" 
                  alt="Research Flow Logo" 
                  className="h-8 w-auto opacity-80"
                />
              </div>

              {/* Custom Google Sign-In Button */}
              <div className="mb-6">
                <div className="relative w-full">
                  {!isMounted ? (
                    // Show a placeholder during server-side rendering
                    <div className="bg-gray-800 text-white p-4 text-center text-sm rounded-lg border border-gray-700 h-14 flex items-center justify-center">
                      Loading sign-in options...
                    </div>
                  ) : isGoogleConfigured ? (
                    <CustomGoogleButton
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        setAuthError('Google sign-in failed. Please try again.');
                      }}
                      isLoading={isLoading}
                      text="signin"
                      className="w-full"
                    />
                  ) : (
                    <div className="bg-gray-800 text-white p-4 text-center text-sm rounded-lg border border-gray-700">
                      <p className="mb-1">⚠️ Google Sign-In not configured</p>
                      <p>Missing Google Client ID in environment variables.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider with "or" text */}
              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-white/10"></div>
                <div className="mx-4 text-white/40 text-sm">or</div>
                <div className="flex-grow h-px bg-white/10"></div>
              </div>

              {/* Error message */}
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg"
                >
                  {authError}
                </motion.div>
              )}

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div className="space-y-4">
                  {/* Email input */}
                  <motion.div 
                    className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                    whileFocus={{ scale: isMobile ? 1 : 1.02 }}
                    whileHover={{ scale: isMobile ? 1 : 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-[#0CF2A0]/10 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail className={`absolute left-4 w-5 h-5 transition-all duration-300 ${
                        focusedInput === "email" ? 'text-white' : 'text-white/40'
                      }`} />
                      
                      <Input
                        type="email"
                        placeholder="Academic email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border-transparent focus:border-[#0CF2A0]/20 text-white placeholder:text-white/30 h-14 transition-all duration-300 pl-12 pr-4 focus:bg-white/10 text-base touch-manipulation"
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

                  {/* Password input */}
                  <motion.div 
                    className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                    whileFocus={{ scale: isMobile ? 1 : 1.02 }}
                    whileHover={{ scale: isMobile ? 1 : 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-[#0CF2A0]/10 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock className={`absolute left-4 w-5 h-5 transition-all duration-300 ${
                        focusedInput === "password" ? 'text-white' : 'text-white/40'
                      }`} />
                      
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border-transparent focus:border-[#0CF2A0]/20 text-white placeholder:text-white/30 h-14 transition-all duration-300 pl-12 pr-14 focus:bg-white/10 text-base touch-manipulation"
                        autoComplete="current-password"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                      />
                      
                      {/* Toggle password visibility */}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPassword(!showPassword);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute right-4 cursor-pointer p-2 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <Eye className="w-5 h-5 text-white/40 hover:text-white transition-colors duration-300" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-white/40 hover:text-white transition-colors duration-300" />
                        )}
                      </button>
                      
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
                </motion.div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="appearance-none h-5 w-5 rounded border border-white/20 bg-white/5 checked:bg-[#0CF2A0] checked:border-[#0CF2A0] focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/30 transition-all duration-200 touch-manipulation"
                      />
                      {rememberMe && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center text-black pointer-events-none"
                        >
                          {/* Checkmark */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <label htmlFor="remember-me" className="text-sm text-white/60 hover:text-white/80 transition-colors duration-200 touch-manipulation cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  
                  <div className="text-sm relative group/link">
                    <Link href="/forgot-password" className="text-white/60 hover:text-white transition-colors duration-200 touch-manipulation p-2 -m-2">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Sign in button */}
                <GradientButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-4 sm:py-5 rounded-xl touch-manipulation min-h-[48px]"
                  variant="default"
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                  }}
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
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </GradientButton>

                {/* Sign up link */}
                <motion.p 
                  className="text-center text-sm text-white/60 mt-8 pb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Don&apos;t have an account?{' '}
                  <Link 
                    href="/signup" 
                    className="relative inline-block group/signup touch-manipulation p-1 -m-1"
                  >
                    <span className="relative z-10 text-[#0CF2A0] group-hover/signup:text-[#0CF2A0]/70 transition-colors duration-300 font-medium">
                      Sign up
                    </span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#0CF2A0] group-hover/signup:w-full transition-all duration-300" />
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