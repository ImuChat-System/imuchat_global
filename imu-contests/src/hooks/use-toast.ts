// Lightweight toast hook (replaces shadcn use-toast)
import { useState, useCallback } from 'react';

interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant }: Toast) => {
    console.log(`[${variant ?? 'default'}] ${title}: ${description}`);
    setToasts(prev => [...prev, { title, description, variant }]);
    // Auto-dismiss after 3s
    setTimeout(() => setToasts(prev => prev.slice(1)), 3000);
  }, []);

  const dismiss = useCallback(() => setToasts([]), []);

  return { toast, toasts, dismiss };
}
