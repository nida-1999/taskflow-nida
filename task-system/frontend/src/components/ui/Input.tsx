import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  isTextarea?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  isTextarea = false,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  
  const baseStyles = "w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg !px-[14px] !py-[10px] text-[0.9rem] transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]";
  const errorStyles = error ? "border-red-500 focus:border-red-500 focus:ring-red-600/10" : "";

  const Component = isTextarea ? "textarea" : "input";

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.8rem] font-semibold text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Component
          id={inputId}
          className={`${baseStyles} ${errorStyles} ${className} ${isTextarea ? 'min-h-[100px] resize-y' : ''}`}
          {...(props as any)}
        />
      </div>
      {error && (
        <span className="text-xs font-medium text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
