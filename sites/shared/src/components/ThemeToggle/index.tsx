'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../../utils/cn';

type Theme = 'light' | 'dark' | 'system';

export interface ThemeToggleProps {
  /** Default theme */
  defaultTheme?: Theme;
  /** Show system option */
  showSystemOption?: boolean;
  /** Label for screen readers */
  label?: string;
  /** Additional class names */
  className?: string;
}

export function ThemeToggle({
  defaultTheme = 'system',
  showSystemOption = true,
  label = 'Toggle theme',
  className,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const cycleTheme = () => {
    if (showSystemOption) {
      setTheme((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
    } else {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }
  };

  if (!mounted) {
    return (
      <button
        className={cn(
          'p-2 rounded-lg text-gray-600 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
          className
        )}
        aria-label={label}
      >
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'p-2 rounded-lg text-gray-600 dark:text-gray-300',
        'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
        className
      )}
      aria-label={label}
      title={theme.charAt(0).toUpperCase() + theme.slice(1)}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

export default ThemeToggle;
