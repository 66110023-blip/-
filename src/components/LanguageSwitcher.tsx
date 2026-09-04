import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'compact' | 'dropdown' | 'full';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-bold ${
          language === 'th'
            ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
        } ${className}`}
        title="Switch Language"
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <span className="font-mono">{language.toUpperCase()}</span>
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1] ${className}`}>
        <button
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-white text-[#0284c7] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <span className="text-sm">🇬🇧</span>
          <span>English</span>
        </button>
        <button
          onClick={() => setLanguage('th')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            language === 'th'
              ? 'bg-white text-[#0284c7] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <span className="text-sm">🇹🇭</span>
          <span>TH</span>
        </button>
      </div>
    );
  }

  // Default 'pill' toggle
  return (
    <div
      className={`inline-flex items-center bg-slate-100 hover:bg-slate-200/80 p-0.5 rounded-xl border border-slate-300/80 transition-all shadow-2xs ${className}`}
      title="Switch Language (EN / TH)"
    >
      <button
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-white text-sky-700 shadow-xs ring-1 ring-slate-900/5'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <span className="text-xs">🇬🇧</span>
        <span>EN</span>
      </button>

      <button
        onClick={() => setLanguage('th')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          language === 'th'
            ? 'bg-white text-sky-700 shadow-xs ring-1 ring-slate-900/5'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <span className="text-xs">🇹🇭</span>
        <span>TH</span>
      </button>
    </div>
  );
};
