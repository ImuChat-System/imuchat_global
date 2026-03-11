import Link from 'next/link';
import { cn } from '../../utils/cn';

export interface FooterProps {
  /** Footer links organized by section */
  sections?: Array<{
    title: string;
    links: Array<{ href: string; label: string }>;
  }>;
  /** Copyright text */
  copyright?: string;
  /** Social links */
  socials?: Array<{ href: string; icon: React.ReactNode; label: string }>;
  /** Additional class names */
  className?: string;
}

export function Footer({ sections = [], copyright, socials = [], className }: FooterProps) {
  return (
    <footer className={cn('bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800', className)}>
      <div className="container mx-auto px-4 py-12">
        {/* Links sections */}
        {sections.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-800">
          {/* Copyright */}
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {copyright || `© ${new Date().getFullYear()} ImuChat. All rights reserved.`}
          </p>

          {/* Social links */}
          {socials.length > 0 && (
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {socials.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
