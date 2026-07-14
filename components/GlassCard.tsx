import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white/10 
        backdrop-blur-md 
        border border-white/20 
        shadow-lg 
        rounded-2xl 
        text-white
        transition-all duration-300
        hover:bg-white/15
        ${className}
      `}
    >
      {children}
    </div>
  );
};