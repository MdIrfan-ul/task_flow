"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
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
    success: "bg-[#e1e0ff] text-[#07006c]",
    error: "bg-[#ffdad6] text-[#93000a]",
    info: "bg-[#dbe1ff] text-[#00174b]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [mounted, setMounted] = useState(false);

    // Only render portal after mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

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
            {mounted &&
                createPortal(
                    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
                        {toasts.map((toast) => (
                            <div
                                key={toast.id}
                                role="alert"
                                className={`${typeClasses[toast.type]} rounded-md px-4 py-3 shadow-[0px_8px_40px_rgba(0,0,0,0.08)] text-sm flex items-center justify-between gap-3`}
                            >
                                <span>{toast.message}</span>
                                <button
                                    onClick={() => dismiss(toast.id)}
                                    className="opacity-70 hover:opacity-100 transition-opacity"
                                    aria-label="Dismiss"
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
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}