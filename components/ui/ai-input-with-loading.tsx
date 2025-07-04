"use client";

import { CornerRightUp } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TextShimmer } from "@/components/ui/text-shimmer";

interface AIInputWithLoadingProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  loadingDuration?: number;
  thinkingDuration?: number;
  onSubmit?: (value: string) => void | Promise<void>;
  className?: string;
  autoAnimate?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  isLoading?: boolean; // External loading state
}

export function AIInputWithLoading({
  id = "ai-input-with-loading",
  placeholder = "Search research topics, professors, or universities...",
  minHeight = 56,
  maxHeight = 200,
  loadingDuration = 3000,
  thinkingDuration = 1000,
  onSubmit,
  className,
  autoAnimate = false,
  value: controlledValue,
  onChange,
  disabled = false,
  onFocus,
  onBlur,
  isLoading = false
}: AIInputWithLoadingProps) {
  const [inputValue, setInputValue] = useState(controlledValue || "");
  const [submitted, setSubmitted] = useState(autoAnimate);
  
  // Use external loading state if provided, otherwise fall back to internal state
  const showLoading = isLoading !== undefined ? isLoading : submitted;

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
    }
  }, [controlledValue]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || showLoading || disabled) return;
    
    // Only manage internal state if no external loading state is provided
    if (isLoading === undefined) {
      setSubmitted(true);
    }
    
    await onSubmit?.(inputValue);
    
    if (controlledValue === undefined) {
      setInputValue("");
    }
    
    // Only use timeout if no external loading state is provided
    if (isLoading === undefined) {
      setTimeout(() => {
        setSubmitted(false);
      }, loadingDuration);
    }
  };

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-4xl w-full mx-auto">
        <input
          id={id}
          placeholder={placeholder}
          className={cn(
            "max-w-4xl w-full rounded-3xl pl-6 pr-16 py-4",
            "bg-[#1a1a1a]/80 backdrop-blur border border-gray-700/50",
            "hover:border-[#0CF2A0]/50 focus:border-[#0CF2A0]",
            "placeholder:text-gray-400 text-white leading-[1.2]",
            "focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/20",
            "transition-all duration-300 text-lg text-center",
            `h-[${minHeight}px]`,
            showLoading && "pointer-events-none"
          )}
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={showLoading || disabled}
        />
        <button
          onClick={handleSubmit}
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 rounded-xl py-2 px-2",
            "transition-all duration-300",
            showLoading 
              ? "bg-transparent" 
              : "bg-[#0CF2A0] hover:bg-[#0CF2A0]/90",
            "min-h-[44px] min-w-[44px] flex items-center justify-center"
          )}
          type="button"
          disabled={showLoading || disabled || !inputValue.trim()}
        >
          {showLoading ? (
            <div className="w-5 h-5 bg-[#0CF2A0] rounded-sm animate-spin" />
          ) : (
            <CornerRightUp
              className={cn(
                "w-5 h-5",
                inputValue.trim() 
                  ? "text-black" 
                  : "text-gray-400"
              )}
            />
          )}
        </button>
        
        {/* Loading Text with TextShimmer */}
        {showLoading && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <TextShimmer 
              duration={1.5}
              className="text-sm font-medium [--base-color:theme(colors.emerald.500)] [--base-gradient-color:theme(colors.emerald.200)] dark:[--base-color:theme(colors.emerald.400)] dark:[--base-gradient-color:theme(colors.emerald.100)]"
            >
              Finding professors...
            </TextShimmer>
          </div>
        )}
      </div>
    </div>
  );
} 