import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Show home icon */
  showHome?: boolean;
  /** Home label for screen readers */
  homeLabel?: string;
  /** Additional class names */
  className?: string;
}

export function Breadcrumb({
  items,
  showHome = true,
  homeLabel = 'Home',
  className,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      {showHome && (
        <>
          <Link
            href="/"
            className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={homeLabel}
          >
            <Home className="w-4 h-4" />
          </Link>
          {items.length > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumb;
