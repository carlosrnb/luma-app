"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, loadAppointments, saveAppointments, type Appointment } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";
import LumaInsight from "@/components/luma/LumaInsight";

const SPECIALTIES = [
  "Pediatria geral","Cardiologia","Dermatologia","Fisioterapia",
  "Fonoaudiologia","Neurologia","Nutrição","Odontologia","Oftalmologia","Ortopedia",
];

export default function ConsultasPage() {
  const router = useRouter();
  const [appts, setAppts]         = useState<Appointment[]>([]);
  const [adding, setAdding]       = useState(false);
  const [babyName, setBabyName]   = useState("—");
  const [lumaCtx, setLumaCtx]    = useState("");
  const [form, setForm]           = useState({
    date:"", time:"", doctor:"", specialty:"Pediatria geral", notes:"",
  });

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    setBabyName(store.family.baby.name);
    const all = loadAppointments().sort((a,b)=>a.date.localeCompare(b.date));
    setAppts(all);
    const next = all.find(a => a.date >= new Date().toISOString().split("T")[0]);
    setLumaCtx(`Bebê: ${store.family.baby.name}. Próxima consulta: ${next ? `${next.date} com ${next.doctor} (${next.specialty})` : "nenhuma agendada"}.`);
  }, [router]);

  function saveAppt() {
    if (!form.date || !form.doctor) return;
    const appt: Appointment = { ...form, id: crypto.randomUUID() };
    const updated = [...appts, appt].sort((a,b)=>a.date.localeCompare(b.date));
    setAppts(updated);
    saveAppointments(updated);
    setAdding(false);
    setForm({ date:"", time:"", doctor:"", specialty:"Pediatria geral", notes:"" });
  }

  function deleteAppt(id: string) {
    const updated = appts.filter(a => a.id !== id);
    setAppts(updated);
    saveAppointments(updated);
  }

  const today    = new Date().toISOString().split("T")[0];
  const upcoming = appts.filter(a => a.date >= today);
  const past     = appts.filter(a => a.date < today).reverse();

  const inp: React.CSSProperties = {
    width:"100%", background:"var(--bg)", borderRadius:12, padding:"11px 14px",
    fontSize:13, color:"var(--ink)", outline:"none", border:"2px solid transparent",
    fontFamily:"Inter,sans-serif", transition:"border-color 0.2s",
  };

  function ApptCard({ a, isPast }: { a: Appointment; isPast?: boolean }) {
    const dateObj = new Date(a.date+"T12:00:00");
    const dayLabel= dateObj.toLocaleDateString("pt-BR", { weekday:"short", day:"numeric", month:"short" });
    const daysLeft= Math.ceil((dateObj.getTime() - new Date().setHours(0,0,0,0)) / 86400000);
    return (
      <div style={{ background: isPast ? "var(--bg)" : "white", borderRadius:"var(--r)",
                    padding:"14px 16px", border: isPast ? "1px dashed var(--ink-lt)" : "none",
                    opacity: isPast ? 0.7 : 1 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
          <div style={{ background: isPast ? "var(--ink-lt)" : "var(--ink)", borderRadius:12,
                        padding:"8px 10px", textAlign:"center", flexShrink:0 }}>
            <p className="f-nunito" style={{ fontSize:18, fontWeight:800, color:"white", lineHeight:1 }}>
              {dateObj.getDate()}
            </p>
            <p style={{ fontSize:9, color:"rgba(255,255,255,0.6)", textTransform:"uppercase",
                        letterSpacing:"0.5px" }}>
              {dateObj.toLocaleDateString("pt-BR",{month:"short"})}
            </p>
          </div>
          <div style={{ flex:1 }}>
            <p className="f-nunito" style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>
              {a.doctor}
            </p>
            <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:2 }}>{a.specialty}</p>
            {a.time && <p style={{ fontSize:11, color:"var(--ink-lt)", marginTop:2 }}>⏰ {a.time}</p>}
            {a.notes && <p style={{ fontSize:11, color:"var(--ink-lt)", marginTop:4, fontStyle:"italic" }}>{a.notes}</p>}
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
            {!isPast && daysLeft >= 0 && (
              <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20,
                             background: daysLeft===0 ? "var(--sage)" : daysLeft<=3 ? "var(--gold)" : "var(--bg)",
                             color:"var(--ink)" }}>
                {daysLeft===0 ? "Hoje" : `Em ${daysLeft} dias`}
              </span>
            )}
            <button onClick={() => deleteAppt(a.id)}
              style={{ fontSize:12, color:"var(--ink-lt)", background:"none", border:"none",
                       cursor:"pointer", padding:"2px 6px" }}>✕</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div>
        {/* HERO */}
        <div style={{ background:"var(--mint)", borderRadius:"0 0 28px 28px",
                      padding:"52px 22px 28px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160,
                        borderRadius:"50%", background:"var(--mint-icon)", opacity:0.5 }} />
          <button onClick={() => router.back()}
            style={{ position:"absolute", top:18, left:18, width:38, height:38, borderRadius:"50%",
                     background:"rgba(255,255,255,0.6)", border:"none", cursor:"pointer",
                     fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:38, marginBottom:10 }}>🩺</div>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--ink)", textTransform:"uppercase",
                        letterSpacing:"1.2px", marginBottom:4 }}>{babyName}</p>
            <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)" }}>Consultas</h1>
            <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:3 }}>Agenda e histórico médico</p>
          </div>
        </div>

        <div style={{ padding:"18px 18px 40px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* LUMA */}
          <LumaInsight context={lumaCtx}
            question={`Com base na consulta agendada, dê uma orientação curta sobre o que levar ou observar. Seja prático e acolhedor.`} />

          {/* ADD BTN */}
          {!adding && (
            <button onClick={() => setAdding(true)} className="f-nunito"
              style={{ width:"100%", background:"var(--ink)", color:"white", borderRadius:"var(--r)",
                       padding:"14px", border:"none", cursor:"pointer", fontSize:14, fontWeight:700 }}>
              + Adicionar consulta
            </button>
          )}

          {/* ADD FORM */}
          {adding && (
            <div className="fade-up" style={{ background:"white", borderRadius:"var(--r)", padding:"18px" }}>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:16 }}>
                Nova consulta
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { label:"Médico / profissional", placeholder:"Dr. Roberto Silva", key:"doctor" as const },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", textTransform:"uppercase",
                                    letterSpacing:"0.6px", display:"block", marginBottom:6 }}>{f.label}</label>
                    <input placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => setForm({...form, [f.key]:e.target.value})} style={inp}
                      onFocus={e => (e.target.style.borderColor="var(--mint-icon)")}
                      onBlur={e  => (e.target.style.borderColor="transparent")} />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", textTransform:"uppercase",
                                  letterSpacing:"0.6px", display:"block", marginBottom:6 }}>Especialidade</label>
                  <select value={form.specialty} onChange={e => setForm({...form, specialty:e.target.value})}
                    style={{ ...inp, appearance:"none" as const, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%239B9690' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", backgroundSize:16 }}>
                    {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ display:"flex", gap:8 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", textTransform:"uppercase",
                                    letterSpacing:"0.6px", display:"block", marginBottom:6 }}>Data</label>
                    <input type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})}
                      style={inp}
                      onFocus={e => (e.target.style.borderColor="var(--mint-icon)")}
                      onBlur={e  => (e.target.style.borderColor="transparent")} />
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", textTransform:"uppercase",
                                    letterSpacing:"0.6px", display:"block", marginBottom:6 }}>Horário</label>
                    <input type="time" value={form.time} onChange={e => setForm({...form, time:e.target.value})}
                      style={inp}
                      onFocus={e => (e.target.style.borderColor="var(--mint-icon)")}
                      onBlur={e  => (e.target.style.borderColor="transparent")} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", textTransform:"uppercase",
                                  letterSpacing:"0.6px", display:"block", marginBottom:6 }}>Observações</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} rows={2}
                    placeholder="O que levar, dúvidas para perguntar…"
                    style={{ ...inp, resize:"none" as const }} />
                </div>

                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setAdding(false)}
                    style={{ flex:1, padding:"12px", borderRadius:12, border:"none", cursor:"pointer",
                             background:"var(--bg)", color:"var(--ink-mid)", fontFamily:"Nunito,sans-serif",
                             fontSize:13, fontWeight:600 }}>Cancelar</button>
                  <button onClick={saveAppt} disabled={!form.date || !form.doctor}
                    style={{ flex:2, padding:"12px", borderRadius:12, border:"none", cursor:"pointer",
                             background:"var(--ink)", color:"white", fontFamily:"Nunito,sans-serif",
                             fontSize:13, fontWeight:700,
                             opacity:(!form.date || !form.doctor) ? 0.4 : 1 }}>
                    Salvar consulta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* UPCOMING */}
          {upcoming.length > 0 && (
            <div>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:10 }}>
                Próximas consultas
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {upcoming.map(a => <ApptCard key={a.id} a={a} />)}
              </div>
            </div>
          )}

          {upcoming.length === 0 && !adding && (
            <div style={{ background:"white", borderRadius:"var(--r)", padding:"20px", textAlign:"center" }}>
              <p style={{ fontSize:32, marginBottom:8 }}>🩺</p>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>
                Nenhuma consulta agendada
              </p>
              <p style={{ fontSize:12, color:"var(--ink-lt)", lineHeight:1.5 }}>
                Adicione a próxima visita ao pediatra para a Luma te ajudar a se preparar.
              </p>
            </div>
          )}

          {/* PAST */}
          {past.length > 0 && (
            <div>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:10 }}>
                Histórico
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {past.slice(0,5).map(a => <ApptCard key={a.id} a={a} isPast />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
