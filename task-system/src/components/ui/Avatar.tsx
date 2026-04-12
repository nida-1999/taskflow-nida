import React from "react";

interface AvatarProps {
  name?: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, avatar, size = "md", className = "" }) => {
  const sizes = {
    sm: "w-6 h-6 text-[0.65rem]",
    md: "w-8 h-8 text-[0.75rem]",
    lg: "w-10 h-10 text-[0.85rem]",
  };

  return (
    <div
      title={name}
      className={`${sizes[size]} rounded-full bg-indigo-50 border border-slate-200 flex items-center justify-center font-extrabold text-indigo-600 transition-all hover:scale-105 ${className}`}
    >
      {avatar || (name ? name.charAt(0).toUpperCase() : "?")}
    </div>
  );
};

export default Avatar;
