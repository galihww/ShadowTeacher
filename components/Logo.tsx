import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`relative rounded-full overflow-hidden shadow-xl ${className}`}>
      <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background Circle White */}
        <circle cx="256" cy="256" r="256" fill="white"/>
        
        {/* Parent/Teacher Figure (Blue) */}
        <circle cx="256" cy="170" r="70" fill="#1e3a8a"/>
        <path 
            d="M256 260 C 150 260 100 360 90 512 L 422 512 C 412 360 362 260 256 260 Z" 
            fill="#1e3a8a"
        />
        
        {/* Child Figure (Orange) - Posisi di depan/bawah */}
        <circle cx="256" cy="330" r="50" fill="#f59e0b" stroke="white" strokeWidth="12"/>
        <path 
            d="M256 390 C 200 390 170 440 160 512 L 352 512 C 342 440 312 390 256 390 Z" 
            fill="#f59e0b" 
            stroke="white" 
            strokeWidth="12"
        />
      </svg>
    </div>
  );
};