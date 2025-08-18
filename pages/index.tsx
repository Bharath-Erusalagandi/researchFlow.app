import React from 'react';
import dynamic from 'next/dynamic';
import { Footer } from '../components/ui/footer-section';
import GlobalHeader from '../components/layout/global-header';

// SSR the hero for better SEO/LCP; keep loading state minimal
const NexusHero = dynamic(
  () => import('../components/blocks/hero-section-nexus'),
  { 
    ssr: true,
    loading: () => <div className="min-h-[50vh] bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>
  }
);

const FeatureSection = dynamic(
  () => import('../components/blocks/feature-section'),
  { 
    ssr: false,
    loading: () => <div className="h-20 bg-[#111111]" />
  }
);

const CollegePartnersSection = dynamic(
  () => import('../components/blocks/college-partners-section'),
  { 
    ssr: false,
    loading: () => <div className="h-20 bg-[#111111]" />
  }
);

const AcademicTestimonials = dynamic(
  () => import('../components/blocks/academic-testimonials'),
  { 
    ssr: false,
    loading: () => <div className="h-20 bg-[#111111]" />
  }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Global Header */}
      <GlobalHeader />
      
      {/* Professor Connect Hero */}
      <div className="pt-[70px]">
        <NexusHero />
      </div>
      
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