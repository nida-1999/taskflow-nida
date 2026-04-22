import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "high" | "medium" | "low" | "neutral" | "success";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className = "" }) => {
  const baseStyles = "inline-flex items-center !px-2 !py-1 rounded-md text-[0.7rem] font-bold";
  
  const variants = {
    high: "bg-red-50 text-red-500",
    medium: "bg-amber-50 text-amber-500",
    low: "bg-emerald-50 text-emerald-500",
    success: "bg-emerald-50 text-emerald-500",
    neutral: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
