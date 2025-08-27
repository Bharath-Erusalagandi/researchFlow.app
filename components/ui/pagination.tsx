'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPages?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPages = 5,
  className = ''
}) => {
  const getVisiblePages = () => {
    const delta = Math.floor(showPages / 2);
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Previous Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          "p-2 rounded-lg transition-colors flex items-center justify-center",
          currentPage <= 1
            ? "text-gray-500 cursor-not-allowed"
            : "text-white hover:bg-white/10 cursor-pointer"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </motion.button>

      {/* First Page */}
      {visiblePages[0] > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            1
          </motion.button>
          {visiblePages[0] > 2 && (
            <div className="px-2 py-2 text-gray-500">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          )}
        </>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page) => (
        <motion.button
          key={page}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(page)}
          className={cn(
            "px-3 py-2 rounded-lg transition-colors",
            page === currentPage
              ? "bg-[#0CF2A0] text-black font-medium"
              : "text-white hover:bg-white/10"
          )}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </motion.button>
      ))}

      {/* Last Page */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <div className="px-2 py-2 text-gray-500">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            {totalPages}
          </motion.button>
        </>
      )}

      {/* Next Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "p-2 rounded-lg transition-colors flex items-center justify-center",
          currentPage >= totalPages
            ? "text-gray-500 cursor-not-allowed"
            : "text-white hover:bg-white/10 cursor-pointer"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </motion.button>
    </div>
  );
};
