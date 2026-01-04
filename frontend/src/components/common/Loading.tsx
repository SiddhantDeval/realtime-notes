import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  fullPage = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  const containerClasses = fullPage 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-surface/60 backdrop-blur-sm' 
    : 'flex items-center justify-center p-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="relative">
        {/* Outer Ring */}
        <div 
          className={`${sizeClasses[size]} rounded-full border-brand-200 dark:border-brand-900/30`}
        ></div>
        {/* Animated Spinner */}
        <div 
          className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-t-brand-600 border-r-transparent border-b-transparent border-l-transparent animate-spin`}
        ></div>
        
        {/* Subtle Glow Effect */}
        <div className={`absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse`}></div>
      </div>
    </div>
  );
};

export default Loading;
