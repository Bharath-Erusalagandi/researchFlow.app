"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Search, 
  User, 
  Settings, 
  LogOut,
  GraduationCap,
  BookOpen,
  FileText,
  Mail,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
  className?: string;
  onClick?: () => void;
  isMobile?: boolean;
}

interface DropdownItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ 
  href, 
  children, 
  hasDropdown = false, 
  className = "", 
  onClick,
  isMobile = false
}) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <motion.div className="relative">
      <Link 
        href={href}
        onClick={onClick}
        className={cn(
          "relative group transition-colors duration-200 flex items-center rounded-md",
          isMobile 
            ? "w-full p-4 text-base font-medium hover:bg-gray-800/50" 
            : "text-sm font-medium py-2 px-3",
          isActive 
            ? "text-[#0CF2A0] bg-[#0CF2A0]/10" 
            : "text-gray-300 hover:text-white hover:bg-gray-800/50",
          className
        )}
      >
        {children}
        {hasDropdown && <ChevronDown className={cn("ml-1", isMobile ? "h-5 w-5" : "h-4 w-4")} />}
        {!hasDropdown && !isActive && !isMobile && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0CF2A0]"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.div>
  );
};

const DropdownMenu: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
}> = ({ children, isOpen }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 z-50"
      >
        <div className="bg-[#111111] border border-gray-700/50 rounded-lg shadow-xl p-2">
          {children}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const DropdownMenuItem: React.FC<{
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ href, children, icon }) => (
  <Link
    href={href}
    className="group flex items-center justify-between w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/30 hover:text-white rounded-md transition-colors duration-150"
  >
    <div className="flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </div>
  </Link>
);

interface MainNavigationProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ 
  children, 
  showSidebar = false 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only close if clicking outside the mobile menu button and container
      if (!target.closest('.mobile-menu-container') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Add a slight delay to prevent immediate closure
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      // Prevent body scroll when mobile menu is open
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

  const navItems = [
    { href: "/professors", label: "Professors", icon: <GraduationCap className="h-4 w-4" /> },
    { href: "/search?tab=email", label: "AI Email", icon: <Brain className="h-4 w-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300">
      {/* Header */}
      <nav className="bg-black/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-display text-2xl font-bold text-white">
                Research<span className="text-[#0CF2A0]">Flow</span>
              </span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/professors" className="text-space text-gray-300 hover:text-white transition-colors font-medium">
                Professors
              </Link>
              <Link href="/research" className="text-space text-gray-300 hover:text-white transition-colors font-medium">
                Research
              </Link>
              <Link href="/contact" className="text-space text-gray-300 hover:text-white transition-colors font-medium">
                Contact
              </Link>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-caption text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="bg-[#0CF2A0] text-black px-4 py-2 rounded-md font-space font-semibold hover:bg-[#0CF2A0]/90 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-40"
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

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-4">
                  <nav className="space-y-1 px-4">
                    {navItems.map((item) => (
                      <NavLink 
                        key={item.href} 
                        href={item.href} 
                        isMobile={true}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </NavLink>
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

      {/* Main content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default MainNavigation; 