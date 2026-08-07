"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadStore, getAgeInMonths,
  loadFeedLogs, saveFeedLogs,
  todayKey, type FeedLog,
} from "@/lib/store";
import AppShell from "@/components/luma/AppShell";
import LumaInsight from "@/components/luma/LumaInsight";

// Foods by introduction phase
const FOODS_BY_PHASE: Record<string, { emoji:string; name:string }[]> = {
  "6": [
    { emoji:"🥕", name:"Cenoura" },{ emoji:"🎃", name:"Abóbora" },
    { emoji:"🍠", name:"Batata-doce" },{ emoji:"🥦", name:"Brócolis" },
    { emoji:"🍗", name:"Frango" },{ emoji:"🥚", name:"Ovo" },
  ],
  "7": [
    { emoji:"🍌", name:"Banana" },{ emoji:"🥑", name:"Abacate" },
    { emoji:"🐟", name:"Peixe" },{ emoji:"🫘", name:"Feijão" },
    { emoji:"🌽", name:"Milho" },{ emoji:"🥬", name:"Couve" },
  ],
  "8": [
    { emoji:"🍓", name:"Morango" },{ emoji:"🫐", name:"Mirtilo" },
    { emoji:"🧀", name:"Queijo" },{ emoji:"🍖", name:"Carne bovina" },
    { emoji:"🌾", name:"Aveia" },{ emoji:"🍚", name:"Arroz integral" },
  ],
  "9+": [
    { emoji:"🍋", name:"Limão" },{ emoji:"🍊", name:"Laranja" },
    { emoji:"🥜", name:"Amendoim" },{ emoji:"🐟", name:"Atum" },
    { emoji:"🥛", name:"Iogurte" },{ emoji:"🍞", name:"Pão integral" },
  ],
};

const REACTIONS = [
  { key:"great",   emoji:"😋", label:"Adorou",   color:"var(--sage)" },
  { key:"ok",      emoji:"😐", label:"Normal",    color:"var(--gold)" },
  { key:"refused", emoji:"🙅", label:"Recusou",  color:"var(--coral)" },
  { key:"allergic",emoji:"🚨", label:"Reação",    color:"var(--blush)" },
] as const;

function getPhase(months: number) {
  if (months < 6)  return null;
  if (months < 7)  return "6";
  if (months < 8)  return "7";
  if (months < 9)  return "8";
  return "9+";
}

export default function AlimentacaoPage() {
  const router = useRouter();
  const [months, setMonths]       = useState(0);
  const [babyName, setBabyName]   = useState("—");
  const [logs, setLogs]           = useState<FeedLog[]>([]);
  const [adding, setAdding]       = useState(false);
  const [selFood, setSelFood]     = useState("");
  const [selReaction, setSelReaction] = useState<FeedLog["reaction"]>("great");
  const [notes, setNotes]         = useState("");
  const [lumaCtx, setLumaCtx]    = useState("");

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    const m = getAgeInMonths(store.family.baby.birthDate);
    setMonths(m);
    setBabyName(store.family.baby.name);
    const all = loadFeedLogs();
    setLogs(all);
    const recent = all.slice(-10).map(l => `${l.food}: ${l.reaction}`).join(", ");
    setLumaCtx(`Bebê: ${store.family.baby.name}, ${m} meses. Fase introdução: ${m >= 6 ? "iniciada" : "ainda não começou"}. Últimos alimentos: ${recent || "nenhum registrado"}.`);
  }, [router]);

  function saveLog() {
    if (!selFood) return;
    const log: FeedLog = { date: todayKey(), food: selFood, reaction: selReaction, notes };
    const updated = [...logs, log];
    setLogs(updated);
    saveFeedLogs(updated);
    setAdding(false); setSelFood(""); setNotes(""); setSelReaction("great");
  }

  const phase      = getPhase(months);
  const todayLogs  = logs.filter(l => l.date === todayKey());
  const recentDays = [...new Set(logs.map(l => l.date))].sort().reverse().slice(0, 7);

  if (months < 6) return (
    <AppShell>
      <div style={{ padding:"60px 22px", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🍼</div>
        <h1 className="f-nunito" style={{ fontSize:22, fontWeight:800, color:"var(--ink)", marginBottom:8 }}>
          Ainda não é hora
        </h1>
        <p style={{ fontSize:14, color:"var(--ink-mid)", lineHeight:1.7, maxWidth:280, margin:"0 auto 24px" }}>
          A introdução alimentar começa a partir dos 6 meses. {babyName} ainda está na fase perfeita do leite materno.
        </p>
        <p style={{ fontSize:12, color:"var(--ink-lt)", fontStyle:"italic" }}>
          A Luma vai te avisar quando chegar a hora! 🌱
        </p>
        <button onClick={() => router.back()}
          style={{ marginTop:32, background:"var(--ink)", color:"white", border:"none",
                   borderRadius:14, padding:"13px 28px", fontFamily:"Nunito,sans-serif",
                   fontSize:14, fontWeight:700, cursor:"pointer" }}>
          Voltar
        </button>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div>
        {/* HERO */}
        <div style={{ background:"var(--gold)", borderRadius:"0 0 28px 28px",
                      padding:"52px 22px 28px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160,
                        borderRadius:"50%", background:"var(--gold-icon)", opacity:0.5 }} />
          <button onClick={() => router.back()}
            style={{ position:"absolute", top:18, left:18, width:38, height:38, borderRadius:"50%",
                     background:"rgba(255,255,255,0.6)", border:"none", cursor:"pointer",
                     fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:38, marginBottom:10 }}>🥣</div>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--ink)", textTransform:"uppercase",
                        letterSpacing:"1.2px", marginBottom:4 }}>{babyName} · {months} meses</p>
            <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)" }}>Alimentação</h1>
            <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:3 }}>Introdução alimentar</p>
          </div>
        </div>

        <div style={{ padding:"18px 18px 40px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* LUMA */}
          <LumaInsight context={lumaCtx}
            question={`Dê uma orientação curta e acolhedora sobre a introdução alimentar para um bebê de ${months} meses. Quais alimentos priorizar agora?`} />

          {/* TODAY */}
          <div style={{ background:"white", borderRadius:"var(--r)", padding:"16px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:800, color:"var(--ink)" }}>Hoje</p>
              <button onClick={() => setAdding(true)}
                style={{ background:"var(--ink)", color:"white", border:"none", borderRadius:20,
                         padding:"6px 14px", fontSize:12, fontWeight:600,
                         fontFamily:"Nunito,sans-serif", cursor:"pointer" }}>
                + Registrar
              </button>
            </div>
            {todayLogs.length === 0 ? (
              <p style={{ fontSize:13, color:"var(--ink-lt)", textAlign:"center", padding:"12px 0" }}>
                Nenhum alimento registrado hoje ainda
              </p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {todayLogs.map((l, i) => {
                  const r = REACTIONS.find(r => r.key === l.reaction)!;
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                                          padding:"8px 10px", borderRadius:12, background:"var(--bg)" }}>
                      <span style={{ fontSize:18 }}>{r.emoji}</span>
                      <p style={{ fontSize:13, fontWeight:500, color:"var(--ink)", flex:1 }}>{l.food}</p>
                      <span style={{ fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20,
                                     background:r.color, color:"var(--ink)" }}>{r.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ADD FORM */}
          {adding && (
            <div className="fade-up" style={{ background:"white", borderRadius:"var(--r)", padding:"18px" }}>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:14 }}>
                Qual alimento?
              </p>

              {/* Food suggestions by phase */}
              {phase && (
                <div style={{ marginBottom:14 }}>
                  <p style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", marginBottom:8,
                              textTransform:"uppercase", letterSpacing:"0.6px" }}>
                    Sugeridos para {months} meses
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {FOODS_BY_PHASE[phase].map(f => (
                      <button key={f.name} onClick={() => setSelFood(f.name)}
                        style={{ padding:"7px 12px", borderRadius:20, border:"none", cursor:"pointer",
                                 fontSize:12, fontWeight:500,
                                 background: selFood === f.name ? "var(--gold)" : "var(--bg)",
                                 color:"var(--ink)", transition:"all 0.15s" }}>
                        {f.emoji} {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom food input */}
              <input value={selFood} onChange={e => setSelFood(e.target.value)}
                placeholder="Ou escreva o alimento…"
                style={{ width:"100%", background:"var(--bg)", borderRadius:12, padding:"11px 14px",
                         fontSize:13, color:"var(--ink)", outline:"none", border:"2px solid transparent",
                         fontFamily:"Inter,sans-serif", marginBottom:14,
                         transition:"border-color 0.2s" }}
                onFocus={e => (e.target.style.borderColor="var(--gold-icon)")}
                onBlur={e  => (e.target.style.borderColor="transparent")} />

              {/* Reaction */}
              <p style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", marginBottom:9,
                          textTransform:"uppercase", letterSpacing:"0.6px" }}>Como reagiu?</p>
              <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                {REACTIONS.map(r => (
                  <button key={r.key} onClick={() => setSelReaction(r.key)}
                    style={{ flex:1, padding:"9px 4px", borderRadius:12, border:"none", cursor:"pointer",
                             display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                             background: selReaction === r.key ? r.color : "var(--bg)",
                             transition:"all 0.15s" }}>
                    <span style={{ fontSize:18 }}>{r.emoji}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:"var(--ink)" }}>{r.label}</span>
                  </button>
                ))}
              </div>

              {/* Notes */}
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Observações (opcional)…" rows={2}
                style={{ width:"100%", background:"var(--bg)", borderRadius:12, padding:"11px 14px",
                         fontSize:13, color:"var(--ink)", outline:"none", border:"none",
                         fontFamily:"Inter,sans-serif", resize:"none", marginBottom:14 }} />

              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setAdding(false)}
                  style={{ flex:1, padding:"12px", borderRadius:12, border:"none", cursor:"pointer",
                           background:"var(--bg)", color:"var(--ink-mid)", fontFamily:"Nunito,sans-serif",
                           fontSize:13, fontWeight:600 }}>Cancelar</button>
                <button onClick={saveLog} disabled={!selFood}
                  style={{ flex:2, padding:"12px", borderRadius:12, border:"none", cursor:"pointer",
                           background:"var(--ink)", color:"white", fontFamily:"Nunito,sans-serif",
                           fontSize:13, fontWeight:700, opacity: selFood ? 1 : 0.4 }}>
                  Salvar registro
                </button>
              </div>
            </div>
          )}

          {/* RECENT HISTORY */}
          {recentDays.length > 0 && (
            <div>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:10 }}>
                Histórico recente
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {recentDays.map(day => {
                  const dayLogs = logs.filter(l => l.date === day);
                  const label   = new Date(day+"T12:00:00").toLocaleDateString("pt-BR", { weekday:"short", day:"numeric", month:"short" });
                  return (
                    <div key={day} style={{ background:"white", borderRadius:"var(--r)", padding:"14px 16px" }}>
                      <p style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)",
                                  textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>
                        {label}
                      </p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {dayLogs.map((l,i) => {
                          const r = REACTIONS.find(r => r.key === l.reaction)!;
                          return (
                            <span key={i} style={{ fontSize:12, padding:"4px 10px", borderRadius:20,
                                                   background:r.color, color:"var(--ink)", fontWeight:500 }}>
                              {r.emoji} {l.food}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIPS */}
          <div style={{ background:"var(--gold)", borderRadius:"var(--r)", padding:"16px 18px" }}>
            <p className="f-nunito" style={{ fontSize:13, fontWeight:800, color:"var(--ink)", marginBottom:10 }}>
              💡 Dicas para essa fase
            </p>
            {[
              "Introduza um alimento novo por vez e espere 3 dias",
              "Não adicione sal, açúcar ou temperos industrializados",
              "Ofereça os alimentos no horário das refeições da família",
              "A recusa é normal — tente até 15 vezes antes de desistir",
            ].map(tip => (
              <div key={tip} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:7 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--ink)",
                               opacity:0.4, marginTop:7, flexShrink:0, display:"block" }} />
                <p style={{ fontSize:12, color:"var(--ink-mid)", lineHeight:1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
