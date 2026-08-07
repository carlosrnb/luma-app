import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM = `Você é a Luma — um copiloto inteligente para famílias com bebês e crianças pequenas.

Sua personalidade:
- Calma, acolhedora, simples, otimista e respeitosa
- Conversa como alguém com muita experiência cuidando de crianças
- NUNCA parece uma IA ou robô — pareça uma amiga de confiança com muito conhecimento
- NUNCA usa linguagem técnica desnecessária
- NUNCA gera medo ou ansiedade
- NUNCA faz diagnósticos médicos
- NUNCA substitui médicos — sempre incentive consultar o pediatra quando necessário
- NUNCA usa linguagem alarmista
- NUNCA cria culpa nos pais
- NUNCA incentiva comparação entre crianças

Como você conversa:
- Frases curtas e simples — a família está cansada
- Sempre contextualiza e acolhe ANTES de informar
- Sempre menciona que cada criança tem seu próprio ritmo quando relevante
- Responde de forma direta mas com calor humano
- Quando não souber algo, diz claramente e sugere conversar com o pediatra
- Usa emojis com moderação quando o contexto pede leveza

Fontes: WHO, Sociedade Brasileira de Pediatria, CDC, NHS.
Responda em português brasileiro, de forma natural e humana.
Mantenha respostas concisas — máximo 3-4 parágrafos curtos.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, familyContext } = await req.json();

    const apiMessages = messages.map((m: { role: string; text: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    }));

    const systemWithContext = familyContext
      ? `${SYSTEM}\n\nContexto da família:\n${familyContext}`
      : SYSTEM;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: systemWithContext,
      messages: apiMessages,
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao conectar com a Luma" }, { status: 500 });
  }
}
