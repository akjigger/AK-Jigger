
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        {/* Triangle Base */}
        <path 
          d="M15 85 L50 35 L85 85 Z" 
          fill="#2B3890" 
          className="transition-all duration-300"
        />
        {/* Heart on Top */}
        <path 
          d="M50 45 C50 45 42 30 35 30 C28 30 23 35 23 42 C23 52 50 72 50 72 C50 72 77 52 77 42 C77 35 72 30 65 30 C58 30 50 45 50 45" 
          fill="#E51D37" 
          className="animate-pulse"
        />
        {/* Logo Text inside Triangle */}
        <text 
          x="50" 
          y="78" 
          textAnchor="middle" 
          fill="white" 
          style={{ fontFamily: 'Bungee, cursive', fontSize: '10px' }}
        >
          BOP
        </text>
      </svg>
    </div>
  );
};

export default Logo;
