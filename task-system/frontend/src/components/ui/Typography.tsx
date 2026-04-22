import React from "react";

interface HeadingProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4";
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ children, variant = "h2", className = "" }) => {
  const styles = {
    h1: "text-[1.8rem] font-extrabold text-slate-900 tracking-tight",
    h2: "text-[1.5rem] font-bold text-slate-900 tracking-tight",
    h3: "text-[1.2rem] font-bold text-slate-800 tracking-tight",
    h4: "text-[0.9rem] font-bold text-slate-800",
  };

  const Component = variant;

  return (
    <Component className={`${styles[variant]} ${className}`}>
      {children}
    </Component>
  );
};

interface TextProps {
  children: React.ReactNode;
  variant?: "body" | "small" | "tiny";
  className?: string;
}

export const Text: React.FC<TextProps> = ({ children, variant = "body", className = "" }) => {
  const styles = {
    body: "text-[0.95rem] text-slate-700 leading-relaxed",
    small: "text-[0.85rem] text-slate-500",
    tiny: "text-[0.7rem] font-semibold text-slate-500 uppercase tracking-wider",
  };

  return (
    <p className={`${styles[variant]} ${className}`}>
      {children}
    </p>
  );
};
