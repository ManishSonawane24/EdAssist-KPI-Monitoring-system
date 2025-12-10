import React from 'react';
import { useTheme } from '../context/ThemeContext';

type Props = {
  className?: string;
  lightSrc?: string;
  darkSrc?: string;
  alt?: string;
  size?: number;
  bare?: boolean;
};

export default function Logo({ className = '', lightSrc, darkSrc, alt = 'EdAssist', size = 24, bare = false }: Props) {
  const { theme } = useTheme();

  // If user provided separate images, use them
  if (lightSrc || darkSrc) {
    const src = theme === 'dark' ? (darkSrc || lightSrc) : (lightSrc || darkSrc);
    if (bare) {
      return <img src={src} alt={alt} width={size} height={size} className={className} />;
    }
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`w-${Math.floor(size / 4)} h-${Math.floor(size / 4)} ${className}`}
      />
    );
  }

  // Fallback: inline SVG that uses currentColor so it responds to text color classes
  if (bare) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-current ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center p-2 rounded-xl shadow-lg ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
  );
}
