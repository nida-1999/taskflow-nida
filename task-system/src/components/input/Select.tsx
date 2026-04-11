import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ className = '', style, options, children, ...props }) => {
  const baseClasses = 'bg-white border border-[var(--border)] rounded-[10px] py-[10px] px-[14px] text-[var(--text-primary)] text-[0.9rem] outline-none transition-all duration-200 w-full cursor-pointer appearance-none hover:border-[#cbd5e1] focus:border-[var(--accent)] focus:ring-3 focus:ring-[rgba(79,70,229,0.1)]';

  return (
    <div className="relative w-full">
      <select 
        className={`${baseClasses} ${className}`} 
        style={style}
        {...props}
      >
        {options ? options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )) : children}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>
  );
};

export default Select;
