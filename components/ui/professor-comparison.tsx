'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, BookOpen, GraduationCap, Mail, ExternalLink, Users, TrendingUp, Star } from 'lucide-react';
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
}

interface ProfessorComparisonProps {
  professors: [Professor, Professor];
  isOpen: boolean;
  onClose: () => void;
  onSelectProfessor?: (professor: Professor) => void;
}

export function ProfessorComparison({
  professors,
  isOpen,
  onClose,
  onSelectProfessor
}: ProfessorComparisonProps) {
  const [hoveredProfessor, setHoveredProfessor] = useState<0 | 1 | null>(null);

  if (!isOpen || professors.length !== 2) return null;

  const [professor1, professor2] = professors;

  const getComparisonValue = (value1: number | undefined, value2: number | undefined, higherIsBetter: boolean = true) => {
    if (!value1 || !value2) return null;

    const diff = value1 - value2;
    if (diff === 0) return 'equal';

    return higherIsBetter ? (diff > 0 ? 'left' : 'right') : (diff < 0 ? 'left' : 'right');
  };

  const ComparisonMetric = ({
    label,
    value1,
    value2,
    icon,
    higherIsBetter = true,
    format = (v: number) => v.toString()
  }: {
    label: string;
    value1?: number;
    value2?: number;
    icon: React.ReactNode;
    higherIsBetter?: boolean;
    format?: (value: number) => string;
  }) => {
    const winner = getComparisonValue(value1, value2, higherIsBetter);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-white/60">
          {icon}
          <span>{label}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className={cn(
              "p-3 rounded-lg border transition-colors",
              winner === 'left'
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : winner === 'right'
                ? "bg-gray-500/10 border-gray-500/30 text-gray-400"
                : "bg-[#0CF2A0]/5 border-[#0CF2A0]/20 text-[#0CF2A0]"
            )}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-lg font-bold">
              {value1 ? format(value1) : 'N/A'}
            </div>
            {winner === 'left' && <Star className="w-4 h-4 inline ml-1" />}
          </motion.div>
          <motion.div
            className={cn(
              "p-3 rounded-lg border transition-colors",
              winner === 'right'
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : winner === 'left'
                ? "bg-gray-500/10 border-gray-500/30 text-gray-400"
                : "bg-[#0CF2A0]/5 border-[#0CF2A0]/20 text-[#0CF2A0]"
            )}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-lg font-bold">
              {value2 ? format(value2) : 'N/A'}
            </div>
            {winner === 'right' && <Star className="w-4 h-4 inline ml-1" />}
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-[#1a1a1a] border border-white/20 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Professor Comparison</h2>
              <p className="text-white/60 text-sm mt-1">Compare research profiles side by side</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white/60 hover:text-white" />
            </button>
          </div>

          {/* Comparison Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Professor 1 */}
              <motion.div
                className={cn(
                  "space-y-6 p-4 rounded-xl border transition-all duration-300",
                  hoveredProfessor === 0 ? "border-[#0CF2A0]/50 bg-[#0CF2A0]/5" : "border-white/10"
                )}
                onMouseEnter={() => setHoveredProfessor(0)}
                onMouseLeave={() => setHoveredProfessor(null)}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{professor1.name}</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#0CF2A0]" />
                        <span>{professor1.university_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#0CF2A0]" />
                        <a
                          href={`mailto:${professor1.email}`}
                          className="hover:text-[#0CF2A0] transition-colors truncate"
                        >
                          {professor1.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  {onSelectProfessor && (
                    <button
                      onClick={() => onSelectProfessor(professor1)}
                      className="px-3 py-1 bg-[#0CF2A0]/20 text-[#0CF2A0] rounded-lg text-sm hover:bg-[#0CF2A0]/30 transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-1">Research Focus</h4>
                    <p className="text-white text-sm leading-relaxed">{professor1.field_of_research}</p>
                  </div>

                  {professor1.official_url && (
                    <a
                      href={professor1.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#0CF2A0] hover:text-[#0CF2A0]/80 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Profile
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Professor 2 */}
              <motion.div
                className={cn(
                  "space-y-6 p-4 rounded-xl border transition-all duration-300",
                  hoveredProfessor === 1 ? "border-[#0CF2A0]/50 bg-[#0CF2A0]/5" : "border-white/10"
                )}
                onMouseEnter={() => setHoveredProfessor(1)}
                onMouseLeave={() => setHoveredProfessor(null)}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{professor2.name}</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#0CF2A0]" />
                        <span>{professor2.university_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#0CF2A0]" />
                        <a
                          href={`mailto:${professor2.email}`}
                          className="hover:text-[#0CF2A0] transition-colors truncate"
                        >
                          {professor2.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  {onSelectProfessor && (
                    <button
                      onClick={() => onSelectProfessor(professor2)}
                      className="px-3 py-1 bg-[#0CF2A0]/20 text-[#0CF2A0] rounded-lg text-sm hover:bg-[#0CF2A0]/30 transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-1">Research Focus</h4>
                    <p className="text-white text-sm leading-relaxed">{professor2.field_of_research}</p>
                  </div>

                  {professor2.official_url && (
                    <a
                      href={professor2.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#0CF2A0] hover:text-[#0CF2A0]/80 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Profile
                    </a>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Metrics Comparison */}
            <div className="mt-8 space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0CF2A0]" />
                Research Impact Comparison
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ComparisonMetric
                  label="Publications"
                  value1={professor1.publications}
                  value2={professor2.publications}
                  icon={<BookOpen className="w-4 h-4" />}
                  format={(v) => v.toLocaleString()}
                />

                <ComparisonMetric
                  label="Citations"
                  value1={professor1.citations}
                  value2={professor2.citations}
                  icon={<TrendingUp className="w-4 h-4" />}
                  format={(v) => v.toLocaleString()}
                />
              </div>
            </div>

            {/* Research Areas Comparison */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0CF2A0]" />
                Research Areas
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white/60">{professor1.name}'s Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {professor1.researchAreas?.length ? (
                      professor1.researchAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#0CF2A0]/20 text-[#0CF2A0] rounded-full text-xs"
                        >
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="text-white/40 text-sm">No specific areas listed</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white/60">{professor2.name}'s Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {professor2.researchAreas?.length ? (
                      professor2.researchAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#0CF2A0]/20 text-[#0CF2A0] rounded-full text-xs"
                        >
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="text-white/40 text-sm">No specific areas listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
