import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NavigationState {
  pathname: string;
  params: Record<string, string>;
}

interface NavigationContextType extends NavigationState {
  navigate: (path: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<string[]>(['/']);
  const [current, setCurrent] = useState('/');

  const extractParams = useCallback((pathname: string): Record<string, string> => {
    const parts = pathname.split('/').filter(Boolean);
    const params: Record<string, string> = {};
    // Simple param extraction — keys are positional
    parts.forEach((part, i) => {
      if (i > 0) params[`id${i}`] = part;
    });
    // Also set common param names
    if (parts.length >= 2) params.id = parts[parts.length - 1];
    return params;
  }, []);

  const navigate = useCallback((path: string) => {
    setHistory(prev => [...prev, current]);
    setCurrent(path);
  }, [current]);

  const goBack = useCallback(() => {
    setHistory(prev => {
      const next = [...prev];
      const last = next.pop() || '/';
      setCurrent(last);
      return next;
    });
  }, []);

  return (
    <NavigationContext.Provider value={{
      pathname: current,
      params: extractParams(current),
      navigate,
      goBack,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}

export default useNavigation;
