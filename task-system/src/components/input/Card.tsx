import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  onClick, 
  style, 
  className = '', 
  ...props 
}, ref) => {
  const defaultStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  };

  return (
    <div 
      ref={ref}
      className={`card ${className}`} 
      onClick={onClick} 
      style={{ 
        ...defaultStyle, 
        ...style, 
        cursor: onClick ? 'pointer' : 'default' 
      }}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
