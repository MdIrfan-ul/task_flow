// import { redirect } from "next/navigation";

// export default function RootPage() {
//   redirect("/dashboard");
// }

"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#faf8ff", color: "#131b2e", minHeight: "100vh" }}>

      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(250,248,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(195,198,215,0.3)", height: 64, display: "flex", alignItems: "center", padding: "0 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#004ac6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SparkIcon />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#131b2e" }}>TaskFlow</span>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Features", "Pricing", "Blog", "Docs"].map((link) => (
              <a key={link} href="#" style={{ fontSize: 14, color: "#434655", textDecoration: "none", fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#004ac6")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#434655")}>
                {link}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => router.push("/login")}
              style={{ fontSize: 14, fontWeight: 500, color: "#131b2e", background: "none", border: "none", cursor: "pointer", padding: "8px 16px" }}>
              Sign in
            </button>
            <button onClick={() => router.push("/register")}
              style={{ fontSize: 14, fontWeight: 500, color: "white", background: "#004ac6", border: "none", borderRadius: 9999, cursor: "pointer", padding: "10px 24px", transition: "all 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,74,198,0.3)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
              Start for Free
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <header style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 32px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 9999, background: "#eaedff", border: "1px solid rgba(195,198,215,0.4)", width: "fit-content" }}>
            <SparkIcon color="#7a1bc8" size={14} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#7a1bc8", letterSpacing: "0.05em", textTransform: "uppercase" }}>AI Task Engine v2.0</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#131b2e", margin: 0 }}>
            The Future of Work is{" "}
            <span style={{ background: "linear-gradient(135deg, #004ac6, #7a1bc8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI-Driven
            </span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.6, color: "#434655", maxWidth: 480, margin: 0 }}>
            Transform chaotic workflows into instant project plans. Automate task distribution, predict bottlenecks, and focus on high-impact results.
          </p>

          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={() => router.push("/register")}
              style={{ fontSize: 15, fontWeight: 600, color: "white", background: "#004ac6", border: "none", borderRadius: 12, cursor: "pointer", padding: "16px 32px", boxShadow: "0 8px 32px rgba(0,74,198,0.25)", transition: "all 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}>
              Start for Free
            </button>
            <button style={{ fontSize: 15, fontWeight: 600, color: "#131b2e", background: "transparent", border: "1px solid #c3c6d7", borderRadius: 12, cursor: "pointer", padding: "16px 32px", transition: "all 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eaedff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
              Book a Demo
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, paddingTop: 24, borderTop: "1px solid rgba(195,198,215,0.3)", marginTop: 8 }}>
            {[["99.9%", "Uptime"], ["50k+", "Users"], ["4.9★", "Rating"]].map(([val, label], i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#131b2e" }}>{val}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#737686", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero image card */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,74,198,0.12) 0%, rgba(122,27,200,0.08) 60%, transparent 100%)", borderRadius: "50%", filter: "blur(60px)", transform: "scale(1.2)" }} />
          <div style={{
            position: "relative",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: 16,
            padding: 8,
            border: "1px solid rgba(195,198,215,0.3)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
            transform: "rotate(1deg)",
          }}>
            {/* AI gradient border glow */}
            <div style={{ position: "absolute", inset: -1, borderRadius: 17, background: "linear-gradient(135deg, #004ac6, #7a1bc8)", opacity: 0.2, zIndex: -1 }} />
            <div style={{ background: "#f2f3ff", borderRadius: 10, padding: 24, minHeight: 320, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Mock UI */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "white", borderRadius: 10, border: "1px solid #e2e7ff" }}>
                <SparkIcon color="#7a1bc8" size={14} />
                <span style={{ fontSize: 13, color: "#434655" }}>Build a SaaS onboarding flow with email, OAuth...</span>
              </div>
              {[
                { title: "Design Database Schema", priority: "HIGH", color: "#ffdad6", textColor: "#93000a" },
                { title: "Auth Flow UI/UX", priority: "MEDIUM", color: "#f0dbff", textColor: "#2c0051" },
                { title: "JWT Implementation", priority: "HIGH", color: "#ffdad6", textColor: "#93000a" },
                { title: "Performance Audit", priority: "LOW", color: "#e2e7ff", textColor: "#003ea8" },
              ].map((task, i) => (
                <div key={i} style={{ background: "white", borderRadius: 10, padding: "12px 14px", border: "1px solid #e2e7ff", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid #c3c6d7", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#131b2e", flex: 1 }}>{task.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: task.color, color: task.textColor }}>
                    {task.priority}
                  </span>
                </div>
              ))}
              <button style={{ background: "linear-gradient(135deg, #004ac6, #4648d4)", color: "white", border: "none", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <SparkIcon size={13} /> Generate Project Plan
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Features bento grid ────────────────────────────── */}
      <section style={{ background: "white", padding: "96px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: "#131b2e", letterSpacing: "-0.02em", marginBottom: 16 }}>
              Built for Modern High-Velocity Teams
            </h2>
            <p style={{ fontSize: 16, color: "#434655", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
              Precision engineering meets artificial intelligence. Manage projects at the speed of thought.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
            {/* AI Task Generation — 8 cols */}
            <div style={{ gridColumn: "span 8", background: "white", border: "1px solid rgba(195,198,215,0.4)", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 20, transition: "border-color 0.3s", cursor: "default" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,74,198,0.4)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,74,198,0.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(195,198,215,0.4)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,74,198,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SparkIcon color="#004ac6" size={22} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#131b2e" }}>AI Task Generation</h3>
              <p style={{ fontSize: 15, color: "#434655", lineHeight: 1.6, maxWidth: 480 }}>
                Input a rough project brief and watch our AI decompose complex goals into actionable, prioritized sub-tasks in seconds.
              </p>
              <div style={{ background: "#f2f3ff", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {["Set up authentication system", "Design database schema", "Build REST API endpoints"].map((t, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#131b2e", border: "1px solid #e2e7ff" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, border: "2px solid #c3c6d7" }} />
                    {t}
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 9999, background: i === 0 ? "#ffdad6" : i === 1 ? "#f0dbff" : "#e2e7ff", color: i === 0 ? "#93000a" : i === 1 ? "#2c0051" : "#003ea8" }}>
                      {i === 0 ? "HIGH" : i === 1 ? "MED" : "LOW"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Intelligent Kanban — 4 cols */}
            <div style={{ gridColumn: "span 4", background: "#004ac6", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20 }}>
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <KanbanIcon />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: "white", marginBottom: 8 }}>Intelligent Kanban</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                  Auto-balancing boards that suggest team re-assignments based on real-time workload data.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["To Do — 4", "In Progress — 2", "Done — 12"].map((col, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.9)", display: "flex", justifyContent: "space-between" }}>
                    <span>{col.split(" — ")[0]}</span>
                    <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 9999, padding: "1px 8px" }}>{col.split(" — ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Insights — 4 cols */}
            <div style={{ gridColumn: "span 4", background: "#f0dbff", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(122,27,200,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChartIcon />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#2c0051" }}>Executive Insights</h3>
              <p style={{ fontSize: 14, color: "#6900b3", lineHeight: 1.6 }}>
                Deep-dive analytics for leadership, providing project health metrics and velocity trends.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[84, 67, 91].map((pct, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "#6900b3" }}>
                      <span>{["Completion", "Velocity", "Uptime"][i]}</span>
                      <span style={{ fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(122,27,200,0.15)", borderRadius: 9999 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#7a1bc8", borderRadius: 9999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise Ready — 8 cols */}
            <div style={{ gridColumn: "span 8", background: "#faf8ff", border: "1px solid rgba(195,198,215,0.4)", borderRadius: 16, padding: 32, display: "flex", alignItems: "center", gap: 48 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: "#131b2e", marginBottom: 12 }}>Enterprise-Grade Stack</h3>
                <p style={{ fontSize: 15, color: "#434655", lineHeight: 1.6, marginBottom: 20 }}>
                  Built for performance and security using a battle-tested architecture. Zero latency project management at scale.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {[
                    { label: "Next.js", color: "#004ac6" },
                    { label: "NestJS", color: "#4648d4" },
                    { label: "MySQL", color: "#7a1bc8" },
                    { label: "OpenAI", color: "#004ac6" },
                    { label: "Sequelize", color: "#4648d4" },
                  ].map((tech) => (
                    <div key={tech.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "#eaedff", borderRadius: 9999, border: "1px solid rgba(195,198,215,0.3)", fontSize: 13, fontWeight: 500, color: "#131b2e" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: tech.color, flexShrink: 0 }} />
                      {tech.label}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flexShrink: 0, padding: 24, borderRadius: 20, background: "linear-gradient(135deg, rgba(0,74,198,0.05), rgba(122,27,200,0.05))", border: "1px solid rgba(195,198,215,0.2)" }}>
                <ShieldIcon size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Showcase ───────────────────────────────── */}
      <section style={{ padding: "96px 32px", background: "rgba(242,243,255,0.5)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 42, fontWeight: 700, color: "#131b2e", letterSpacing: "-0.02em", marginBottom: 56 }}>
            The command center for your vision.
          </h2>
          <div style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
            {/* AI gradient border */}
            <div style={{ background: "linear-gradient(135deg, #004ac6, #4648d4, #7a1bc8)", borderRadius: 20, padding: 2, boxShadow: "0 32px 80px rgba(0,74,198,0.2)" }}>
              <div style={{ background: "white", borderRadius: 18, padding: 24 }}>
                {/* Mock dashboard */}
                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, height: 320 }}>
                  {/* Sidebar mock */}
                  <div style={{ background: "#f2f3ff", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: "#004ac6" }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#131b2e" }}>TaskFlow</span>
                    </div>
                    {["Dashboard", "Workspaces", "Projects", "My Tasks", "AI Assistant"].map((item, i) => (
                      <div key={item} style={{ padding: "6px 10px", borderRadius: 8, background: i === 0 ? "#eaedff" : "transparent", fontSize: 12, color: i === 0 ? "#004ac6" : "#434655", fontWeight: i === 0 ? 600 : 400, borderLeft: i === 0 ? "2px solid #004ac6" : "2px solid transparent" }}>
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Main content mock */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {[["12", "Projects"], ["48", "Active"], ["156", "Done"], ["8", "Members"]].map(([val, label]) => (
                        <div key={label} style={{ background: "#f2f3ff", borderRadius: 10, padding: "10px 12px" }}>
                          <p style={{ fontSize: 18, fontWeight: 700, color: "#131b2e", margin: 0 }}>{val}</p>
                          <p style={{ fontSize: 10, color: "#434655", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ flex: 1, background: "#f2f3ff", borderRadius: 10, padding: 16, display: "flex", gap: 12 }}>
                      {["BACKLOG", "TO DO", "IN PROGRESS"].map((col, i) => (
                        <div key={col} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#737686", margin: 0 }}>{col}</p>
                          {[...Array(i === 0 ? 2 : 1)].map((_, j) => (
                            <div key={j} style={{ background: "white", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "#131b2e", border: "1px solid #e2e7ff" }}>
                              {["Design tokens", "Stripe API", "Landing page copy"][i * 2 + j] ?? "Task"}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating AI card left */}
            <div style={{ position: "absolute", left: -120, top: "25%", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderRadius: 14, padding: 20, width: 220, border: "1px solid rgba(195,198,215,0.4)", borderLeft: "4px solid #004ac6", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <SparkIcon color="#004ac6" size={14} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#131b2e" }}>AI Suggestion</span>
              </div>
              <p style={{ fontSize: 12, color: "#434655", lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
                "Move Database Optimization to Sprint 4 based on velocity."
              </p>
            </div>

            {/* Floating metric card right */}
            <div style={{ position: "absolute", right: -120, bottom: "25%", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderRadius: 14, padding: 20, width: 200, border: "1px solid rgba(195,198,215,0.4)", borderRight: "4px solid #7a1bc8", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#131b2e" }}>Real-time Load</span>
              </div>
              <div style={{ height: 6, background: "#eaedff", borderRadius: 9999, marginBottom: 6 }}>
                <div style={{ height: "100%", width: "75%", background: "#7a1bc8", borderRadius: 9999 }} />
              </div>
              <p style={{ fontSize: 11, color: "#434655", margin: 0, textAlign: "right" }}>75% Capacity</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA section ────────────────────────────────────── */}
      <section style={{ padding: "96px 32px", background: "linear-gradient(135deg, #004ac6 0%, #4648d4 50%, #7a1bc8 100%)", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: 42, fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: 20 }}>
            Ready to build faster?
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 40 }}>
            Join 50,000+ teams already using TaskFlow to ship projects on time and under budget.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button onClick={() => router.push("/register")}
              style={{ fontSize: 15, fontWeight: 600, color: "#004ac6", background: "white", border: "none", borderRadius: 12, cursor: "pointer", padding: "16px 40px", transition: "all 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
              Get started free
            </button>
            <button style={{ fontSize: 15, fontWeight: 600, color: "white", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, cursor: "pointer", padding: "16px 40px", transition: "all 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)"; }}>
              View demo
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer style={{ background: "white", borderTop: "1px solid rgba(195,198,215,0.4)", padding: "64px 32px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#004ac6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SparkIcon size={13} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#131b2e" }}>TaskFlow</span>
              </div>
              <p style={{ fontSize: 14, color: "#434655", lineHeight: 1.6, maxWidth: 280 }}>
                The AI-native workspace designed for high-performance teams. Build better, faster, together.
              </p>
            </div>

            {/* Links */}
            {[
              ["Product", ["AI Assistant", "Kanban Boards", "Analytics", "Integrations"]],
              ["Company", ["About Us", "Careers", "Blog", "Security"]],
              ["Connect", ["Twitter", "LinkedIn", "GitHub", "Discord"]],
              ["Legal", ["Privacy Policy", "Terms of Service", "Cookie Policy"]],
            ].map(([heading, links]) => (
              <div key={heading as string}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "#131b2e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
                  {heading as string}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(links as string[]).map((link) => (
                    <a key={link} href="#" style={{ fontSize: 14, color: "#434655", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#004ac6")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#434655")}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 24, borderTop: "1px solid rgba(195,198,215,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "#737686" }}>© 2024 TaskFlow AI. All rights reserved.</p>
            <span style={{ fontSize: 12, color: "#737686" }}>
              Status: <span style={{ color: "#004ac6", fontWeight: 700 }}>All Systems Operational</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function SparkIcon({ color = "white", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={color} />
    </svg>
  );
}

function KanbanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="18" rx="1.5" stroke="white" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="11" rx="1.5" stroke="white" strokeWidth="1.8" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V10M12 20V4M20 20v-7" stroke="#7a1bc8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L3 7v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7l-9-5z" stroke="rgba(0,74,198,0.3)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="rgba(0,74,198,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}