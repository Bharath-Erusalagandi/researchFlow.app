"use client"

import { memo, useEffect, useLayoutEffect, useState } from "react"
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion"

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === "undefined"

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })

  const handleChange = () => {
    setMatches(getMatches(query))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()

    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

// University data with logos and names
type University = {
  name: string;
  logo: string;
}

const universities: University[] = [
  {
    name: "Oxford University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/1200px-Oxford-University-Circlet.svg.png",
  },
  {
    name: "Yale University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Yale_University_logo.svg/1200px-Yale_University_logo.svg.png",
  },
  {
    name: "Harvard University",
    logo: "https://1000logos.net/wp-content/uploads/2017/02/Harvard-Logo.png",
  },
  {
    name: "Stanford University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_Cardinal_logo.svg/1200px-Stanford_Cardinal_logo.svg.png",
  },
  {
    name: "MIT",
    logo: "https://1000logos.net/wp-content/uploads/2022/08/MIT-Logo.png",
  },
  {
    name: "UC Berkeley",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/1200px-Seal_of_University_of_California%2C_Berkeley.svg.png",
  },
  {
    name: "Princeton University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_seal.svg/1200px-Princeton_seal.svg.png",
  }
  // Note: Cambridge University has been excluded as requested
]

const UniversityCarousel = () => {
  const isScreenSizeSm = useMediaQuery("(max-width: 640px)")
  const cylinderWidth = isScreenSizeSm ? 1100 : 1800
  const faceCount = universities.length
  const faceWidth = cylinderWidth / faceCount
  const radius = cylinderWidth / (2 * Math.PI)
  const rotation = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)
  
  const transform = useTransform(
    rotation,
    (value) => `rotate3d(0, 1, 0, ${value}deg)`
  )
  
  const controls = useAnimation()

  // Auto rotation effect
  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        rotation.set(rotation.get() + 0.2) // Slow continuous rotation
      }, 16) // 60fps for smooth animation
      
      return () => clearInterval(interval)
    }
  }, [isDragging, rotation])

  return (
    <div className="h-96 w-full max-w-4xl mx-auto">
      <div
        className="flex h-full items-center justify-center"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.div
          drag="x"
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDragStart={() => setIsDragging(true)}
          onDrag={(_, info) => {
            setIsDragging(true)
            rotation.set(rotation.get() + info.offset.x * 0.05)
          }}
          onDragEnd={(_, info) => {
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.05,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 30,
                mass: 0.1,
              },
            })
            // Resume auto rotation after a delay
            setTimeout(() => setIsDragging(false), 1000)
          }}
          animate={controls}
        >
          {universities.map((university, i) => (
            <motion.div
              key={`key-${university.name}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
              }}
            >
              <div className="bg-[#1a1a1a] border border-gray-700 hover:border-[#0CF2A0]/50 rounded-xl p-6 transition-all w-[180px] text-center shadow-lg hover:shadow-[#0CF2A0]/10">
                <motion.div
                  className="flex flex-col items-center justify-center gap-4"
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="h-20 flex items-center justify-center">
                    <motion.img
                      src={university.logo}
                      alt={university.name}
                      className="max-h-20 w-auto object-contain"
                      initial={{ filter: "blur(4px)", opacity: 0 }}
                      animate={{ filter: "blur(0px)", opacity: 1 }}
                      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                    />
                  </div>
                  <motion.p className="text-[#0CF2A0] text-sm font-medium">
                    {university.name}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default UniversityCarousel; 