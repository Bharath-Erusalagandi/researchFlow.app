'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  backHref = '/',
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/search", label: "Search", icon: "🔍" },
    { href: "/professors", label: "Professors", icon: "👨‍🏫" },
    { href: "/search?tab=email", label: "AI Email", icon: "✉️" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className={cn("min-h-screen bg-[#111111] text-gray-300", className)}>
      {/* Mobile Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-800/50"
        animate={{
          backgroundColor: isScrolled ? "rgba(17, 17, 17, 0.95)" : "rgba(17, 17, 17, 0.9)",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left side - Back button or Logo */}
          <div className="flex items-center space-x-3">
            {showBackButton ? (
              <motion.button
                onClick={() => router.push(backHref)}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors touch-manipulation"
                whileTap={{ scale: 0.95 }}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            ) : (
              <Link href="/" className="flex items-center">
                <img 
                  src="/logo without text.png" 
                  alt="Research Flow Logo" 
                  className="h-24 w-auto"
                />
              </Link>
            )}
            
            {title && (
              <h1 className="text-lg font-semibold text-white truncate max-w-[150px]">
                {title}
              </h1>
            )}
          </div>

          {/* Right side - Menu button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors touch-manipulation"
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
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
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#111111]/98 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Navigation Grid */}
                <div className="grid grid-cols-2 gap-3 p-6">
                  {navItems.map((item) => {
                    const isActive = router.pathname === item.href || 
                      (item.href.includes('?') && router.asPath === item.href);
                    
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 touch-manipulation",
                            isActive 
                              ? "bg-[#0CF2A0]/10 border-[#0CF2A0]/30 text-[#0CF2A0]" 
                              : "bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600"
                          )}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="text-2xl mb-2">
                            {typeof item.icon === 'string' ? item.icon : item.icon}
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="px-6 pb-6">
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        router.push('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full p-3 text-left rounded-lg bg-[#0CF2A0]/10 border border-[#0CF2A0]/20 text-[#0CF2A0] hover:bg-[#0CF2A0]/20 transition-colors duration-200 touch-manipulation"
                    >
                      <span className="font-medium">Sign In / Sign Up</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Mobile Bottom Safe Area */}
      <div className="h-safe-area-inset-bottom bg-[#111111]" />
    </div>
  );
};

export default MobileLayout; 