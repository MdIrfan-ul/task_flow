"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiPatch, apiPost } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";

type Tab = "profile" | "workspace" | "members" | "security" | "integrations" | "billing";

const TABS: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "workspace", label: "Workspace" },
    { id: "members", label: "Members" },
    { id: "security", label: "Security" },
    { id: "integrations", label: "Integrations" },
    { id: "billing", label: "Billing" },
];

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<Tab>("security");

    return (
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--color-on-surface)", letterSpacing: "-0.02em", marginBottom: 6 }}>
                        Settings
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)" }}>
                        Manage your account preferences and security settings.
                    </p>
                </div>

                {/* User card */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ position: "relative" }}>
                        <Avatar src={user?.avatarUrl} name={user?.name ?? ""} size="md" />
                        <div style={{ position: "absolute", bottom: 0, right: 0, width: 16, height: 16, borderRadius: "50%", background: "var(--color-primary)", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{user?.name}</p>
                        <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-outline-variant)", marginBottom: 28, gap: 0, overflowX: "auto" }}>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "10px 20px",
                            fontSize: 14,
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === tab.id ? "2px solid var(--color-primary)" : "2px solid transparent",
                            marginBottom: -1,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === "profile" && <ProfileTab user={user} showToast={showToast} />}
            {activeTab === "security" && <SecurityTab showToast={showToast} logout={logout} />}
            {activeTab === "workspace" && <WorkspaceTab />}
            {activeTab === "members" && <MembersTab />}
            {activeTab === "integrations" && <IntegrationsTab />}
            {activeTab === "billing" && <BillingTab />}
        </div>
    );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({ user, showToast }: { user: any; showToast: any }) {
    const [name, setName] = useState(user?.name ?? "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiPatch(`/users/${user?.id}`, { name });
            showToast("Profile updated", "success");
        } catch {
            showToast("Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
            <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)" }}>Personal Information</h2>

                {/* Avatar upload */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Avatar src={user?.avatarUrl} name={user?.name ?? ""} size="lg" />
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-on-surface)", marginBottom: 4 }}>Profile photo</p>
                        <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginBottom: 8 }}>PNG or JPG, max 3MB</p>
                        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--color-primary)", cursor: "pointer", padding: "6px 12px", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-full)" }}>
                            Change photo
                            <input type="file" accept="image/*" style={{ display: "none" }} />
                        </label>
                    </div>
                </div>

                <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" value={user?.email ?? ""} disabled hint="Contact support to change your email" />

                <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                    Save changes
                </Button>
            </div>

            {/* Danger zone */}
            <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-error-container)", borderRadius: "var(--radius-md)", padding: "24px" }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-error)", marginBottom: 8 }}>Danger Zone</h2>
                <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginBottom: 16 }}>
                    Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                <button style={{ fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-error)", color: "var(--color-error)", background: "transparent", cursor: "pointer" }}>
                    Delete account
                </button>
            </div>
        </div>
    );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab({ showToast, logout }: { showToast: any; logout: any }) {
    const [current, setCurrent] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);

    const handleUpdatePassword = async () => {
        if (!current || !newPass || !confirm) {
            showToast("Please fill in all fields", "error");
            return;
        }
        if (newPass !== confirm) {
            showToast("Passwords don't match", "error");
            return;
        }
        if (newPass.length < 8) {
            showToast("Password must be at least 8 characters", "error");
            return;
        }
        setIsSaving(true);
        try {
            await apiPost("/auth/change-password", { currentPassword: current, newPassword: newPass });
            showToast("Password updated", "success");
            setCurrent(""); setNewPass(""); setConfirm("");
        } catch {
            showToast("Failed to update password", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Password management */}
                <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <LockIcon />
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)" }}>Password Management</h2>
                    </div>

                    <Input label="Current Password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••••••" />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Input label="New Password" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="••••••••••••" />
                        <Input label="Confirm New Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••••••" />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="primary" onClick={handleUpdatePassword} isLoading={isSaving}>
                            Update Password
                        </Button>
                    </div>
                </div>

                {/* Active Sessions */}
                <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <SessionIcon />
                            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)" }}>Active Sessions</h2>
                        </div>
                        <button onClick={() => { logout(); showToast("All sessions revoked", "success"); }}
                            style={{ fontSize: 13, fontWeight: 500, color: "var(--color-error)", background: "none", border: "none", cursor: "pointer" }}>
                            Revoke All
                        </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                            { device: "MacBook Pro 16\"", location: "San Francisco, USA", lastActive: "2 mins ago", isCurrent: true, icon: <LaptopIcon /> },
                            { device: "iPhone 15 Pro", location: "Madrid, Spain", lastActive: "Oct 12, 2023", isCurrent: false, icon: <PhoneIcon /> },
                        ].map((session, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius)", background: session.isCurrent ? "var(--color-primary-fixed)" : "transparent" }}>
                                <span style={{ color: session.isCurrent ? "var(--color-primary)" : "var(--color-on-surface-variant)", flexShrink: 0 }}>
                                    {session.icon}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-on-surface)" }}>{session.device}</p>
                                        {session.isCurrent && (
                                            <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 9999, background: "var(--color-primary)", color: "white" }}>
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                                        {session.location} · Last Active: {session.lastActive}
                                    </p>
                                </div>
                                {!session.isCurrent && (
                                    <button style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", cursor: "pointer" }}>
                                        Revoke
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Two-Factor Auth */}
                <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <ShieldIcon />
                            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)" }}>Two-Factor Auth</p>
                        </div>
                        {/* Toggle */}
                        <button
                            onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                            style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", transition: "background 0.2s", background: twoFAEnabled ? "var(--color-primary)" : "var(--color-outline-variant)", position: "relative", flexShrink: 0 }}
                        >
                            <span style={{ position: "absolute", top: 2, left: twoFAEnabled ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                        </button>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginBottom: 14, lineHeight: 1.5 }}>
                        Add an extra layer of security to your account by requiring a code from your mobile device.
                    </p>
                    <button style={{ width: "100%", fontSize: 13, fontWeight: 500, padding: "8px", borderRadius: "var(--radius)", border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", cursor: "pointer" }}>
                        Manage Auth Methods
                    </button>
                </div>

                {/* OAuth Connections */}
                <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 14 }}>OAuth Connections</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            { name: "Google", connected: true, icon: <GoogleIcon /> },
                            { name: "GitHub", connected: true, icon: <GitHubIcon /> },
                        ].map((oauth) => (
                            <div key={oauth.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {oauth.icon}
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-on-surface)" }}>{oauth.name}</p>
                                        <p style={{ fontSize: 11, color: oauth.connected ? "var(--color-secondary)" : "var(--color-on-surface-variant)" }}>
                                            {oauth.connected ? "● CONNECTED" : "Not connected"}
                                        </p>
                                    </div>
                                </div>
                                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)" }}>
                                    <UnlinkIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Analysis */}
                <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <SparkIcon />
                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)" }}>Security Analysis</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            "Your password was last changed 184 days ago. We recommend a refresh for better security.",
                            "No suspicious login attempts detected in the last 30 days.",
                        ].map((insight, i) => (
                            <p key={i} style={{ fontSize: 13, color: "var(--color-on-surface-variant)", padding: "10px 12px", background: "var(--color-surface-container-low)", borderRadius: "var(--radius)", lineHeight: 1.5 }}>
                                {insight}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Placeholder tabs ─────────────────────────────────────────────────────────

function WorkspaceTab() {
    return (
        <PlaceholderTab title="Workspace Settings" description="Configure your workspace name, avatar, and preferences." />
    );
}

function MembersTab() {
    return (
        <PlaceholderTab title="Members" description="Manage workspace members and their roles from the Workspaces page." />
    );
}

function IntegrationsTab() {
    return (
        <PlaceholderTab title="Integrations" description="Connect your favourite tools — Slack, GitHub, Figma and more. Coming soon." />
    );
}

function BillingTab() {
    return (
        <PlaceholderTab title="Billing" description="Manage your plan and payment methods. Coming soon." />
    );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
    return (
        <div style={{ textAlign: "center", padding: "80px 24px", background: "var(--color-surface-container-lowest)", border: "2px dashed var(--color-outline-variant)", borderRadius: "var(--radius-lg)" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 8 }}>{title}</p>
            <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)" }}>{description}</p>
        </div>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function LockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--color-primary)" strokeWidth="1.8" />
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function SessionIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="var(--color-primary)" strokeWidth="1.8" />
            <path d="M8 21h8M12 17v4" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L3 7v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7l-9-5z" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    );
}

function LaptopIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M0 21h24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function UnlinkIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function SparkIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="var(--color-tertiary)" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#24292e" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
    );
}