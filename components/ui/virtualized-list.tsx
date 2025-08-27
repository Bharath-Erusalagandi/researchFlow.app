'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  }, [onScroll]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      originalIndex: startIndex + index
    }));
  }, [items, visibleRange]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <AnimatePresence>
          {visibleItems.map(({ item, originalIndex }) => (
            <motion.div
              key={originalIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: originalIndex * itemHeight,
                width: '100%',
                height: itemHeight
              }}
            >
              {renderItem(item, originalIndex)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Hook for dynamic container height
export function useContainerHeight(defaultHeight: number = 600) {
  const [height, setHeight] = useState(defaultHeight);

  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 200; // Approximate header height
      const newHeight = Math.max(400, viewportHeight - headerHeight);
      setHeight(newHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return height;
}

// Hook for dynamic item height based on screen size
export function useItemHeight() {
  const [itemHeight, setItemHeight] = useState(380); // Default for desktop

  useEffect(() => {
    const updateItemHeight = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemHeight(350); // Mobile
      } else if (width < 1024) {
        setItemHeight(360); // Tablet
      } else {
        setItemHeight(380); // Desktop
      }
    };

    updateItemHeight();
    window.addEventListener('resize', updateItemHeight);
    return () => window.removeEventListener('resize', updateItemHeight);
  }, []);

  return itemHeight;
}
