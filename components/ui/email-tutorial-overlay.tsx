'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, SkipForward, Info, User, FileText, Mail, Send } from 'lucide-react';
import { TutorialOverlay } from './tutorial-overlay';
import { cookies } from '@/lib/cookies';

export interface EmailTutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: { x: number; y: number };
  action?: 'click' | 'scroll' | 'input';
}

const emailTutorialSteps: EmailTutorialStep[] = [
  {
    id: 'select-professor',
    title: 'Select a Professor',
    description: 'First, go to the Search tab and click "Personalized Email" on any professor card to select them for email composition.',
    target: 'body',
    position: 'center'
  },
  {
    id: 'fill-information',
    title: 'Fill Your Information',
    description: 'Complete the interactive setup with your name, research details, university, and resume. This personalizes your email content.',
    target: 'body',
    position: 'center'
  },
  {
    id: 'generate-email',
    title: 'Generate Email',
    description: 'Click "Generate Personalized Email" to create a tailored message based on your research and the professor\'s expertise.',
    target: 'body',
    position: 'center'
  },
  {
    id: 'send-email',
    title: 'Send Your Email',
    description: 'Connect your Gmail to send directly, or copy the email to your clipboard to send manually through your email client.',
    target: 'body',
    position: 'center'
  }
];

interface EmailTutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function EmailTutorialOverlay({
  isVisible,
  onComplete,
  onSkip
}: EmailTutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Check if user has seen this tutorial before
      const hasSeenEmailTutorial = cookies.hasSeenTutorial('email-tutorial');

      if (!hasSeenEmailTutorial) {
        setShowTutorial(true);
        setCurrentStep(0);
      } else {
        // User has seen it before, skip directly
        onSkip();
      }
    } else {
      setShowTutorial(false);
    }
  }, [isVisible, onSkip]);

  const handleComplete = () => {
    // Mark tutorial as seen
    cookies.setTutorialSeen('email-tutorial');
    setShowTutorial(false);
    onComplete();
  };

  const handleSkip = () => {
    // Mark tutorial as seen even when skipped
    cookies.setTutorialSeen('email-tutorial');
    setShowTutorial(false);
    onSkip();
  };

  const handleNext = () => {
    if (currentStep < emailTutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!showTutorial || !isVisible) return null;

  const currentStepData = emailTutorialSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-auto"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      >
        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="absolute bg-[#1a1a1a]/95 border border-white/30 rounded-xl shadow-2xl backdrop-blur-xl max-w-sm w-full mx-4 max-h-[calc(100vh-2rem)] overflow-auto"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-white">
                  Step {currentStep + 1} of {emailTutorialSteps.length}
                </div>
                <div className="flex gap-1">
                  {emailTutorialSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-[#0CF2A0]' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-1 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#0CF2A0]/20 rounded-full flex items-center justify-center mt-0.5">
                {currentStep === 0 && <User className="h-4 w-4 text-[#0CF2A0]" />}
                {currentStep === 1 && <FileText className="h-4 w-4 text-[#0CF2A0]" />}
                {currentStep === 2 && <Mail className="h-4 w-4 text-[#0CF2A0]" />}
                {currentStep === 3 && <Send className="h-4 w-4 text-[#0CF2A0]" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>
            </div>

            {/* Pro Tip for last step */}
            {currentStep === emailTutorialSteps.length - 1 && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm font-medium mb-1">Pro Tip</p>
                <p className="text-blue-200 text-sm">Review and edit the generated email before sending to add your personal touch and ensure accuracy.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Skip Tutorial
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0CF2A0] hover:bg-[#0CF2A0]/90 text-black rounded-lg transition-colors font-medium"
              >
                {currentStep === emailTutorialSteps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < emailTutorialSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
