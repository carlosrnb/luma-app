"use client";
import { useRouter, usePathname } from "next/navigation";

const NAV = [
  { icon: "🏠", label: "Início",      href: "/home" },
  { icon: "📈", label: "Evolução",    href: "/desenvolvimento" },
  { icon: null, label: "",             href: "/registro" },
  { icon: "📚", label: "Conteúdo",   href: "#" },
  { icon: "⚙️", label: "Ajustes",    href: "#" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  function go(href: string) {
    if (href !== "#") router.push(href);
  }

  return (
    <div className="app-shell">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">lu<span>m</span>a</div>
        {NAV.map((item, i) => {
          if (!item.icon) return (
            <button key={i} onClick={() => go(item.href)}
              className="sidebar-item"
              style={{ background: "var(--ink)", color: "white", marginTop: 8 }}>
              <span className="s-icon">✏️</span> Registrar
            </button>
          );
          const active = pathname.startsWith(item.href) && item.href !== "#";
          return (
            <button key={i} onClick={() => go(item.href)}
              className={`sidebar-item${active ? " active" : ""}`}>
              <span className="s-icon">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </aside>

      {/* ── MAIN CONTENT (phone frame on desktop) ── */}
      <main className="app-main">
        {children}

        {/* ── BOTTOM NAV (mobile only) ── */}
        <nav className="bottom-nav">
          {NAV.map((item, i) => {
            if (!item.icon) return (
              <button key={i} onClick={() => go(item.href)}
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "var(--ink)", border: "4px solid var(--bg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, marginTop: -20, cursor: "pointer", flexShrink: 0,
                  boxShadow: "0 4px 16px rgba(38,35,30,0.25)"
                }}>✏️</button>
            );
            const active = pathname.startsWith(item.href) && item.href !== "#";
            return (
              <button key={i} onClick={() => go(item.href)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 3, padding: "4px 12px", border: "none", background: "none",
                  cursor: "pointer", opacity: active ? 1 : 0.38,
                  transition: "opacity 0.18s"
                }}>
                <span style={{ fontSize: 21 }}>{item.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: active ? "var(--sage-dk)" : "var(--ink)",
                  fontFamily: "Inter, sans-serif"
                }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
