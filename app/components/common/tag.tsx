import React from 'react';

export interface TagProps {
  name: string;
  onClick?: (tag: string) => void;
  className?: string;
}

export function Tag({ name, onClick, className = '' }: TagProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(name);
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200 hover:bg-blue-800 transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {name}
    </span>
  );
}
