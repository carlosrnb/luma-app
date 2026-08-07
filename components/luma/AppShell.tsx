"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadStore } from "@/lib/store";

const NAV = [
  { icon:"🏠", label:"Início",   href:"/home" },
  { icon:"💬", label:"Chat",     href:"/chat" },
  { icon:"📚", label:"Conteúdo", href:"/conteudo" },
  { icon:"⚙️", label:"Ajustes", href:"/ajustes" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [parentName, setParentName] = useState("");
  const [babyName, setBabyName]     = useState("");

  useEffect(() => {
    const store = loadStore();
    if (store.family) {
      setParentName(store.family.parentName);
      setBabyName(store.family.baby.name);
    }
  }, []);

  function go(href: string) { if (href !== "#") router.push(href); }
  function isActive(href: string) {
    if (href === "/home") return pathname === "/home";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const initial = parentName ? parentName[0].toUpperCase() : "?";

  return (
    <div className="app-shell">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">lu<span>m</span>a</div>
        <div className="sidebar-tagline">Seu copiloto familiar</div>

        <div className="sidebar-section">Menu</div>
        {NAV.map(item => (
          <button key={item.href} onClick={() => go(item.href)}
            className={`sidebar-item${isActive(item.href) ? " active" : ""}`}>
            <span className="s-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="sidebar-section" style={{ marginTop:16 }}>Módulos</div>
        {[
          { icon:"🥣", label:"Alimentação",  href:"/alimentacao" },
          { icon:"📏", label:"Crescimento",  href:"/crescimento" },
          { icon:"💉", label:"Vacinação",    href:"/vacinacao" },
          { icon:"🩺", label:"Consultas",    href:"/consultas" },
        ].map(item => (
          <button key={item.href} onClick={() => go(item.href)}
            className={`sidebar-item${isActive(item.href) ? " active" : ""}`}>
            <span className="s-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <button onClick={() => go("/registro")}
          className="sidebar-item"
          style={{ marginTop:12, background:"var(--sage)", color:"var(--sage-dk)" }}>
          <span className="s-icon">✏️</span>
          Registrar
        </button>

        {parentName && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div>
              <div className="sidebar-user-name">{parentName.split(" ")[0]}</div>
              <div className="sidebar-user-sub">Família do {babyName}</div>
            </div>
          </div>
        )}
      </aside>

      {/* ── PHONE FRAME ── */}
      <div className="app-frame">
        <div className="app-phone">
          <div className="app-scroll">
            {children}
          </div>

          {/* ── BOTTOM NAV ── */}
          <nav className="bottom-nav">
            {NAV.map(item => {
              const active = isActive(item.href);
              return (
                <button key={item.href} onClick={() => go(item.href)}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center",
                    gap:3, padding:"4px 10px", border:"none", background:"none",
                    cursor:"pointer", opacity: active ? 1 : 0.38, transition:"opacity 0.2s",
                  }}>
                  <span style={{ fontSize:20 }}>{item.icon}</span>
                  <span style={{ fontSize:10, fontWeight:600, fontFamily:"Inter,sans-serif",
                                 color: active ? "var(--sage-dk)" : "var(--ink)" }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            <button onClick={() => go("/registro")}
              style={{
                width:50, height:50, borderRadius:"50%",
                background:"var(--ink)", border:"3px solid var(--bg)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:19, marginTop:-18, cursor:"pointer", flexShrink:0,
                boxShadow:"0 4px 14px rgba(38,35,30,0.22)",
              }}>✏️</button>
          </nav>
        </div>
      </div>
    </div>
  );
}
