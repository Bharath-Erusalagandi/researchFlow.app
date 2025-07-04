import { cn } from "@/lib/utils"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  text,
  className
}: Omit<TestimonialCardProps, 'author'> & { author?: TestimonialAuthor }) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center rounded-lg shrink-0",
        "bg-[#1a1a1a] border border-gray-700 hover:border-[#0CF2A0]/50",
        "p-6 text-start",
        "w-[300px] sm:w-[350px] min-h-[120px]",
        "transition-colors duration-300",
        className
      )}
    >
      <p className="text-gray-400 text-sm leading-relaxed">
        &quot;{text}&quot;
      </p>
    </div>
  )
} 