'use client';

import { cn } from "@/lib/utils"
import { TestimonialCard } from "@/components/ui/testimonial-card"

interface TestimonialsSectionProps {
  testimonials: Array<{
    text: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  testimonials,
  className 
}: TestimonialsSectionProps) {
  return (
    <section className={cn(
      "bg-[#111111] text-white py-16 md:py-24 relative z-10",
      className
    )}>
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-pattern opacity-50"></div>
      
      <div className="relative w-full overflow-hidden">
        <div className="flex flex-nowrap gap-6 py-8">
          {/* First copy - moves from right to left */}
          <div className="flex animate-marquee gap-6 flex-nowrap">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard 
                key={`first-${i}`}
                text={testimonial.text}
              />
            ))}
          </div>
          
          {/* Second copy - seamlessly continues the animation */}
          <div className="flex animate-marquee gap-6 flex-nowrap">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard 
                key={`second-${i}`}
                text={testimonial.text}
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#111111]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#111111]" />
      </div>
    </section>
  )
} 