"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/luma/AppShell";

interface Article {
  id: string;
  emoji: string;
  category: string;
  title: string;
  summary: string;
  readMin: number;
  color: string;
  content: string;
}

const ARTICLES: Article[] = [
  {
    id:"sleep-regression",
    emoji:"🌙", category:"Sono", color:"var(--lav)",
    title:"Por que o sono mudou com 4 meses?",
    summary:"Essa fase tem nome e explicação. E vai passar.",
    readMin:3,
    content:`A regressão do sono dos 4 meses é real — e tem explicação.

Nessa fase, o cérebro do bebê amadurece e os ciclos de sono ficam mais parecidos com os de adultos: períodos de sono leve e profundo se alternam. O bebê começa a perceber quando passa do sono profundo para o leve — e acorda.

**O que você pode fazer:**

Manter uma rotina previsível antes de dormir ajuda o sistema nervoso a entender que é hora de descansar. Banho morno, luz baixa, música suave ou leitura — repetir a mesma sequência faz diferença.

Não existe receita mágica. Cada bebê tem o seu ritmo. O que funciona para uma família pode não funcionar para outra.

**Quando passa?**

Geralmente entre 2 e 6 semanas. Não é para sempre — mesmo que pareça.

Se as noites estiverem muito difíceis, conversar com o pediatra pode trazer orientações mais personalizadas para o seu bebê.`,
  },
  {
    id:"introduction-start",
    emoji:"🥣", category:"Alimentação", color:"var(--gold)",
    title:"Por onde começar a introdução alimentar?",
    summary:"6 meses chegou. E agora? Um passo de cada vez.",
    readMin:4,
    content:`A introdução alimentar começa aos 6 meses — e não precisa ser complicada.

A regra mais importante: um alimento novo por vez. Espere de 2 a 3 dias antes de introduzir o próximo. Assim você identifica possíveis reações com mais facilidade.

**Por onde começar:**

Legumes e verduras cozidos são ótimas primeiras opções: cenoura, abobrinha, batata-doce, chuchu. Você pode oferecer amassados, em purê ou no método BLW (Baby-Led Weaning — pedaços macios para o bebê segurar sozinho).

**O que evitar no primeiro ano:**

Sal, açúcar, mel, refrigerante, embutidos, alimentos industrializados. O paladar do bebê está se formando — quanto mais natural, melhor.

**A recusa é normal:**

Bebês podem recusar um alimento até 15 vezes antes de aceitar. Não desista na primeira tentativa. Ofereça novamente em outro momento, sem pressão.

Lembre: o leite materno continua sendo o principal alimento até 1 ano.`,
  },
  {
    id:"tummy-time",
    emoji:"🌱", category:"Desenvolvimento", color:"var(--sage)",
    title:"Tummy time: por que colocar de bruço importa",
    summary:"15 minutos por dia que fazem diferença real no desenvolvimento.",
    readMin:3,
    content:`Colocar o bebê de bruço quando está acordado e sob supervisão — isso é o tummy time.

Parece simples. E é. Mas os benefícios são grandes.

**Por que faz diferença:**

Fortalece os músculos do pescoço, ombros e costas — essenciais para sentar, engatinhar e andar. Estimula a coordenação motora e a percepção espacial. Reduz o risco de plagiocefalia (cabeça achatada de um lado).

**Como começar:**

Comece com 2 a 3 minutos algumas vezes ao dia logo depois que o bebê nascer. Conforme ele se acostuma, aumente gradualmente para 15 a 30 minutos por dia ao total.

**E se o bebê reclamar?**

Normal no começo. Coloque no chão em vez do sofá — superfície firme é mais segura. Fique no nível dele, faça contato visual, use um brinquedo colorido na frente.

**Nunca durante o sono.** O tummy time é sempre supervisionado.`,
  },
  {
    id:"first-fever",
    emoji:"🌡️", category:"Saúde", color:"var(--coral)",
    title:"Primeira febre: o que fazer (e o que não fazer)",
    summary:"Calma. Febre não é inimiga — é sinal de que o corpo está funcionando.",
    readMin:5,
    content:`Febre é uma das experiências mais assustadoras para pais de primeira viagem. Mas entender o que ela significa ajuda a agir com mais calma.

**O que é febre:**

Temperatura acima de 37,8°C. O corpo aumenta a temperatura para combater agentes infecciosos — é uma resposta saudável do sistema imune.

**Quando ligar para o pediatra:**

- Bebê com menos de 3 meses com temperatura acima de 38°C — ligue imediatamente
- Febre acima de 39,5°C em qualquer idade
- Febre que dura mais de 2 dias
- Bebê muito irritado, sonolento demais ou com dificuldade para respirar

**O que você pode fazer:**

Ofereça mais líquidos. Mantenha o ambiente fresco. Um pano úmido morno na testa pode ajudar no conforto. Antitérmicos só com orientação do pediatra.

**O que não fazer:**

Não dê banho frio — pode causar tremores que aumentam a temperatura. Não agasalhe demais. Não use álcool na pele.

A febre em si raramente causa dano. O que importa é o estado geral do bebê.`,
  },
  {
    id:"parent-anxiety",
    emoji:"💙", category:"Para os pais", color:"var(--sky)",
    title:"É normal se sentir perdido. Todos os pais se sentem.",
    summary:"Ansiedade parental existe. E não é fraqueza.",
    readMin:4,
    content:`Ser pai ou mãe pela primeira vez é uma das experiências mais intensas da vida. E ninguém está 100% preparado — por mais que tenha lido, estudado, pesquisado.

A ansiedade parental é real. E muito comum.

**O que alimenta essa ansiedade:**

Excesso de informação. Redes sociais mostrando apenas os momentos perfeitos. Comparação constante. Noites sem dormir que comprometem o julgamento. A sensação de que você é o único responsável por um ser humano pequeno e vulnerável.

**O que ajuda:**

Reduzir o tempo em grupos de maternidade que geram comparação. Priorizar o que o seu pediatra diz em vez do Google. Aceitar ajuda quando alguém oferecer. Reconhecer que dias ruins não te tornam um mau pai ou má mãe.

**Uma coisa importante:**

Se a ansiedade estiver afetando seu sono, seu apetite ou sua capacidade de cuidar de você mesmo — isso merece atenção. Conversar com um profissional de saúde mental não é fraqueza. É cuidado.

Você está fazendo o suficiente. Mais do que percebe.`,
  },
  {
    id:"breastfeeding-tips",
    emoji:"🤱", category:"Amamentação", color:"var(--peach)",
    title:"Amamentação: as 5 dúvidas mais comuns",
    summary:"Do pega ao desmame — perguntas que toda mãe tem mas nem sempre pergunta.",
    readMin:5,
    content:`A amamentação é natural — mas nem sempre é fácil no começo. Aqui estão as dúvidas que mais aparecem.

**1. Como sei se o bebê está mamando suficiente?**

Observe as fraldas: 6 ou mais fraldas molhadas por dia é um bom sinal. E o bebê ganha peso regularmente nas pesagens do pediatra.

**2. Dói para todo mundo?**

Uma leve sensibilidade nos primeiros dias é comum. Dor intensa é sinal de que o pega pode estar errado. Um consultora de amamentação pode ajudar a corrigir.

**3. Posso continuar amamentando se estiver doente?**

Na maioria das doenças comuns, sim. O leite materno transmite anticorpos que ajudam o bebê. Consulte seu médico sobre medicamentos.

**4. Leite fraco existe?**

Raramente. O leite materno se adapta às necessidades do bebê em cada fase. Quem mais amamenta, mais leite produz.

**5. Quando desmamar?**

A OMS recomenda amamentação exclusiva até 6 meses e complementar até 2 anos ou mais. Mas cada família tem sua realidade — e não existe certo ou errado.`,
  },
];

const CATEGORIES = ["Todos", "Sono", "Alimentação", "Desenvolvimento", "Saúde", "Para os pais", "Amamentação"];

export default function ConteudoPage() {
  const router = useRouter();
  const [cat, setCat]             = useState("Todos");
  const [selected, setSelected]   = useState<Article | null>(null);

  const filtered = cat === "Todos" ? ARTICLES : ARTICLES.filter(a => a.category === cat);

  if (selected) return (
    <AppShell>
      <div>
        {/* ARTICLE HERO */}
        <div style={{ background:selected.color, borderRadius:"0 0 28px 28px",
                      padding:"52px 22px 28px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-40, right:-40, width:150, height:150,
                        borderRadius:"50%", background:"rgba(0,0,0,0.06)" }} />
          <button onClick={() => setSelected(null)}
            style={{ position:"absolute", top:18, left:18, width:38, height:38, borderRadius:"50%",
                     background:"rgba(255,255,255,0.6)", border:"none", cursor:"pointer",
                     fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:38, marginBottom:10 }}>{selected.emoji}</div>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--ink)", textTransform:"uppercase",
                        letterSpacing:"1.2px", marginBottom:4 }}>
              {selected.category} · {selected.readMin} min de leitura
            </p>
            <h1 className="f-nunito" style={{ fontSize:22, fontWeight:800, color:"var(--ink)",
                                              lineHeight:1.25, maxWidth:300 }}>
              {selected.title}
            </h1>
          </div>
        </div>

        <div style={{ padding:"22px 22px 48px" }}>
          {selected.content.split("\n\n").map((para, i) => {
            if (para.startsWith("**") && para.endsWith("**")) {
              return (
                <p key={i} className="f-nunito"
                  style={{ fontSize:15, fontWeight:800, color:"var(--ink)", margin:"20px 0 8px" }}>
                  {para.replace(/\*\*/g,"")}
                </p>
              );
            }
            const withBold = para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            return (
              <p key={i} style={{ fontSize:14, color:"var(--ink)", lineHeight:1.8, marginBottom:12 }}
                dangerouslySetInnerHTML={{ __html: withBold }} />
            );
          })}
          <div style={{ marginTop:28, padding:"16px", background:"var(--bg)", borderRadius:"var(--r)" }}>
            <p style={{ fontSize:12, color:"var(--ink-lt)", lineHeight:1.6, fontStyle:"italic" }}>
              Este conteúdo é informativo e não substitui orientação médica. Sempre consulte seu pediatra para dúvidas sobre a saúde do seu filho.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div>
        {/* HEADER */}
        <div style={{ padding:"20px 18px 0" }}>
          <h1 className="f-nunito" style={{ fontSize:24, fontWeight:800, color:"var(--ink)", marginBottom:4 }}>
            Conteúdo
          </h1>
          <p style={{ fontSize:13, color:"var(--ink-lt)" }}>
            Artigos escritos para situações reais
          </p>
        </div>

        {/* CATEGORY FILTER */}
        <div style={{ padding:"14px 18px 0", overflowX:"auto", display:"flex", gap:7,
                      scrollbarWidth:"none", WebkitOverflowScrolling:"touch" as any }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding:"7px 14px", borderRadius:20, border:"none", cursor:"pointer",
                       fontSize:12, fontWeight:600, fontFamily:"Inter,sans-serif",
                       background: cat===c ? "var(--ink)" : "white",
                       color: cat===c ? "white" : "var(--ink-mid)",
                       whiteSpace:"nowrap", flexShrink:0, transition:"all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>

        {/* ARTICLES */}
        <div style={{ padding:"14px 18px 40px", display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(a => (
            <button key={a.id} onClick={() => setSelected(a)}
              style={{ background:"white", borderRadius:"var(--r)", padding:"16px",
                       border:"none", cursor:"pointer", textAlign:"left", width:"100%",
                       display:"flex", gap:14, alignItems:"flex-start",
                       transition:"box-shadow 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow="none")}>
              <div style={{ width:52, height:52, borderRadius:14, background:a.color, flexShrink:0,
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
                {a.emoji}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                  <span style={{ fontSize:10, fontWeight:600, color:"var(--ink-lt)",
                                 textTransform:"uppercase", letterSpacing:"0.5px" }}>
                    {a.category}
                  </span>
                  <span style={{ fontSize:10, color:"var(--ink-lt)" }}>· {a.readMin} min</span>
                </div>
                <p className="f-nunito" style={{ fontSize:15, fontWeight:700, color:"var(--ink)",
                                                 lineHeight:1.3, marginBottom:4 }}>
                  {a.title}
                </p>
                <p style={{ fontSize:12, color:"var(--ink-mid)", lineHeight:1.4 }}>{a.summary}</p>
              </div>
              <span style={{ fontSize:16, color:"var(--ink-lt)", opacity:0.4, flexShrink:0, marginTop:2 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
