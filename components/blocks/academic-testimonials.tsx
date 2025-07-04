'use client';
import { TestimonialsSection } from './testimonials-section';

const academicTestimonials = [
  {
    text: "The professor matching algorithm helped me find the perfect research mentor for my graduate thesis. The collaboration has been incredibly productive."
  },
  {
    text: "As a researcher, I've found multiple collaboration opportunities through this platform. The networking capabilities are unmatched in academia."
  },
  {
    text: "The research resources available through this platform have accelerated my work significantly. I completed my publication months ahead of schedule."
  },
  {
    text: "Finding funding for my research project was seamless with the grant matching service. I secured funding that I didn't even know existed."
  },
  {
    text: "The academic mentorship program transformed my approach to research methodology. My mentor provided invaluable guidance throughout my project."
  },
  {
    text: "My publication received significant attention thanks to the visibility provided by this platform. The academic community engagement has been exceptional."
  },
  {
    text: "The interdisciplinary connections I made through this platform resulted in a groundbreaking collaborative research project across three universities."
  }
];

export default function AcademicTestimonials() {
  return (
    <TestimonialsSection testimonials={academicTestimonials} />
  );
} 