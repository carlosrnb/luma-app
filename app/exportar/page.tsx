"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  loadStore, getAgeFull, getAgeInMonths,
  loadGrowthLogs, loadFeedLogs,
  loadVaccineRecords, loadAppointments,
} from "@/lib/store";
import AppShell from "@/components/luma/AppShell";

export default function ExportarPage() {
  const router   = useRouter();
  const [ready, setReady] = useState(false);
  const [html, setHtml]   = useState("");

  useEffect(() => {
    const store = loadStore();
    if (!store.family?.onboarded) { router.replace("/onboarding"); return; }
    const { baby, parentName } = store.family;
    const age    = getAgeFull(baby.birthDate);
    const months = getAgeInMonths(baby.birthDate);
    const today  = new Date().toLocaleDateString("pt-BR", { day:"numeric", month:"long", year:"numeric" });
    const sleepLogs  = (store.sleepLogs ?? []).slice(-10);
    const growthLogs = loadGrowthLogs().slice(-5);
    const feedLogs   = loadFeedLogs().slice(-10);
    const vaccines   = loadVaccineRecords();
    const doneMeds   = vaccines.filter(v => !!v.doneDate);
    const appts      = loadAppointments().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);

    const reactionLabel = (r: string) =>
      r==="great"?"Adorou 😋":r==="ok"?"Normal 😐":r==="refused"?"Recusou 🙅":"Reação ⚠️";

    const doc = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório Luma — ${baby.name}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #26231E; background: white; padding: 48px; max-width: 800px; margin: 0 auto; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #D4E8CC; }
.logo { font-size: 28px; font-weight: 900; color: #26231E; }
.logo span { color: #6E9E65; }
.baby-name { font-size: 20px; font-weight: 700; text-align: right; }
.baby-sub  { font-size: 13px; color: #9B9690; margin-top: 3px; text-align: right; }
h2 { font-size: 13px; font-weight: 700; color: #6E9E65; text-transform: uppercase; letter-spacing: 1px; margin: 28px 0 10px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px; }
.card  { background: #F7F4EF; border-radius: 10px; padding: 12px 14px; }
.clabel{ font-size: 11px; color: #9B9690; margin-bottom: 3px; }
.cval  { font-size: 16px; font-weight: 700; }
table  { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; padding: 8px 10px; background: #F7F4EF; font-size: 11px; font-weight: 700; color: #5C5850; text-transform: uppercase; letter-spacing: 0.5px; }
td { padding: 8px 10px; border-bottom: 1px solid #F7F4EF; vertical-align: top; }
.footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #F7F4EF; font-size: 11px; color: #9B9690; line-height: 1.6; }
@media print { body { padding: 24px; } }
</style></head><body>

<div class="header">
  <div class="logo">lu<span>m</span>a</div>
  <div>
    <div class="baby-name">${baby.name}</div>
    <div class="baby-sub">${age} · Responsável: ${parentName}</div>
    <div class="baby-sub">Gerado em ${today}</div>
  </div>
</div>

${growthLogs.length > 0 ? `<h2>📏 Crescimento</h2>
<div class="grid2">
  ${growthLogs.slice(-1).flatMap(g => [
    g.weightKg ? `<div class="card"><div class="clabel">Peso</div><div class="cval">${g.weightKg} kg</div></div>` : "",
    g.heightCm ? `<div class="card"><div class="clabel">Altura</div><div class="cval">${g.heightCm} cm</div></div>` : "",
    g.headCm   ? `<div class="card"><div class="clabel">Perímetro cefálico</div><div class="cval">${g.headCm} cm</div></div>` : "",
  ]).join("")}
</div>` : ""}

${sleepLogs.length > 0 ? `<h2>🌙 Sono — últimos ${sleepLogs.length} registros</h2>
<table><tr><th>Data</th><th>Horas</th><th>Pausas</th><th>Obs.</th></tr>
${sleepLogs.map(s=>`<tr><td>${new Date(s.date+"T12:00:00").toLocaleDateString("pt-BR")}</td><td>${s.hours}h</td><td>${s.interruptions}</td><td style="color:#9B9690">${s.notes||"—"}</td></tr>`).join("")}
</table>` : ""}

${feedLogs.length > 0 ? `<h2>🥣 Alimentação — ${feedLogs.length} registros</h2>
<table><tr><th>Data</th><th>Alimento</th><th>Reação</th></tr>
${feedLogs.map(f=>`<tr><td>${new Date(f.date+"T12:00:00").toLocaleDateString("pt-BR")}</td><td>${f.food}</td><td>${reactionLabel(f.reaction)}</td></tr>`).join("")}
</table>` : ""}

${doneMeds.length > 0 ? `<h2>💉 Vacinação — ${doneMeds.length} aplicadas</h2>
<table><tr><th>Vacina</th><th>Data</th></tr>
${doneMeds.map(v=>`<tr><td>${v.name}</td><td>${v.doneDate?new Date(v.doneDate+"T12:00:00").toLocaleDateString("pt-BR"):"—"}</td></tr>`).join("")}
</table>` : ""}

${appts.length > 0 ? `<h2>🩺 Consultas</h2>
<table><tr><th>Data</th><th>Médico</th><th>Especialidade</th></tr>
${appts.map(a=>`<tr><td>${new Date(a.date+"T12:00:00").toLocaleDateString("pt-BR")}${a.time?" · "+a.time:""}</td><td>${a.doctor}</td><td>${a.specialty}</td></tr>`).join("")}
</table>` : ""}

<div class="footer">
Relatório gerado pela Luma · luma-familia.vercel.app<br>
Informações baseadas nos registros inseridos pelo responsável. Não substitui avaliação médica profissional.
</div>
</body></html>`;

    setHtml(doc);
    setReady(true);
  }, [router]);

  function printPDF() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  return (
    <AppShell>
      <div style={{ padding:"20px 18px 48px" }}>
        <button onClick={() => router.back()}
          style={{ fontSize:13, fontWeight:600, color:"var(--ink-lt)", border:"none",
                   background:"none", cursor:"pointer", marginBottom:20,
                   display:"flex", alignItems:"center", gap:5 }}>← Voltar</button>

        <h1 className="f-nunito" style={{ fontSize:24, fontWeight:800, color:"var(--ink)", marginBottom:4 }}>
          Relatório PDF
        </h1>
        <p style={{ fontSize:13, color:"var(--ink-lt)", marginBottom:24, lineHeight:1.6 }}>
          Leve para o pediatra um resumo completo com sono, alimentação, vacinação e consultas.
        </p>

        {ready ? (
          <>
            <div style={{ borderRadius:"var(--r)", overflow:"hidden", marginBottom:14,
                          border:"1px solid rgba(0,0,0,0.08)", height:380 }}>
              <iframe srcDoc={html} style={{ width:"100%", height:"100%", border:"none" }} title="Preview" />
            </div>
            <button onClick={printPDF} className="f-nunito"
              style={{ width:"100%", background:"var(--ink)", color:"white", fontSize:14,
                       fontWeight:700, padding:"15px", borderRadius:14, border:"none", cursor:"pointer", marginBottom:8 }}>
              📄 Salvar como PDF
            </button>
            <p style={{ fontSize:11, color:"var(--ink-lt)", textAlign:"center" }}>
              Na janela de impressão → "Salvar como PDF"
            </p>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:48 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
            <p style={{ fontSize:13, color:"var(--ink-lt)" }}>Preparando relatório…</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
