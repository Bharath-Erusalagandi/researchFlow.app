import React from 'react';
import { motion } from 'framer-motion';
import { Mail, BookOpen, Award, GraduationCap, Brain, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  source?: string;
}

interface ProfessorCardProps {
  professor: Professor;
  index: number;
  isSaved: boolean;
  onSave: (professor: Professor) => void;
  onPersonalizedEmail: (professor: Professor) => void;
}

export const ProfessorCard: React.FC<ProfessorCardProps> = ({ 
  professor, 
  index, 
  isSaved, 
  onSave, 
  onPersonalizedEmail 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.1
      }}
      className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-10 hover:border-[#0CF2A0]/50 transition-all duration-300 group min-h-[320px] flex flex-col overflow-hidden"
    >
      {/* Header: Name, University, and Save Button */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div className="flex items-center gap-4 flex-1">
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#0CF2A0] transition-colors">
              {professor.name}
            </h3>
          <div className="flex items-center gap-2 min-w-0">
            <GraduationCap className="h-5 w-5 text-[#0CF2A0] flex-shrink-0" />
            <span className="text-base font-medium text-gray-300 truncate">{professor.university_name}</span>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSave(professor);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={cn(
            "px-5 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex-shrink-0 ml-4 touch-manipulation mobile-touch-target",
            isSaved
              ? 'bg-green-600/20 text-green-400 cursor-not-allowed'
              : 'bg-gray-700/50 text-gray-300 hover:bg-[#0CF2A0]/20 hover:text-[#0CF2A0]'
          )}
          disabled={isSaved}
          type="button"
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Research Field */}
      <div className="mb-6 flex-1 overflow-hidden">
        <p className="text-gray-400 text-base leading-relaxed line-clamp-3 break-words">
          {professor.field_of_research}
        </p>
      </div>

      {/* Stats Row - Enhanced with h-index and source info */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3 text-base min-w-0 overflow-hidden flex-wrap">
          {professor.publications && professor.publications > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <BookOpen className="h-5 w-5 text-[#0CF2A0]" />
              <span className="text-[#0CF2A0] font-semibold">{professor.publications}</span>
              <span className="text-gray-400">Papers</span>
            </div>
          )}
          
          {professor.citations && professor.citations > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Award className="h-5 w-5 text-[#0CF2A0]" />
              <span className="text-[#0CF2A0] font-semibold">{professor.citations.toLocaleString()}</span>
              <span className="text-gray-400">Cites</span>
            </div>
          )}


        </div>

        {/* Email and Source Info */}
        <div className="flex items-center justify-between gap-2 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-1">
            <Mail className="h-5 w-5 text-[#0CF2A0] flex-shrink-0" />
            {professor.email ? (
              <a 
                href={`mailto:${professor.email}`} 
                className="text-base text-gray-300 hover:text-[#0CF2A0] transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
                title={professor.email}
              >
                {professor.email}
              </a>
            ) : (
              <span className="text-gray-500 text-sm italic">Contact via institution</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button - Bigger and more prominent */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPersonalizedEmail(professor);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="w-full bg-[#0CF2A0]/20 text-[#0CF2A0] px-6 py-6 rounded-xl hover:bg-[#0CF2A0]/30 transition-colors border border-[#0CF2A0]/30 text-lg font-semibold flex items-center justify-center gap-3 mt-auto touch-manipulation mobile-button"
        type="button"
      >
        <Brain className="h-6 w-6" />
        Personalized Email
      </button>
    </motion.div>
  );
}; 