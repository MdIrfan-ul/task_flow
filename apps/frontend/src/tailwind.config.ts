import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // ─── Colors (from Stitch design) ───────────────────────────────
            colors: {
                // Backgrounds & surfaces
                background: "#faf8ff",
                surface: "#faf8ff",
                "surface-bright": "#faf8ff",
                "surface-dim": "#d2d9f4",
                "surface-variant": "#dae2fd",
                "surface-tint": "#0053db",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f2f3ff",
                "surface-container": "#eaedff",
                "surface-container-high": "#e2e7ff",
                "surface-container-highest": "#dae2fd",

                // On-surface (text colors)
                "on-surface": "#131b2e",
                "on-surface-variant": "#434655",
                "on-background": "#131b2e",
                "inverse-surface": "#283044",
                "inverse-on-surface": "#eef0ff",

                // Primary (blue)
                primary: "#004ac6",
                "on-primary": "#ffffff",
                "primary-container": "#2563eb",
                "on-primary-container": "#eeefff",
                "primary-fixed": "#dbe1ff",
                "primary-fixed-dim": "#b4c5ff",
                "on-primary-fixed": "#00174b",
                "on-primary-fixed-variant": "#003ea8",
                "inverse-primary": "#b4c5ff",

                // Secondary (indigo)
                secondary: "#4648d4",
                "on-secondary": "#ffffff",
                "secondary-container": "#6063ee",
                "on-secondary-container": "#fffbff",
                "secondary-fixed": "#e1e0ff",
                "secondary-fixed-dim": "#c0c1ff",
                "on-secondary-fixed": "#07006c",
                "on-secondary-fixed-variant": "#2f2ebe",

                // Tertiary (purple — used for AI features)
                tertiary: "#7a1bc8",
                "on-tertiary": "#ffffff",
                "tertiary-container": "#943fe2",
                "on-tertiary-container": "#faecff",
                "tertiary-fixed": "#f0dbff",
                "tertiary-fixed-dim": "#ddb7ff",
                "on-tertiary-fixed": "#2c0051",
                "on-tertiary-fixed-variant": "#6900b3",

                // Error (red)
                error: "#ba1a1a",
                "on-error": "#ffffff",
                "error-container": "#ffdad6",
                "on-error-container": "#93000a",

                // Outline / borders
                outline: "#737686",
                "outline-variant": "#c3c6d7",
            },

            // ─── Border radius ─────────────────────────────────────────────
            borderRadius: {
                sm: "0.25rem",   // 4px
                DEFAULT: "0.5rem",    // 8px
                md: "0.75rem",   // 12px — main card radius
                lg: "1rem",      // 16px — modals / overlays
                xl: "1.5rem",    // 24px — large containers
                full: "9999px",    // pill buttons & badges
            },

            // ─── Spacing ───────────────────────────────────────────────────
            spacing: {
                "stack-sm": "8px",
                "stack-md": "16px",
                "stack-lg": "24px",
                "gutter": "24px",
                "margin-mobile": "16px",
                "margin-desktop": "32px",
                "sidebar-width": "260px",
                "header-height": "64px",
            },

            // ─── Font family ───────────────────────────────────────────────
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },

            // ─── Font sizes with line-height & weight built in ─────────────
            fontSize: {
                "display-lg": ["48px", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],
                "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "-0.02em" }],
                "headline-lg-mobile": ["24px", { lineHeight: "1.2", fontWeight: "600" }],
                "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
                "headline-sm": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
                "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
                "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
                "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
                "label-md": ["14px", { lineHeight: "1", fontWeight: "500", letterSpacing: "0.01em" }],
                "label-sm": ["12px", { lineHeight: "1", fontWeight: "600" }],
            },

            // ─── Box shadows ───────────────────────────────────────────────
            boxShadow: {
                card: "0px 4px 20px rgba(0, 0, 0, 0.04)",   // Level 2 — cards
                overlay: "0px 8px 40px rgba(0, 0, 0, 0.08)",   // Level 3 — modals
            },

            // ─── Background image (AI gradient) ───────────────────────────
            backgroundImage: {
                "ai-gradient": "linear-gradient(135deg, #7a1bc8, #0053db, #2563eb)",
            },
        },
    },
    plugins: [],
};

export default config;