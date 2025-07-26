"use client"

import { memo, useEffect, useLayoutEffect, useMemo, useState } from "react"
import {
  AnimatePresence,
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

// College data with images, names and logos
type College = {
  name: string
  image: string
  logo: string
}

const colleges: College[] = [
  {
    name: "Harvard University",
    image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=600&h=600&fit=crop&q=80",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Harvard_shield_wreath.svg/150px-Harvard_shield_wreath.svg.png",
  },
  {
    name: "Stanford University",
    image: "https://images.unsplash.com/photo-1564444247765-c080f449283b?w=600&h=600&fit=crop&q=80",
    logo: "https://identity.stanford.edu/wp-content/uploads/sites/3/2020/07/block-s-right.png",
  },
  {
    name: "MIT",
    image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600&h=600&fit=crop&q=80",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png",
  },
  {
    name: "UC Berkeley",
    image: "https://images.unsplash.com/photo-1584432139977-7ce5b97f3c43?w=600&h=600&fit=crop&q=80",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/150px-Seal_of_University_of_California%2C_Berkeley.svg.png",
  },
  {
    name: "Oxford University",
    image: "https://images.unsplash.com/photo-1569447853931-5de840fecb80?w=600&h=600&fit=crop&q=80",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/150px-Oxford-University-Circlet.svg.png",
  },
  {
    name: "Cambridge University",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=600&fit=crop&q=80",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Coat_of_arms_of_the_University_of_Cambridge.svg/150px-Coat_of_arms_of_the_University_of_Cambridge.svg.png",
  },
  {
    name: "Yale University",
    image: "https://images.unsplash.com/photo-1582559934359-0334164d1bb8?w=600&h=600&fit=crop&q=80",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Yale_University_logo.svg/150px-Yale_University_logo.svg.png",
  },
  {
    name: "Princeton University",
    image: "https://images.unsplash.com/photo-1595500403311-07117ec9078a?w=600&h=600&fit=crop&q=80",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_shield.svg/150px-Princeton_shield.svg.png",
  }
]

const duration = 0.15
const transition = { duration, ease: [0.32, 0.72, 0, 1], filter: "blur(4px)" }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] }

const Carousel = memo(
  ({
    handleClick,
    controls,
    isCarouselActive,
  }: {
    handleClick: (college: College, index: number) => void
    controls: any
    isCarouselActive: boolean
  }) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)")
    const cylinderWidth = isScreenSizeSm ? 1100 : 1800
    const faceCount = colleges.length
    const faceWidth = cylinderWidth / faceCount
    const radius = cylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)
    const [isDragging, setIsDragging] = useState(false)
    
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    )

    // Auto rotation effect
    useEffect(() => {
      if (!isDragging && isCarouselActive) {
        const interval = setInterval(() => {
          rotation.set(rotation.get() + 0.2) // Slow continuous rotation
        }, 16) // 60fps for smooth animation
        
        return () => clearInterval(interval)
      }
    }, [isDragging, isCarouselActive, rotation])

    return (
      <div
        className="flex h-full items-center justify-center"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.div
          drag={isCarouselActive ? "x" : false}
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDragStart={() => setIsDragging(true)}
          onDrag={(_, info) => {
            if (isCarouselActive) {
              setIsDragging(true)
              rotation.set(rotation.get() + info.offset.x * 0.05)
            }
          }}
          onDragEnd={(_, info) => {
            if (isCarouselActive) {
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
            }
          }}
          animate={controls}
        >
          {colleges.map((college, i) => (
            <motion.div
              key={`key-${college.name}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center rounded-xl bg-[#1a1a1a] border border-gray-700 p-2"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
              }}
              onClick={() => handleClick(college, i)}
            >
              <motion.div className="flex flex-col items-center w-full h-full">
                <motion.img
                  src={college.image}
                  alt={college.name}
                  layoutId={`img-${college.name}`}
                  className="w-full rounded-t-lg object-cover aspect-square"
                  initial={{ filter: "blur(4px)" }}
                  layout="position"
                  animate={{ filter: "blur(0px)" }}
                  transition={transition}
                />
                <motion.div 
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-[#111111] w-full rounded-b-lg"
                  layoutId={`info-${college.name}`}
                >
                  <img 
                    src={college.logo} 
                    alt={`${college.name} logo`} 
                    className="h-8 w-8 object-contain" 
                  />
                  <p className="text-[#0CF2A0] font-medium truncate text-sm">
                    {college.name}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }
)

Carousel.displayName = "Carousel"

function ThreeDCollegeCarousel() {
  const [activeCollege, setActiveCollege] = useState<College | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()

  const handleClick = (college: College) => {
    setActiveCollege(college)
    setIsCarouselActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveCollege(null)
    setIsCarouselActive(true)
  }

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {activeCollege && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeCollege.name}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-5 md:p-16"
            style={{ willChange: "opacity" }}
            transition={transitionOverlay}
          >
            <motion.div className="bg-[#1a1a1a] rounded-xl max-w-md w-full overflow-hidden shadow-xl border border-gray-700">
              <motion.img
                layoutId={`img-${activeCollege.name}`}
                src={activeCollege.image}
                alt={activeCollege.name}
                className="w-full aspect-square object-cover"
              />
              <motion.div 
                layoutId={`info-${activeCollege.name}`}
                className="p-4 flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={activeCollege.logo} 
                    alt={`${activeCollege.name} logo`} 
                    className="h-12 w-12 object-contain" 
                  />
                  <h3 className="text-white text-xl font-semibold">{activeCollege.name}</h3>
                </div>
                <p className="text-gray-400 text-sm text-center mt-2">
                  Discover professors who can open doors to <span className="font-bold text-gray-300">research opportunities</span> and help launch your academic career.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-[400px] w-full overflow-hidden">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  )
}

export { ThreeDCollegeCarousel }; 