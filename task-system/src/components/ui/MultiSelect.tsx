import React, { useState, useRef, useEffect } from "react";
import { Text } from "./Typography";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const isActive = selected.length > 0;

  const displayLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label || selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} className={`flex flex-col gap-1 relative ${className}`}>
      <Text variant="tiny">{label}</Text>
      
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`h-9 min-w-[160px] !px-3 rounded-lg border text-[0.85rem] font-bold text-left flex items-center justify-between transition-all outline-none ${
          open 
            ? "border-indigo-600 ring-4 ring-indigo-600/10" 
            : isActive 
              ? "border-indigo-600 bg-indigo-50/30 text-indigo-700" 
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180 text-indigo-600" : "text-slate-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 !p-[6px] animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={`w-full text-left !px-3 !py-2 rounded-lg text-[0.85rem] font-semibold flex items-center justify-start gap-2.5 transition-colors mb-0.5 last:mb-0 ${
                    checked 
                      ? "bg-indigo-50/70 text-indigo-700" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className={`flex-shrink-0 w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all ${
                    checked 
                      ? "bg-indigo-600 border-indigo-600 shadow-sm" 
                      : "bg-white border-slate-300"
                  }`}>
                    {checked && (
                      <svg className="w-[12px] h-[12px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                      </svg>
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

export default MultiSelect;
