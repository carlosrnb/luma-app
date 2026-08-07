"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadProStatus, saveProStatus } from "@/lib/store";

const FEATURES_FREE = [
  "Insight diário da Luma",
  "Registro de sono",
  "Gráfico dos últimos 7 dias",
  "Marcos de desenvolvimento",
  "3 perguntas por dia no chat",
];

const FEATURES_PRO = [
  { icon:"💬", text:"Chat ilimitado com a Luma" },
  { icon:"📊", text:"Histórico completo de sono" },
  { icon:"🥣", text:"Introdução alimentar guiada" },
  { icon:"📏", text:"Curva de crescimento" },
  { icon:"💉", text:"Calendário vacinal com alertas" },
  { icon:"📋", text:"Resumo pré-consulta da Luma" },
  { icon:"👨‍👩‍👧", text:"Múltiplos filhos" },
  { icon:"🤝", text:"Compartilhar com família" },
  { icon:"📄", text:"Relatório PDF para o pediatra" },
];

const PLANS = [
  { id:"monthly", label:"Mensal",  price:"R$ 19,90", sub:"/mês",  badge:null,          highlight:false },
  { id:"annual",  label:"Anual",   price:"R$ 12,40", sub:"/mês",  badge:"Melhor valor", highlight:true  },
  { id:"family",  label:"Família", price:"R$ 24,90", sub:"/mês",  badge:"Até 5 membros",highlight:false },
];

export default function ProPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);

  function handleSubscribe() {
    setLoading(true);
    // Simulate payment — in production connect Stripe/RevenueCat
    setTimeout(() => {
      const status = loadProStatus();
      saveProStatus({ ...status, isPro: true });
      setLoading(false);
      setDone(true);
      setTimeout(() => router.replace("/home"), 2000);
    }, 1800);
  }

  if (done) return (
    <div style={{ minHeight:"100dvh", background:"var(--bg)", display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
      <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)", marginBottom:8 }}>
        Bem-vindo ao Pro!
      </h1>
      <p style={{ fontSize:14, color:"var(--ink-lt)", lineHeight:1.6 }}>
        Agora você tem acesso completo à Luma.<br />Redirecionando…
      </p>
    </div>
  );

  return (
    <div style={{ minHeight:"100dvh", background:"var(--bg)", maxWidth:430, margin:"0 auto" }}>

      {/* HEADER */}
      <div style={{ padding:"20px 22px 0", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={() => router.back()}
          style={{ width:36, height:36, borderRadius:"50%", background:"white", border:"none",
                   cursor:"pointer", fontSize:15, color:"var(--ink)",
                   display:"flex", alignItems:"center", justifyContent:"center",
                   boxShadow:"0 1px 4px rgba(0,0,0,0.08)", flexShrink:0 }}>←</button>
      </div>

      {/* HERO */}
      <div style={{ padding:"24px 22px 0", textAlign:"center" }}>
        <div style={{ width:56, height:56, borderRadius:"50%", margin:"0 auto 14px",
                      background:"linear-gradient(135deg,var(--lav),var(--lav-dk))",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
          ✦
        </div>
        <h1 className="f-nunito" style={{ fontSize:26, fontWeight:800, color:"var(--ink)",
                                          marginBottom:8, lineHeight:1.2 }}>
          Luma Pro
        </h1>
        <p style={{ fontSize:14, color:"var(--ink-mid)", lineHeight:1.6, maxWidth:280, margin:"0 auto" }}>
          O copiloto completo para cada fase do seu filho. Sem ansiedade. Com você 24h.
        </p>
      </div>

      {/* TRIAL BADGE */}
      <div style={{ margin:"20px 22px 0" }}>
        <div style={{ background:"linear-gradient(135deg,var(--sage),var(--sage-icon))",
                      borderRadius:12, padding:"12px 16px", textAlign:"center" }}>
          <p className="f-nunito" style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>
            🎁 7 dias grátis para testar
          </p>
          <p style={{ fontSize:12, color:"var(--ink-mid)", marginTop:2 }}>
            Cancele quando quiser. Sem compromisso.
          </p>
        </div>
      </div>

      {/* FEATURES PRO */}
      <div style={{ padding:"20px 22px 0" }}>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                    letterSpacing:"0.8px", marginBottom:12 }}>Tudo que você ganha no Pro</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {FEATURES_PRO.map(f => (
            <div key={f.text} style={{ display:"flex", alignItems:"center", gap:11 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"white",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:16, flexShrink:0 }}>{f.icon}</div>
              <p style={{ fontSize:13, color:"var(--ink)", fontWeight:500 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FREE COMPARISON */}
      <div style={{ margin:"20px 22px 0", background:"white", borderRadius:"var(--r)",
                    padding:"14px 16px" }}>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                    letterSpacing:"0.8px", marginBottom:10 }}>Incluído no plano grátis</p>
        {FEATURES_FREE.map(f => (
          <div key={f} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:7 }}>
            <span style={{ fontSize:13, color:"var(--ink-lt)" }}>✓</span>
            <p style={{ fontSize:12, color:"var(--ink-lt)" }}>{f}</p>
          </div>
        ))}
      </div>

      {/* PLAN SELECTOR */}
      <div style={{ padding:"20px 22px 0" }}>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--ink-lt)", textTransform:"uppercase",
                    letterSpacing:"0.8px", marginBottom:12 }}>Escolha seu plano</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {PLANS.map(plan => (
            <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
              style={{
                width:"100%", background: plan.highlight && selectedPlan===plan.id ? "var(--ink)" : "white",
                borderRadius:14, padding:"14px 16px",
                border: selectedPlan===plan.id
                  ? `2px solid ${plan.highlight ? "var(--ink)" : "var(--sage-dk)"}`
                  : "2px solid transparent",
                cursor:"pointer", textAlign:"left",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                transition:"all 0.15s",
              }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{
                  width:20, height:20, borderRadius:"50%",
                  border: `2px solid ${selectedPlan===plan.id ? (plan.highlight ? "white" : "var(--sage-dk)") : "var(--ink-lt)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0,
                }}>
                  {selectedPlan===plan.id && (
                    <div style={{ width:10, height:10, borderRadius:"50%",
                                  background: plan.highlight ? "white" : "var(--sage-dk)" }} />
                  )}
                </div>
                <div>
                  <p className="f-nunito" style={{ fontSize:14, fontWeight:700,
                                                   color: plan.highlight && selectedPlan===plan.id ? "white" : "var(--ink)" }}>
                    {plan.label}
                    {plan.badge && (
                      <span style={{ marginLeft:8, fontSize:10, fontWeight:600,
                                     background: plan.highlight && selectedPlan===plan.id ? "rgba(255,255,255,0.2)" : "var(--sage)",
                                     color: plan.highlight && selectedPlan===plan.id ? "white" : "var(--sage-dk)",
                                     padding:"2px 8px", borderRadius:20 }}>
                        {plan.badge}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p className="f-nunito" style={{ fontSize:16, fontWeight:800,
                                                 color: plan.highlight && selectedPlan===plan.id ? "white" : "var(--ink)" }}>
                  {plan.price}
                </p>
                <p style={{ fontSize:11,
                             color: plan.highlight && selectedPlan===plan.id ? "rgba(255,255,255,0.6)" : "var(--ink-lt)" }}>
                  {plan.sub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:"20px 22px 16px" }}>
        <button onClick={handleSubscribe} disabled={loading} className="f-nunito"
          style={{ width:"100%", background:"var(--ink)", color:"white", fontSize:15,
                   fontWeight:700, padding:"16px", borderRadius:14, border:"none",
                   cursor: loading ? "default" : "pointer",
                   opacity: loading ? 0.7 : 1, transition:"opacity 0.2s" }}>
          {loading ? "Processando…" : "Começar 7 dias grátis →"}
        </button>
        <p style={{ fontSize:11, color:"var(--ink-lt)", textAlign:"center", marginTop:10, lineHeight:1.5 }}>
          Você não será cobrado durante o período de teste.<br />
          Cancele a qualquer momento antes de vencer.
        </p>
      </div>

      {/* TESTIMONIAL */}
      <div style={{ margin:"0 22px 40px", background:"var(--peach)", borderRadius:"var(--r)",
                    padding:"16px" }}>
        <p style={{ fontSize:13, color:"var(--ink)", lineHeight:1.6, fontStyle:"italic",
                    marginBottom:10 }}>
          "Às 3h da manhã com meu bebê chorando, abri o chat da Luma. Em 2 minutos eu sabia exatamente o que estava acontecendo e o que fazer. Vale cada centavo."
        </p>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"var(--peach-icon)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:13, fontWeight:700, color:"var(--ink)" }}>M</div>
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:"var(--ink)" }}>Mariana S.</p>
            <p style={{ fontSize:11, color:"var(--ink-lt)" }}>Mãe do Enzo, 7 meses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
