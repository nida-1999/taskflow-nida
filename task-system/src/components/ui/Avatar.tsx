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

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getColor = (name?: string) => {
    if (!name) return { bg: "#f0f4ff", text: "#4f46e5", border: "#e2e8f0" };
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return {
        bg: `hsl(${h}, 70%, 94%)`,
        text: `hsl(${h}, 70%, 35%)`,
        border: `hsl(${h}, 30%, 88%)`
    };
  };

  const colors = getColor(name);
  const isImage = !!(avatar && (avatar.includes("/") || avatar.includes(".")));

  return (
    <div
      title={name}
      style={{ 
        backgroundColor: isImage ? "transparent" : colors.bg,
        color: isImage ? "transparent" : colors.text,
        borderColor: isImage ? "transparent" : colors.border
      }}
      className={`${sizes[size]} rounded-full border flex items-center justify-center font-extrabold transition-all hover:scale-105 overflow-hidden ${className}`}
    >
      {isImage ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        avatar || getInitials(name)
      )}
    </div>
  );
};

export default Avatar;
