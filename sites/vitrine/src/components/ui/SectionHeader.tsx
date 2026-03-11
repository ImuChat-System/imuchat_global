interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeader({ 
  label, 
  title, 
  description, 
  centered = true,
  className = '' 
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      {label && (
        <div className={`inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium ${centered ? 'justify-center mx-auto' : ''}`}>
          {label}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
        {title}
      </h2>
      {description && (
        <p className={`text-lg md:text-xl text-slate-600 leading-relaxed ${centered ? 'max-w-3xl mx-auto' : 'max-w-3xl'}`}>
          {description}
        </p>
      )}
    </div>
  );
}
