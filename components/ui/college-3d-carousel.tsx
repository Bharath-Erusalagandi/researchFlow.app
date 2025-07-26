"use client"

import { memo, useEffect, useLayoutEffect, useState } from "react"
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

// College data with logos
type College = {
  name: string
  logo: string
}

const colleges: College[] = [
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
    name: "Oxford University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/1200px-Oxford-University-Circlet.svg.png",
  },
  {
    name: "Yale University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Yale_University_logo.svg/1200px-Yale_University_logo.svg.png",
  },
  {
    name: "Princeton University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_seal.svg/1200px-Princeton_seal.svg.png",
  },
]

const duration = 0.15
const transition = { duration, ease: [0.32, 0.72, 0, 1] }
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
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    )

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
          onDrag={(_, info) =>
            isCarouselActive &&
            rotation.set(rotation.get() + info.offset.x * 0.05)
          }
          onDragEnd={(_, info) =>
            isCarouselActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.05,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 30,
                mass: 0.1,
              },
            })
          }
          animate={controls}
        >
          {colleges.map((college, i) => (
            <motion.div
              key={`key-${college.name}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
              }}
              onClick={() => handleClick(college, i)}
            >
              <div className="bg-[#1a1a1a] border border-gray-700 hover:border-[#0CF2A0]/50 rounded-xl p-6 transition-all w-[180px] text-center shadow-lg hover:shadow-[#0CF2A0]/10">
                <motion.div
                  className="flex flex-col items-center justify-center gap-4"
                  layoutId={`content-${college.name}`}
                  transition={transition}
                >
                  <div className="h-20 flex items-center justify-center">
                    <motion.img
                      src={college.logo}
                      alt={college.name}
                      className="max-h-20 w-auto object-contain"
                      initial={{ filter: "blur(4px)", opacity: 0 }}
                      animate={{ filter: "blur(0px)", opacity: 1 }}
                      transition={transition}
                    />
                  </div>
                  <motion.p className="text-[#0CF2A0] text-sm font-medium">
                    {college.name}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }
)

Carousel.displayName = "Carousel"

function CollegeCarousel() {
  const [activeCollege, setActiveCollege] = useState<College | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()

  const handleClick = (college: College, index: number) => {
    setActiveCollege(college)
    setActiveIndex(index)
    setIsCarouselActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveCollege(null)
    setActiveIndex(null)
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
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-5"
            style={{ willChange: "opacity" }}
            transition={transitionOverlay}
          >
            <motion.div 
              className="bg-[#1a1a1a] rounded-xl max-w-md w-full overflow-hidden border border-gray-700 shadow-xl p-8"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                className="flex flex-col items-center gap-8"
                layoutId={`content-${activeCollege.name}`}
              >
                <div className="bg-gradient-to-b from-[#1a1a1a] to-black p-6 w-full flex justify-center">
                  <motion.img
                    src={activeCollege.logo}
                    alt={activeCollege.name}
                    className="h-28 object-contain"
                  />
                </div>
                <motion.div className="text-center px-4">
                  <h3 className="text-white text-xl font-bold mb-3">{activeCollege.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Discover professors who can open doors to <span className="font-bold text-gray-300">research opportunities</span> and help launch your academic career at this world-class institution.
                  </p>
                </motion.div>
                <motion.button 
                  className="mt-2 bg-[#0CF2A0]/10 hover:bg-[#0CF2A0]/20 border border-[#0CF2A0]/50 text-[#0CF2A0] px-8 py-2 rounded-md text-sm font-medium transition-all hover:scale-105"
                  onClick={handleClose}
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-[300px] sm:h-[360px] w-full overflow-hidden">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  )
}

export { CollegeCarousel } 