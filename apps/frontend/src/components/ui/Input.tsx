import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className = "", id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-label-md text-on-surface mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`input-field ${error ? "border-error" : ""} ${className}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-label-sm text-error">
                        {error}
                    </p>
                )}
                {!error && hint && (
                    <p className="mt-1 text-label-sm text-on-surface-variant">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className = "", id, ...props }, ref) => {
        const textareaId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-label-md text-on-surface mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`input-field resize-none ${error ? "border-error" : ""} ${className}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${textareaId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${textareaId}-error`} className="mt-1 text-label-sm text-error">
                        {error}
                    </p>
                )}
                {!error && hint && (
                    <p className="mt-1 text-label-sm text-on-surface-variant">{hint}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";