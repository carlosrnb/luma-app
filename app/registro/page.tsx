"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, saveStore, todayKey } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";

type Step = "type" | "sleep" | "done";

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep]               = useState<Step>("type");
  const [hours, setHours]             = useState(10);
  const [interruptions, setInterruptions] = useState(0);
  const [notes, setNotes]             = useState("");
  const [babyName, setBabyName]       = useState("—");
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    setBabyName(store.family.baby.name);
  }, [router]);

  function saveSleep() {
    const store = loadStore();
    saveStore({ ...store, sleepLogs: [...store.sleepLogs.filter(l => l.date !== todayKey()), { date: todayKey(), hours, interruptions, notes }] });
    setSaved(true); setStep("done");
  }

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg)", borderRadius:12, padding:"12px 14px",
    fontSize:13, color:"var(--ink)", outline:"none", border:"2px solid transparent",
    fontFamily:"Inter, sans-serif", transition:"border-color 0.2s", resize:"none" as const };

  return (
    <AppShell>
      <div style={{ padding:"56px 20px 40px" }}>
        <button onClick={() => step === "type" ? router.back() : setStep("type")}
          style={{ fontSize:13, fontWeight:600, color:"var(--ink-lt)", border:"none", background:"none",
                   cursor:"pointer", marginBottom:24, display:"flex", alignItems:"center", gap:4 }}>
          ← {step === "type" ? "Voltar" : "Outro registro"}
        </button>

        <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)", marginBottom:6 }}>
          {step === "type" && "O que vamos registrar?"}
          {step === "sleep" && `Como foi a noite do ${babyName}?`}
          {step === "done" && "Anotado! 🌱"}
        </h1>
        {step === "type" && <p style={{ fontSize:13, color:"var(--ink-lt)", marginBottom:28 }}>Poucos inputs, muito retorno.</p>}

        {step === "type" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[{id:"sleep",emoji:"🌙",label:"Sono",sub:"Como foi a noite?"},
              {id:"feed", emoji:"🥣",label:"Alimentação",sub:"O que comeu hoje?"},
              {id:"mood", emoji:"💭",label:"Observação",sub:"Algo que você notou"}].map(t => (
              <button key={t.id} onClick={() => { if (t.id === "sleep") setStep("sleep"); else setStep("done"); }}
                style={{ background:"white", borderRadius:"var(--r)", padding:"16px 20px",
                         display:"flex", alignItems:"center", gap:16, border:"none", cursor:"pointer",
                         textAlign:"left", transition:"transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow="0 6px 20px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow="none"; }}>
                <span style={{ fontSize:28 }}>{t.emoji}</span>
                <div>
                  <p className="f-nunito" style={{ fontSize:16, fontWeight:700, color:"var(--ink)" }}>{t.label}</p>
                  <p style={{ fontSize:13, color:"var(--ink-lt)" }}>{t.sub}</p>
                </div>
                <span style={{ marginLeft:"auto", fontSize:18, color:"var(--ink-lt)", opacity:0.4 }}>›</span>
              </button>
            ))}
          </div>
        )}

        {step === "sleep" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* hours */}
            <div style={{ background:"white", borderRadius:"var(--r)", padding:"20px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                          letterSpacing:"0.8px", marginBottom:16 }}>Quantas horas dormiu no total?</p>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", marginBottom:12 }}>
                <span className="f-nunito" style={{ fontSize:56, fontWeight:800, color:"var(--ink)", lineHeight:1 }}>{hours}</span>
                <span className="f-nunito" style={{ fontSize:24, fontWeight:700, color:"var(--ink-lt)", marginLeft:6, marginBottom:6 }}>h</span>
              </div>
              <input type="range" min={1} max={16} value={hours} onChange={e => setHours(Number(e.target.value))} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--ink-lt)", marginTop:4 }}>
                <span>1h</span><span>16h</span>
              </div>
            </div>

            {/* interruptions */}
            <div style={{ background:"white", borderRadius:"var(--r)", padding:"20px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                          letterSpacing:"0.8px", marginBottom:16 }}>Quantas vezes acordou?</p>
              <div style={{ display:"flex", gap:8 }}>
                {[0,1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setInterruptions(n)}
                    style={{ flex:1, padding:"12px 4px", borderRadius:12, border:"none", cursor:"pointer",
                             fontFamily:"Nunito, sans-serif", fontSize:15, fontWeight:700, transition:"all 0.15s",
                             background: interruptions === n ? "var(--lav)" : "var(--bg)",
                             color: interruptions === n ? "var(--lav-deep)" : "var(--ink-mid)" }}>
                    {n === 5 ? "5+" : n}
                  </button>
                ))}
              </div>
            </div>

            {/* notes */}
            <div style={{ background:"white", borderRadius:"var(--r)", padding:"20px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                          letterSpacing:"0.8px", marginBottom:12 }}>Alguma observação? (opcional)</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={inp}
                placeholder="Ex: acordou com fome às 3h, voltou a dormir rápido…"
                onFocus={e => (e.target.style.borderColor = "var(--lav-dk)")}
                onBlur={e => (e.target.style.borderColor = "transparent")} />
            </div>

            <button onClick={saveSleep} className="f-nunito"
              style={{ width:"100%", background:"var(--ink)", color:"white", fontSize:15, fontWeight:700,
                       padding:"16px", borderRadius:16, border:"none", cursor:"pointer" }}>
              Salvar registro
            </button>
          </div>
        )}

        {step === "done" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, paddingTop:24 }}>
            <span style={{ fontSize:64 }}>{saved ? "🌙" : "✍️"}</span>
            <p className="f-nunito" style={{ fontSize:20, fontWeight:800, color:"var(--ink)", textAlign:"center" }}>
              {saved ? `Noite do ${babyName} anotada!` : "Funcionalidade em breve"}
            </p>
            <p style={{ fontSize:13, color:"var(--ink-lt)", textAlign:"center", lineHeight:1.6, maxWidth:280 }}>
              {saved ? "A Luma vai usar esse dado para entender melhor o padrão de sono e te dar insights mais precisos." : "Estamos construindo esse módulo."}
            </p>
            <button onClick={() => router.push("/home")} className="f-nunito"
              style={{ marginTop:16, width:"100%", background:"var(--sage)", borderRadius:16,
                       padding:"16px", fontSize:15, fontWeight:700, color:"var(--ink-mid)",
                       border:"none", cursor:"pointer" }}>
              Voltar para o início
            </button>
            {saved && (
              <button onClick={() => router.push("/sono")} className="f-nunito"
                style={{ width:"100%", background:"white", borderRadius:16, padding:"16px",
                         fontSize:15, fontWeight:700, color:"var(--lav-deep)", border:"none", cursor:"pointer" }}>
                Ver análise do sono →
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
