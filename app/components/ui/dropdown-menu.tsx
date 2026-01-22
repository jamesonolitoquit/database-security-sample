'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  className = '',
  align = 'end',
  children,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={ref}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 ${
        alignClasses[align]
      } ${isOpen ? 'block' : 'hidden'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground ${className}`}
      {...props}
    />
  );
};