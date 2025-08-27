'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, AlertCircle } from 'lucide-react';

interface OptimizedProfessorImageProps {
  src?: string;
  name: string;
  university: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  priority?: boolean;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24'
};

const iconSizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export const OptimizedProfessorImage: React.FC<OptimizedProfessorImageProps> = ({
  src,
  name,
  university,
  size = 'md',
  className = '',
  priority = false,
  showFallback = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate initials from name
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a consistent color based on name
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  if (!src || imageError) {
    if (!showFallback) return null;

    return (
      <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold text-sm ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <AnimatePresence>
        {!imageLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${bgColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
          >
            <User className={iconSizes[size]} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full"
      >
        <Image
          src={src}
          alt={`Professor ${name} from ${university}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-full object-cover"
          priority={priority}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading={priority ? 'eager' : 'lazy'}
        />
      </motion.div>
    </div>
  );
};
