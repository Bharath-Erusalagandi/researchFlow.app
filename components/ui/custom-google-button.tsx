"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/ui/gradient-button";

declare global {
  interface Window {
    google?: any;
  }
}

interface CustomGoogleButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  text?: 'signin' | 'signup';
  className?: string;
}

export function CustomGoogleButton({
  onSuccess,
  onError,
  isLoading = false,
  disabled = false,
  text = 'signin',
  className
}: CustomGoogleButtonProps) {
  const buttonText = text === 'signin' ? 'Sign in with Google' : 'Sign up with Google';

  useEffect(() => {
    // Load Google Identity Services script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleSignIn = () => {
    if (!window.google || disabled || isLoading) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('Google Client ID not configured');
      onError?.();
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            onSuccess(response);
          } else {
            onError?.();
          }
        },
        auto_select: false,
        cancel_on_tap_outside: false
      });

      // Create a temporary container for the Google button
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);

      window.google.accounts.id.renderButton(tempContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        width: 280
      });

      // Trigger click on the hidden Google button
      const googleButton = tempContainer.querySelector('div[role="button"]') as HTMLElement;
      if (googleButton) {
        googleButton.click();
      } else {
        // Fallback to prompt
        window.google.accounts.id.prompt();
      }

      // Clean up the temporary container
      setTimeout(() => {
        document.body.removeChild(tempContainer);
      }, 1000);

    } catch (error) {
      console.error('Google Sign-In error:', error);
      onError?.();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <GradientButton
        onClick={handleGoogleSignIn}
        disabled={disabled || isLoading}
        variant="variant"
        className={cn(
          "w-full min-h-[56px] gap-3 touch-manipulation select-none",
          "focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/50 focus:ring-offset-2 focus:ring-offset-black",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-white" />
        ) : (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              fillOpacity="0.9"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              fillOpacity="0.8"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              fillOpacity="0.7"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              fillOpacity="0.9"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        
        <span className="text-white font-bold text-base">
          {isLoading ? 'Connecting...' : buttonText}
        </span>
      </GradientButton>
    </motion.div>
  );
} 