'use client';
import { motion } from 'framer-motion';
import UniversityCarousel from '@/components/ui/modified-3d-carousel';

export default function CollegePartnersSection() {
  return (
    <section id="partner-institutions-section" className="py-24 md:py-32 bg-[#111111] relative z-10">
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-pattern opacity-50"></div>
      
      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Partner Institutions
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect with professors from these prestigious universities 
            for research collaborations and academic mentorship.
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