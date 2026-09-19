import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';

interface TableHeaderProps {
  children: ReactNode;
  sticky?: boolean;
}

export const TableHeader = ({ children, sticky = false }: TableHeaderProps) => (
  <thead className={`app-surface border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-wide text-zinc-700 dark:border-zinc-800 dark:text-zinc-300 ${sticky ? 'sticky top-0 z-10' : ''}`}>
    {children}
  </thead>
);

export type TableSortDirection = 'asc' | 'desc' | null;

interface SortableTableHeaderCellProps {
  children: ReactNode;
  sortDirection: TableSortDirection;
  onSort?: () => void;
  align?: 'left' | 'right';
  className?: string;
}

export const SortableTableHeaderCell = ({
  children,
  sortDirection,
  onSort,
  align = 'left',
  className = '',
}: SortableTableHeaderCellProps) => (
  <th
    scope="col"
    aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none'}
    className={`px-6 py-2 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
  >
    <button
      type="button"
      onClick={onSort}
      disabled={!onSort}
      className={`inline-flex items-center gap-1 whitespace-nowrap ${align === 'right' ? 'ml-auto' : ''} ${onSort ? 'cursor-pointer hover:text-zinc-950 dark:hover:text-white' : 'cursor-default'}`}
    >
      {children}
      <span className="relative h-3.5 w-3 shrink-0" aria-hidden="true">
        <ChevronUp className={`absolute -top-0.5 left-0 h-3 w-3 ${sortDirection === 'asc' ? 'text-current' : 'text-zinc-400/70 dark:text-zinc-600'}`} />
        <ChevronDown className={`absolute -bottom-0.5 left-0 h-3 w-3 ${sortDirection === 'desc' ? 'text-current' : 'text-zinc-400/70 dark:text-zinc-600'}`} />
      </span>
    </button>
  </th>
);
