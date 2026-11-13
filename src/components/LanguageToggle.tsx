import React from 'react';
import localesData from '../data/locales.json';
import { useI18n, SupportedLocale } from '../utils/i18n';

export type { SupportedLocale };

export interface LocaleStrings {
  title: string;
  blood_group: string;
  critical_allergies: string;
  medical_conditions: string;
  active_medications: string;
  emergency_contacts: string;
  call_primary: string;
  bystander_instruction: string;
}

export const getLocaleStrings = (locale: string): LocaleStrings => {
  const typedLocales = localesData as Record<string, LocaleStrings>;
  return typedLocales[locale] || typedLocales.en;
};

interface LanguageToggleProps {
  currentLang?: SupportedLocale;
  onLanguageChange?: (lang: SupportedLocale) => void;
  size?: 'sm' | 'md';
  variant?: 'dark' | 'light';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLang: propLang,
  onLanguageChange: propOnChange,
  size = 'md',
  variant = 'dark'
}) => {
  const i18n = useI18n();
  const currentLang = propLang || i18n.currentLang;
  const onLanguageChange = propOnChange || i18n.setLanguage;

  const languages: { code: SupportedLocale; label: string; sub: string }[] = [
    { code: 'en', label: 'EN', sub: 'English' },
    { code: 'ml', label: 'മലയാളം', sub: 'Malayalam' },
    { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
    { code: 'mr', label: 'मराठी', sub: 'Marathi' },
    { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
    { code: 'bn', label: 'বাংলা', sub: 'Bengali' },
    { code: 'te', label: 'తెలుగు', sub: 'Telugu' }
  ];

  const containerClasses = variant === 'light'
    ? 'inline-flex items-center p-1 rounded-2xl bg-orange-100/70 border border-[#DC7009]/30 shadow-inner'
    : 'inline-flex items-center p-1 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 shadow-inner';

  return (
    <div
      id="emergency-language-toggle"
      className={containerClasses}
    >
      {languages.map(lang => {
        const isActive = currentLang === lang.code;
        return (
          <button
            key={lang.code}
            id={`lang-btn-${lang.code}`}
            type="button"
            onClick={() => onLanguageChange(lang.code)}
            className={`transition-all rounded-xl font-black text-center relative flex items-center justify-center ${
              size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs sm:text-sm'
            } ${
              isActive
                ? variant === 'light'
                  ? 'bg-[#DC7009] text-white shadow-md scale-100'
                  : 'bg-white text-[#1A0E06] shadow-md scale-100'
                : variant === 'light'
                  ? 'text-gray-700 hover:text-gray-900 hover:bg-orange-200/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title={`Switch language to ${lang.sub}`}
          >
            <span>{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
};
