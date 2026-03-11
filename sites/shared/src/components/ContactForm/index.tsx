'use client';

import { Loader2, Send } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '../../utils/cn';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormProps {
  /** Called when form is submitted */
  onSubmit?: (data: ContactFormData) => Promise<void> | void;
  /** Labels for form fields */
  labels?: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    submit?: string;
    sending?: string;
    success?: string;
  };
  /** Placeholder texts */
  placeholders?: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
  /** Additional class names */
  className?: string;
}

export function ContactForm({
  onSubmit,
  labels = {},
  placeholders = {},
  className,
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        setIsSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit]
  );

  if (isSuccess) {
    return (
      <div className={cn('p-6 rounded-xl bg-green-50 dark:bg-green-900/20 text-center', className)}>
        <p className="text-green-600 dark:text-green-400 font-medium">
          {labels.success || 'Thank you! Your message has been sent.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {labels.name || 'Name'}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder={placeholders.name || 'Your name'}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {labels.email || 'Email'}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={placeholders.email || 'your@email.com'}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {labels.subject || 'Subject'}
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          placeholder={placeholders.subject || 'How can we help?'}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {labels.message || 'Message'}
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder={placeholders.message || 'Tell us more...'}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-lg',
          'bg-primary-600 hover:bg-primary-700 text-white font-medium',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-all'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {labels.sending || 'Sending...'}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {labels.submit || 'Send Message'}
          </>
        )}
      </button>
    </form>
  );
}

export default ContactForm;
