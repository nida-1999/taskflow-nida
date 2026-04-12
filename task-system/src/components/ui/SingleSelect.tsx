import React, { useState, useRef, useEffect } from "react";
import { Text } from "./Typography";
import { useMobile } from "../../hooks/useMobile";

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
  isCreatable?: boolean;
  onCreateOption?: (val: string) => void;
}

const SingleSelect: React.FC<SingleSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  isCreatable = false,
  onCreateOption,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMobile()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      if (isCreatable && !isMobile) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open, isCreatable, isMobile]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const handleCreate = () => {
    if (onCreateOption && search.trim()) {
      onCreateOption(search.trim());
      setOpen(false);
    }
  };

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = options.find(o => o.label.toLowerCase() === search.toLowerCase());

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isActive = !!selectedOption;

  return (
    <div ref={ref} className={`flex flex-col gap-1 relative ${className}`}>
      {label ? <Text variant="tiny">{label}</Text> : ""} 
      
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
        <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[220px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl z-50 p-[6px] animate-in fade-in zoom-in-95 duration-150">
          {isCreatable && (
            <div className="!px-2 !pb-2 !pt-1 border-b border-[var(--border)] !mb-1">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[0.75rem] opacity-50">🔍</span>
                <input
                  ref={inputRef}
                  className="w-full h-8 !pl-7 !pr-2 bg-[var(--nav-bg)] border border-[var(--border)] rounded-lg text-[0.8rem] outline-none focus:border-[var(--accent)]"
                  placeholder="Search or type to create..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && search && !exactMatch && isCreatable) {
                      handleCreate();
                    }
                  }}
                />
              </div>
            </div>
          )}
          <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const selected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left !px-3 !py-2 rounded-lg text-[0.85rem] font-medium flex items-center justify-start gap-2.5 transition-colors !mb-0.5 last:mb-0 ${
                      selected 
                        ? "bg-[var(--accent-light)] text-[var(--accent)] font-semibold" 
                        : "text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                    }`}
                  >
                    <div className={`flex-shrink-0 w-[14px] h-[14px] rounded-full border flex items-center justify-center transition-all ${
                      selected 
                        ? "bg-[var(--accent)] border-[var(--accent)] shadow-sm" 
                        : "bg-[var(--bg-secondary)] border-[var(--border)]"
                    }`}>
                      {selected && (
                        <div className="w-[5px] h-[5px] rounded-full bg-[var(--bg-secondary)]" />
                      )}
                    </div>
                    <span className="truncate !pt-[1px]">{opt.label}</span>
                  </button>
                );
              })
            ) : !isCreatable && (
              <div className="!py-4 !px-3 text-center text-[0.8rem] text-[var(--text-secondary)] italic">
                No results found
              </div>
            )}
            
            {isCreatable && search.trim() && !exactMatch && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full text-left !px-3 !py-2.5 !mt-1 rounded-lg text-[0.85rem] font-bold text-[var(--accent)] hover:bg-[var(--accent-light)] flex items-center gap-2 border border-dashed border-[var(--accent-light)]"
              >
                <span className="text-base">✨</span>
                <span className="truncate">Create "{search}"</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleSelect;
