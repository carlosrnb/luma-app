"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadStore, getAgeInMonths,
  loadVaccineRecords, saveVaccineRecords,
  VACCINE_SCHEDULE, todayKey, type VaccineRecord,
} from "@/lib/store";
import AppShell from "@/components/luma/AppShell";

// Groups for the first-access wizard
const WIZARD_GROUPS = [
  {
    label: "Ao nascer",
    ids: ["bcg", "hepb_0"],
  },
  {
    label: "2 meses",
    ids: ["penta_1", "vip_1", "pneumo_1", "rota_1"],
  },
  {
    label: "3 meses",
    ids: ["meningo_1"],
  },
  {
    label: "4 meses",
    ids: ["penta_2", "vip_2", "pneumo_2", "rota_2"],
  },
  {
    label: "5 meses",
    ids: ["meningo_2"],
  },
  {
    label: "6 meses",
    ids: ["penta_3", "vip_3", "pneumo_3", "hepb_1", "influenza_1"],
  },
  {
    label: "9 meses",
    ids: ["febre_amarela"],
  },
  {
    label: "12 meses",
    ids: ["meningo_ref", "pneumo_ref", "triplice"],
  },
  {
    label: "15 meses",
    ids: ["varicela", "dtp_ref1", "vop_ref", "triplice_2", "hepA"],
  },
  {
    label: "4 anos",
    ids: ["dtp_ref2", "vop_ref2"],
  },
];

const STORAGE_WIZARD_KEY = "luma_vac_wizard_done";

function wizardDone(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_WIZARD_KEY) === "1";
}
function markWizardDone() {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_WIZARD_KEY, "1");
}

export default function VacinacaoPage() {
  const router = useRouter();
  const [months, setMonths]         = useState(0);
  const [babyName, setBabyName]     = useState("—");
  const [records, setRecords]       = useState<VaccineRecord[]>([]);
  const [activeTab, setActiveTab]   = useState<"upcoming" | "done" | "all">("upcoming");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0); // index into WIZARD_GROUPS
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    const m = getAgeInMonths(store.family.baby.birthDate);
    setMonths(m);
    setBabyName(store.family.baby.name);
    const recs = loadVaccineRecords();
    setRecords(recs);

    // Show wizard if never completed AND no vaccines marked done yet
    const noDone = recs.filter(r => !!r.doneDate).length === 0;
    if (!wizardDone() && noDone) setShowWizard(true);
  }, [router]);

  // Wizard: toggle a vaccine id
  function toggleId(id: string) {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Wizard: mark all checked as done and close
  function applyWizard() {
    const updated = records.map(r =>
      checkedIds.has(r.id) ? { ...r, doneDate: todayKey() } : r
    );
    setRecords(updated);
    saveVaccineRecords(updated);
    markWizardDone();
    setShowWizard(false);
  }

  // Skip wizard — mark all past-due as done automatically
  function skipWizard() {
    markWizardDone();
    setShowWizard(false);
  }

  // Main list actions
  function toggleDone(id: string) {
    const updated = records.map(r =>
      r.id === id ? { ...r, doneDate: r.doneDate ? undefined : todayKey() } : r
    );
    setRecords(updated);
    saveVaccineRecords(updated);
  }

  const upcoming  = records.filter(r => !r.doneDate && r.dueMonths <= months + 1);
  const overdue   = records.filter(r => !r.doneDate && r.dueMonths < months);
  const done      = records.filter(r => !!r.doneDate);
  const future    = records.filter(r => !r.doneDate && r.dueMonths > months + 1);
  const pct       = Math.round((done.length / records.length) * 100);

  // current wizard group filtered to doses relevant for baby's age
  const eligibleGroups = WIZARD_GROUPS.filter(g => {
    const minAge = Math.min(...g.ids.map(id => VACCINE_SCHEDULE.find(v => v.id === id)?.dueMonths ?? 999));
    return minAge <= months;
  });
  const currentGroup = eligibleGroups[wizardStep];

  function statusLabel(r: VaccineRecord) {
    if (r.doneDate) return { text: "Aplicada", color: "var(--sage)" };
    if (r.dueMonths < months) return { text: "Atrasada", color: "var(--coral)" };
    if (r.dueMonths <= months + 1) return { text: "Agora", color: "var(--gold)" };
    return { text: `${r.dueMonths} m`, color: "var(--bg)" };
  }

  const displayed = activeTab === "upcoming"
    ? [...new Map([...overdue, ...upcoming].map(r => [r.id, r])).values()]
    : activeTab === "done" ? done : records;

  // ── WIZARD UI ──
  if (showWizard) return (
    <AppShell>
      <div style={{ padding: "40px 22px 48px", minHeight: "100%" }}>

        {/* header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💉</div>
          <h1 className="f-nunito" style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>
            Vamos atualizar a carteira do {babyName}?
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-lt)", lineHeight: 1.6 }}>
            Marque as vacinas que já foram aplicadas. Leva só 1 minuto.
          </p>
        </div>

        {/* progress dots */}
        <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
          {eligibleGroups.map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 4, flex: 1,
              background: i <= wizardStep ? "var(--sage-dk)" : "var(--bg)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {currentGroup && (
          <div className="fade-up">
            <p style={{
              fontSize: 11, fontWeight: 700, color: "var(--ink-lt)",
              textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12,
            }}>
              Vacinas — {currentGroup.label}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {currentGroup.ids.map(id => {
                const vac = VACCINE_SCHEDULE.find(v => v.id === id);
                if (!vac) return null;
                const checked = checkedIds.has(id);
                return (
                  <button key={id} onClick={() => toggleId(id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: checked ? "var(--sage)" : "white",
                      borderRadius: "var(--r)", padding: "14px 16px",
                      border: "none", cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s",
                    }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${checked ? "var(--sage-dk)" : "var(--ink-lt)"}`,
                      background: checked ? "var(--sage-dk)" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: "white", transition: "all 0.2s",
                    }}>
                      {checked ? "✓" : ""}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{vac.name}</p>
                  </button>
                );
              })}
            </div>

            {/* nav buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {wizardStep > 0 && (
                <button onClick={() => setWizardStep(s => s - 1)}
                  style={{
                    flex: 1, padding: "13px", borderRadius: 14, border: "none",
                    background: "var(--bg)", cursor: "pointer",
                    fontFamily: "Nunito, sans-serif", fontSize: 14, fontWeight: 600, color: "var(--ink-mid)",
                  }}>← Voltar</button>
              )}
              {wizardStep < eligibleGroups.length - 1 ? (
                <button onClick={() => setWizardStep(s => s + 1)}
                  style={{
                    flex: 2, padding: "13px", borderRadius: 14, border: "none",
                    background: "var(--ink)", color: "white", cursor: "pointer",
                    fontFamily: "Nunito, sans-serif", fontSize: 14, fontWeight: 700,
                  }}>Próximo →</button>
              ) : (
                <button onClick={applyWizard}
                  style={{
                    flex: 2, padding: "13px", borderRadius: 14, border: "none",
                    background: "var(--sage-dk)", color: "white", cursor: "pointer",
                    fontFamily: "Nunito, sans-serif", fontSize: 14, fontWeight: 700,
                  }}>Salvar carteira ✓</button>
              )}
            </div>

            <button onClick={skipWizard}
              style={{
                width: "100%", marginTop: 12, padding: "10px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "var(--ink-lt)", fontFamily: "Inter, sans-serif",
              }}>
              Pular por agora — vou marcar manualmente depois
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );

  // ── MAIN UI ──
  return (
    <AppShell>
      <div>
        {/* HERO */}
        <div style={{
          background: "var(--blush)", borderRadius: "0 0 28px 28px",
          padding: "52px 22px 28px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40, width: 160, height: 160,
            borderRadius: "50%", background: "var(--blush-icon)", opacity: 0.5,
          }} />
          <button onClick={() => router.back()}
            style={{
              position: "absolute", top: 18, left: 18, width: 38, height: 38,
              borderRadius: "50%", background: "rgba(255,255,255,0.6)",
              border: "none", cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>💉</div>
            <p style={{
              fontSize: 10, fontWeight: 700, color: "var(--ink)",
              textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 4,
            }}>{babyName} · {months} meses</p>
            <h1 className="f-nunito" style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)" }}>Vacinação</h1>
            <p style={{ fontSize: 12, color: "var(--ink-mid)", marginTop: 3 }}>
              Calendário SBP / Ministério da Saúde
            </p>
          </div>
        </div>

        <div style={{ padding: "18px 18px 40px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* PROGRESS */}
          <div style={{ background: "var(--ink)", borderRadius: "var(--r)", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <p className="f-nunito" style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
                Progresso da vacinação
              </p>
              <p className="f-nunito" style={{ fontSize: 14, fontWeight: 800, color: "var(--sage)" }}>
                {pct}%
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 8, marginBottom: 10 }}>
              <div style={{
                width: `${pct}%`, height: "100%", background: "var(--sage-dk)",
                borderRadius: 99, transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                {done.length} de {records.length} vacinas aplicadas
                {overdue.length > 0 && ` · ${overdue.length} atrasada${overdue.length > 1 ? "s" : ""}`}
              </p>
              <button onClick={() => { markWizardDone(); setCheckedIds(new Set()); setWizardStep(0); setShowWizard(true); }}
                style={{
                  fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer",
                  padding: "4px 10px", borderRadius: 20,
                }}>
                Atualizar carteira
              </button>
            </div>
          </div>

          {/* ALERT — only if overdue AND no vaccines done */}
          {overdue.length > 0 && done.length === 0 && (
            <div style={{
              background: "var(--coral)", borderRadius: "var(--r)",
              padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <p className="f-nunito" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>
                  Carteira não atualizada
                </p>
                <p style={{ fontSize: 12, color: "var(--ink-mid)", lineHeight: 1.5 }}>
                  Clique em "Atualizar carteira" acima para marcar as vacinas já aplicadas do {babyName}.
                </p>
              </div>
            </div>
          )}

          {overdue.length > 0 && done.length > 0 && (
            <div style={{
              background: "var(--gold)", borderRadius: "var(--r)",
              padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <div>
                <p className="f-nunito" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>
                  {overdue.length} vacina{overdue.length > 1 ? "s" : ""} a agendar
                </p>
                <p style={{ fontSize: 12, color: "var(--ink-mid)", lineHeight: 1.5 }}>
                  Fale com o pediatra na próxima consulta para atualizar o calendário.
                </p>
              </div>
            </div>
          )}

          {/* TABS */}
          <div style={{ display: "flex", gap: 6 }}>
            {([
              { id: "upcoming" as const, label: `A fazer (${upcoming.length + overdue.length})` },
              { id: "done" as const, label: `Feitas (${done.length})` },
              { id: "all" as const, label: "Todas" },
            ]).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  flex: 1, padding: "9px 4px", borderRadius: 12, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
                  background: activeTab === t.id ? "var(--ink)" : "white",
                  color: activeTab === t.id ? "white" : "var(--ink-mid)",
                  transition: "all 0.15s",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* EMPTY STATE */}
          {displayed.length === 0 && activeTab === "done" && (
            <div style={{ background: "white", borderRadius: "var(--r)", padding: "24px", textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>💉</p>
              <p className="f-nunito" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Nenhuma vacina marcada ainda
              </p>
              <p style={{ fontSize: 12, color: "var(--ink-lt)", lineHeight: 1.5 }}>
                Clique no círculo ao lado de cada vacina para marcar como aplicada.
              </p>
            </div>
          )}

          {/* VACCINE LIST */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayed.map(r => {
              const s = statusLabel(r);
              return (
                <div key={r.id} style={{
                  background: "white", borderRadius: "var(--r)",
                  padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <button onClick={() => toggleDone(r.id)}
                    style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${r.doneDate ? "var(--sage-dk)" : "var(--ink-lt)"}`,
                      background: r.doneDate ? "var(--sage-dk)" : "white",
                      cursor: "pointer", fontSize: 13, color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>
                    {r.doneDate ? "✓" : ""}
                  </button>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 500,
                      color: r.doneDate ? "var(--ink-lt)" : "var(--ink)",
                      textDecoration: r.doneDate ? "line-through" : "none",
                    }}>
                      {r.name}
                    </p>
                    {r.doneDate && (
                      <p style={{ fontSize: 11, color: "var(--ink-lt)", marginTop: 2 }}>
                        Aplicada em {new Date(r.doneDate + "T12:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                    background: s.color, color: "var(--ink)", whiteSpace: "nowrap",
                  }}>
                    {s.text}
                  </span>
                </div>
              );
            })}

            {activeTab === "upcoming" && future.length > 0 && (
              <p style={{ fontSize: 12, color: "var(--ink-lt)", textAlign: "center", padding: "8px" }}>
                + {future.length} vacinas programadas para os próximos meses
              </p>
            )}
          </div>

          <p style={{
            fontSize: 11, color: "var(--ink-lt)", textAlign: "center",
            fontStyle: "italic", lineHeight: 1.5,
          }}>
            Calendário baseado no SBP e Ministério da Saúde do Brasil.<br />
            Consulte sempre o pediatra para orientações individualizadas.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
