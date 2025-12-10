import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "system"
    );

    const applyTheme = (t) => {
        let finalTheme = t;

        if (t === "system") {
            finalTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }

        document.documentElement.setAttribute("data-theme", finalTheme);
    };

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // если меняется системная тема — тоже меняем
    useEffect(() => {
        if (theme !== "system") return;

        const listener = (e) => {
            applyTheme("system");
        };

        window.matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", listener);

        return () =>
            window.matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", listener);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
