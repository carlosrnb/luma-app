"use client";
import { useEffect, useState } from "react";

interface Props { context: string; question: string; style?: React.CSSProperties; }

export default function LumaInsight({ context, question, style }: Props) {
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setText("");
    fetch("/api/luma", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ context, question }),
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) setText(d.text || ""); })
      .catch(() => { if (!cancelled) setText("Estou aqui com você. Tente novamente em instantes."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [context, question]);

  return (
    <div style={{
      background:"white", borderRadius:"var(--r)", padding:"14px 16px",
      display:"flex", gap:12, alignItems:"flex-start", ...style
    }}>
      <div style={{
        width:32, height:32, borderRadius:"50%", flexShrink:0,
        background:"linear-gradient(135deg,var(--sage),var(--sage-icon))",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
      }}>✦</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:10, fontWeight:700, color:"var(--sage-dk)", letterSpacing:"0.8px",
                    textTransform:"uppercase", marginBottom:4 }}>Luma</p>
        {loading ? (
          <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:4 }}>
            {[0,1,2].map(i => (
              <span key={i} className="dot-bounce"
                style={{ width:5, height:5, borderRadius:"50%", background:"var(--ink-lt)",
                         display:"block", animationDelay:`${i*0.15}s` }} />
            ))}
          </div>
        ) : (
          <p style={{ fontSize:13, color:"var(--ink)", lineHeight:1.6, wordBreak:"break-word" }}>{text}</p>
        )}
      </div>
    </div>
  );
}
