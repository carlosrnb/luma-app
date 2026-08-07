"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, getAgeFull, getAgeInMonths, loadGrowthLogs, saveGrowthLogs, todayKey, type GrowthLog } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";
import LumaInsight from "@/components/luma/LumaInsight";

// WHO median references (simplified)
const WHO_WEIGHT: Record<number, number> = {
  0:3.3,1:4.5,2:5.6,3:6.4,4:7.0,5:7.5,6:7.9,
  7:8.3,8:8.6,9:8.9,10:9.2,11:9.4,12:9.6,
  18:10.9,24:12.2,36:14.3,48:16.3,60:18.3,
};
const WHO_HEIGHT: Record<number, number> = {
  0:49.9,1:54.7,2:58.4,3:61.4,4:63.9,5:65.9,6:67.6,
  7:69.2,8:70.6,9:72.0,10:73.3,11:74.5,12:75.7,
  18:82.3,24:87.8,36:96.1,48:103.3,60:110.0,
};

function getRef(table: Record<number,number>, months: number): number {
  const keys = Object.keys(table).map(Number).sort((a,b)=>a-b);
  let prev = keys[0], next = keys[keys.length-1];
  for (const k of keys) { if (k <= months) prev = k; if (k >= months && k < next) next = k; }
  if (prev === next) return table[prev];
  const ratio = (months - prev) / (next - prev);
  return table[prev] + ratio * (table[next] - table[prev]);
}

export default function CrescimentoPage() {
  const router = useRouter();
  const [babyName, setBabyName] = useState("—");
  const [ageStr, setAgeStr]     = useState("—");
  const [months, setMonths]     = useState(0);
  const [logs, setLogs]         = useState<GrowthLog[]>([]);
  const [adding, setAdding]     = useState(false);
  const [weight, setWeight]     = useState("");
  const [height, setHeight]     = useState("");
  const [head, setHead]         = useState("");
  const [lumaCtx, setLumaCtx]  = useState("");

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    const m  = getAgeInMonths(store.family.baby.birthDate);
    const a  = getAgeFull(store.family.baby.birthDate);
    const nm = store.family.baby.name;
    setMonths(m); setAgeStr(a); setBabyName(nm);
    const all = loadGrowthLogs();
    setLogs(all.sort((a,b) => a.date.localeCompare(b.date)));
    const last = all[all.length-1];
    setLumaCtx(`Bebê: ${nm}, ${a}. Último peso: ${last?.weightKg ?? "não registrado"} kg. Última altura: ${last?.heightCm ?? "não registrada"} cm.`);
  }, [router]);

  function saveLog() {
    if (!weight && !height && !head) return;
    const log: GrowthLog = {
      date: todayKey(),
      weightKg: weight ? parseFloat(weight) : undefined,
      heightCm: height ? parseFloat(height) : undefined,
      headCm:   head   ? parseFloat(head)   : undefined,
    };
    const updated = [...logs.filter(l => l.date !== todayKey()), log]
      .sort((a,b) => a.date.localeCompare(b.date));
    setLogs(updated);
    saveGrowthLogs(updated);
    setAdding(false); setWeight(""); setHeight(""); setHead("");
  }

  const last = logs[logs.length - 1];
  const refW = getRef(WHO_WEIGHT, months).toFixed(1);
  const refH = getRef(WHO_HEIGHT, months).toFixed(1);

  function diffLabel(val: number, ref: number, unit: string) {
    const diff = val - ref;
    const pct  = Math.abs(diff / ref * 100);
    if (pct < 10) return { text:"Na média", color:"var(--sage)" };
    if (diff > 0) return { text:`+${diff.toFixed(1)}${unit} acima`, color:"var(--sky)" };
    return { text:`${diff.toFixed(1)}${unit} abaixo`, color:"var(--coral)" };
  }

  const inp: React.CSSProperties = {
    flex:1, background:"var(--bg)", borderRadius:12, padding:"11px 14px",
    fontSize:14, color:"var(--ink)", outline:"none", border:"2px solid transparent",
    fontFamily:"Inter,sans-serif", transition:"border-color 0.2s",
  };

  return (
    <AppShell>
      <div>
        {/* HERO */}
        <div style={{ background:"var(--sky)", borderRadius:"0 0 28px 28px",
                      padding:"52px 22px 28px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160,
                        borderRadius:"50%", background:"var(--sky-icon)", opacity:0.5 }} />
          <button onClick={() => router.back()}
            style={{ position:"absolute", top:18, left:18, width:38, height:38, borderRadius:"50%",
                     background:"rgba(255,255,255,0.6)", border:"none", cursor:"pointer",
                     fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:38, marginBottom:10 }}>📏</div>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--ink)", textTransform:"uppercase",
                        letterSpacing:"1.2px", marginBottom:4 }}>{babyName} · {ageStr}</p>
            <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)" }}>Crescimento</h1>
            <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:3 }}>Peso, altura e perímetro cefálico</p>
          </div>
        </div>

        <div style={{ padding:"18px 18px 40px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* LUMA */}
          <LumaInsight context={lumaCtx}
            question={`Dê uma observação acolhedora sobre o crescimento de ${babyName} nessa fase de ${months} meses. Sem percentil alarmante.`} />

          {/* LAST RECORD */}
          {last ? (
            <div style={{ background:"var(--ink)", borderRadius:"var(--r)", padding:"18px" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.5)",
                          textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>
                Último registro · {new Date(last.date+"T12:00:00").toLocaleDateString("pt-BR", { day:"numeric", month:"long" })}
              </p>
              <div style={{ display:"flex", gap:12 }}>
                {last.weightKg && (
                  <div style={{ flex:1, background:"rgba(255,255,255,0.08)", borderRadius:14, padding:"12px" }}>
                    <p style={{ fontSize:22, fontWeight:800, color:"white", fontFamily:"Nunito,sans-serif" }}>
                      {last.weightKg}<span style={{ fontSize:13 }}>kg</span>
                    </p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:2 }}>Peso</p>
                    {(() => { const d = diffLabel(last.weightKg!, parseFloat(refW), "kg"); return (
                      <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20,
                                     background:d.color, color:"var(--ink)", marginTop:6, display:"inline-block" }}>
                        {d.text}
                      </span>
                    );})()}
                  </div>
                )}
                {last.heightCm && (
                  <div style={{ flex:1, background:"rgba(255,255,255,0.08)", borderRadius:14, padding:"12px" }}>
                    <p style={{ fontSize:22, fontWeight:800, color:"white", fontFamily:"Nunito,sans-serif" }}>
                      {last.heightCm}<span style={{ fontSize:13 }}>cm</span>
                    </p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:2 }}>Altura</p>
                    {(() => { const d = diffLabel(last.heightCm!, parseFloat(refH), "cm"); return (
                      <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20,
                                     background:d.color, color:"var(--ink)", marginTop:6, display:"inline-block" }}>
                        {d.text}
                      </span>
                    );})()}
                  </div>
                )}
                {last.headCm && (
                  <div style={{ flex:1, background:"rgba(255,255,255,0.08)", borderRadius:14, padding:"12px" }}>
                    <p style={{ fontSize:22, fontWeight:800, color:"white", fontFamily:"Nunito,sans-serif" }}>
                      {last.headCm}<span style={{ fontSize:13 }}>cm</span>
                    </p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:2 }}>Cabeça</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background:"white", borderRadius:"var(--r)", padding:"20px", textAlign:"center" }}>
              <p style={{ fontSize:32, marginBottom:8 }}>📏</p>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>
                Nenhum registro ainda
              </p>
              <p style={{ fontSize:12, color:"var(--ink-lt)", lineHeight:1.5 }}>
                Registre o peso e a altura do {babyName} após cada consulta para acompanhar a evolução.
              </p>
            </div>
          )}

          {/* ADD BTN */}
          {!adding && (
            <button onClick={() => setAdding(true)} className="f-nunito"
              style={{ width:"100%", background:"var(--sky)", borderRadius:"var(--r)", padding:"14px",
                       border:"none", cursor:"pointer", fontSize:14, fontWeight:700, color:"var(--ink)" }}>
              + Registrar medidas de hoje
            </button>
          )}

          {/* ADD FORM */}
          {adding && (
            <div className="fade-up" style={{ background:"white", borderRadius:"var(--r)", padding:"18px" }}>
              <p className="f-nunito" style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:16 }}>
                Registrar medidas
              </p>
              {[
                { label:"Peso (kg)", placeholder:"Ex: 7.8", val:weight, set:setWeight },
                { label:"Altura (cm)", placeholder:"Ex: 68", val:height, set:setHeight },
                { label:"Perímetro cefálico (cm)", placeholder:"Ex: 43", val:head, set:setHead },
              ].map(f => (
                <div key={f.label} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)", textTransform:"uppercase",
                                  letterSpacing:"0.6px", display:"block", marginBottom:6 }}>{f.label}</label>
                  <input type="number" inputMode="decimal" placeholder={f.placeholder} value={f.val}
                    onChange={e => f.set(e.target.value)} style={{ ...inp, width:"100%" }}
                    onFocus={e => (e.target.style.borderColor="var(--sky-icon)")}
                    onBlur={e  => (e.target.style.borderColor="transparent")} />
                </div>
              ))}
              <p style={{ fontSize:11, color:"var(--ink-lt)", marginBottom:14, fontStyle:"italic" }}>
                Preencha apenas os campos que você tem. Os outros ficam em branco.
              </p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setAdding(false)}
                  style={{ flex:1, padding:"12px", borderRadius:12, border:"none", cursor:"pointer",
                           background:"var(--bg)", color:"var(--ink-mid)", fontFamily:"Nunito,sans-serif",
                           fontSize:13, fontWeight:600 }}>Cancelar</button>
                <button onClick={saveLog} disabled={!weight && !height && !head}
                  style={{ flex:2, padding:"12px", borderRadius:12, border:"none", cursor:"pointer",
                           background:"var(--ink)", color:"white", fontFamily:"Nunito,sans-serif",
                           fontSize:13, fontWeight:700,
                           opacity:(!weight && !height && !head) ? 0.4 : 1 }}>
                  Salvar
                </button>
              </div>
            </div>
          )}

          {/* REFERENCE */}
          <div style={{ background:"white", borderRadius:"var(--r)", padding:"16px 18px" }}>
            <p className="f-nunito" style={{ fontSize:13, fontWeight:800, color:"var(--ink)", marginBottom:12 }}>
              Referência OMS para {months} meses
            </p>
            <div style={{ display:"flex", gap:10 }}>
              {[
                { label:"Peso mediano", val:`${refW} kg` },
                { label:"Altura mediana", val:`${refH} cm` },
              ].map(r => (
                <div key={r.label} style={{ flex:1, background:"var(--bg)", borderRadius:12, padding:"12px" }}>
                  <p style={{ fontSize:10, color:"var(--ink-lt)", marginBottom:4 }}>{r.label}</p>
                  <p className="f-nunito" style={{ fontSize:18, fontWeight:800, color:"var(--ink)" }}>{r.val}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize:11, color:"var(--ink-lt)", marginTop:10, fontStyle:"italic", lineHeight:1.5 }}>
              A mediana é um ponto de referência, não um objetivo. Cada criança cresce no seu próprio ritmo.
            </p>
          </div>

          {/* HISTORY TABLE */}
          {logs.length > 1 && (
            <div style={{ background:"white", borderRadius:"var(--r)", padding:"16px 18px" }}>
              <p className="f-nunito" style={{ fontSize:13, fontWeight:800, color:"var(--ink)", marginBottom:12 }}>
                Histórico
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[...logs].reverse().slice(0,6).map((l,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                                         padding:"8px 0", borderBottom:"1px solid var(--bg)" }}>
                    <p style={{ fontSize:11, color:"var(--ink-lt)", minWidth:80 }}>
                      {new Date(l.date+"T12:00:00").toLocaleDateString("pt-BR", { day:"2-digit", month:"short" })}
                    </p>
                    {l.weightKg && <span style={{ fontSize:12, color:"var(--ink)", fontWeight:600 }}>{l.weightKg} kg</span>}
                    {l.heightCm && <span style={{ fontSize:12, color:"var(--ink-mid)" }}>· {l.heightCm} cm</span>}
                    {l.headCm   && <span style={{ fontSize:12, color:"var(--ink-lt)" }}>· cabeça {l.headCm} cm</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
