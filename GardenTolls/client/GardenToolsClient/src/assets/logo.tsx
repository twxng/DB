import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 40, height = 40, color = '#4CAF50' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" fill="#F5F7F9" stroke={color} strokeWidth="4" />
      <path
        d="M50 15C55.5228 15 60 19.4772 60 25C60 30.5228 55.5228 35 50 35C44.4772 35 40 30.5228 40 25C40 19.4772 44.4772 15 50 15Z"
        fill={color}
      />
      <rect x="48" y="35" width="4" height="35" rx="2" fill={color} />
      <path
        d="M30 60C30 50 40 40 50 40C60 40 70 50 70 60C70 70 60 80 50 80C40 80 30 70 30 60Z"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M30 60C25 60 20 65 20 70C20 75 25 80 30 80"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M70 60C75 60 80 65 80 70C80 75 75 80 70 80"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Logo; 