"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, getAgeFull, last7Days, type SleepLog } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";
import LumaInsight from "@/components/luma/LumaInsight";

const DAY_LABELS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function SonoPage() {
  const router = useRouter();
  const [babyName, setBabyName] = useState("—");
  const [age, setAge]           = useState("—");
  const [logs, setLogs]         = useState<(SleepLog | null)[]>([]);
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
      const label = DAY_LABELS[new Date(days[i]).getDay()];
      return l ? `${label}: ${l.hours}h, ${l.interruptions} pausas` : `${label}: sem registro`;
    }).join("; ");
    setLumaCtx(`Bebê: ${name}, ${a}. Sono última semana: ${summary}.`);
  }, [router]);

  const days7 = last7Days();

  return (
    <AppShell>
      <div style={{ paddingBottom:80 }}>

        {/* HERO */}
        <div style={{ background:"var(--lav)", borderRadius:"0 0 32px 32px", padding:"56px 24px 32px",
                      position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200,
                        borderRadius:"50%", background:"var(--lav-dk)", opacity:0.5 }} />
          <button onClick={() => router.back()}
            style={{ position:"absolute", top:20, left:20, width:40, height:40, borderRadius:"50%",
                     background:"rgba(255,255,255,0.55)", border:"none", cursor:"pointer",
                     fontSize:17, color:"var(--ink)", backdropFilter:"blur(8px)" }}>←</button>
          <div style={{ fontSize:42, marginBottom:12, position:"relative" }}>🌙</div>
          <p style={{ fontSize:11, fontWeight:700, color:"var(--lav-deep)", textTransform:"uppercase",
                      letterSpacing:"1px", marginBottom:6, position:"relative" }}>{babyName} · {age}</p>
          <h1 className="f-nunito" style={{ fontSize:28, fontWeight:800, color:"var(--ink)", position:"relative" }}>Sono</h1>
          <p style={{ fontSize:13, color:"var(--ink-mid)", marginTop:4, position:"relative" }}>Últimos 7 dias de registro</p>
        </div>

        {/* LUMA */}
        <div style={{ padding:"20px 20px 0" }}>
          <LumaInsight context={lumaCtx}
            question="Analise o padrão de sono desta semana e dê uma resposta curta, acolhedora, sem alarme." />
        </div>

        {/* WEEK BARS */}
        <div style={{ padding:"22px 20px 0" }}>
          <h2 className="f-nunito" style={{ fontSize:16, fontWeight:800, color:"var(--ink)", marginBottom:14 }}>Esta semana</h2>
          <div style={{ display:"flex", gap:8 }}>
            {days7.map((d,i) => {
              const log  = logs[i];
              const pct  = log ? Math.min((log.hours / 12) * 100, 100) : 0;
              const label= DAY_LABELS[new Date(d).getDay()];
              const isToday = d === new Date().toISOString().split("T")[0];
              const barColor = isToday && log ? "var(--lav-deep)" : log ? (log.hours >= 10 ? "var(--lav-dk)" : log.hours >= 8 ? "var(--lav-dk)" : "var(--coral-icon)") : "transparent";
              return (
                <div key={d} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <p style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px",
                              color: isToday ? "var(--lav-deep)" : "var(--ink-lt)" }}>{label}</p>
                  <div style={{ width:"100%", height:80, background:"white", borderRadius:20, overflow:"hidden",
                                display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                    <div style={{ width:"100%", height:`${pct}%`, background:barColor, borderRadius:20,
                                  transition:"height 0.5s ease" }} />
                  </div>
                  <p style={{ fontSize:9, fontWeight:600, color:"var(--ink-lt)" }}>{log ? `${log.hours}h` : "—"}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* PATTERNS */}
        <div style={{ padding:"22px 20px 0" }}>
          <h2 className="f-nunito" style={{ fontSize:16, fontWeight:800, color:"var(--ink)", marginBottom:12 }}>O que está acontecendo</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { icon:"🧠", bg:"var(--lav)",   title:"Salto de desenvolvimento",   body:"Nessa fase, o cérebro processa muita informação nova. O sono fica mais agitado justamente porque ele está crescendo." },
              { icon:"🌅", bg:"var(--coral)",  title:"Acordadas entre 2h e 4h",    body:"É o período de sono mais leve. Qualquer estímulo pode despertar com mais facilidade. Normal para essa faixa de idade." },
              { icon:"☀️", bg:"var(--gold)",   title:"Sonecas do dia estão OK",    body:"As sonecas diurnas têm duração adequada. O ciclo circadiano está se estabelecendo no ritmo certo." },
            ].map(item => (
              <div key={item.title} style={{ background:"white", borderRadius:"var(--r)", padding:"16px 18px",
                                             display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:item.bg, flexShrink:0,
                              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                  {item.icon}
                </div>
                <div>
                  <p className="f-nunito" style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>{item.title}</p>
                  <p style={{ fontSize:12, color:"var(--ink-mid)", lineHeight:1.55, marginTop:4 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION */}
        <div style={{ padding:"20px 20px 0" }}>
          <div style={{ background:"var(--lav)", borderRadius:"var(--r)", padding:"22px" }}>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--lav-deep)", textTransform:"uppercase",
                        letterSpacing:"1px", marginBottom:8 }}>Para esta noite</p>
            <h3 className="f-nunito" style={{ fontSize:17, fontWeight:800, color:"var(--ink)", marginBottom:8 }}>
              Tente uma rotina de 20 minutos antes de dormir
            </h3>
            <p style={{ fontSize:13, color:"var(--ink-mid)", lineHeight:1.55, marginBottom:16 }}>
              Banho morno, luz baixa, música suave ou leitura. A repetição ajuda o sistema nervoso do {babyName} a entender que é hora de descansar.
            </p>
            <button className="f-nunito"
              style={{ width:"100%", background:"var(--ink)", color:"white", fontSize:14, fontWeight:700,
                       padding:"14px", borderRadius:16, border:"none", cursor:"pointer" }}>
              ✓ &nbsp;Marcar como feito esta noite
            </button>
          </div>
        </div>

        {/* WHEN TO CALL */}
        <div style={{ padding:"16px 20px 0" }}>
          <div style={{ background:"white", borderRadius:"var(--r)", padding:"18px 20px",
                        borderLeft:"4px solid var(--lav-dk)" }}>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--lav-deep)", textTransform:"uppercase",
                        letterSpacing:"1px", marginBottom:12 }}>Quando falar com o pediatra</p>
            {["Mais de 6 acordadas por noite por mais de 2 semanas seguidas",
              "Dificuldade de respirar ou ronco frequente durante o sono",
              "Irritabilidade intensa durante o dia, sem melhora"].map(item => (
              <div key={item} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--lav-deep)",
                               marginTop:5, flexShrink:0, display:"block" }} />
                <p style={{ fontSize:13, color:"var(--ink-mid)", lineHeight:1.5 }}>{item}</p>
              </div>
            ))}
            <p style={{ fontSize:12, color:"var(--ink-lt)", marginTop:10, fontStyle:"italic", lineHeight:1.5 }}>
              Cada criança tem seu próprio ritmo. Seu pediatra conhece o {babyName} melhor do que qualquer app.
            </p>
          </div>
        </div>

        {/* REGISTER */}
        <div style={{ padding:"16px 20px 0" }}>
          <button onClick={() => router.push("/registro")} className="f-nunito"
            style={{ width:"100%", background:"white", border:"2px dashed var(--lav-dk)",
                     borderRadius:"var(--r)", padding:"18px", display:"flex", alignItems:"center",
                     justifyContent:"center", gap:10, fontSize:15, fontWeight:700,
                     color:"var(--lav-deep)", cursor:"pointer" }}>
            🌙 &nbsp;Registrar a noite de hoje
          </button>
        </div>
      </div>
    </AppShell>
  );
}
