import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconColor?: string;
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  className = '',
  iconColor = 'text-primary-600'
}: FeatureCardProps) {
  return (
    <div className={`group p-6 rounded-2xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 ${iconColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
