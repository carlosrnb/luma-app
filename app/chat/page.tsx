"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  loadStore, getAgeFull,
  loadChat, saveChat, clearChat,
  loadProStatus, saveProStatus,
  FREE_MSG_LIMIT,
  type ChatMessage,
} from "@/lib/store";
import AppShell from "@/components/luma/AppShell";

const SUGGESTIONS = [
  "Por que meu bebê está acordando tanto à noite?",
  "Quando começo a introdução alimentar?",
  "Meu filho está com febre, o que faço?",
  "Como estimular o desenvolvimento da fala?",
  "É normal meu bebê não querer dormir sozinho?",
  "Quais alimentos evitar no primeiro ano?",
];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
}

function TypingDots() {
  return (
    <div style={{ display:"flex", gap:4, alignItems:"center", padding:"4px 0" }}>
      {[0,1,2].map(i => (
        <span key={i} className="dot-bounce" style={{
          width:7, height:7, borderRadius:"50%",
          background:"var(--ink-lt)", display:"block",
          animationDelay:`${i*0.15}s`,
        }} />
      ))}
    </div>
  );
}

function ProWall({ onUpgrade, remaining }: { onUpgrade: () => void; remaining: number }) {
  return (
    <div style={{
      margin:"0 18px 12px",
      background:"linear-gradient(135deg, var(--lav) 0%, var(--blush) 100%)",
      borderRadius:"var(--r)", padding:"20px",
      textAlign:"center",
    }}>
      <div style={{ fontSize:32, marginBottom:10 }}>✦</div>
      <p className="f-nunito" style={{ fontSize:16, fontWeight:800, color:"var(--ink)", marginBottom:6 }}>
        {remaining === 0
          ? "Você usou suas 3 perguntas de hoje"
          : `Ainda ${remaining} pergunta${remaining > 1 ? "s" : ""} grátis hoje`}
      </p>
      <p style={{ fontSize:13, color:"var(--ink-mid)", lineHeight:1.55, marginBottom:16 }}>
        Com o <strong>Luma Pro</strong> você conversa com a Luma sem limite — qualquer hora, qualquer dúvida.
      </p>
      <button onClick={onUpgrade} className="f-nunito"
        style={{ width:"100%", background:"var(--ink)", color:"white",
                 fontSize:14, fontWeight:700, padding:"13px", borderRadius:12,
                 border:"none", cursor:"pointer", marginBottom:8 }}>
        Experimentar Pro — 7 dias grátis
      </button>
      <p style={{ fontSize:11, color:"var(--ink-lt)" }}>Cancele quando quiser. Sem compromisso.</p>
    </div>
  );
}

export default function ChatPage() {
  const router   = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [familyCtx, setFamilyCtx] = useState("");
  const [babyName, setBabyName]   = useState("seu bebê");
  const [isPro, setIsPro]         = useState(false);
  const [freeLeft, setFreeLeft]   = useState(FREE_MSG_LIMIT);
  const [showProWall, setShowProWall] = useState(false);

  useEffect(() => {
    const store  = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }

    const name  = store.family.baby.name;
    const age   = getAgeFull(store.family.baby.birthDate);
    const sl    = store.sleepLogs.slice(-5);
    setBabyName(name);
    setFamilyCtx(
      `Bebê: ${name}, ${age}.\n` +
      `Pai/mãe: ${store.family.parentName}.\n` +
      `Sono recente: ${sl.length ? sl.map(s => `${s.hours}h (${s.interruptions} pausas)`).join(", ") : "sem registros"}.`
    );

    // Load chat history
    const history = loadChat();
    if (history.length === 0) {
      // Welcome message
      const welcome: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Oi! Sou a Luma, sua companheira nessa fase com o ${name} 🌱\n\nPode me perguntar qualquer coisa — sobre sono, alimentação, desenvolvimento, ou só desabafar mesmo. Estou aqui.`,
        ts: Date.now(),
      };
      setMessages([welcome]);
      saveChat([welcome]);
    } else {
      setMessages(history);
    }

    // Pro status
    const pro = loadProStatus();
    setIsPro(pro.isPro);
    const left = Math.max(0, FREE_MSG_LIMIT - pro.freeMessagesUsed);
    setFreeLeft(left);
    if (!pro.isPro && left === 0) setShowProWall(true);
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading, showProWall]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    // Check free limit
    const pro = loadProStatus();
    if (!pro.isPro && pro.freeMessagesUsed >= FREE_MSG_LIMIT) {
      setShowProWall(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: text.trim(),
      ts: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    saveChat(updated);
    setInput("");
    setLoading(true);

    // Increment free usage
    if (!pro.isPro) {
      const newUsed = pro.freeMessagesUsed + 1;
      const newPro = { ...pro, freeMessagesUsed: newUsed, freeMessagesDate: new Date().toISOString().split("T")[0] };
      saveProStatus(newPro);
      const left = Math.max(0, FREE_MSG_LIMIT - newUsed);
      setFreeLeft(left);
    }

    try {
      // Build conversation for API (last 20 messages for context)
      const apiMessages = updated.slice(-20).map(m => ({ role: m.role, text: m.text }));
      const res  = await fetch("/api/luma-chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages: apiMessages, familyContext: familyCtx }),
      });
      const data = await res.json();
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.text || "Não consegui processar sua mensagem. Tente novamente.",
        ts: Date.now(),
      };
      const withReply = [...updated, reply];
      setMessages(withReply);
      saveChat(withReply);

      // Show pro wall after limit
      const freshPro = loadProStatus();
      if (!freshPro.isPro && freshPro.freeMessagesUsed >= FREE_MSG_LIMIT) {
        setTimeout(() => setShowProWall(true), 600);
      }
    } catch {
      const err: ChatMessage = {
        id: crypto.randomUUID(),
        role:"assistant",
        text:"Tive um probleminha aqui. Tenta de novo?",
        ts: Date.now(),
      };
      const withErr = [...updated, err];
      setMessages(withErr);
      saveChat(withErr);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, familyCtx]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleUpgrade() {
    // Simulate pro activation for now
    const pro = loadProStatus();
    saveProStatus({ ...pro, isPro: true });
    setIsPro(true);
    setShowProWall(false);
    setFreeLeft(999);
  }

  const canSend = input.trim().length > 0 && !loading && (isPro || freeLeft > 0);

  return (
    <AppShell>
      {/* ── HEADER ── */}
      <div style={{
        padding:"18px 18px 14px",
        borderBottom:"1px solid rgba(0,0,0,0.05)",
        display:"flex", alignItems:"center", gap:12,
        background:"var(--bg)",
        position:"sticky", top:0, zIndex:10,
      }}>
        <button onClick={() => router.back()}
          style={{ width:36, height:36, borderRadius:"50%", background:"white",
                   border:"none", cursor:"pointer", fontSize:15, color:"var(--ink)",
                   display:"flex", alignItems:"center", justifyContent:"center",
                   boxShadow:"0 1px 4px rgba(0,0,0,0.08)", flexShrink:0 }}>←</button>

        <div style={{ width:38, height:38, borderRadius:"50%", flexShrink:0,
                      background:"linear-gradient(135deg,var(--sage),var(--sage-icon))",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>
          ✦
        </div>
        <div style={{ flex:1 }}>
          <p className="f-nunito" style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>Luma</p>
          <p style={{ fontSize:11, color:"var(--sage-dk)", fontWeight:500 }}>
            {isPro ? "Pro · Conversa ilimitada" : `${freeLeft} pergunta${freeLeft !== 1 ? "s" : ""} grátis hoje`}
          </p>
        </div>

        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {!isPro && (
            <button onClick={handleUpgrade} className="f-nunito"
              style={{ fontSize:11, fontWeight:700, padding:"5px 11px", borderRadius:20,
                       background:"var(--lav)", color:"var(--lav-deep)", border:"none",
                       cursor:"pointer", whiteSpace:"nowrap" }}>
              ✦ Pro
            </button>
          )}
          <button onClick={() => { clearChat(); setMessages([]); setTimeout(() => router.replace("/chat"), 100); }}
            title="Limpar conversa"
            style={{ width:32, height:32, borderRadius:"50%", background:"white",
                     border:"none", cursor:"pointer", fontSize:14, color:"var(--ink-lt)",
                     display:"flex", alignItems:"center", justifyContent:"center" }}>
            ↺
          </button>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div style={{ padding:"16px 18px 0", display:"flex", flexDirection:"column", gap:12 }}>

        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isLast = idx === messages.length - 1;

          return (
            <div key={msg.id} className={isLast ? "fade-up" : ""}
              style={{ display:"flex", flexDirection:"column",
                       alignItems: isUser ? "flex-end" : "flex-start" }}>

              {/* Avatar row for assistant */}
              {!isUser && (
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                  <div style={{ width:24, height:24, borderRadius:"50%",
                                background:"linear-gradient(135deg,var(--sage),var(--sage-icon))",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:11 }}>✦</div>
                  <p style={{ fontSize:11, fontWeight:700, color:"var(--sage-dk)",
                              textTransform:"uppercase", letterSpacing:"0.5px" }}>Luma</p>
                </div>
              )}

              {/* Bubble */}
              <div style={{
                maxWidth:"85%",
                background: isUser ? "var(--ink)" : "white",
                color: isUser ? "white" : "var(--ink)",
                borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding:"11px 14px",
                fontSize:13.5,
                lineHeight:1.6,
                whiteSpace:"pre-wrap",
                wordBreak:"break-word",
                boxShadow: isUser ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                {msg.text}
              </div>

              {/* Timestamp */}
              <p style={{ fontSize:10, color:"var(--ink-lt)", marginTop:3,
                          paddingLeft: isUser ? 0 : 4, paddingRight: isUser ? 4 : 0 }}>
                {formatTime(msg.ts)}
              </p>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="fade-up" style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
            <div style={{ width:24, height:24, borderRadius:"50%",
                          background:"linear-gradient(135deg,var(--sage),var(--sage-icon))",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:11, flexShrink:0 }}>✦</div>
            <div style={{ background:"white", borderRadius:"18px 18px 18px 4px",
                          padding:"11px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
              <TypingDots />
            </div>
          </div>
        )}

        {/* Pro wall */}
        {showProWall && !isPro && (
          <div className="fade-up">
            <ProWall onUpgrade={handleUpgrade} remaining={freeLeft} />
          </div>
        )}

        {/* Suggestions — only show when few messages */}
        {messages.length <= 2 && !loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:4 }}>
            <p style={{ fontSize:11, fontWeight:600, color:"var(--ink-lt)",
                        textTransform:"uppercase", letterSpacing:"0.5px", paddingLeft:2 }}>
              Perguntas frequentes
            </p>
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                style={{ background:"white", border:"none", borderRadius:12,
                         padding:"10px 14px", fontSize:13, color:"var(--ink)",
                         textAlign:"left", cursor:"pointer", lineHeight:1.4,
                         boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
                         transition:"box-shadow 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.06)")}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} style={{ height:8 }} />
      </div>

      {/* ── INPUT BAR ── */}
      <div style={{
        position:"sticky", bottom:0, padding:"10px 18px 20px",
        background:"rgba(247,244,239,0.96)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(0,0,0,0.06)",
      }}>
        {/* Free counter */}
        {!isPro && freeLeft > 0 && freeLeft <= FREE_MSG_LIMIT && (
          <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}>
            <div style={{ display:"flex", gap:5 }}>
              {Array.from({ length: FREE_MSG_LIMIT }).map((_,i) => (
                <div key={i} style={{
                  width:6, height:6, borderRadius:"50%",
                  background: i < (FREE_MSG_LIMIT - freeLeft) ? "var(--ink-lt)" : "var(--sage-dk)",
                  opacity: i < (FREE_MSG_LIMIT - freeLeft) ? 0.3 : 1,
                  transition:"all 0.3s",
                }} />
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }}
            onKeyDown={handleKey}
            placeholder={
              !isPro && freeLeft === 0
                ? "Ative o Pro para continuar conversando…"
                : `Pergunte qualquer coisa sobre o ${babyName}…`
            }
            disabled={!isPro && freeLeft === 0}
            rows={1}
            style={{
              flex:1, background:"white", borderRadius:16, padding:"11px 14px",
              fontSize:14, color:"var(--ink)", outline:"none",
              border:"2px solid transparent", fontFamily:"Inter,sans-serif",
              resize:"none", overflowY:"hidden", lineHeight:1.5,
              transition:"border-color 0.2s",
              opacity: (!isPro && freeLeft === 0) ? 0.5 : 1,
            }}
            onFocus={e => (e.target.style.borderColor="var(--sage-dk)")}
            onBlur={e  => (e.target.style.borderColor="transparent")}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!canSend}
            style={{
              width:44, height:44, borderRadius:"50%", border:"none",
              background: canSend ? "var(--ink)" : "var(--bg)",
              color: canSend ? "white" : "var(--ink-lt)",
              fontSize:18, cursor: canSend ? "pointer" : "default",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, transition:"all 0.2s",
              boxShadow: canSend ? "0 4px 12px rgba(38,35,30,0.2)" : "none",
            }}>
            ↑
          </button>
        </div>
      </div>
    </AppShell>
  );
}
