'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

interface PageTransitionProps {
  children: React.ReactNode;
  isTransitioning?: boolean;
  onTransitionComplete?: () => void;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isTransitioning = false,
  onTransitionComplete
}) => {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait" onExitComplete={onTransitionComplete}>
      <motion.div
        key={router.pathname}
        initial={isTransitioning ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth transition
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

interface SmoothRedirectProps {
  to: string;
  delay?: number;
  children: React.ReactNode;
}

export const SmoothRedirect: React.FC<SmoothRedirectProps> = ({
  to,
  delay = 1500,
  children
}) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(to);
      }, 300); // Small delay for exit animation
    }, delay);

    return () => clearTimeout(timer);
  }, [router, to, delay]);

  return (
    <AnimatePresence>
      {!isRedirecting ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-screen bg-black"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="w-16 h-16 bg-[#0CF2A0] rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#0CF2A0] text-lg font-medium"
            >
              Welcome back!
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-sm mt-1"
            >
              Taking you to your dashboard...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
