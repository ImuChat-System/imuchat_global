'use client';

import { Search } from 'lucide-react';
import { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Called when search is submitted */
  onSearch?: (query: string) => void;
  /** Called on every input change */
  onChange?: (query: string) => void;
  /** Initial value */
  defaultValue?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

const sizeClasses = {
  sm: 'py-2 pl-10 pr-4 text-sm',
  md: 'py-3 pl-12 pr-4 text-base',
  lg: 'py-4 pl-14 pr-6 text-lg',
};

const iconSizeClasses = {
  sm: 'w-4 h-4 left-3',
  md: 'w-5 h-5 left-4',
  lg: 'w-6 h-6 left-5',
};

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  onChange,
  defaultValue = '',
  size = 'md',
  className,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onChange?.(value);
    },
    [onChange]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(query);
    },
    [onSearch, query]
  );

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-gray-400',
          iconSizeClasses[size]
        )}
      />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full rounded-xl border border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
          'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'outline-none transition-all',
          sizeClasses[size]
        )}
      />
    </form>
  );
}

export default SearchBar;
