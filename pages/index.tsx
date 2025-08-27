import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Footer } from '../components/ui/footer-section';
import GlobalHeader from '../components/layout/global-header';
import { cookies } from '../lib/cookies';
import { SmoothRedirect } from '../components/ui/page-transition';

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
  const router = useRouter();
  const [showAutoLoginTransition, setShowAutoLoginTransition] = useState(false);

  useEffect(() => {
    // Check if user has valid session cookies for auto-login
    const checkAutoLogin = async () => {
      try {
        const sessionData = cookies.getUserSession();
        if (sessionData && !sessionData.expired) {
          // Show smooth transition to search page
          setShowAutoLoginTransition(true);
        }
      } catch (error) {
        console.error('Error checking auto-login:', error);
      }
    };

    // Only check after a short delay to avoid interfering with initial page load
    const timer = setTimeout(checkAutoLogin, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (showAutoLoginTransition) {
    return (
      <SmoothRedirect to="/search" delay={2000}>
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
      </SmoothRedirect>
    );
  }

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