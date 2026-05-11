"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-64", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-white/20 bg-background/60 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 backdrop-blur-md",
          isOpen && "border-primary/50 shadow-[0_0_15px_rgba(255,120,120,0.15)]",
          !disabled && "hover:border-white/40 hover:bg-background/80"
        )}
      >
        <span className="truncate">
          {value || <span className="text-muted-foreground">{placeholder}</span>}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-50 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-hidden rounded-xl border border-white/20 bg-card/95 p-1 text-popover-foreground shadow-2xl backdrop-blur-xl">
            <div className="max-h-60 overflow-auto scrollbar-hide">
              {options.length === 0 ? (
                <div className="px-2 py-4 text-center text-xs text-muted-foreground italic">
                  No datasets found
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                    }}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-3 pr-8 text-sm outline-none hover:bg-primary/10 hover:text-primary transition-colors",
                      value === "" && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <span className="truncate">Default (All)</span>
                    {value === "" && (
                      <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-3 pr-8 text-sm outline-none hover:bg-primary/10 hover:text-primary transition-colors",
                        value === option && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <span className="truncate">{option}</span>
                      {value === option && (
                        <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
