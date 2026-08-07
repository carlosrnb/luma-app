"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, getAgeFull, last7Days, type SleepLog } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";
import LumaInsight from "@/components/luma/LumaInsight";

const DAY_LABELS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const MAX_H = 12;

export default function SonoPage() {
  const router = useRouter();
  const [babyName, setBabyName] = useState("—");
  const [age, setAge]           = useState("—");
  const [logs, setLogs]         = useState<(SleepLog|null)[]>([]);
  const [lumaCtx, setLumaCtx]  = useState("");

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    const name = store.family.baby.name;
    const a    = getAgeFull(store.family.baby.birthDate);
    setBabyName(name); setAge(a);
    const days   = last7Days();
    const mapped = days.map(d => store.sleepLogs.find(l => l.date === d) ?? null);
    setLogs(mapped);
    const summary = mapped.map((l,i) => {
      const label = DAY_LABELS[new Date(days[i] + "T12:00:00").getDay()];
      return l ? `${label}: ${l.hours}h, ${l.interruptions} pausas` : `${label}: sem registro`;
    }).join("; ");
    setLumaCtx(`Bebê: ${name}, ${a}. Sono última semana: ${summary}.`);
  }, [router]);

  const days7 = last7Days();

  const S = { // shared style shortcuts
    card: { background:"white", borderRadius:"var(--r)", padding:"16px 18px" } as React.CSSProperties,
    section: { fontSize:14, fontFamily:"Nunito,sans-serif", fontWeight:800, color:"var(--ink)", marginBottom:12 } as React.CSSProperties,
  };

  return (
    <AppShell>
      <div>
        {/* HERO */}
        <div style={{ background:"var(--lav)", borderRadius:"0 0 28px 28px",
                      padding:"52px 22px 28px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180,
                        borderRadius:"50%", background:"var(--lav-dk)", opacity:0.45, pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-30, left:-20, width:120, height:120,
                        borderRadius:"50%", background:"var(--lav-deep)", opacity:0.07, pointerEvents:"none" }} />
          <button onClick={() => router.back()}
            style={{ position:"absolute", top:18, left:18, width:38, height:38, borderRadius:"50%",
                     background:"rgba(255,255,255,0.6)", backdropFilter:"blur(8px)",
                     border:"none", cursor:"pointer", fontSize:16, color:"var(--ink)",
                     display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:38, marginBottom:10 }}>🌙</div>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--lav-deep)", textTransform:"uppercase",
                        letterSpacing:"1.2px", marginBottom:4 }}>{babyName} · {age}</p>
            <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)" }}>Sono</h1>
            <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:3 }}>Últimos 7 dias de registro</p>
          </div>
        </div>

        <div style={{ padding:"18px 18px 32px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* LUMA */}
          <LumaInsight context={lumaCtx}
            question="Analise o padrão de sono desta semana e dê uma resposta curta, acolhedora, sem alarme." />

          {/* WEEK BARS */}
          <div style={{ ...S.card }}>
            <p style={S.section}>Esta semana</p>
            <div style={{ display:"flex", gap:6, alignItems:"flex-end" }}>
              {days7.map((d,i) => {
                const log    = logs[i];
                const pct    = log ? Math.min((log.hours/MAX_H)*100, 100) : 0;
                const label  = DAY_LABELS[new Date(d+"T12:00:00").getDay()];
                const isToday= d === new Date().toISOString().split("T")[0];
                const barBg  = isToday && log ? "var(--lav-deep)"
                             : log && log.hours>=10 ? "var(--lav-dk)"
                             : log ? "var(--coral-icon)"
                             : "transparent";
                return (
                  <div key={d} style={{ flex:1, display:"flex", flexDirection:"column",
                                        alignItems:"center", gap:5 }}>
                    <p style={{ fontSize:10, fontWeight:600, textTransform:"uppercase",
                                color: isToday ? "var(--lav-deep)" : "var(--ink-lt)",
                                letterSpacing:"0.3px" }}>{label}</p>
                    <div style={{ width:"100%", height:72, background:"var(--bg)", borderRadius:16,
                                  overflow:"hidden", display:"flex", flexDirection:"column",
                                  justifyContent:"flex-end" }}>
                      <div style={{ width:"100%", height:`${pct}%`, background:barBg,
                                    borderRadius:16, transition:"height 0.5s ease" }} />
                    </div>
                    <p style={{ fontSize:9, fontWeight:600, color:"var(--ink-lt)" }}>
                      {log ? `${log.hours}h` : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PATTERNS */}
          <div>
            <p className="f-nunito" style={{ fontSize:14, fontWeight:800, color:"var(--ink)",
                                            marginBottom:10 }}>O que está acontecendo</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { icon:"🧠", bg:"var(--lav)",   title:"Salto de desenvolvimento",
                  body:"Nessa fase o cérebro processa muita informação nova. O sono fica mais agitado justamente porque ele está crescendo." },
                { icon:"🌅", bg:"var(--coral)",  title:"Acordadas entre 2h e 4h",
                  body:"É o período de sono mais leve. Qualquer estímulo pode despertar com mais facilidade. Normal para essa faixa de idade." },
                { icon:"☀️", bg:"var(--gold)",   title:"Sonecas do dia estão OK",
                  body:"As sonecas diurnas têm duração adequada. O ciclo circadiano está se estabelecendo no ritmo certo." },
              ].map(item => (
                <div key={item.title} style={{ ...S.card, display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:item.bg, flexShrink:0,
                                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="f-nunito" style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>{item.title}</p>
                    <p style={{ fontSize:12, color:"var(--ink-mid)", lineHeight:1.55, marginTop:3 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION */}
          <div style={{ background:"var(--lav)", borderRadius:"var(--r)", padding:"18px" }}>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--lav-deep)", textTransform:"uppercase",
                        letterSpacing:"1px", marginBottom:6 }}>Para esta noite</p>
            <p className="f-nunito" style={{ fontSize:16, fontWeight:800, color:"var(--ink)", marginBottom:6 }}>
              Rotina de 20 minutos antes de dormir
            </p>
            <p style={{ fontSize:12, color:"var(--ink-mid)", lineHeight:1.55, marginBottom:14 }}>
              Banho morno, luz baixa, música suave ou leitura. A repetição ajuda o sistema nervoso do {babyName} a entender que é hora de descansar.
            </p>
            <button className="f-nunito"
              style={{ width:"100%", background:"var(--ink)", color:"white", fontSize:13,
                       fontWeight:700, padding:"13px", borderRadius:12, border:"none", cursor:"pointer" }}>
              ✓ &nbsp;Marcar como feito esta noite
            </button>
          </div>

          {/* WHEN TO CALL */}
          <div style={{ ...S.card, borderLeft:"3px solid var(--lav-dk)" }}>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--lav-deep)", textTransform:"uppercase",
                        letterSpacing:"1px", marginBottom:10 }}>Quando falar com o pediatra</p>
            {[
              "Mais de 6 acordadas por noite por mais de 2 semanas seguidas",
              "Dificuldade de respirar ou ronco frequente durante o sono",
              "Irritabilidade intensa durante o dia, sem melhora",
            ].map(item => (
              <div key={item} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--lav-deep)",
                               marginTop:6, flexShrink:0, display:"block" }} />
                <p style={{ fontSize:12, color:"var(--ink-mid)", lineHeight:1.5 }}>{item}</p>
              </div>
            ))}
            <p style={{ fontSize:11, color:"var(--ink-lt)", marginTop:8, fontStyle:"italic", lineHeight:1.5 }}>
              Cada criança tem seu próprio ritmo. Seu pediatra conhece o {babyName} melhor do que qualquer app.
            </p>
          </div>

          {/* REGISTER */}
          <button onClick={() => router.push("/registro")} className="f-nunito"
            style={{ width:"100%", background:"white", border:"2px dashed var(--lav-dk)",
                     borderRadius:"var(--r)", padding:"16px", display:"flex", alignItems:"center",
                     justifyContent:"center", gap:10, fontSize:14, fontWeight:700,
                     color:"var(--lav-deep)", cursor:"pointer",
                     transition:"background 0.15s" }}>
            🌙 &nbsp;Registrar a noite de hoje
          </button>
        </div>
      </div>
    </AppShell>
  );
}
