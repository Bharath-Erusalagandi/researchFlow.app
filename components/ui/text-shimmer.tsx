'use client';
import React, { useMemo, type JSX } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

export function TextShimmer({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  const commonProps = {
    initial: { backgroundPosition: '100% center' },
    animate: { backgroundPosition: '0% center' },
    transition: {
      repeat: Infinity,
      duration,
      ease: 'linear' as const,
    },
    style: {
      '--spread': `${dynamicSpread}px`,
      backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
    } as React.CSSProperties,
    className: cn(
      'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
      'text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]',
      '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
      'dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]',
      className
    ),
  };

  // Use motion.p as default since it's the most common use case
  if (Component === 'p' || !Component) {
    return <motion.p {...commonProps}>{children}</motion.p>;
  }
  
  if (Component === 'span') {
    return <motion.span {...commonProps}>{children}</motion.span>;
  }
  
  if (Component === 'div') {
    return <motion.div {...commonProps}>{children}</motion.div>;
  }
  
  if (Component === 'h1') {
    return <motion.h1 {...commonProps}>{children}</motion.h1>;
  }
  
  if (Component === 'h2') {
    return <motion.h2 {...commonProps}>{children}</motion.h2>;
  }
  
  if (Component === 'h3') {
    return <motion.h3 {...commonProps}>{children}</motion.h3>;
  }

  // Fallback to motion.p for any other component
  return <motion.p {...commonProps}>{children}</motion.p>;
} 