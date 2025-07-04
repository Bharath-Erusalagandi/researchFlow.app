'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// College data with names and logos
type College = {
  name: string;
  logo: string;
}

const colleges: College[] = [
  {
    name: "Harvard University",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Harvard_shield_wreath.svg/150px-Harvard_shield_wreath.svg.png",
  },
  {
    name: "Stanford University",
    logo: "https://identity.stanford.edu/wp-content/uploads/sites/3/2020/07/block-s-right.png",
  },
  {
    name: "MIT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png",
  },
  {
    name: "UC Berkeley",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/150px-Seal_of_University_of_California%2C_Berkeley.svg.png",
  },
  {
    name: "Oxford University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/150px-Oxford-University-Circlet.svg.png",
  },
  {
    name: "Cambridge University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Coat_of_arms_of_the_University_of_Cambridge.svg/150px-Coat_of_arms_of_the_University_of_Cambridge.svg.png",
  },
  {
    name: "Yale University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Yale_University_logo.svg/150px-Yale_University_logo.svg.png",
  },
  {
    name: "Princeton University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_shield.svg/150px-Princeton_shield.svg.png",
  },
];

export default function CollegeLogoCarousel() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative overflow-hidden w-full py-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-12">
        {/* First set of logos */}
        <motion.div
          className="flex gap-12 min-w-max"
          animate={{
            x: isHovered ? 0 : "-100%"
          }}
          transition={{
            ease: "linear",
            duration: isHovered ? 0 : 30,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          {colleges.map((college, i) => (
            <CollegeLogo key={`logo-1-${i}`} college={college} />
          ))}
        </motion.div>
        
        {/* Duplicate set for seamless looping */}
        <motion.div
          className="flex gap-12 min-w-max"
          animate={{
            x: isHovered ? 0 : "-100%"
          }}
          transition={{
            ease: "linear",
            duration: isHovered ? 0 : 30,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          {colleges.map((college, i) => (
            <CollegeLogo key={`logo-2-${i}`} college={college} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function CollegeLogo({ college }: { college: College }) {
  return (
    <div className="flex flex-col items-center gap-2 w-[170px]">
      <div className="bg-[#1a1a1a] border border-gray-700 hover:border-[#0CF2A0]/50 rounded-xl p-4 h-[120px] w-[120px] flex items-center justify-center transition-all duration-300">
        <img 
          src={college.logo} 
          alt={college.name} 
          className="max-h-[80px] max-w-[80px] object-contain" 
        />
      </div>
      <p className="text-[#0CF2A0] text-sm font-medium text-center">
        {college.name}
      </p>
    </div>
  );
} 