import { useEffect } from 'react';
import { Heart } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-purple-500 shadow-lg shadow-rose-200 mb-4">
          <Heart className="w-7 h-7 text-white fill-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-800 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-md mx-auto">
            {subtitle}
          </p>
        )}
      </div>
      <div className="bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}
