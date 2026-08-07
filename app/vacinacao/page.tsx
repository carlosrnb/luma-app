"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, getAgeInMonths, loadVaccineRecords, saveVaccineRecords, todayKey, type VaccineRecord } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";

export default function VacinacaoPage() {
  const router = useRouter();
  const [months, setMonths]       = useState(0);
  const [babyName, setBabyName]   = useState("—");
  const [records, setRecords]     = useState<VaccineRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming"|"done"|"all">("upcoming");

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    setMonths(getAgeInMonths(store.family.baby.birthDate));
    setBabyName(store.family.baby.name);
    setRecords(loadVaccineRecords());
  }, [router]);

  function toggleDone(id: string) {
    const updated = records.map(r =>
      r.id === id ? { ...r, doneDate: r.doneDate ? undefined : todayKey() } : r
    );
    setRecords(updated);
    saveVaccineRecords(updated);
  }

  const upcoming = records.filter(r => !r.doneDate && r.dueMonths <= months + 2);
  const overdue  = records.filter(r => !r.doneDate && r.dueMonths < months);
  const done     = records.filter(r => !!r.doneDate);
  const future   = records.filter(r => !r.doneDate && r.dueMonths > months + 2);
  const doneCount = done.length;
  const totalCount = records.length;
  const pct = Math.round((doneCount / totalCount) * 100);

  const displayed = activeTab === "upcoming"
    ? [...overdue, ...upcoming].filter((r,i,a) => a.findIndex(x=>x.id===r.id)===i)
    : activeTab === "done" ? done
    : records;

  function statusLabel(r: VaccineRecord) {
    if (r.doneDate) return { text:"Aplicada", color:"var(--sage)", icon:"✓" };
    if (r.dueMonths < months) return { text:"Atrasada", color:"var(--coral)", icon:"!" };
    if (r.dueMonths <= months + 1) return { text:"Agora", color:"var(--gold)", icon:"·" };
    return { text:`${r.dueMonths} meses`, color:"var(--bg)", icon:"·" };
  }

  return (
    <AppShell>
      <div>
        {/* HERO */}
        <div style={{ background:"var(--blush)", borderRadius:"0 0 28px 28px",
                      padding:"52px 22px 28px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160,
                        borderRadius:"50%", background:"var(--blush-icon)", opacity:0.5 }} />
          <button onClick={() => router.back()}
            style={{ position:"absolute", top:18, left:18, width:38, height:38, borderRadius:"50%",
                     background:"rgba(255,255,255,0.6)", border:"none", cursor:"pointer",
                     fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:38, marginBottom:10 }}>💉</div>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--ink)", textTransform:"uppercase",
                        letterSpacing:"1.2px", marginBottom:4 }}>{babyName} · {months} meses</p>
            <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)" }}>Vacinação</h1>
            <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:3 }}>Calendário SBP / Ministério da Saúde</p>
          </div>
        </div>

        <div style={{ padding:"18px 18px 40px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* PROGRESS */}
          <div style={{ background:"var(--ink)", borderRadius:"var(--r)", padding:"18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:700, color:"white" }}>Progresso da vacinação</p>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:800, color:"var(--sage)" }}>{pct}%</p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:99, height:8, marginBottom:10 }}>
              <div style={{ width:`${pct}%`, height:"100%", background:"var(--sage-dk)",
                            borderRadius:99, transition:"width 0.5s ease" }} />
            </div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>
              {doneCount} de {totalCount} vacinas aplicadas
              {overdue.length > 0 && ` · ${overdue.length} atrasada${overdue.length>1?"s":""}`}
            </p>
          </div>

          {/* ALERT */}
          {overdue.length > 0 && (
            <div style={{ background:"var(--coral)", borderRadius:"var(--r)", padding:"14px 16px",
                          display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ fontSize:20 }}>⚠️</span>
              <div>
                <p className="f-nunito" style={{ fontSize:13, fontWeight:700, color:"var(--ink)", marginBottom:3 }}>
                  {overdue.length} vacina{overdue.length>1?"s":""} em atraso
                </p>
                <p style={{ fontSize:12, color:"var(--ink-mid)", lineHeight:1.5 }}>
                  Agende uma visita ao posto de saúde o quanto antes para atualizar o calendário vacinal.
                </p>
              </div>
            </div>
          )}

          {/* TABS */}
          <div style={{ display:"flex", gap:6 }}>
            {([
              { id:"upcoming", label:`A fazer (${upcoming.length + overdue.filter(r=>!upcoming.includes(r)).length})` },
              { id:"done",     label:`Feitas (${doneCount})` },
              { id:"all",      label:"Todas" },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ flex:1, padding:"9px 4px", borderRadius:12, border:"none", cursor:"pointer",
                         fontSize:12, fontWeight:600, fontFamily:"Inter,sans-serif",
                         background: activeTab===t.id ? "var(--ink)" : "white",
                         color: activeTab===t.id ? "white" : "var(--ink-mid)",
                         transition:"all 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* LIST */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {displayed.map(r => {
              const s = statusLabel(r);
              return (
                <div key={r.id} style={{ background:"white", borderRadius:"var(--r)",
                                          padding:"14px 16px", display:"flex",
                                          alignItems:"center", gap:12 }}>
                  <button onClick={() => toggleDone(r.id)}
                    style={{ width:26, height:26, borderRadius:"50%", flexShrink:0,
                             border:`2px solid ${r.doneDate ? "var(--sage-dk)" : "var(--ink-lt)"}`,
                             background: r.doneDate ? "var(--sage-dk)" : "white",
                             cursor:"pointer", fontSize:13, color:"white",
                             display:"flex", alignItems:"center", justifyContent:"center",
                             transition:"all 0.2s" }}>
                    {r.doneDate ? "✓" : ""}
                  </button>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:500, color: r.doneDate ? "var(--ink-lt)" : "var(--ink)",
                                textDecoration: r.doneDate ? "line-through" : "none" }}>
                      {r.name}
                    </p>
                    {r.doneDate && (
                      <p style={{ fontSize:11, color:"var(--ink-lt)", marginTop:2 }}>
                        Aplicada em {new Date(r.doneDate+"T12:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20,
                                 background:s.color, color:"var(--ink)", whiteSpace:"nowrap" }}>
                    {s.text}
                  </span>
                </div>
              );
            })}
            {activeTab === "upcoming" && future.length > 0 && (
              <p style={{ fontSize:12, color:"var(--ink-lt)", textAlign:"center", padding:"8px" }}>
                + {future.length} vacinas programadas para os próximos meses
              </p>
            )}
          </div>

          {/* SOURCE */}
          <p style={{ fontSize:11, color:"var(--ink-lt)", textAlign:"center", fontStyle:"italic", lineHeight:1.5 }}>
            Calendário baseado no SBP e Ministério da Saúde do Brasil.<br />
            Consulte sempre o pediatra para orientações individualizadas.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
