"use client";
import { useEffect, useState, useRef } from "react";

interface Props {
  context: string;
  question: string;
  style?: React.CSSProperties;
}

export default function LumaInsight({ context, question, style }: Props) {
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  function doFetch() {
    // cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setText("");
    setError(false);

    const timeout = setTimeout(() => controller.abort(), 14000);

    fetch("/api/luma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context, question }),
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error("status " + r.status);
        return r.json();
      })
      .then(d => {
        clearTimeout(timeout);
        setText(d.text || "");
        setLoading(false);
      })
      .catch(err => {
        clearTimeout(timeout);
        if (err.name === "AbortError") return; // intentional cancel — don't show error
        setError(true);
        setLoading(false);
      });
  }

  useEffect(() => {
    doFetch();
    return () => { abortRef.current?.abort(); };
  // Re-fetch whenever context or question changes (new page / new baby data)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, question]);

  return (
    <div style={{
      background: "white", borderRadius: "var(--r)", padding: "14px 16px",
      display: "flex", gap: 12, alignItems: "flex-start", ...style,
    }}>
      {/* orb */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, var(--sage), var(--sage-icon))",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
      }}>✦</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: "var(--sage-dk)",
          letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 5,
        }}>Luma</p>

        {loading && (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[0, 1, 2].map(i => (
              <span key={i} className="dot-bounce" style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "var(--ink-lt)", display: "block",
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ fontSize: 13, color: "var(--ink-lt)", fontStyle: "italic" }}>
              Não consegui carregar agora.
            </p>
            <button onClick={doFetch} style={{
              fontSize: 11, fontWeight: 600, color: "var(--sage-dk)",
              background: "var(--sage)", border: "none", cursor: "pointer",
              padding: "3px 10px", borderRadius: 20,
            }}>Tentar de novo</button>
          </div>
        )}

        {!loading && !error && text && (
          <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.6, wordBreak: "break-word" }}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
