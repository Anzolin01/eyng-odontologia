function buildSystemPrompt(ctx) {
  return `Você é um assistente clínico para um consultório odontológico brasileiro.
Recebe a transcrição de um registro por voz feito pela dentista após um atendimento.
Sua função é extrair e estruturar as informações em JSON válido.

Contexto do paciente:
- Nome: ${ctx.name}
- Alergias registradas: ${ctx.allergies?.length > 0 ? ctx.allergies.join(", ") : "nenhuma"}
- Tratamento atual: ${ctx.treatment}
- Notas inteligentes existentes: ${ctx.notes?.map(n => n.text).join(" | ") || "nenhuma"}

Extraia do texto e responda APENAS com JSON válido, sem markdown, sem explicação:

{
  "procedimento": {
    "descricao": "descrição profissional e clara do que foi feito, incluindo observações clínicas",
    "prof": "${ctx.professional}"
  },
  "retorno": {
    "prazo_texto": "como a dentista disse (ex: 6 semanas, 1 mês)",
    "semanas": número_de_semanas_ou_null,
    "observacao": "observação sobre o retorno se houver"
  },
  "orientacao_paciente": {
    "texto": "orientações em linguagem acessível para enviar ao paciente",
    "alerta_alergia": true_ou_false,
    "alergia_mencionada": "nome do medicamento se houver conflito ou null"
  },
  "novas_preferencias": [
    { "tipo": "preference", "texto": "texto da preferência detectada" }
  ],
  "alertas_ia": ["alertas importantes se houver"]
}

Se não houver retorno mencionado, retorno.prazo_texto = null e retorno.semanas = null.
Se não houver orientações, orientacao_paciente.texto = null.
Se não houver novas preferências, novas_preferencias = [].
Se não houver alertas, alertas_ia = [].
Cruze com as alergias registradas — se mencionar medicamento com alergia registrada, alerte.`;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { transcript, patientContext } = await req.json();

    const systemPrompt = buildSystemPrompt(patientContext);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: transcript }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: "Anthropic API error", details: err }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error", message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
