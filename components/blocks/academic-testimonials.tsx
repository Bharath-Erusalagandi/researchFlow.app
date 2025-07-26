'use client';
import { TestimonialsSection } from './testimonials-section';

const academicTestimonials = [
  {
    text: "The professor matching algorithm helped me find the <span class='font-bold text-gray-300 italic'>perfect research mentor</span> for my graduate thesis. The collaboration has been <span class='font-bold text-[#0CF2A0]'>incredibly productive</span>."
  },
  {
    text: "As a researcher, I've found <span class='font-bold text-gray-300 italic'>multiple collaboration opportunities</span> through this platform. The <span class='font-bold text-[#0CF2A0]'>networking capabilities</span> are unmatched in academia."
  },
  {
    text: "The research resources available through this platform have <span class='font-bold text-gray-300 italic'>accelerated my work significantly</span>. I completed my publication <span class='font-bold text-[#0CF2A0]'>months ahead of schedule</span>."
  },
  {
    text: "Finding funding for my research project was seamless with the grant matching service. I secured <span class='font-bold text-[#0CF2A0] italic'>funding that I didn't even know existed</span>."
  },
  {
    text: "The academic mentorship program <span class='font-bold text-gray-300 italic'>transformed my approach</span> to research methodology. My mentor provided <span class='font-bold text-[#0CF2A0]'>invaluable guidance</span> throughout my project."
  },
  {
    text: "My publication received <span class='font-bold text-gray-300 italic'>significant attention</span> thanks to the visibility provided by this platform. The <span class='font-bold text-[#0CF2A0]'>academic community engagement</span> has been exceptional."
  },
  {
    text: "The interdisciplinary connections I made through this platform resulted in a <span class='font-bold text-[#0CF2A0] italic'>groundbreaking collaborative research project</span> across three universities."
  }
];

export default function AcademicTestimonials() {
  return (
    <TestimonialsSection testimonials={academicTestimonials} />
  );
} 