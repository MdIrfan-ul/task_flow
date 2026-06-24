import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "inline-flex items-center justify-center gap-2 bg-error text-on-error rounded-full font-medium transition-all duration-150 cursor-pointer hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-label-sm",
    md: "px-5 py-2.5 text-label-md",
    lg: "px-6 py-3 text-body-md",
};

export default function Button({
    variant = "primary",
    size = "md",
    isLoading = false,
    icon,
    iconPosition = "left",
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <Spinner />
                    {children}
                </span>
            ) : (
                <>
                    {icon && iconPosition === "left" && icon}
                    {children}
                    {icon && iconPosition === "right" && icon}
                </>
            )}
        </button>
    );
}

function Spinner() {
    return (
        <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
        </svg>
    );
}