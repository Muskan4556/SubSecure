"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Sparkles } from "lucide-react";
import { SUBSCRIPTION_CATEGORIES } from "@/lib/validations/subscriptionValidation";
import type { SubscriptionCategory } from "@/lib/types/subscription-types";

const LABELS: Record<string, string> = {
  ENTERTAINMENT: "Entertainment",
  MUSIC: "Music",
  PRODUCTIVITY: "Productivity",
  CLOUD_STORAGE: "Cloud Storage",
  DEVELOPMENT: "Development",
  EDUCATION: "Education",
  HEALTH_FITNESS: "Health & Fitness",
  NEWS_READING: "News & Reading",
  GAMING: "Gaming",
  UTILITIES: "Utilities",
  FINANCE: "Finance",
  OTHER: "Other",
};

const CATEGORY_DOTS: Record<string, string> = {
  ENTERTAINMENT: "bg-rose-400",
  MUSIC: "bg-purple-400",
  PRODUCTIVITY: "bg-blue-400",
  CLOUD_STORAGE: "bg-sky-400",
  DEVELOPMENT: "bg-emerald-400",
  EDUCATION: "bg-amber-400",
  HEALTH_FITNESS: "bg-green-400",
  NEWS_READING: "bg-orange-400",
  GAMING: "bg-violet-400",
  UTILITIES: "bg-teal-400",
  FINANCE: "bg-lime-400",
  OTHER: "bg-white/40",
};

interface CategorySelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  includeAutoDetect?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  className = "",
  includeAutoDetect = true,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedLabel = value
    ? LABELS[value] ?? value
    : includeAutoDetect
    ? "Auto-detect"
    : "Select category";

  const selectedDot = value ? CATEGORY_DOTS[value] : null;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-9 w-full flex items-center justify-between rounded-md border border-white/10 bg-white/4 px-3 py-1.5 text-sm text-white/90 hover:bg-white/6 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedDot ? (
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${selectedDot}`}
            />
          ) : includeAutoDetect && !value ? (
            <Sparkles className="w-3.5 h-3.5 text-blue-400/80 shrink-0" />
          ) : null}
          <span
            className={
              !value && includeAutoDetect
                ? "text-blue-300/80 font-mono text-[13px]"
                : "text-white/80"
            }
          >
            {selectedLabel}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white/80" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl border border-white/10 bg-[#0d1525] p-1.5 shadow-2xl z-50 max-h-64 overflow-y-auto backdrop-blur-md">
          {includeAutoDetect && (
            <>
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-mono transition-colors text-left ${
                  !value
                    ? "bg-white/10 text-white font-medium"
                    : "text-blue-300/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Auto-detect from name</span>
                </div>
                {!value && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              </button>
              <div className="my-1 border-b border-white/6" />
            </>
          )}

          <div className="space-y-0.5">
            {SUBSCRIPTION_CATEGORIES.map((cat) => {
              const isSelected = value === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onChange(cat);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    isSelected
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/70 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        CATEGORY_DOTS[cat] ?? "bg-white/30"
                      }`}
                    />
                    <span className="truncate">{LABELS[cat] ?? cat}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
