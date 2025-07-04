import React from 'react';
import dynamic from 'next/dynamic';
import { Footer } from '../components/ui/footer-section';

// Use dynamic import with no SSR to avoid hydration issues with framer-motion
const NexusHero = dynamic(() => import('../components/blocks/hero-section-nexus'), {
  ssr: false,
});

const FeatureSection = dynamic(() => import('../components/blocks/feature-section'), {
  ssr: false,
});

const CollegePartnersSection = dynamic(() => import('../components/blocks/college-partners-section'), {
  ssr: false,
});

const AcademicTestimonials = dynamic(() => import('../components/blocks/academic-testimonials'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Professor Connect Hero */}
      <NexusHero />
      
      {/* Features Section */}
      <FeatureSection />
      
      {/* College Partners Section */}
      <CollegePartnersSection />
      
      {/* Testimonials Section */}
      <AcademicTestimonials />
      
      {/* Footer */}
      <Footer />
    </div>
  );
} 