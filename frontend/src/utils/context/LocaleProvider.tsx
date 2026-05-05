import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { vi, TranslationKeys } from '@/utils/i18n/vi';
import { en } from '@/utils/i18n/en';
import { th } from '@/utils/i18n/th';
import { km } from '@/utils/i18n/km';
import { id } from '@/utils/i18n/id';

export type Lang = 'vi' | 'en' | 'th' | 'km' | 'id';

interface LocaleContextType {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: TranslationKeys;
}

const translations: Record<Lang, TranslationKeys> = { vi, en, th, km, id };

const LocaleContext = createContext<LocaleContextType>({
    lang: 'vi',
    setLang: () => { },
    t: vi,
});

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Lang>(
        () => (localStorage.getItem('lang') as Lang) || 'vi'
    );

    const setLang = useCallback((l: Lang) => {
        setLangState(l);
        localStorage.setItem('lang', l);
    }, []);

    return (
        <LocaleContext.Provider value={{ lang, setLang, t: translations[lang] }}>
            {children}
        </LocaleContext.Provider>
    );
};
