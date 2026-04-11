import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  isLoading, 
  children, 
  className = '', 
  style,
  ...props 
}) => {
  const isPrimary = variant === 'primary';
  const isDisabled = isLoading || props.disabled;
  
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold text-[0.9rem] transition-all duration-200';
  const variantClasses = isPrimary 
    ? 'bg-[#0f172a] text-white border-none !py-[10px] !px-5 hover:opacity-90' 
    : 'bg-transparent text-[var(--text-primary)] border border-[var(--border)] py-2 px-4 hover:bg-[rgba(0,0,0,0.02)]';
  const stateClasses = isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer opacity-100';

  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${stateClasses} ${className}`} 
      disabled={isDisabled}
      style={style}
      {...props}
    >
      {isLoading ? (
        <>
          <span className={`spinner w-3.5 h-3.5 border-2 ${isPrimary ? 'border-t-white' : 'border-t-[var(--accent)]'}`} />
          <span>{children}</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;
