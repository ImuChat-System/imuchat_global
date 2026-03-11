import Link from 'next/link';
import { cn } from '../../utils/cn';

export interface ArticleCardProps {
  /** Article title */
  title: string;
  /** Article description/excerpt */
  description?: string;
  /** Link to full article */
  href: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Category label */
  category?: string;
  /** Reading time in minutes */
  readingTime?: number;
  /** Card variant */
  variant?: 'default' | 'compact' | 'featured';
  /** Additional class names */
  className?: string;
}

export function ArticleCard({
  title,
  description,
  href,
  icon,
  category,
  readingTime,
  variant = 'default',
  className,
}: ArticleCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg',
          'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
          className
        )}
      >
        {icon && (
          <span className="flex-shrink-0 text-primary-600 dark:text-primary-400">
            {icon}
          </span>
        )}
        <span className="text-gray-900 dark:text-white font-medium">{title}</span>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={href}
        className={cn(
          'block p-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600',
          'text-white hover:from-primary-600 hover:to-primary-700 transition-all',
          'shadow-lg hover:shadow-xl',
          className
        )}
      >
        {icon && (
          <span className="inline-block mb-4 text-white/80">{icon}</span>
        )}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        {description && (
          <p className="text-white/80 text-sm">{description}</p>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'block p-4 rounded-xl border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600',
        'hover:shadow-md transition-all group',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex-shrink-0 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          {category && (
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wide">
              {category}
            </span>
          )}
          <h3 className="text-gray-900 dark:text-white font-semibold mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
              {description}
            </p>
          )}
          {readingTime && (
            <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 inline-block">
              {readingTime} min read
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
