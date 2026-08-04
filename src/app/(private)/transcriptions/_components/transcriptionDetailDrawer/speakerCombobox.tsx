'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';

interface SpeakerComboboxProps {
  speaker: string;
  value: string;
  options: string[];
  onChange: (speaker: string, value: string) => void;
}

export const SpeakerCombobox = ({ speaker, value, options, onChange }: SpeakerComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
  const queryTrimmed = query.trim();
  const exactMatch = options.some((o) => o.toLowerCase() === queryTrimmed.toLowerCase());
  const showAdd = queryTrimmed.length > 0 && !exactMatch;

  const select = (val: string) => {
    onChange(speaker, val);
    setOpen(false);
    setQuery('');
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(speaker, '');
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
      >
        <span className={value ? 'font-semibold text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}>
          {value || 'None'}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {value && (
            <span
              role="button"
              onClick={clear}
              className="rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 w-full rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 animate-fade-in">
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type a name..."
              className="w-full rounded-lg bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600"
            />
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => select(option)}
                  className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{option}</span>
                  {value === option && <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))
            ) : (
              !showAdd && (
                <p className="px-3.5 py-2 text-xs italic text-zinc-400">No options found</p>
              )
            )}

            {showAdd && (
              <button
                type="button"
                onClick={() => select(queryTrimmed)}
                className="flex w-full items-center gap-2 border-t border-zinc-100 px-3.5 py-2 text-left text-xs font-bold text-indigo-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-indigo-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                Use &quot;{queryTrimmed}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
