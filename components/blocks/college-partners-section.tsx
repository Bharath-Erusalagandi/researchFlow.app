'use client';
import { motion } from 'framer-motion';
import UniversityCarousel from '@/components/ui/modified-3d-carousel';

export default function CollegePartnersSection() {
  return (
    <section id="partner-institutions-section" className="py-24 md:py-32 bg-[#111111] relative z-30">
      <div className="absolute inset-0 z-0 bg-[#111111]"></div>
      
              <div className="mx-auto w-full max-w-6xl px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            From Your <span className="italic font-extrabold text-[#0CF2A0]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}>Dream</span> <span className="italic" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}>Universities</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Access professors from <span className="font-bold text-gray-300 italic">world-renowned institutions</span> and discover opportunities at universities you've always dreamed of joining. Your <span className="font-bold text-[#0CF2A0]">next breakthrough</span> starts here.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <UniversityCarousel />
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-16 bg-gradient-to-r from-[#0CF2A0]/20 to-transparent rounded-l-full opacity-50 pointer-events-none"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-16 bg-gradient-to-l from-[#0CF2A0]/20 to-transparent rounded-r-full opacity-50 pointer-events-none"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 