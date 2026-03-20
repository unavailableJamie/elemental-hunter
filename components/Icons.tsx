
import React from 'react';

// Specialized Fantasy RPG Icons
// Designed for high readability at small sizes.
// Uses fill="currentColor" to ensure compatibility with Tailwind CSS text color classes.

export const FireIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    {/* Stylized Triple-tongued Flame */}
    <path d="M12 2C12 2 15 6 15 9.5C15 11.5 13.5 13 12 13C10.5 13 9.5 11.5 9.5 9.5C9.5 8 10 7 10 7C7 8.5 6 12 6 14.5C6 18.5 8.5 22 12 22C15.5 22 18 18.5 18 14.5C18 11.5 16 7 12 2Z" />
    <path d="M12 15C13.1046 15 14 15.8954 14 17C14 18.1046 13.1046 19 12 19C10.8954 19 10 18.1046 10 17C10 15.8954 10.8954 15 12 15Z" opacity="0.4" />
  </svg>
);

export const IceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    {/* Faceted Crystal Shard */}
    <path d="M12 2L6 8L8 14L12 22L16 14L18 8L12 2Z" />
    <path d="M12 2L10 8L12 14L14 8L12 2Z" fill="white" fillOpacity="0.25" />
    <path d="M8 8L11 11L12 8H8Z" fill="black" fillOpacity="0.1" />
  </svg>
);

export const GrassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    {/* Curved Elven Leaf */}
    <path d="M17 2C17 2 11 3 8 7C5 11 5 16 12 22C12 22 11 17 13 13C15 9 19 7 20 4C20.5 2.5 18.5 1.5 17 2Z" />
    <path d="M12 22C12 22 13 18 16 15C19 12 22 12 22 12C22 12 18 13 15 16C12 19 12 22 12 22Z" opacity="0.4" />
  </svg>
);

export const RockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    {/* Jagged Cracked Boulder */}
    <path d="M4 10L7 4L16 3L21 9L19 17L12 21L5 18L4 10Z" />
    <path d="M7 4L12 8L16 3L12 5L7 4Z" fill="white" fillOpacity="0.2" />
    <path d="M19 17L12 15L12 21L19 17Z" fill="black" fillOpacity="0.15" />
    <path d="M10 12L14 13" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.8" strokeLinecap="round" />
  </svg>
);

export const DiceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    {/* Refined D6 with rounded corners and optimized pip layout */}
    <rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
    <circle cx="7" cy="7" r="2" fill="#767676" />
    <circle cx="17" cy="17" r="2" fill="#767676" />
    <circle cx="17" cy="7" r="2" fill="#767676" />
    <circle cx="7" cy="17" r="2" fill="#767676" />
    <circle cx="12" cy="12" r="2" fill="#767676" />
  </svg>
);

export const PortalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <circle cx="12" cy="12" r="9" opacity="0.3" />
    <path d="M12 3a9 9 0 0 1 0 18" />
    <path d="M12 6a6 6 0 0 1 0 12" />
    <path d="M12 9a3 3 0 0 1 0 6" />
  </svg>
);

export const ManaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="#057ED5" 
    stroke="#000000" 
    strokeWidth="1.5"
    {...props}
  >
    <path d="M12 2L2 7L7 22L17 22L22 7L12 2Z" />
  </svg>
);

// ATK pip: upward triangle — angular/physical
export const AtkPip: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
    <svg viewBox="-12 -12 24 24" className={`${className} drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]`}>
        <path d="M 0 -10 L 9 7 L -9 7 Z" fill="#EEB82C" stroke="#824A1D" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
);

// Mana pip: 4-point star — magical/arcane
export const ManaPip: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
    <svg viewBox="-12 -12 24 24" className={`${className} drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]`}>
        <path d="M 0 -10 L 2.5 -2.5 L 10 0 L 2.5 2.5 L 0 10 L -2.5 2.5 L -10 0 L -2.5 -2.5 Z" fill="#4E86EF" stroke="#4F46E5" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
);

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M18 2H6v2H2v7c0 2.21 1.79 4 4 4h1v2c0 2.21 1.79 4 4 4v2H7v2h10v-2h-3v-2c2.21 0 4-1.79 4-4v-2h1c2.21 0 4-1.79 4-4V4h-4V2zM6 13c-1.1 0-2-.9-2-2V6h2v7zm14-2c0 1.1-.9 2-2 2v-7h2v5z" />
  </svg>
);
