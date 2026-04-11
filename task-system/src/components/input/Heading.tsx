import React from 'react';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}

const Heading: React.FC<HeadingProps> = ({ level = 1, children, style, className = '', id }) => {
  const Tag = `h${level}` as any;
  
  const levelClasses = {
    1: 'text-[1.75rem] font-extrabold text-[#0f172a] mb-[4px]',
    2: 'text-[1.4rem] font-extrabold text-[#0f172a] mb-[4px]',
    3: 'text-[1.1rem] font-bold text-[#1e293b] mb-[4px]',
    4: 'text-[0.9rem] font-bold text-[#334155] mb-[4px]',
  };

  return (
    <Tag 
      id={id} 
      className={`${levelClasses[level]} ${className}`} 
      style={style}
    >
      {children}
    </Tag>
  );
};

export default Heading;
