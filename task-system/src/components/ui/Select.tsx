import React from "react";
import { Text } from "./Typography";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ label, className = "", children, ...props }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Text variant="tiny">{label}</Text>
      <select
        className="h-9 min-w-[150px] !px-3 rounded-lg border border-slate-200 bg-white text-[0.85rem] font-bold text-slate-700 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all appearance-none cursor-pointer"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
