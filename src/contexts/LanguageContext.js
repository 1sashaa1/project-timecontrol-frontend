import { createContext, useState } from "react";
import { translations } from "../i18n";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(
        localStorage.getItem("lang") || "ru"
    );

    const t = translations[language];

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("lang", lang);
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}
