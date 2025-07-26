import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, BookOpen, Award, Heart, PenTool, ExternalLink } from 'lucide-react';
import Image from 'next/image';

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

interface OptimizedProfessorCardProps {
  professor: Professor;
  index: number;
  isSaved: boolean;
  onSave: (professor: Professor) => void;
  onPersonalizedEmail: (professor: Professor) => void;
  isVisible?: boolean; // For virtual scrolling
}

const OptimizedProfessorCard = memo<OptimizedProfessorCardProps>(({
  professor,
  index,
  isSaved,
  onSave,
  onPersonalizedEmail,
  isVisible = true
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleSave = useCallback(() => {
    onSave(professor);
  }, [onSave, professor]);

  const handlePersonalizedEmail = useCallback(() => {
    onPersonalizedEmail(professor);
  }, [onPersonalizedEmail, professor]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleQuickEmail = useCallback(() => {
    const subject = encodeURIComponent('Research Collaboration Inquiry');
    const body = encodeURIComponent(`Dear ${professor.name},\n\nI hope this email finds you well. I am writing to express my interest in your research work in ${professor.field_of_research}.\n\nI would love to discuss potential research opportunities or collaboration possibilities.\n\nThank you for your time and consideration.\n\nBest regards,`);
    const mailtoLink = `mailto:${professor.email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  }, [professor]);

  // If not visible (for virtual scrolling), render placeholder
  if (!isVisible) {
    return <div style={{ height: '400px' }} className="bg-gray-900/50 rounded-xl animate-pulse" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative bg-[#1a1a1a]/90 border border-gray-800/50 rounded-xl p-8 hover:border-[#0CF2A0]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#0CF2A0]/10 backdrop-blur-sm"
    >
      {/* Professor Image with optimized loading */}
      <div className="relative w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden bg-gray-800">
        {!imageError ? (
          <Image
            src={professor.image || '/api/placeholder/80/80'}
            alt={professor.name}
            width={96}
            height={96}
            className={`object-cover transition-opacity duration-200 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={index < 6} // Prioritize first 6 images
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0CF2A0]/20 to-blue-500/20 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-[#0CF2A0]" />
          </div>
        )}
        
        {imageLoading && !imageError && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
      </div>

      {/* Professor Name */}
      <h3 className="text-2xl font-bold text-white mb-3 text-center group-hover:text-[#0CF2A0] transition-colors">
        {professor.name}
      </h3>

      {/* University */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <GraduationCap className="h-4 w-4 text-[#0CF2A0]" />
        <p className="text-gray-300 text-base text-center">{professor.university_name}</p>
      </div>

      {/* Research Field */}
      <div className="mb-6">
        <p className="text-gray-400 text-base text-center leading-relaxed">
          {professor.field_of_research.length > 120 
            ? `${professor.field_of_research.substring(0, 120)}...` 
            : professor.field_of_research
          }
        </p>
      </div>

      {/* Stats Row */}
      {(professor.publications || professor.citations) && (
        <div className="flex justify-center gap-6 mb-6 text-base">
          {professor.publications && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-[#0CF2A0]" />
              <span className="text-gray-300">{professor.publications}</span>
              <span className="text-gray-500 text-xs">papers</span>
            </div>
          )}
          {professor.citations && (
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4 text-blue-400" />
              <span className="text-gray-300">{professor.citations}</span>
              <span className="text-gray-500 text-xs">citations</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Primary Actions */}
        <div className="flex gap-2">
          <motion.button
            onClick={handlePersonalizedEmail}
            className="flex-1 bg-[#0CF2A0] text-black px-6 py-3 rounded-lg text-base font-medium hover:bg-[#0CF2A0]/90 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PenTool className="h-4 w-4" />
            Personalized Email
          </motion.button>
          
          <motion.button
            onClick={handleSave}
            className={`p-3 rounded-lg transition-colors ${
              isSaved 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2">
          <motion.button
            onClick={handleQuickEmail}
            className="flex-1 bg-gray-700/50 text-gray-300 px-6 py-3 rounded-lg text-base hover:bg-gray-600/50 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail className="h-4 w-4" />
            Quick Email
          </motion.button>
          
          {professor.official_url && (
            <motion.a
              href={professor.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ExternalLink className="h-4 w-4" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
});

OptimizedProfessorCard.displayName = 'OptimizedProfessorCard';

export default OptimizedProfessorCard; 