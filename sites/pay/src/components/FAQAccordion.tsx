'use client';

import { useState } from 'react';

interface Question {
  q: string;
  a: string;
}

interface Category {
  title: string;
  questions: Question[];
}

interface FAQAccordionProps {
  categories: Category[];
}

function CategorySection({ category }: { category: Category }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
        {category.title}
      </h3>
      <div className="flex flex-col gap-2">
        {category.questions.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <span className="font-medium text-sm pr-4" style={{ color: 'var(--color-text)' }}>{item.q}</span>
              <span
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-lg font-bold transition-transform"
                style={{
                  background: 'rgba(5,150,105,0.15)',
                  color: 'var(--color-primary)',
                  transform: openIndex === idx ? 'rotate(45deg)' : 'none',
                }}
              >
                +
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-4">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FAQAccordion({ categories }: FAQAccordionProps) {
  return (
    <div>
      {categories.map((cat, i) => (
        <CategorySection key={i} category={cat} />
      ))}
    </div>
  );
}
