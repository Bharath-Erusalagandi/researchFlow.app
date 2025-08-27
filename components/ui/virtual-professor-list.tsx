'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessorCard } from './professor-card';

interface Professor {
  id?: number;
  name: string;
  field_of_research: string;
  university_name: string;
  email: string;
  official_url: string;
  image?: string;
  publications?: number;
  citations?: number;
  title?: string;
  researchAreas?: string[];
}

interface VirtualProfessorListProps {
  professors: Professor[];
  savedProfessors: string[];
  isLoading?: boolean;
  onSave: (professor: Professor) => void;
  onPersonalizedEmail: (professor: Professor) => void;
  processingEmailForProfessor?: string;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

export const VirtualProfessorList: React.FC<VirtualProfessorListProps> = ({
  professors,
  savedProfessors,
  isLoading = false,
  onSave,
  onPersonalizedEmail,
  processingEmailForProfessor,
  itemHeight = 400,
  containerHeight = 800,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const totalHeight = professors.length * itemHeight;

  const startIndex = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    return Math.max(0, start - overscan);
  }, [scrollTop, itemHeight, overscan]);

  const endIndex = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = startIndex + visibleCount + overscan * 2;
    return Math.min(professors.length - 1, end);
  }, [startIndex, containerHeight, itemHeight, overscan, professors.length]);

  const visibleItems = useMemo(() => {
    return professors.slice(startIndex, endIndex + 1).map((professor, index) => ({
      professor,
      index: startIndex + index
    }));
  }, [professors, startIndex, endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 min-h-[320px] animate-pulse"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                <div className="h-10 bg-gray-700 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              <div className="h-20 bg-gray-700 rounded w-full mt-8"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={setContainerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <AnimatePresence>
          {visibleItems.map(({ professor, index }) => {
            const isSaved = savedProfessors.includes(professor.id?.toString() || '');
            const isProcessing = processingEmailForProfessor === (professor.id?.toString() || professor.name);

            return (
              <motion.div
                key={professor.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full px-4"
                style={{
                  top: index * itemHeight,
                  height: itemHeight
                }}
              >
                <ProfessorCard
                  professor={professor}
                  index={index}
                  isSaved={isSaved}
                  isProcessing={isProcessing}
                  onSave={onSave}
                  onPersonalizedEmail={onPersonalizedEmail}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
