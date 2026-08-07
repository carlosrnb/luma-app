"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, getAgeFull, getAgeInMonths } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";
import LumaInsight from "@/components/luma/LumaInsight";

interface Milestone { area: string; bg: string; icon: string; items: { text: string; done: boolean }[]; }

function getMilestones(months: number): Milestone[] {
  if (months < 6) return [
    { area:"Motor",        bg:"var(--sage)",  icon:"🌱", items:[{text:"Levanta a cabeça quando de bruço",done:true},{text:"Rola de barriga para cima",done:true},{text:"Segura objetos por alguns segundos",done:false}] },
    { area:"Comunicação",  bg:"var(--lav)",   icon:"💬", items:[{text:"Sorri quando você fala",done:true},{text:"Faz sons de vogais",done:true}] },
    { area:"Social",       bg:"var(--peach)", icon:"🤝", items:[{text:"Reconhece rosto dos pais",done:true},{text:"Responde com expressões",done:false}] },
  ];
  if (months < 12) return [
    { area:"Motor",        bg:"var(--sage)",  icon:"🌱", items:[{text:"Senta sem apoio por alguns segundos",done:true},{text:"Apoia peso nas pernas quando seguro",done:true},{text:"Passa objetos de mão em mão",done:false},{text:"Começa a engatinhar",done:false}] },
    { area:"Comunicação",  bg:"var(--lav)",   icon:"💬", items:[{text:"Balbucia combinando sílabas (ba-ba, ma-ma)",done:true},{text:"Vira quando ouve o próprio nome",done:true},{text:"Imita sons simples",done:false}] },
    { area:"Social",       bg:"var(--peach)", icon:"🤝", items:[{text:"Estende os braços para colo",done:true},{text:"Demonstra preferência por pessoas conhecidas",done:true}] },
    { area:"Cognitivo",    bg:"var(--gold)",  icon:"✨", items:[{text:"Procura objeto que escondeu",done:false},{text:"Explora objetos com as mãos e boca",done:true}] },
  ];
  return [
    { area:"Motor",        bg:"var(--sage)",  icon:"🌱", items:[{text:"Fica de pé com apoio",done:true},{text:"Dá os primeiros passos",done:false},{text:"Usa pinça (polegar + indicador)",done:true}] },
    { area:"Comunicação",  bg:"var(--lav)",   icon:"💬", items:[{text:"Fala as primeiras palavras",done:false},{text:"Entende comandos simples",done:true}] },
    { area:"Social",       bg:"var(--peach)", icon:"🤝", items:[{text:"Imita gestos (tchau, palminhas)",done:true},{text:"Brinca de esconde-esconde",done:true}] },
  ];
}

export default function DesenvolvimentoPage() {
  const router = useRouter();
  const [babyName, setBabyName] = useState("—");
  const [age, setAge]           = useState("—");
  const [months, setMonths]     = useState(0);
  const [lumaCtx, setLumaCtx]  = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    const name = store.family.baby.name;
    const a    = getAgeFull(store.family.baby.birthDate);
    const m    = getAgeInMonths(store.family.baby.birthDate);
    setBabyName(name); setAge(a); setMonths(m);
    setMilestones(getMilestones(m));
    setLumaCtx(`Bebê: ${name}, ${a}. Fase: ${m} meses.`);
  }, [router]);

  return (
    <AppShell>
      <div style={{ paddingBottom:80 }}>
        {/* HERO */}
        <div style={{ background:"var(--sage)", borderRadius:"0 0 32px 32px", padding:"56px 24px 32px",
                      position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200,
                        borderRadius:"50%", background:"var(--sage-icon)", opacity:0.5 }} />
          <button onClick={() => router.back()}
            style={{ position:"absolute", top:20, left:20, width:40, height:40, borderRadius:"50%",
                     background:"rgba(255,255,255,0.55)", border:"none", cursor:"pointer", fontSize:17 }}>←</button>
          <div style={{ fontSize:42, marginBottom:12, position:"relative" }}>🌱</div>
          <p style={{ fontSize:11, fontWeight:700, color:"var(--sage-dk)", textTransform:"uppercase",
                      letterSpacing:"1px", marginBottom:6, position:"relative" }}>{babyName} · {age}</p>
          <h1 className="f-nunito" style={{ fontSize:28, fontWeight:800, color:"var(--ink)", position:"relative" }}>Desenvolvimento</h1>
          <p style={{ fontSize:13, color:"var(--ink-mid)", marginTop:4, position:"relative" }}>O que esperar nessa fase</p>
        </div>

        <div style={{ padding:"20px 20px 0" }}>
          <LumaInsight context={lumaCtx}
            question={`Dê uma mensagem curta e acolhedora sobre o desenvolvimento de ${babyName} nessa fase de ${months} meses. Sem alarme, sem comparação, sem percentil.`} />
        </div>

        <div style={{ padding:"16px 20px 0" }}>
          <div style={{ background:"rgba(239,228,192,0.6)", borderRadius:"var(--r)", padding:"14px 16px",
                        display:"flex", gap:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:20 }}>💛</span>
            <p style={{ fontSize:13, color:"var(--ink-mid)", lineHeight:1.6 }}>
              Cada criança tem seu próprio ritmo. Esses marcos são referências gerais — não metas ou cobranças.
            </p>
          </div>
        </div>

        <div style={{ padding:"16px 20px 0", display:"flex", flexDirection:"column", gap:14 }}>
          {milestones.map(area => (
            <div key={area.area} style={{ background:"white", borderRadius:"var(--r)", overflow:"hidden" }}>
              <div style={{ background:area.bg, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:20 }}>{area.icon}</span>
                <p className="f-nunito" style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>{area.area}</p>
              </div>
              <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
                {area.items.map(item => (
                  <div key={item.text} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:2,
                                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:11,
                                  background: item.done ? "var(--sage-dk)" : "var(--bg)",
                                  border: item.done ? "none" : "2px solid var(--sage)",
                                  color: "white" }}>
                      {item.done ? "✓" : ""}
                    </div>
                    <p style={{ fontSize:13, lineHeight:1.4, color: item.done ? "var(--ink)" : "var(--ink-lt)" }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize:12, color:"var(--ink-lt)", textAlign:"center", padding:"16px 32px", fontStyle:"italic", lineHeight:1.5 }}>
          Baseado em diretrizes da OMS e Sociedade Brasileira de Pediatria. Sempre consulte seu pediatra para uma avaliação individualizada.
        </p>
      </div>
    </AppShell>
  );
}
