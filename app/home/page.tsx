"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, saveStore, getAgeFull, todayKey, type Family, type MoodLog } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";
import LumaInsight from "@/components/luma/LumaInsight";

const MOODS = [
  { key:"anxious", emoji:"😰", label:"Ansiosa" },
  { key:"calm",    emoji:"😌", label:"Tranquila" },
  { key:"tired",   emoji:"😴", label:"Cansada" },
  { key:"happy",   emoji:"🥰", label:"Feliz" },
] as const;

const CARDS = [
  { id:"desenvolvimento", bg:"var(--sage)",  icon:"var(--sage-icon)",  emoji:"🌱", title:"Desenvolvimento", sub:"Evolução e marcos",       badge:"No ritmo dele ✓", tall:true,  href:"/desenvolvimento" },
  { id:"sono",            bg:"var(--lav)",   icon:"var(--lav-icon)",   emoji:"🌙", title:"Sono",            sub:"Registros recentes",      badge:"Observe esta semana", tall:true, href:"/sono" },
  { id:"alimentacao",     bg:"var(--gold)",  icon:"var(--gold-icon)",  emoji:"🥣", title:"Alimentação",     sub:"Introdução alimentar",    tall:false, href:"#" },
  { id:"hoje",            bg:"var(--mint)",  icon:"var(--mint-icon)",  emoji:"✨", title:"Para hoje",       sub:"1 sugestão prática",      tall:false, href:"/registro" },
  { id:"crescimento",     bg:"var(--sky)",   icon:"var(--sky-icon)",   emoji:"📏", title:"Crescimento",     sub:"Último: —",              tall:false, href:"#" },
  { id:"vacinacao",       bg:"var(--blush)", icon:"var(--blush-icon)", emoji:"💉", title:"Vacinação",       sub:"Próxima: 9 meses",       tall:false, href:"#" },
];

export default function Home() {
  const router = useRouter();
  const [family, setFamily]   = useState<Family | null>(null);
  const [mood, setMood]       = useState<string | null>(null);
  const [tab, setTab]         = useState<"today"|"week">("today");
  const [lumaCtx, setLumaCtx] = useState("");

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    setFamily(store.family);
    const tm = store.moodLogs.find(m => m.date === todayKey());
    if (tm) setMood(tm.mood);
    const age  = getAgeFull(store.family.baby.birthDate);
    const sl   = store.sleepLogs.slice(-7);
    setLumaCtx(`Bebê: ${store.family.baby.name}, ${age}. Sono recente: ${sl.length ? sl.map(s => `${s.hours}h (${s.interruptions} pausas)`).join(", ") : "sem registros"}.`);
  }, [router]);

  function saveMood(key: string) {
    setMood(key);
    const store = loadStore();
    saveStore({ ...store, moodLogs: [...store.moodLogs.filter(m => m.date !== todayKey()), { date: todayKey(), mood: key as MoodLog["mood"] }] });
  }

  if (!family) return null;

  const babyName    = family.baby.name;
  const age         = getAgeFull(family.baby.birthDate);
  const parentFirst = family.parentName.split(" ")[0];
  const todayLabel  = new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" });

  return (
    <AppShell>
      <div style={{ paddingBottom:100 }}>

        {/* TOP BAR */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 20px 10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11 }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--peach)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontFamily:"Nunito, sans-serif", fontSize:18, fontWeight:700, color:"var(--ink)", flexShrink:0 }}>
              {parentFirst[0]}
            </div>
            <div>
              <p className="f-nunito" style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>{family.parentName}</p>
              <p style={{ fontSize:12, color:"var(--ink-lt)" }}>Família do {babyName}</p>
            </div>
          </div>
          <button style={{ width:40, height:40, borderRadius:"50%", background:"white", border:"none",
                           cursor:"pointer", fontSize:17, position:"relative",
                           boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            🔔
            <span style={{ position:"absolute", top:8, right:8, width:8, height:8,
                           borderRadius:"50%", background:"#E07B6A", border:"2px solid var(--bg)" }} />
          </button>
        </div>

        {/* GREETING */}
        <div style={{ padding:"16px 20px 0" }}>
          <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)", lineHeight:1.2, marginBottom:4 }}>
            Como está o{" "}
            <span style={{ color:"var(--sage-dk)" }}>{babyName}</span> hoje?
          </h1>
          <p style={{ fontSize:12, color:"var(--ink-lt)", textTransform:"capitalize" }}>{todayLabel} · {age}</p>
        </div>

        {/* MOOD */}
        <div style={{ padding:"14px 20px 0" }}>
          <div style={{ background:"white", borderRadius:"var(--r)", padding:"16px" }}>
            <p style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", textTransform:"uppercase",
                        letterSpacing:"0.8px", marginBottom:12 }}>Como você está se sentindo?</p>
            <div style={{ display:"flex", gap:8 }}>
              {MOODS.map(m => (
                <button key={m.key} onClick={() => saveMood(m.key)}
                  style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
                           gap:6, padding:"10px 4px", borderRadius:14, border:"none", cursor:"pointer",
                           background: mood === m.key ? "var(--sage)" : "var(--bg)",
                           transform: mood === m.key ? "scale(1.05)" : "scale(1)",
                           transition:"all 0.15s" }}>
                  <span style={{ fontSize:22 }}>{m.emoji}</span>
                  <span style={{ fontSize:11, fontWeight:500, color:"var(--ink-mid)" }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONSULT */}
        <div style={{ padding:"12px 20px 0" }}>
          <div style={{ background:"var(--ink)", borderRadius:"var(--r)", padding:"16px 20px",
                        display:"flex", alignItems:"center", gap:16, cursor:"pointer" }}>
            <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"8px 12px", textAlign:"center", flexShrink:0 }}>
              <p className="f-nunito" style={{ fontSize:22, fontWeight:800, color:"white", lineHeight:1 }}>16</p>
              <p style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.5)", letterSpacing:"0.8px", textTransform:"uppercase", marginTop:2 }}>AGO</p>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:2 }}>Consulta com Dr. Roberto</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>14h30 · Pediatria geral</p>
            </div>
            <span style={{ background:"var(--sage-dk)", color:"white", fontSize:10, fontWeight:600,
                           padding:"4px 10px", borderRadius:20, whiteSpace:"nowrap" }}>Em 11 dias</span>
          </div>
        </div>

        {/* LUMA */}
        <div style={{ padding:"12px 20px 0" }}>
          <LumaInsight context={lumaCtx}
            question={`Dê um insight curto e acolhedor sobre como ${babyName} está hoje, baseado no contexto.`} />
        </div>

        {/* SEC HEADER */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 20px 12px" }}>
          <h2 className="f-nunito" style={{ fontSize:18, fontWeight:800, color:"var(--ink)" }}>O dia de hoje</h2>
          <div style={{ display:"flex", gap:6 }}>
            {(["today","week"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ fontSize:12, fontWeight:600, padding:"5px 14px", borderRadius:20, border:"none",
                         cursor:"pointer", fontFamily:"Inter, sans-serif",
                         background: tab === t ? "var(--ink)" : "white",
                         color: tab === t ? "white" : "var(--ink-mid)", transition:"all 0.15s" }}>
                {t === "today" ? "Hoje" : "Semana"}
              </button>
            ))}
          </div>
        </div>

        {/* CARD GRID */}
        <div className="card-grid">
          {/* TALL PAIR */}
          {CARDS.filter(c => c.tall).map(c => (
            <button key={c.id} onClick={() => c.href !== "#" && router.push(c.href)}
              style={{ background:c.bg, borderRadius:"var(--r)", padding:"18px 16px",
                       display:"flex", flexDirection:"column", justifyContent:"space-between",
                       border:"none", cursor:"pointer", textAlign:"left", minHeight:170,
                       transition:"transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform="translateY(-3px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow="0 10px 28px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform="translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow="none"; }}>
              <div style={{ width:46, height:46, borderRadius:13, background:c.icon,
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                {c.emoji}
              </div>
              <div>
                <p className="f-nunito" style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>{c.title}</p>
                <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:2 }}>{c.sub}</p>
                {c.badge && (
                  <span style={{ display:"inline-block", marginTop:8, fontSize:10, fontWeight:600,
                                 padding:"3px 9px", borderRadius:20, background:"rgba(255,255,255,0.55)",
                                 color:"var(--ink-mid)" }}>{c.badge}</span>
                )}
              </div>
            </button>
          ))}

          {/* MARCOS WIDE */}
          <button style={{ gridColumn:"span 2", background:"var(--peach)", borderRadius:"var(--r)",
                           padding:"16px 20px", display:"flex", alignItems:"center", gap:16,
                           border:"none", cursor:"pointer", textAlign:"left",
                           transition:"transform 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform="translateY(0)"; }}>
            <div style={{ width:46, height:46, borderRadius:13, background:"var(--peach-icon)",
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
              🎯
            </div>
            <div style={{ flex:1 }}>
              <p className="f-nunito" style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>Marcos do mês</p>
              <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:2 }}>Sentar sem apoio, balbuciar, pegar objetos.</p>
            </div>
            <span style={{ fontSize:18, color:"var(--ink-lt)", opacity:0.4 }}>›</span>
          </button>

          {/* SHORT CARDS */}
          {CARDS.filter(c => !c.tall).slice(2).map(c => (
            <button key={c.id} onClick={() => c.href !== "#" && router.push(c.href)}
              style={{ background:c.bg, borderRadius:"var(--r)", padding:"16px",
                       display:"flex", flexDirection:"column", justifyContent:"space-between",
                       border:"none", cursor:"pointer", textAlign:"left", minHeight:130,
                       transition:"transform 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform="translateY(0)"; }}>
              <div style={{ width:44, height:44, borderRadius:12, background:c.icon,
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                {c.emoji}
              </div>
              <div>
                <p className="f-nunito" style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>{c.title}</p>
                <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:2 }}>{c.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
