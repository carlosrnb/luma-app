"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, saveStore, loadProStatus, type Family } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";

export default function AjustesPage() {
  const router = useRouter();
  const [family, setFamily]       = useState<Family | null>(null);
  const [isPro, setIsPro]         = useState(false);
  const [editing, setEditing]     = useState<"parent"|"baby"|null>(null);
  const [parentName, setParentName] = useState("");
  const [babyName, setBabyName]   = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    setFamily(store.family);
    setParentName(store.family.parentName);
    setBabyName(store.family.baby.name);
    setBirthDate(store.family.baby.birthDate);
    setIsPro(loadProStatus().isPro);

    // Re-read pro status when user returns to this tab (e.g. after /pro page)
    function onFocus() { setIsPro(loadProStatus().isPro); }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") setIsPro(loadProStatus().isPro);
    });
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  function saveName(field: "parent" | "baby") {
    if (!family) return;
    const updated: Family = field === "parent"
      ? { ...family, parentName }
      : { ...family, baby: { ...family.baby, name: babyName, birthDate } };
    const store = loadStore();
    saveStore({ ...store, family: updated });
    setFamily(updated);
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetApp() {
    if (!confirm("Tem certeza? Todos os dados serão apagados.")) return;
    localStorage.clear();
    router.replace("/onboarding");
  }

  if (!family) return null;

  const inp: React.CSSProperties = {
    width:"100%", background:"var(--bg)", borderRadius:12, padding:"11px 14px",
    fontSize:14, color:"var(--ink)", outline:"none", border:"2px solid transparent",
    fontFamily:"Inter,sans-serif", transition:"border-color 0.2s",
  };

  function Section({ title, children }: { title:string; children:React.ReactNode }) {
    return (
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                    letterSpacing:"0.8px", marginBottom:10, paddingLeft:4 }}>{title}</p>
        <div style={{ background:"white", borderRadius:"var(--r)", overflow:"hidden" }}>
          {children}
        </div>
      </div>
    );
  }

  function Row({ icon, label, value, onPress, danger }: {
    icon:string; label:string; value?:string; onPress?:()=>void; danger?:boolean;
  }) {
    return (
      <button onClick={onPress}
        style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
                 border:"none", background:"none", cursor:onPress?"pointer":"default",
                 textAlign:"left", borderBottom:"1px solid var(--bg)" }}>
        <span style={{ fontSize:18, width:24, textAlign:"center", flexShrink:0 }}>{icon}</span>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:13, fontWeight:500, color: danger ? "#E07B6A" : "var(--ink)" }}>{label}</p>
          {value && <p style={{ fontSize:11, color:"var(--ink-lt)", marginTop:1 }}>{value}</p>}
        </div>
        {onPress && <span style={{ fontSize:14, color:"var(--ink-lt)", opacity:0.4 }}>›</span>}
      </button>
    );
  }

  return (
    <AppShell>
      <div style={{ padding:"20px 18px 48px" }}>

        {/* HEADER */}
        <h1 className="f-nunito" style={{ fontSize:24, fontWeight:800, color:"var(--ink)",
                                          marginBottom:4 }}>Ajustes</h1>
        <p style={{ fontSize:13, color:"var(--ink-lt)", marginBottom:22 }}>
          Gerencie sua conta e preferências
        </p>

        {/* PLAN BADGE */}
        <div style={{ marginBottom:20, background: isPro
          ? "linear-gradient(135deg,var(--lav),var(--lav-dk))"
          : "white",
          borderRadius:"var(--r)", padding:"14px 16px",
          display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:"50%",
                        background: isPro ? "rgba(255,255,255,0.25)" : "var(--lav)",
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
            ✦
          </div>
          <div style={{ flex:1 }}>
            <p className="f-nunito" style={{ fontSize:14, fontWeight:700,
                                             color: isPro ? "white" : "var(--ink)" }}>
              {isPro ? "Luma Pro ativo" : "Plano Gratuito"}
            </p>
            <p style={{ fontSize:12, color: isPro ? "rgba(255,255,255,0.65)" : "var(--ink-lt)",
                        marginTop:2 }}>
              {isPro ? "Acesso completo a todos os recursos" : "3 perguntas ao chat por dia"}
            </p>
          </div>
          {!isPro && (
            <button onClick={() => router.push("/pro")} className="f-nunito"
              style={{ background:"var(--ink)", color:"white", border:"none", borderRadius:20,
                       padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              Fazer upgrade
            </button>
          )}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* PERFIL DOS PAIS */}
          <Section title="Seu perfil">
            {editing === "parent" ? (
              <div style={{ padding:"16px" }}>
                <input value={parentName} onChange={e => setParentName(e.target.value)}
                  style={inp} placeholder="Seu nome completo"
                  onFocus={e => (e.target.style.borderColor="var(--sage-dk)")}
                  onBlur={e  => (e.target.style.borderColor="transparent")} />
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <button onClick={() => setEditing(null)}
                    style={{ flex:1, padding:"10px", borderRadius:10, border:"none",
                             background:"var(--bg)", cursor:"pointer", fontFamily:"Nunito,sans-serif",
                             fontSize:13, fontWeight:600, color:"var(--ink-mid)" }}>Cancelar</button>
                  <button onClick={() => saveName("parent")}
                    style={{ flex:2, padding:"10px", borderRadius:10, border:"none",
                             background:"var(--ink)", cursor:"pointer", fontFamily:"Nunito,sans-serif",
                             fontSize:13, fontWeight:700, color:"white" }}>Salvar</button>
                </div>
              </div>
            ) : (
              <Row icon="👤" label="Nome" value={family.parentName} onPress={() => setEditing("parent")} />
            )}
          </Section>

          {/* PERFIL DO BEBÊ */}
          <Section title="Perfil do bebê">
            {editing === "baby" ? (
              <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
                <input value={babyName} onChange={e => setBabyName(e.target.value)}
                  style={inp} placeholder="Nome do bebê"
                  onFocus={e => (e.target.style.borderColor="var(--sage-dk)")}
                  onBlur={e  => (e.target.style.borderColor="transparent")} />
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", textTransform:"uppercase",
                                  letterSpacing:"0.6px", display:"block", marginBottom:6 }}>Data de nascimento</label>
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]} style={inp}
                    onFocus={e => (e.target.style.borderColor="var(--sage-dk)")}
                    onBlur={e  => (e.target.style.borderColor="transparent")} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setEditing(null)}
                    style={{ flex:1, padding:"10px", borderRadius:10, border:"none",
                             background:"var(--bg)", cursor:"pointer", fontFamily:"Nunito,sans-serif",
                             fontSize:13, fontWeight:600, color:"var(--ink-mid)" }}>Cancelar</button>
                  <button onClick={() => saveName("baby")}
                    style={{ flex:2, padding:"10px", borderRadius:10, border:"none",
                             background:"var(--ink)", cursor:"pointer", fontFamily:"Nunito,sans-serif",
                             fontSize:13, fontWeight:700, color:"white" }}>Salvar</button>
                </div>
              </div>
            ) : (
              <>
                <Row icon="👶" label="Nome" value={family.baby.name} onPress={() => setEditing("baby")} />
                <Row icon="🎂" label="Data de nascimento"
                  value={new Date(family.baby.birthDate+"T12:00:00").toLocaleDateString("pt-BR", { day:"numeric", month:"long", year:"numeric" })}
                  onPress={() => setEditing("baby")} />
              </>
            )}
          </Section>

          {/* NAVEGAÇÃO RÁPIDA */}
          <Section title="Módulos">
            <Row icon="🥣" label="Alimentação"    onPress={() => router.push("/alimentacao")} />
            <Row icon="📏" label="Crescimento"    onPress={() => router.push("/crescimento")} />
            <Row icon="💉" label="Vacinação"      onPress={() => router.push("/vacinacao")} />
            <Row icon="🩺" label="Consultas"      onPress={() => router.push("/consultas")} />
            <Row icon="💬" label="Chat com a Luma" onPress={() => router.push("/chat")} />
            <Row icon="📄" label="Exportar relatório PDF" onPress={() => router.push("/exportar")} />
            <Row icon="🔗" label="Compartilhar app" onPress={() => {
              if (navigator.share) {
                navigator.share({ title: "Luma", text: "Acompanhe o desenvolvimento do seu filho com a Luma 🌱", url: "https://luma-familia.vercel.app" });
              } else {
                navigator.clipboard?.writeText("https://luma-familia.vercel.app");
                setSaved(true); setTimeout(() => setSaved(false), 2000);
              }
            }} />
          </Section>

          {/* APP */}
          <Section title="Sobre o app">
            <Row icon="📋" label="Termos de uso" />
            <Row icon="🔒" label="Privacidade" />
            <Row icon="⭐" label="Avaliar o app" />
            <Row icon="📨" label="Falar com o time" />
            <Row icon="ℹ️"  label="Versão" value="1.0.0" />
          </Section>

          {/* DANGER */}
          <Section title="Zona de perigo">
            <Row icon="🗑️" label="Apagar todos os dados" onPress={resetApp} danger />
          </Section>
        </div>

        {/* SAVED TOAST */}
        {saved && (
          <div className="fade-up"
            style={{ position:"fixed", bottom:100, left:"50%", transform:"translateX(-50%)",
                     background:"var(--ink)", color:"white", padding:"10px 22px",
                     borderRadius:30, fontSize:13, fontWeight:600, zIndex:200,
                     boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>
            ✓ Salvo com sucesso
          </div>
        )}
      </div>
    </AppShell>
  );
}
