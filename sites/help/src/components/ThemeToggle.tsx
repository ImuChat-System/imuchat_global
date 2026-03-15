'use client';
import { Sun, Moon, Contrast } from 'lucide-react';
import { useTheme, type Theme } from '@/providers/ThemeProvider';

const THEMES: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun size={16} />, label: 'Clair' },
  { value: 'dark', icon: <Moon size={16} />, label: 'Sombre' },
  { value: 'high-contrast', icon: <Contrast size={16} />, label: 'Contraste' },
];

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const idx = THEMES.findIndex(t => t.value === theme);
  const current = THEMES[idx] ?? THEMES[0];
  const next = THEMES[(idx + 1) % THEMES.length];

  return (
    <button
      onClick={() => setTheme(next.value)}
      className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 flex items-center gap-1.5 text-sm ${className}`}
      title={`Mode ${next.label}`}
      aria-label={`Passer en mode ${next.label}`}
    >
      {current.icon}
    </button>
  );
}
