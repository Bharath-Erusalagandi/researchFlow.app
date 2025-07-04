"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Search, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  show: boolean;
  className?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

const SAMPLE_SUGGESTIONS = [
  {
    category: "Research Fields",
    icon: BookOpen,
    suggestions: [
      "machine learning",
      "artificial intelligence", 
      "neuroscience",
      "cancer research",
      "climate science",
      "quantum computing"
    ]
  },
  {
    category: "Popular Topics",
    icon: Search,
    suggestions: [
      "gene therapy",
      "renewable energy",
      "data science",
      "psychology",
      "biotechnology",
      "robotics"
    ]
  },
  {
    category: "Academic Areas",
    icon: GraduationCap,
    suggestions: [
      "computer science",
      "molecular biology",
      "economics",
      "environmental science",
      "materials science",
      "cognitive science"
    ]
  }
];

export function SearchSuggestions({ 
  show, 
  className, 
  onSuggestionClick 
}: SearchSuggestionsProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute top-full mt-2 w-full max-w-2xl mx-auto z-50",
            "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl",
            "rounded-2xl border border-gray-200 dark:border-gray-800",
            "shadow-xl shadow-black/10 dark:shadow-black/20",
            className
          )}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[#0CF2A0]" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Search Suggestions
              </h3>
            </div>
            
            <div className="space-y-4">
              {SAMPLE_SUGGESTIONS.map((category, categoryIndex) => (
                <div key={category.category}>
                  <div className="flex items-center gap-2 mb-2">
                    <category.icon className="w-4 h-4 text-gray-500" />
                    <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {category.category}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.suggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: categoryIndex * 0.05 + index * 0.02 
                        }}
                        onClick={() => onSuggestionClick?.(suggestion)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm",
                          "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                          "hover:bg-[#0CF2A0]/20 hover:text-[#0CF2A0] dark:hover:bg-[#0CF2A0]/20",
                          "transition-all duration-200 cursor-pointer",
                          "border border-transparent hover:border-[#0CF2A0]/30"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Try searching for research topics, academic fields, or specific methodologies
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 