"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, saveStore, todayKey } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";

type Step = "type" | "sleep" | "done";

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>("type");
  const [hours, setHours]         = useState(10);
  const [interruptions, setInterruptions] = useState(0);
  const [notes, setNotes]         = useState("");
  const [babyName, setBabyName]   = useState("—");
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    setBabyName(store.family.baby.name);
  }, [router]);

  function saveSleep() {
    const store = loadStore();
    saveStore({ ...store, sleepLogs: [
      ...store.sleepLogs.filter(l => l.date !== todayKey()),
      { date: todayKey(), hours, interruptions, notes }
    ]});
    setSaved(true); setStep("done");
  }

  const inp: React.CSSProperties = {
    width:"100%", background:"var(--bg)", borderRadius:12, padding:"12px 14px",
    fontSize:13, color:"var(--ink)", outline:"none",
    border:"2px solid transparent", fontFamily:"Inter,sans-serif",
    transition:"border-color 0.2s", resize:"none" as const,
  };

  const ENTRY_TYPES = [
    { id:"sleep", emoji:"🌙", label:"Sono",        sub:"Como foi a noite?" },
    { id:"feed",  emoji:"🥣", label:"Alimentação", sub:"O que comeu hoje?" },
    { id:"obs",   emoji:"💭", label:"Observação",  sub:"Algo que você notou" },
  ];

  return (
    <AppShell>
      <div style={{ padding:"52px 18px 40px" }}>

        {/* BACK */}
        <button onClick={() => step === "type" ? router.back() : setStep("type")}
          style={{ fontSize:13, fontWeight:600, color:"var(--ink-lt)", border:"none",
                   background:"none", cursor:"pointer", marginBottom:22,
                   display:"flex", alignItems:"center", gap:5 }}>
          ← {step === "type" ? "Voltar" : "Outro tipo"}
        </button>

        {/* TITLE */}
        <h1 className="f-nunito" style={{ fontSize:24, fontWeight:800, color:"var(--ink)", marginBottom:4 }}>
          {step === "type"  && "O que vamos registrar?"}
          {step === "sleep" && `Como foi a noite do ${babyName}?`}
          {step === "done"  && "Anotado! 🌱"}
        </h1>
        {step === "type" && (
          <p style={{ fontSize:13, color:"var(--ink-lt)", marginBottom:24 }}>
            Poucos inputs, muito retorno.
          </p>
        )}

        {/* STEP: TYPE */}
        {step === "type" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
            {ENTRY_TYPES.map(t => (
              <button key={t.id}
                onClick={() => { if (t.id === "sleep") setStep("sleep"); else setStep("done"); }}
                style={{ background:"white", borderRadius:"var(--r)", padding:"16px 18px",
                         display:"flex", alignItems:"center", gap:14, border:"none",
                         cursor:"pointer", textAlign:"left", width:"100%",
                         transition:"box-shadow 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow="none")}>
                <span style={{ fontSize:26 }}>{t.emoji}</span>
                <div style={{ flex:1 }}>
                  <p className="f-nunito" style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>{t.label}</p>
                  <p style={{ fontSize:12, color:"var(--ink-lt)", marginTop:2 }}>{t.sub}</p>
                </div>
                <span style={{ fontSize:16, color:"var(--ink-lt)", opacity:0.4 }}>›</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP: SLEEP */}
        {step === "sleep" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:16 }}>

            {/* HOURS */}
            <div style={{ background:"white", borderRadius:"var(--r)", padding:"18px" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                          letterSpacing:"0.8px", marginBottom:14 }}>Quantas horas dormiu no total?</p>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", marginBottom:12 }}>
                <span className="f-nunito" style={{ fontSize:52, fontWeight:800, color:"var(--ink)", lineHeight:1 }}>{hours}</span>
                <span className="f-nunito" style={{ fontSize:22, fontWeight:700, color:"var(--ink-lt)", marginLeft:6, marginBottom:4 }}>h</span>
              </div>
              <input type="range" min={1} max={16} value={hours}
                onChange={e => setHours(Number(e.target.value))} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11,
                            color:"var(--ink-lt)", marginTop:4 }}>
                <span>1h</span><span>16h</span>
              </div>
            </div>

            {/* INTERRUPTIONS */}
            <div style={{ background:"white", borderRadius:"var(--r)", padding:"18px" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                          letterSpacing:"0.8px", marginBottom:14 }}>Quantas vezes acordou?</p>
              <div style={{ display:"flex", gap:6 }}>
                {[0,1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setInterruptions(n)}
                    style={{ flex:1, padding:"11px 2px", borderRadius:11, border:"none",
                             cursor:"pointer", fontFamily:"Nunito,sans-serif",
                             fontSize:14, fontWeight:700, transition:"all 0.15s",
                             background: interruptions===n ? "var(--lav)" : "var(--bg)",
                             color: interruptions===n ? "var(--lav-deep)" : "var(--ink-mid)" }}>
                    {n===5?"5+":n}
                  </button>
                ))}
              </div>
            </div>

            {/* NOTES */}
            <div style={{ background:"white", borderRadius:"var(--r)", padding:"18px" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                          letterSpacing:"0.8px", marginBottom:12 }}>Alguma observação? (opcional)</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                style={inp} placeholder="Ex: acordou com fome às 3h, voltou a dormir rápido…"
                onFocus={e => (e.target.style.borderColor="var(--lav-dk)")}
                onBlur={e  => (e.target.style.borderColor="transparent")} />
            </div>

            <button onClick={saveSleep} className="f-nunito"
              style={{ width:"100%", background:"var(--ink)", color:"white", fontSize:14,
                       fontWeight:700, padding:"15px", borderRadius:14, border:"none", cursor:"pointer" }}>
              Salvar registro
            </button>
          </div>
        )}

        {/* STEP: DONE */}
        {step === "done" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                        gap:14, paddingTop:28, textAlign:"center" }}>
            <span style={{ fontSize:60 }}>{saved ? "🌙" : "✍️"}</span>
            <p className="f-nunito" style={{ fontSize:20, fontWeight:800, color:"var(--ink)" }}>
              {saved ? `Noite do ${babyName} anotada!` : "Funcionalidade em breve"}
            </p>
            <p style={{ fontSize:13, color:"var(--ink-lt)", lineHeight:1.65, maxWidth:280 }}>
              {saved
                ? "A Luma vai usar esse dado para entender melhor o padrão de sono e te dar insights mais precisos."
                : "Estamos construindo esse módulo. Em breve você poderá registrar alimentação e observações aqui."}
            </p>
            <button onClick={() => router.push("/home")} className="f-nunito"
              style={{ marginTop:8, width:"100%", background:"var(--sage)", borderRadius:14,
                       padding:"15px", fontSize:14, fontWeight:700, color:"var(--ink-mid)",
                       border:"none", cursor:"pointer" }}>
              Voltar para o início
            </button>
            {saved && (
              <button onClick={() => router.push("/sono")} className="f-nunito"
                style={{ width:"100%", background:"white", borderRadius:14, padding:"15px",
                         fontSize:14, fontWeight:700, color:"var(--lav-deep)",
                         border:"none", cursor:"pointer" }}>
                Ver análise do sono →
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
