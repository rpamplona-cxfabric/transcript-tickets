'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, User, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchLeads } from '@/lib/api/leads';
import { queryKeys } from '@/lib/queries/queryKeys';
import { useDebounce } from '@/lib/hooks/useDebounce';

export interface ComboboxLead {
  leadId: number;
  firstName: string;
  lastName: string;
  emails?: string[] | null;
  phones?: string[] | null;
}

interface ComboboxProps {
  onSelect: (lead: ComboboxLead) => void;
  onCreateNew: (typedText: string) => void;
  placeholder?: string;
  className?: string;
}

export const Combobox = ({
  onSelect,
  onCreateNew,
  placeholder = 'Search lead...',
  className = '',
}: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { data: results = [], isFetching } = useQuery({
    queryKey: queryKeys.leadSearch(debouncedQuery),
    queryFn: () => searchLeads(debouncedQuery),
    enabled: isOpen,
    staleTime: 10_000,
  });

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-450 dark:text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-11 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-600 dark:focus:border-white"
        />
        {isFetching && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 animate-spin text-zinc-400" />
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 animate-fade-in">
          {results.length > 0 ? (
            results.map((lead) => {
              const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown Lead';
              const detail = lead.phones?.[0] || lead.emails?.[0] || '';
              return (
                <button
                  key={lead.leadId}
                  type="button"
                  onClick={() => { onSelect(lead); setQuery(''); setIsOpen(false); }}
                  className="flex w-full cursor-pointer items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-400" />
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{fullName}</span>
                      {detail && <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">{detail}</p>}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            !isFetching && (
              <div className="px-3.5 py-2 text-xs italic text-zinc-400">No matching leads found</div>
            )
          )}

          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => { onCreateNew(query.trim()); setQuery(''); setIsOpen(false); }}
              className="flex w-full cursor-pointer items-center gap-2 border-t border-zinc-150 px-3.5 py-2.5 text-left text-xs font-bold text-indigo-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-indigo-400 dark:hover:bg-zinc-900 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create as new lead: &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
};
