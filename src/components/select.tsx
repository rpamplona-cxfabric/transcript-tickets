'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { SelectOption } from '../types';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export const Select = ({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  className = '',
  buttonClassName = '',
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | MouseEventInit | MouseEventInit | any) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 focus:border-zinc-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900/50 ${buttonClassName}`}
      >
        <span className={selectedOption ? '' : 'text-zinc-400 dark:text-zinc-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1.5 max-h-60 w-full min-w-0 overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs italic text-zinc-400">No options available</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center px-3.5 py-2 text-left text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                  opt.value === value
                    ? 'bg-zinc-50 font-semibold text-zinc-900 dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
