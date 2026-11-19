import { useState, useCallback, createContext, useContext, useRef } from "react";
import style from "./Toast.module.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const addToast = useCallback((message, type = "info", duration = 3500) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className={style.container}>
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`${style.toast} ${style[t.type]}`}
                        onClick={() => removeToast(t.id)}
                    >
                        <span className={style.icon}>
                            {t.type === "success" && "✓"}
                            {t.type === "error" && "✕"}
                            {t.type === "info" && "ℹ"}
                            {t.type === "warning" && "⚠"}
                        </span>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
