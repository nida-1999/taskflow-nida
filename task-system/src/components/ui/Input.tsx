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
  
  const baseStyles = "w-full bg-white border border-slate-200 rounded-lg !px-[14px] !py-[10px] text-[0.9rem] transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none text-slate-700 placeholder:text-slate-400";
  const errorStyles = error ? "border-red-500 focus:border-red-500 focus:ring-red-600/10" : "";

  const Component = isTextarea ? "textarea" : "input";

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.8rem] font-semibold text-slate-500"
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
