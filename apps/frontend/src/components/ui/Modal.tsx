"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg";
    footer?: ReactNode;
}

const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
};

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    footer,
}: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEsc);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                className={`w-full ${sizeClasses[size]} bg-surface-container-lowest rounded-lg shadow-overlay max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
                        <h2 id="modal-title" className="text-headline-sm text-on-surface">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-on-surface-variant hover:text-on-surface transition-colors"
                            aria-label="Close modal"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                )}
                <div className="px-6 py-5 overflow-y-auto scrollbar-thin flex-1">
                    {children}
                </div>
                {footer && (
                    <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}