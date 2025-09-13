'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  X, ArrowLeft, ArrowRight, SkipForward, CheckCircle, 
  Sparkles, Target, MousePointer, Zap, Trophy, Gift,
  Heart, Star, TrendingUp, Lightbulb, Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface EnhancedTutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: { x: number; y: number };
  icon?: React.ReactNode;
  action?: 'click' | 'scroll' | 'input' | 'hover';
  showPointer?: boolean;
  pulseTarget?: boolean;
  confettiOnComplete?: boolean;
  tip?: string;
}

interface EnhancedTutorialOverlayProps {
  steps: EnhancedTutorialStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  tutorialKey: string;
  autoAdvance?: boolean;
  theme?: 'dark' | 'light';
}

export function EnhancedTutorialOverlay({ 
  steps, 
  isVisible, 
  onComplete, 
  onSkip, 
  tutorialKey,
  autoAdvance = false,
  theme = 'dark'
}: EnhancedTutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  
  const prevStepsLength = useRef(steps.length);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for interactive cursor
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const cursorX = useTransform(mouseX, (value) => value - 16);
  const cursorY = useTransform(mouseY, (value) => value - 16);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    if (isVisible) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible, mouseX, mouseY]);

  // Auto-advance handling
  useEffect(() => {
    if (steps.length > 0 && currentStep >= steps.length) {
      setCurrentStep(steps.length - 1);
    }
    
    if (autoAdvance && steps.length > prevStepsLength.current && prevStepsLength.current > 0) {
      setCurrentStep(prevStepsLength.current);
    }
    
    prevStepsLength.current = steps.length;
  }, [steps.length, currentStep, autoAdvance]);

  // Target element tracking
  useEffect(() => {
    if (!isVisible || !steps[currentStep]) return;

    const findTarget = () => {
      const targetSelector = steps[currentStep].target;
      let target = document.querySelector(targetSelector);
      
      if (!target && targetSelector !== 'body') {
        setTimeout(() => {
          target = document.querySelector(targetSelector);
          if (target) {
            setTargetElement(target);
            setTargetRect(target.getBoundingClientRect());
            
            // Add pulse animation to target
            if (steps[currentStep].pulseTarget) {
              target.classList.add('tutorial-pulse');
            }
          } else {
            console.warn(`Tutorial target not found: ${targetSelector}`);
            const bodyTarget = document.querySelector('body');
            if (bodyTarget) {
              setTargetElement(bodyTarget);
              setTargetRect(bodyTarget.getBoundingClientRect());
            }
          }
        }, 500);
        return;
      }
      
      if (target) {
        setTargetElement(target);
        setTargetRect(target.getBoundingClientRect());
        
        // Add pulse animation
        if (steps[currentStep].pulseTarget) {
          target.classList.add('tutorial-pulse');
        }
      }
    };

    findTarget();

    const updateRect = () => {
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      }
    };

    window.addEventListener('scroll', updateRect);
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
      
      // Remove pulse animation
      if (targetElement) {
        targetElement.classList.remove('tutorial-pulse');
      }
    };
  }, [currentStep, isVisible, steps, targetElement]);

  const handleNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));
    
    // Trigger confetti for special steps
    if (steps[currentStep].confettiOnComplete) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0CF2A0', '#10B981', '#3B82F6']
      });
    }
    
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final confetti celebration
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#0CF2A0', '#10B981', '#3B82F6', '#8B5CF6']
        });
        onComplete();
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

  const handleSkip = () => {
    onSkip();
  };

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const step = steps[currentStep];
    const offset = step.offset || { x: 0, y: 0 };
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = Math.min(420, viewportWidth - 32);
    const tooltipHeight = 300;
    const padding = 16;

    let position: {
      top: number | string;
      left: number | string;
      transform: string;
    } = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };

    switch (step.position) {
      case 'top':
        position = {
          top: Math.max(padding, targetRect.top - 20 + offset.y),
          left: Math.min(
            Math.max(padding, targetRect.left + targetRect.width / 2 + offset.x),
            viewportWidth - tooltipWidth - padding
          ),
          transform: 'translate(-50%, -100%)',
        };
        break;
      case 'bottom':
        position = {
          top: Math.min(
            viewportHeight - tooltipHeight - padding,
            targetRect.bottom + 20 + offset.y
          ),
          left: Math.min(
            Math.max(padding, targetRect.left + targetRect.width / 2 + offset.x),
            viewportWidth - tooltipWidth - padding
          ),
          transform: 'translate(-50%, 0)',
        };
        break;
      case 'left':
        position = {
          top: Math.min(
            Math.max(padding, targetRect.top + targetRect.height / 2 + offset.y),
            viewportHeight - tooltipHeight - padding
          ),
          left: Math.max(padding, targetRect.left - 20 + offset.x),
          transform: 'translate(-100%, -50%)',
        };
        break;
      case 'right':
        position = {
          top: Math.min(
            Math.max(padding, targetRect.top + targetRect.height / 2 + offset.y),
            viewportHeight - tooltipHeight - padding
          ),
          left: Math.min(
            targetRect.right + 20 + offset.x,
            viewportWidth - tooltipWidth - padding
          ),
          transform: 'translate(0, -50%)',
        };
        break;
      case 'center':
      default:
        position = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
        break;
    }

    return position;
  };

  const getSpotlightStyle = () => {
    if (!targetRect) return {};

    const padding = 12;
    return {
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
    };
  };

  if (!isVisible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-auto"
      >
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
          </div>
        </motion.div>

        {/* Interactive Cursor (shows on hover areas) */}
        {currentStepData.showPointer && (
          <motion.div
            className="fixed w-8 h-8 pointer-events-none z-[10001]"
            style={{
              x: cursorX,
              y: cursorY,
            }}
          >
            <MousePointer className="w-8 h-8 text-[#0CF2A0] drop-shadow-lg" />
          </motion.div>
        )}

        {/* Spotlight Effect with Animation */}
        {targetRect && targetElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="absolute rounded-xl"
            style={{
              ...getSpotlightStyle(),
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
              border: '3px solid #0CF2A0',
              pointerEvents: 'none',
              backgroundColor: 'transparent',
            }}
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0CF2A0] via-blue-500 to-purple-500 animate-gradient-x opacity-50" />
            </div>
            
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-xl">
              <div className="absolute inset-0 rounded-xl border-2 border-[#0CF2A0] animate-ping opacity-75" />
              <div className="absolute inset-0 rounded-xl border-2 border-[#0CF2A0] animate-ping animation-delay-500 opacity-50" />
            </div>
          </motion.div>
        )}

        {/* Tutorial Card with Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl max-w-md w-full mx-4 max-h-[calc(100vh-2rem)] overflow-hidden"
          style={getTooltipPosition()}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center" />
          </div>

          {/* Progress Bar */}
          <div className="relative h-1 bg-gray-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0CF2A0] to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Header with Enhanced Design */}
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Step Counter with Animation */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0CF2A0]/20 to-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-[#0CF2A0]">
                      {currentStep + 1}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#0CF2A0] rounded-full animate-pulse" />
                </motion.div>

                {/* Progress Dots */}
                <div className="flex gap-2">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <div
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          completedSteps.has(index) 
                            ? 'bg-[#0CF2A0] shadow-[0_0_8px_rgba(12,242,160,0.6)]' 
                            : index === currentStep 
                            ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                            : 'bg-gray-600'
                        }`}
                      />
                      {completedSteps.has(index) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <CheckCircle className="w-3 h-3 text-[#0CF2A0]" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSkip}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Icon and Title */}
            <div className="flex items-start gap-4">
              {currentStepData.icon && (
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0CF2A0]/20 to-blue-500/20 rounded-xl flex items-center justify-center"
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {currentStepData.icon}
                </motion.div>
              )}
              <div className="flex-1">
                <motion.h3 
                  className="text-xl font-bold text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {currentStepData.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-300 leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentStepData.description}
                </motion.p>
              </div>
            </div>

            {/* Action Hint */}
            {currentStepData.action && (
              <motion.div 
                className="mt-4 flex items-center gap-2 text-sm text-[#0CF2A0]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {currentStepData.action === 'click' && 'Click the highlighted element'}
                  {currentStepData.action === 'input' && 'Type in the highlighted field'}
                  {currentStepData.action === 'scroll' && 'Scroll to see more'}
                  {currentStepData.action === 'hover' && 'Hover over the element'}
                </span>
              </motion.div>
            )}

            {/* Pro Tip */}
            {currentStepData.tip && (
              <motion.div 
                className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">Pro Tip</p>
                    <p className="text-blue-200 text-sm">{currentStepData.tip}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer with Navigation */}
          <div className="relative p-6 pt-4 border-t border-white/10 bg-gradient-to-t from-gray-900/50 to-transparent">
            <div className="flex items-center justify-between">
              <motion.button
                onClick={handleSkip}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
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
                  className="flex items-center gap-2 px-6 py-2.5 text-sm bg-gradient-to-r from-[#0CF2A0] to-blue-500 hover:from-[#0CF2A0]/90 hover:to-blue-500/90 text-black rounded-xl transition-all font-bold shadow-lg disabled:opacity-50"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(12, 242, 160, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Trophy className="w-4 h-4" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Gamification hint */}
            {currentStep === steps.length - 1 && (
              <motion.div 
                className="mt-4 text-center text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Gift className="w-4 h-4 inline-block mr-1 text-[#0CF2A0]" />
                Complete the tutorial to unlock all features!
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        @keyframes gradient-x {
          0%, 100% { transform: translateX(0%); }
          50% { transform: translateX(100%); }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
        
        .tutorial-pulse {
          animation: tutorial-pulse 2s ease-in-out infinite;
        }
        
        @keyframes tutorial-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(12, 242, 160, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(12, 242, 160, 0); }
        }
      `}</style>
    </AnimatePresence>
  );
}
