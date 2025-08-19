'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: { x: number; y: number };
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  tutorialKey: string; // Unique key for this tutorial
}

export function TutorialOverlay({ 
  steps, 
  isVisible, 
  onComplete, 
  onSkip, 
  tutorialKey 
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Update target element when step changes
  useEffect(() => {
    if (!isVisible || !steps[currentStep]) return;

    const findTarget = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        setTargetElement(target);
        setTargetRect(target.getBoundingClientRect());
      }
    };

    // Initial find
    findTarget();

    // Update on scroll/resize
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
    };
  }, [currentStep, isVisible, steps, targetElement]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
    const tooltipWidth = Math.min(384, viewportWidth - 32); // max-w-sm = 384px, but respect mobile
    const tooltipHeight = 250; // estimated height with padding
    const padding = 16; // minimum padding from edges

    let position = {};

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

    // Additional fallback: if position would still go off-screen, center it
    const positionNumeric = typeof position.top === 'number' ? position : {
      top: typeof position.top === 'string' ? viewportHeight / 2 : position.top as number,
      left: typeof position.left === 'string' ? viewportWidth / 2 : position.left as number
    };

    if (positionNumeric.top < padding || 
        positionNumeric.top > viewportHeight - tooltipHeight - padding ||
        positionNumeric.left < padding || 
        positionNumeric.left > viewportWidth - tooltipWidth - padding) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    return position;
  };

  const getSpotlightStyle = () => {
    if (!targetRect) return {};

    const padding = 8;
    return {
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
    };
  };

  if (!isVisible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-auto"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      >
        {/* Spotlight Effect */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute rounded-lg"
            style={{
              ...getSpotlightStyle(),
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
              border: '2px solid #0CF2A0',
              pointerEvents: 'none',
              backgroundColor: 'transparent',
            }}
          />
        )}

        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="absolute bg-[#1a1a1a]/95 border border-white/30 rounded-xl shadow-2xl backdrop-blur-xl max-w-sm w-full mx-4 max-h-[calc(100vh-2rem)] overflow-auto"
          style={getTooltipPosition()}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-white">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <div className="flex gap-1">
                  {steps.map((_, index) => (
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
            <h3 className="text-lg font-semibold text-white mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {currentStepData.description}
            </p>
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
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
