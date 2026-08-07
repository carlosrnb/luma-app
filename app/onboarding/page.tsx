"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, saveStore } from "@/lib/store";

type Step = "parent" | "baby" | "done";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep]             = useState<Step>("parent");
  const [parentName, setParentName] = useState("");
  const [babyName, setBabyName]     = useState("");
  const [birthDate, setBirthDate]   = useState("");

  function handleParent() { if (parentName.trim()) setStep("baby"); }
  function handleBaby() {
    if (!babyName.trim() || !birthDate) return;
    const store = loadStore();
    saveStore({ ...store, family: { parentName: parentName.trim(), baby: { name: babyName.trim(), birthDate }, onboarded: true }});
    setStep("done");
    setTimeout(() => router.replace("/home"), 1500);
  }

  const inp: React.CSSProperties = {
    width:"100%", background:"white", borderRadius:14, padding:"14px 18px",
    fontSize:15, color:"var(--ink)", outline:"none",
    border:"2px solid transparent", fontFamily:"Inter,sans-serif",
    transition:"border-color 0.2s",
  };

  return (
    /* full viewport, centered both axes on desktop */
    <div style={{
      minHeight:"100dvh", background:"var(--bg)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      {/* card container — phone-width on desktop */}
      <div style={{
        width:"100%", maxWidth:430,
        minHeight:"100dvh",
        display:"flex", flexDirection:"column",
        padding:"0 28px",
      }}>
        {/* accent bar */}
        <div style={{ height:3, background:"var(--sage-dk)", borderRadius:"0 0 6px 6px",
                      marginBottom:0, flexShrink:0 }} />

        {/* content */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
                      paddingTop:40, paddingBottom:40 }}>
          {/* logo */}
          <div style={{ marginBottom:48 }}>
            <p className="f-nunito" style={{ fontSize:32, fontWeight:800, color:"var(--ink)",
                                            letterSpacing:"-0.5px", marginBottom:4 }}>
              lu<span style={{ color:"var(--sage-dk)" }}>m</span>a
            </p>
            <p style={{ fontSize:13, color:"var(--ink-lt)" }}>Seu copiloto para a infância</p>
          </div>

          {step === "parent" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div>
                <h1 className="f-nunito" style={{ fontSize:28, fontWeight:800, color:"var(--ink)",
                                                  lineHeight:1.2, marginBottom:6 }}>
                  Olá! Qual é o<br />seu nome?
                </h1>
                <p style={{ fontSize:13, color:"var(--ink-lt)" }}>Vamos começar nos conhecendo.</p>
              </div>
              <input autoFocus style={inp} placeholder="Seu nome" value={parentName}
                onChange={e => setParentName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleParent()}
                onFocus={e => (e.target.style.borderColor="var(--sage-dk)")}
                onBlur={e  => (e.target.style.borderColor="transparent")} />
              <button onClick={handleParent} disabled={!parentName.trim()} className="f-nunito"
                style={{ width:"100%", background:"var(--ink)", color:"white", fontSize:15,
                         fontWeight:700, padding:"15px", borderRadius:14, border:"none",
                         cursor:parentName.trim()?"pointer":"default",
                         opacity:parentName.trim()?1:0.3, transition:"opacity 0.2s" }}>
                Continuar →
              </button>
            </div>
          )}

          {step === "baby" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div>
                <h1 className="f-nunito" style={{ fontSize:28, fontWeight:800, color:"var(--ink)",
                                                  lineHeight:1.2, marginBottom:6 }}>
                  Oi, {parentName.split(" ")[0]}! 👋<br />E o seu bebê?
                </h1>
                <p style={{ fontSize:13, color:"var(--ink-lt)" }}>Nome e data de nascimento — só isso.</p>
              </div>
              <input autoFocus style={inp} placeholder="Nome do bebê" value={babyName}
                onChange={e => setBabyName(e.target.value)}
                onFocus={e => (e.target.style.borderColor="var(--sage-dk)")}
                onBlur={e  => (e.target.style.borderColor="transparent")} />
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--ink-lt)",
                                textTransform:"uppercase", letterSpacing:"0.8px", paddingLeft:4 }}>
                  Data de nascimento
                </label>
                <input type="date" style={inp} value={birthDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={e => setBirthDate(e.target.value)}
                  onFocus={e => (e.target.style.borderColor="var(--sage-dk)")}
                  onBlur={e  => (e.target.style.borderColor="transparent")} />
              </div>
              <button onClick={handleBaby} disabled={!babyName.trim()||!birthDate} className="f-nunito"
                style={{ width:"100%", background:"var(--ink)", color:"white", fontSize:15,
                         fontWeight:700, padding:"15px", borderRadius:14, border:"none",
                         cursor:(babyName.trim()&&birthDate)?"pointer":"default",
                         opacity:(babyName.trim()&&birthDate)?1:0.3, transition:"opacity 0.2s" }}>
                Começar →
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column",
                                              alignItems:"center", gap:16, textAlign:"center" }}>
              <span style={{ fontSize:64 }}>🌱</span>
              <h1 className="f-nunito" style={{ fontSize:24, fontWeight:800, color:"var(--ink)" }}>
                Tudo pronto!<br />Bem-vindo à Luma.
              </h1>
              <p style={{ fontSize:13, color:"var(--ink-lt)" }}>Preparando o seu painel…</p>
            </div>
          )}
        </div>

        {/* step dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:8,
                      paddingBottom:"max(32px,env(safe-area-inset-bottom))", flexShrink:0 }}>
          {(["parent","baby"] as Step[]).map(s => (
            <div key={s} style={{
              height:5, borderRadius:5, transition:"all 0.3s",
              width: step===s ? 22 : 5,
              background: step===s ? "var(--sage-dk)" : "var(--ink-lt)",
              opacity: step===s ? 1 : 0.3,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
