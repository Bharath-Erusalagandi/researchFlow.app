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
    title: 'Research Collaboration',
    icon: Users,
    description: 'Connect with leading professors and researchers for collaborative projects and opportunities.',
  },
  {
    title: 'Academic Mentorship',
    icon: GraduationCap,
    description: 'Receive guidance and mentorship from experienced professors in your field of study.',
  },
  {
    title: 'Publication Support',
    icon: BookOpen,
    description: 'Get assistance with academic publications, paper reviews, and journal submissions.',
  },
  {
    title: 'Research Resources',
    icon: BookMarked,
    description: 'Access comprehensive research materials, methodologies, and tools for your academic work.',
  },
  {
    title: 'Grant Opportunities',
    icon: FileSpreadsheet,
    description: 'Discover funding opportunities and receive guidance for research grant applications.',
  },
  {
    title: 'Academic Recognition',
    icon: Award,
    description: 'Showcase your research achievements and gain recognition in the academic community.',
  },
];

export default function FeatureSection() {
  return (
    <section className="py-20 md:py-32 bg-[#111111] relative z-10">
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-pattern"></div>
      <div className="mx-auto w-full max-w-6xl space-y-16 px-6">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-white text-balance md:text-4xl lg:text-6xl">
            Academic Excellence & Research Innovation
          </h2>
          <p className="text-gray-400 mt-6 text-sm tracking-wide text-balance md:text-lg">
            Everything you need to elevate your academic research and collaboration experience.
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