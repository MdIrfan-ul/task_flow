"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
    ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const typeClasses: Record<ToastType, string> = {
    success: "bg-secondary-fixed text-on-secondary-fixed",
    error: "bg-error-container text-on-error-container",
    info: "bg-primary-fixed text-on-primary-fixed",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {typeof document !== "undefined" &&
                createPortal(
                    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
                        {toasts.map((toast) => (
                            <div
                                key={toast.id}
                                role="alert"
                                className={`${typeClasses[toast.type]} rounded-md px-4 py-3 shadow-overlay text-body-sm flex items-center justify-between gap-3 animate-[slideIn_0.2s_ease-out]`}
                            >
                                <span>{toast.message}</span>
                                <button
                                    onClick={() => dismiss(toast.id)}
                                    className="opacity-70 hover:opacity-100 transition-opacity"
                                    aria-label="Dismiss notification"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}