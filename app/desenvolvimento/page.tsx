"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStore, getAgeFull, getAgeInMonths } from "@/lib/store";
import AppShell from "@/components/luma/AppShell";
import LumaInsight from "@/components/luma/LumaInsight";

interface Milestone { area:string; bg:string; icon:string; items:{text:string;done:boolean}[]; }

function getMilestones(months:number):Milestone[] {
  if (months < 6) return [
    { area:"Motor",       bg:"var(--sage)",  icon:"🌱", items:[{text:"Levanta a cabeça quando de bruço",done:true},{text:"Rola de barriga para cima",done:true},{text:"Segura objetos por alguns segundos",done:false}]},
    { area:"Comunicação", bg:"var(--lav)",   icon:"💬", items:[{text:"Sorri quando você fala",done:true},{text:"Faz sons de vogais",done:true}]},
    { area:"Social",      bg:"var(--peach)", icon:"🤝", items:[{text:"Reconhece rosto dos pais",done:true},{text:"Responde com expressões",done:false}]},
  ];
  if (months < 12) return [
    { area:"Motor",       bg:"var(--sage)",  icon:"🌱", items:[{text:"Senta sem apoio por alguns segundos",done:true},{text:"Apoia peso nas pernas quando seguro",done:true},{text:"Passa objetos de mão em mão",done:false},{text:"Começa a engatinhar",done:false}]},
    { area:"Comunicação", bg:"var(--lav)",   icon:"💬", items:[{text:"Balbucia combinando sílabas (ba-ba, ma-ma)",done:true},{text:"Vira quando ouve o próprio nome",done:true},{text:"Imita sons simples",done:false}]},
    { area:"Social",      bg:"var(--peach)", icon:"🤝", items:[{text:"Estende os braços para colo",done:true},{text:"Demonstra preferência por pessoas conhecidas",done:true}]},
    { area:"Cognitivo",   bg:"var(--gold)",  icon:"✨", items:[{text:"Procura objeto que escondeu",done:false},{text:"Explora objetos com as mãos e boca",done:true}]},
  ];
  return [
    { area:"Motor",       bg:"var(--sage)",  icon:"🌱", items:[{text:"Fica de pé com apoio",done:true},{text:"Dá os primeiros passos",done:false},{text:"Usa pinça (polegar + indicador)",done:true}]},
    { area:"Comunicação", bg:"var(--lav)",   icon:"💬", items:[{text:"Fala as primeiras palavras",done:false},{text:"Entende comandos simples",done:true}]},
    { area:"Social",      bg:"var(--peach)", icon:"🤝", items:[{text:"Imita gestos (tchau, palminhas)",done:true},{text:"Brinca de esconde-esconde",done:true}]},
  ];
}

export default function DesenvolvimentoPage() {
  const router = useRouter();
  const [babyName, setBabyName]     = useState("—");
  const [age, setAge]               = useState("—");
  const [months, setMonths]         = useState(0);
  const [lumaCtx, setLumaCtx]      = useState("");
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
      <div>
        {/* HERO */}
        <div style={{ background:"var(--sage)", borderRadius:"0 0 28px 28px",
                      padding:"52px 22px 28px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180,
                        borderRadius:"50%", background:"var(--sage-icon)", opacity:0.5, pointerEvents:"none" }} />
          <button onClick={() => router.back()}
            style={{ position:"absolute", top:18, left:18, width:38, height:38, borderRadius:"50%",
                     background:"rgba(255,255,255,0.6)", backdropFilter:"blur(8px)",
                     border:"none", cursor:"pointer", fontSize:16, color:"var(--ink)",
                     display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:38, marginBottom:10 }}>🌱</div>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--sage-dk)", textTransform:"uppercase",
                        letterSpacing:"1.2px", marginBottom:4 }}>{babyName} · {age}</p>
            <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)" }}>Desenvolvimento</h1>
            <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:3 }}>O que esperar nessa fase</p>
          </div>
        </div>

        <div style={{ padding:"18px 18px 32px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* LUMA */}
          <LumaInsight context={lumaCtx}
            question={`Dê uma mensagem curta e acolhedora sobre o desenvolvimento de ${babyName} nessa fase de ${months} meses. Sem alarme, sem comparação.`} />

          {/* FRAMING */}
          <div style={{ background:"rgba(239,228,192,0.6)", borderRadius:"var(--r)",
                        padding:"13px 16px", display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>💛</span>
            <p style={{ fontSize:12, color:"var(--ink-mid)", lineHeight:1.6 }}>
              Cada criança tem seu próprio ritmo. Esses marcos são referências gerais — não metas ou cobranças. O que importa é a evolução do {babyName}.
            </p>
          </div>

          {/* MILESTONES */}
          {milestones.map(area => (
            <div key={area.area} style={{ background:"white", borderRadius:"var(--r)", overflow:"hidden" }}>
              <div style={{ background:area.bg, padding:"11px 16px",
                            display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:17 }}>{area.icon}</span>
                <p className="f-nunito" style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>{area.area}</p>
              </div>
              <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
                {area.items.map(item => (
                  <div key={item.text} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{
                      width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:1,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:10,
                      background: item.done ? "var(--sage-dk)" : "transparent",
                      border: item.done ? "none" : "2px solid var(--sage-dk)",
                      color:"white",
                    }}>
                      {item.done ? "✓" : ""}
                    </div>
                    <p style={{ fontSize:13, lineHeight:1.4,
                                color: item.done ? "var(--ink)" : "var(--ink-lt)" }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* DISCLAIMER */}
          <p style={{ fontSize:11, color:"var(--ink-lt)", textAlign:"center",
                      lineHeight:1.6, fontStyle:"italic", padding:"0 8px" }}>
            Baseado em diretrizes da OMS e Sociedade Brasileira de Pediatria.<br />
            Sempre consulte seu pediatra para uma avaliação individualizada.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
