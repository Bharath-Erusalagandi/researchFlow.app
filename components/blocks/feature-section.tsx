'use client';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  BookMarked, 
  FileSpreadsheet, 
  Award 
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { FeatureCard } from '@/components/ui/grid-feature-cards';

const features = [
  {
    title: 'Find Your Perfect Match',
    icon: Users,
    description: 'Discover professors who align with your research interests and academic goals in seconds.',
  },
  {
    title: 'Get Expert Guidance',
    icon: GraduationCap,
    description: 'Connect with experienced mentors who can accelerate your academic journey and career.',
  },
  {
    title: 'Research Opportunities',
    icon: BookOpen,
    description: 'Access exclusive research positions, internships, and collaborative projects in your field.',
  },
  {
    title: 'Build Your Network',
    icon: BookMarked,
    description: 'Expand your academic circle with leading researchers and industry professionals.',
  },
  {
    title: 'Secure Funding',
    icon: FileSpreadsheet,
    description: 'Get connected to professors who can help you find scholarships and research grants.',
  },
  {
    title: 'Launch Your Career',
    icon: Award,
    description: 'Transform your academic experience into career success with the right connections.',
  },
];

export default function FeatureSection() {
  return (
    <section id="feature-section" className="pt-24 pb-20 md:pt-32 md:pb-32 bg-[#111111] relative z-20">
      <div className="absolute inset-0 z-1 bg-[#111111]"></div>
              <div className="mx-auto w-full max-w-6xl space-y-16 px-6 relative z-10">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-white text-balance md:text-4xl lg:text-6xl">
            Find The <span className="italic" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}>Perfect Professor</span> For You
          </h2>
          <p className="text-gray-400 mt-6 text-sm tracking-wide text-balance md:text-lg">
            Connect with <span className="font-bold text-gray-300 italic">leading professors</span> in your field and unlock opportunities that will <span className="font-bold text-[#0CF2A0]">transform your academic journey</span>.
          </p>
        </AnimatedContainer>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <AnimatedContainer 
              key={i} 
              delay={0.2 + (i * 0.1)}
            >
              <FeatureCard 
                feature={feature} 
                className="p-8 h-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#0CF2A0]/10"
              />
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: React.ComponentProps<typeof motion.div>['className'];
  children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 