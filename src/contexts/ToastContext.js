import { createContext, useContext, useState } from "react";
import "../css/Toast.css"

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = "success") => {
        const id = Date.now();

        playSound(type);

        const toast = { id, message, type };
        setToasts(prev => [...prev, toast]);

        setTimeout(() => {
            removeToast(id);
        }, 3500);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Окно уведомлений */}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type}`}>
                        <span className="toast-icon">
                            {t.type === "success" && "✔️"}
                            {t.type === "error" && "❌"}
                            {t.type === "info" && "ℹ️"}
                            {t.type === "warning" && "⚠️"}
                        </span>

                        <span className="toast-message">{t.message}</span>

                        {/* Крестик закрытия */}
                        <button className="toast-close" onClick={() => removeToast(t.id)}>
                            ✖
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function playSound(type) {
    let url;

    switch (type) {
        case "success":
            url = "/sounds/success.mp3";
            break;
        case "error":
            url = "/sounds/error.mp3";
            break;
        case "warning":
            url = "/sounds/warning.mp3";
            break;
        default:
            url = "/sounds/info.mp3";
    }

    const audio = new Audio(url);
    audio.volume = 0.35;
    audio.play();
}