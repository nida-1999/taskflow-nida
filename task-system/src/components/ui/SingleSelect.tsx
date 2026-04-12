import React, { useState, useRef, useEffect } from "react";
import { Text } from "./Typography";

export interface Option {
  value: string;
  label: string;
}

export interface SingleSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SingleSelect: React.FC<SingleSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isActive = !!selectedOption;

  return (
    <div ref={ref} className={`flex flex-col gap-1 relative ${className}`}>
      {label && <Text variant="tiny">{label}</Text>}
      
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-9 min-w-[160px] w-full !px-3 rounded-lg border text-[0.85rem] font-medium text-left flex items-center justify-between transition-all outline-none ${
          open 
            ? "border-indigo-600 ring-4 ring-indigo-600/10" 
            : isActive 
              ? "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--heading-color)] font-semibold" 
              : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180 text-indigo-600" : "text-slate-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[200px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl z-50 p-[6px] animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left !px-3 !py-2 rounded-lg text-[0.85rem] font-medium flex items-center justify-start gap-2.5 transition-colors mb-0.5 last:mb-0 ${
                    selected 
                      ? "bg-[var(--accent-light)] text-[var(--accent)] font-semibold" 
                      : "text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                  }`}
                >
                  <div className={`flex-shrink-0 w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all ${
                    selected 
                      ? "bg-[var(--accent)] border-[var(--accent)] shadow-sm" 
                      : "bg-[var(--bg-secondary)] border-[var(--border)]"
                  }`}>
                    {selected && (
                      <div className="w-[6px] h-[6px] rounded-full bg-[var(--bg-secondary)]" />
                    )}
                  </div>
                  <span className="truncate !pt-[1px]">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleSelect;
