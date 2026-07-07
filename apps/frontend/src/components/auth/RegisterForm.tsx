"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../ui/Input";
import Button from "../ui/Button";

interface FormState {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export default function RegisterForm() {
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, loginWithOAuth } = useAuth();

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Name is required";
        } else if (form.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (!form.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!form.password) {
            newErrors.password = "Password is required";
        } else if (form.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setServerError(null);
        setIsLoading(true);

        try {
            await register({
                name: form.name.trim(),
                email: form.email,
                password: form.password,
            });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Something went wrong. Try again.";
            setServerError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const update =
        (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm((f) => ({ ...f, [field]: e.target.value }));
            // Clear field error on change
            if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
        };

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
                <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
                    <SparkIcon />
                </div>
                <div>
                    <p className="text-body-md font-semibold text-on-surface leading-tight">
                        TaskFlow
                    </p>
                    <p className="text-label-sm text-on-surface-variant leading-tight">
                        AI-Powered PM
                    </p>
                </div>
            </div>

            <h1 className="text-headline-md text-on-surface mb-1">Create an account</h1>
            <p className="text-body-sm text-on-surface-variant mb-7">
                Get started with TaskFlow for free
            </p>

            {/* OAuth buttons */}
            <div className="flex flex-col gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => loginWithOAuth("google")}
                    className="btn-secondary w-full flex items-center justify-center gap-2.5"
                >
                    <GoogleIcon />
                    Continue with Google
                </button>
                <button
                    type="button"
                    onClick={() => loginWithOAuth("github")}
                    className="btn-secondary w-full flex items-center justify-center gap-2.5"
                >
                    <GitHubIcon />
                    Continue with GitHub
                </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-outline-variant/40" />
                <span className="text-label-sm text-on-surface-variant">or</span>
                <div className="flex-1 h-px bg-outline-variant/40" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Full name"
                    type="text"
                    name="name"
                    placeholder="Alex Rivera"
                    value={form.name}
                    onChange={update("name")}
                    error={errors.name}
                    autoComplete="name"
                    autoFocus
                />

                <Input
                    label="Email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={update("email")}
                    error={errors.email}
                    autoComplete="email"
                />

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={update("password")}
                    error={errors.password}
                    autoComplete="new-password"
                    hint={!errors.password ? "At least 8 characters" : undefined}
                />

                <Input
                    label="Confirm password"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                />

                {serverError && (
                    <p className="text-label-md text-error bg-error-container/40 px-3 py-2 rounded-md">
                        {serverError}
                    </p>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="w-full mt-1"
                >
                    Create account
                </Button>

                <p className="text-label-sm text-on-surface-variant text-center">
                    By signing up, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                    </Link>
                </p>
            </form>

            <p className="text-body-sm text-on-surface-variant text-center mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </p>
        </div>
    );
}

function SparkIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
    );
}