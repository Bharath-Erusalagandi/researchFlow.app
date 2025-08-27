'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, GraduationCap, University, User, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  type: 'research' | 'professor' | 'university' | 'recent';
  text: string;
  subtitle?: string;
  icon: React.ReactNode;
  category: string;
}

interface SearchSuggestionsProps {
  isOpen: boolean;
  query: string;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  recentSearches?: string[];
  className?: string;
}

const RESEARCH_FIELDS = [
  'Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'Natural Language Processing',
  'Robotics', 'Cybersecurity', 'Data Science', 'Blockchain', 'Quantum Computing',
  'Bioinformatics', 'Neuroscience', 'Climate Science', 'Renewable Energy',
  'Biomedical Engineering', 'Materials Science', 'Nanotechnology', 'Physics',
  'Chemistry', 'Mathematics', 'Statistics', 'Economics', 'Psychology',
  'Sociology', 'Political Science', 'History', 'Literature', 'Philosophy'
];

const TOP_UNIVERSITIES = [
  'Harvard University', 'Stanford University', 'MIT', 'University of Cambridge',
  'University of Oxford', 'University of California, Berkeley', 'Princeton University',
  'Yale University', 'Columbia University', 'University of Chicago',
  'University of Toronto', 'ETH Zurich', 'Imperial College London',
  'University College London', 'Carnegie Mellon University'
];

export function SearchSuggestions({
  isOpen,
  query,
  onSelect,
  onClose,
  recentSearches = [],
  className
}: SearchSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate smart suggestions based on query
  const suggestions = useMemo(() => {
    const allSuggestions: Suggestion[] = [];

    // Recent searches (highest priority)
    if (recentSearches.length > 0 && !query.trim()) {
      recentSearches.slice(0, 3).forEach((search, index) => {
        allSuggestions.push({
          id: `recent-${index}`,
          type: 'recent',
          text: search,
          subtitle: 'Recent search',
          icon: <Clock className="h-4 w-4" />,
          category: 'Recent'
        });
      });
    }

    // Research field matches
    if (query.trim()) {
      RESEARCH_FIELDS
        .filter(field =>
          field.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(field.toLowerCase())
        )
        .slice(0, 3)
        .forEach(field => {
          allSuggestions.push({
            id: `research-${field}`,
            type: 'research',
            text: field,
            subtitle: 'Research field',
            icon: <TrendingUp className="h-4 w-4" />,
            category: 'Research'
          });
        });
    }

    // University matches
    if (query.trim()) {
      TOP_UNIVERSITIES
        .filter(uni =>
          uni.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 2)
        .forEach(uni => {
          allSuggestions.push({
            id: `university-${uni}`,
            type: 'university',
            text: uni,
            subtitle: 'University',
            icon: <University className="h-4 w-4" />,
            category: 'Universities'
          });
        });
    }

    // Professor name patterns
    if (query.trim() && query.length > 2) {
      const professorSuggestions = [
        `${query} Smith`,
        `${query} Johnson`,
        `${query} Williams`,
        `Dr. ${query}`,
        `Professor ${query}`
      ].filter(name => name.length > query.length + 2);

      professorSuggestions.slice(0, 2).forEach((name, index) => {
        allSuggestions.push({
          id: `professor-${index}`,
          type: 'professor',
          text: name,
          subtitle: 'Professor name',
          icon: <User className="h-4 w-4" />,
          category: 'Professors'
        });
      });
    }

    // Remove duplicates and limit total suggestions
    const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.text === suggestion.text)
    );

    return uniqueSuggestions.slice(0, 8);
  }, [query, recentSearches]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            onSelect(suggestions[selectedIndex].text);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, suggestions, selectedIndex, onSelect, onClose]);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  if (!isOpen || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={suggestionsRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden",
          className
        )}
      >
        <div className="max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => onSelect(suggestion.text)}
              className={cn(
                "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/10 transition-colors group",
                selectedIndex === index && "bg-[#0CF2A0]/10 border-l-2 border-[#0CF2A0]"
              )}
            >
              <div className={cn(
                "flex-shrink-0 p-1.5 rounded-lg transition-colors",
                selectedIndex === index
                  ? "bg-[#0CF2A0]/20 text-[#0CF2A0]"
                  : "bg-white/5 text-white/60 group-hover:bg-[#0CF2A0]/10 group-hover:text-[#0CF2A0]"
              )}>
                {suggestion.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium truncate">
                    {suggestion.text}
                  </p>
                  <span className="text-xs text-white/40 ml-2 flex-shrink-0">
                    {suggestion.category}
                  </span>
                </div>
                {suggestion.subtitle && (
                  <p className="text-sm text-white/60 truncate">
                    {suggestion.subtitle}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="border-t border-white/10 px-4 py-2 bg-black/20">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Use ↑↓ arrows to navigate, Enter to select</span>
            <button
              onClick={onClose}
              className="hover:text-white transition-colors p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
