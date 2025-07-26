'use client';

import React, { useState, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent, type SVGProps } from 'react';
import { motion, useScroll, useMotionValueEvent, type Variants } from 'framer-motion';
import { ShimmerButton } from '../ui/shimmer-button';

const ChevronDownIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-1 inline-block transition-transform duration-200 group-hover:rotate-180" {...props}>
     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
   </svg>
);

interface NavLinkProps {
    href?: string;
    children: ReactNode;
    hasDropdown?: boolean;
    className?: string;
    onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href = "#", children, hasDropdown = false, className = "", onClick }) => (
   <motion.a
     href={href}
     onClick={onClick}
     className={`relative group text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 flex items-center py-1 ${className}`}
     whileHover="hover"
   >
     {children}
     {hasDropdown && <ChevronDownIcon />}
     {!hasDropdown && (
         <motion.div
           className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-[#0CF2A0]"
           variants={{ initial: { scaleX: 0, originX: 0.5 }, hover: { scaleX: 1, originX: 0.5 } }}
           initial="initial"
           transition={{ duration: 0.3, ease: "easeOut" }}
         />
     )}
   </motion.a>
 );

export default function GlobalHeader() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { scrollY } = useScroll();
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  const headerVariants: Variants = {
    top: {
      backgroundColor: "rgba(17, 17, 17, 0.8)",
      borderBottomColor: "rgba(55, 65, 81, 0.5)",
      boxShadow: 'none',
      zIndex: 9999,
    },
    scrolled: {
      backgroundColor: "rgba(17, 17, 17, 0.95)",
      borderBottomColor: "rgba(75, 85, 99, 0.7)",
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 9999,
    }
  };

  const handleAboutClick = useCallback((e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetElement = document.getElementById('feature-section');
    if (targetElement) {
      const headerHeight = 70;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleFacultiesClick = useCallback((e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetElement = document.getElementById('partner-institutions-section');
    if (targetElement) {
      const headerHeight = 70;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleContactClick = useCallback((e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // You can implement contact modal logic here or scroll to contact section
    alert('Contact functionality - implement modal or contact form');
  }, []);

  return (
    <motion.header
      variants={headerVariants}
      initial="top"
      animate={isScrolled ? "scrolled" : "top"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="px-6 w-full md:px-10 lg:px-16 fixed top-0 backdrop-blur-md border-b border-gray-800/50"
      style={{ zIndex: 9999 }}
    >
      <nav className="flex justify-between items-center max-w-screen-xl mx-auto h-[70px]">
        <div className="flex items-center flex-shrink-0">
          <img 
            src="/full name website logo.png" 
            alt="Research Flow Logo" 
            className="h-32 w-auto"
          />
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center space-x-6 lg:space-x-8">
          <NavLink href="#" onClick={handleFacultiesClick}>Faculties</NavLink>
          <NavLink href="#" onClick={handleAboutClick}>Research Platform</NavLink>
          <NavLink href="#" onClick={handleContactClick}>Contact</NavLink>
        </div>

        <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
          <ShimmerButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = '/login';
            }}
            className="px-6 py-2"
            shimmerColor="#0CF2A0"
            background="rgba(17, 17, 17, 0.9)"
            borderRadius="8px"
            shimmerDuration="2s"
          >
            <span className="text-sm font-semibold text-white">
              Get Started
            </span>
          </ShimmerButton>
        </div>
      </nav>
    </motion.header>
  );
} 