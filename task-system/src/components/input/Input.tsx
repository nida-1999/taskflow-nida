import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', style, ...props }) => {
  const baseClasses = 'bg-white border border-[var(--border)] rounded-[10px] !py-[10px] !px-[14px] text-[var(--text-primary)] text-[0.9rem] outline-none transition-all duration-200 w-full hover:border-[#cbd5e1] focus:border-[var(--accent)] focus:ring-3 focus:ring-[rgba(79,70,229,0.1)]';

  return (
    <input 
      className={`${baseClasses} ${className}`} 
      style={style}
      {...props} 
    />
  );
};

export default Input;
