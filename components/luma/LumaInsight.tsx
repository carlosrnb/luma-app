"use client";
import { useEffect, useState, useRef } from "react";

interface Props {
  context: string;
  question: string;
  style?: React.CSSProperties;
}

export default function LumaInsight({ context, question, style }: Props) {
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // prevent double-fetch in StrictMode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;
    setLoading(true);
    setText("");
    setError(false);

    // 12s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

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
        if (!cancelled) setText(d.text || "");
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function retry() {
    fetchedRef.current = false;
    setError(false);
    setLoading(true);
    setText("");
    // remount trick — toggle key from parent not available, so re-trigger
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    fetch("/api/luma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context, question }),
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) setText(d.text || ""); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { clearTimeout(timeout); if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }

  return (
    <div style={{
      background: "white",
      borderRadius: "var(--r)",
      padding: "14px 16px",
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      ...style,
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
            <button onClick={retry} style={{
              fontSize: 11, fontWeight: 600, color: "var(--sage-dk)",
              border: "none", cursor: "pointer",
              padding: "2px 8px", borderRadius: 20,
              background: "var(--sage)",
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
