import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    
    if (langCode === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = langCode;
    }
    
    setIsOpen(false);
  };

  const languages = [
    { code: 'en', name: 'English', flagUrl: 'https://flagcdn.com/w20/gb.png' },
    { code: 'fr', name: 'Français', flagUrl: 'https://flagcdn.com/w20/fr.png' },
    { code: 'ar', name: 'العربية', flagUrl: 'https://flagcdn.com/w20/ma.png' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
      >
        <Globe className="h-4 w-4" />
        <img src={currentLang.flagUrl} alt={currentLang.name} className="w-5 h-5 rounded-sm" />
        {/* <span className="text-xs text-gray-500">{currentLang.code.toUpperCase()}</span> */}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition ${
                i18n.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <img src={lang.flagUrl} alt={lang.name} className="w-5 h-5 rounded-sm" />
              <span className="flex-1 text-left">{lang.name}</span>
              {i18n.language === lang.code && (
                <span className="text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;