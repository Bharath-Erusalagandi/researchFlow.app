'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, SkipForward, Mail, User, FileText, Send, Sparkles, CheckCircle } from 'lucide-react';
import { cookies } from '@/lib/cookies';
import { userPrefsService } from '@/lib/userPreferences';
import confetti from 'canvas-confetti';

export interface EnhancedEmailTutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: { x: number; y: number };
  action?: 'click' | 'scroll' | 'input';
  icon?: React.ReactNode;
  highlight?: boolean;
  tip?: string;
}

interface EnhancedEmailTutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function EnhancedEmailTutorialOverlay({
  isVisible,
  onComplete,
  onSkip
}: EnhancedEmailTutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  const emailTutorialSteps: EnhancedEmailTutorialStep[] = [
    {
      id: 'email-intro',
      title: '📧 Email Creation Wizard',
      description: 'Welcome! Let me show you how to create personalized emails that professors will love to read. Ready to make great first impressions?',
      target: 'body',
      position: 'center',
      icon: <Sparkles className="w-6 h-6 text-[#0CF2A0]" />
    },
    {
      id: 'select-professor',
      title: '👨‍🎓 Select Your Professor',
      description: 'First, choose a professor from your search results by clicking "Personalized Email" on their card. This starts the email creation process!',
      target: 'body',
      position: 'center',
      icon: <User className="w-6 h-6 text-blue-500" />,
      tip: 'Each email is customized to the specific professor\'s research!'
    },
    {
      id: 'fill-information',
      title: '📝 Tell Us About You',
      description: 'Complete the form with your details - name, research interests, and academic background. This personalizes your email content!',
      target: 'body',
      position: 'center',
      icon: <FileText className="w-6 h-6 text-purple-500" />,
      action: 'input',
      tip: 'The more specific you are, the better your email will be!'
    },
    {
      id: 'generate-email',
      title: '✨ AI Magic Time!',
      description: 'Click "Generate Personalized Email" and watch as AI creates a professional, engaging email tailored to your research alignment!',
      target: 'body',
      position: 'center',
      icon: <Mail className="w-6 h-6 text-indigo-500" />,
      action: 'click',
      highlight: true
    },
    {
      id: 'send-email',
      title: '🚀 Send with Confidence',
      description: 'Review your email, make any edits, then send directly via Gmail or copy to your preferred email client. You\'re ready to connect!',
      target: 'body',
      position: 'center',
      icon: <Send className="w-6 h-6 text-green-500" />,
      tip: 'Follow up after a week if you don\'t hear back!'
    }
  ];

  useEffect(() => {
    const checkAndShowTutorial = async () => {
      if (isVisible) {
        try {
          // Check if user has seen this tutorial before
          if (userPrefsService.isUserInitialized()) {
            const hasSeenEmailTutorial = await userPrefsService.getTutorialStatus('email_tutorial');
            if (!hasSeenEmailTutorial) {
              setShowTutorial(true);
              setCurrentStep(0);
            } else {
              onSkip();
            }
          } else {
            // Fallback to cookies
            const hasSeenEmailTutorial = cookies.hasSeenTutorial('email-tutorial');
            if (!hasSeenEmailTutorial) {
              setShowTutorial(true);
              setCurrentStep(0);
            } else {
              onSkip();
            }
          }
        } catch (error) {
          console.error('Error checking email tutorial status:', error);
          // Fallback to showing tutorial
          setShowTutorial(true);
          setCurrentStep(0);
        }
      } else {
        setShowTutorial(false);
      }
    };
    
    checkAndShowTutorial();
  }, [isVisible, onSkip]);

  const handleComplete = async () => {
    // Trigger celebration confetti
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#0CF2A0', '#10B981', '#3B82F6', '#8B5CF6']
    });
    
    // Mark tutorial as seen
    try {
      if (userPrefsService.isUserInitialized()) {
        await userPrefsService.markTutorialCompleted('email_tutorial');
      } else {
        cookies.setTutorialSeen('email-tutorial');
      }
    } catch (error) {
      console.error('Error saving email tutorial completion:', error);
      cookies.setTutorialSeen('email-tutorial');
    }
    
    setShowTutorial(false);
    onComplete();
  };

  const handleSkip = async () => {
    // Mark tutorial as seen even when skipped
    try {
      if (userPrefsService.isUserInitialized()) {
        await userPrefsService.markTutorialCompleted('email_tutorial');
      } else {
        cookies.setTutorialSeen('email-tutorial');
      }
    } catch (error) {
      console.error('Error saving email tutorial skip:', error);
      cookies.setTutorialSeen('email-tutorial');
    }
    
    setShowTutorial(false);
    onSkip();
  };

  const handleNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));
    
    // Small confetti for step completion
    if (currentStep === 2 || currentStep === 3) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0CF2A0', '#3B82F6']
      });
    }
    
    setTimeout(() => {
      if (currentStep < emailTutorialSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
      setIsAnimating(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (currentStep > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  if (!showTutorial || !isVisible) return null;

  const currentStepData = emailTutorialSteps[currentStep];
  const progress = ((currentStep + 1) / emailTutorialSteps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-auto"
      >
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#0CF2A0] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
          </div>
        </motion.div>

        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl max-w-lg w-full mx-4 overflow-hidden"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Progress Bar */}
          <div className="relative h-1.5 bg-gray-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0CF2A0] via-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>

          {/* Header */}
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              {/* Step indicator with icon */}
              <div className="flex items-center gap-4">
                <motion.div 
                  className="relative"
                  animate={{ 
                    rotate: [0, -5, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0CF2A0]/30 to-blue-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    {currentStepData.icon || <Mail className="w-7 h-7 text-[#0CF2A0]" />}
                  </div>
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0CF2A0] rounded-full flex items-center justify-center text-black text-xs font-bold"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {currentStep + 1}
                  </motion.div>
                </motion.div>

                {/* Progress dots with connections */}
                <div className="flex items-center gap-1">
                  {emailTutorialSteps.map((_, index) => (
                    <React.Fragment key={index}>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                          completedSteps.has(index) 
                            ? 'bg-[#0CF2A0]' 
                            : index === currentStep 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-gray-600'
                        }`}
                      >
                        {completedSteps.has(index) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                      {index < emailTutorialSteps.length - 1 && (
                        <div className={`w-8 h-0.5 transition-all duration-300 ${
                          completedSteps.has(index) ? 'bg-[#0CF2A0]' : 'bg-gray-600'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSkip}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content with animations */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-3">
                {currentStepData.title}
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {currentStepData.description}
              </p>

              {/* Action hint with animation */}
              {currentStepData.action && (
                <motion.div 
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0CF2A0]/10 border border-[#0CF2A0]/30 rounded-lg text-[#0CF2A0]"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {currentStepData.action === 'click' && 'Click to continue'}
                    {currentStepData.action === 'input' && 'Fill in the fields'}
                    {currentStepData.action === 'scroll' && 'Scroll to explore'}
                  </span>
                </motion.div>
              )}

              {/* Pro tip with gradient background */}
              {currentStepData.tip && (
                <motion.div 
                  className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-blue-300 text-sm font-semibold mb-1">💡 Pro Tip</p>
                  <p className="text-blue-100 text-sm">{currentStepData.tip}</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="relative p-6 pt-4 bg-gradient-to-t from-gray-900/50 to-transparent">
            <div className="flex items-center justify-between">
              <motion.button
                onClick={handleSkip}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <SkipForward className="w-4 h-4" />
                Skip Tutorial
              </motion.button>

              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <motion.button
                    onClick={handlePrevious}
                    disabled={isAnimating}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </motion.button>
                )}
                
                <motion.button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="relative flex items-center gap-2 px-6 py-2.5 text-sm bg-gradient-to-r from-[#0CF2A0] to-blue-500 hover:from-[#0CF2A0]/90 hover:to-blue-500/90 text-black rounded-xl transition-all font-bold shadow-lg disabled:opacity-50 overflow-hidden"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(12, 242, 160, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">
                    {currentStep === emailTutorialSteps.length - 1 ? 'Complete' : 'Next'}
                  </span>
                  {currentStep < emailTutorialSteps.length - 1 ? (
                    <ArrowRight className="w-4 h-4 relative z-10" />
                  ) : (
                    <CheckCircle className="w-4 h-4 relative z-10" />
                  )}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(30px, -50px) scale(1.1) rotate(120deg); }
          66% { transform: translate(-20px, 20px) scale(0.9) rotate(240deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        
        .animate-blob {
          animation: blob 15s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 5s;
        }
        
        .animation-delay-4000 {
          animation-delay: 10s;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </AnimatePresence>
  );
}
