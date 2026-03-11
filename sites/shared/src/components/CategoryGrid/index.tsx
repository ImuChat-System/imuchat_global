import Link from 'next/link';
import { cn } from '../../utils/cn';

export interface CategoryItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
  articleCount?: number;
}

export interface CategoryGridProps {
  /** Categories to display */
  categories: CategoryItem[];
  /** Grid columns (responsive) */
  columns?: 2 | 3 | 4;
  /** Additional class names */
  className?: string;
}

const columnClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export function CategoryGrid({
  categories,
  columns = 3,
  className,
}: CategoryGridProps) {
  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={category.href}
          className={cn(
            'flex flex-col items-center p-6 rounded-xl',
            'border border-gray-200 dark:border-gray-700',
            'bg-white dark:bg-gray-800',
            'hover:border-primary-300 dark:hover:border-primary-600',
            'hover:shadow-lg transition-all group'
          )}
        >
          {category.icon && (
            <span className="text-3xl mb-3 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {category.icon}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {category.label}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
              {category.description}
            </p>
          )}
          {category.articleCount !== undefined && (
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {category.articleCount} articles
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

export default CategoryGrid;
