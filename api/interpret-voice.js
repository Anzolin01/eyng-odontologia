export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key não configurada" });
  }

  const { transcript, patientContext } = req.body;

  const systemPrompt = `Você é um assistente clínico experiente de um consultório odontológico brasileiro.
Recebe a transcrição de um registro por voz feito pela dentista logo após o atendimento.
O texto pode ser informal, com pausas, repetições e palavras soltas — ignore ruídos e extraia o que importa.

Contexto do paciente:
- Nome: ${patientContext.name}
- Alergias registradas: ${patientContext.allergies?.length > 0 ? patientContext.allergies.join(", ") : "nenhuma"}
- Tratamento atual: ${patientContext.treatment}
- Notas anteriores: ${patientContext.notes?.map(n => n.text).join(" | ") || "nenhuma"}

REGRAS DE EXTRAÇÃO — leia com atenção:

1. "procedimento.descricao": SOMENTE o que foi REALIZADO nesta consulta. Reescreva em linguagem clínica profissional. NÃO copie o texto bruto da dentista.
   Exemplo ruim: "fiz uma coisa no dente dela e tal"
   Exemplo bom: "Restauração classe II em resina composta no dente 36"

2. "retorno": APENAS se a dentista mencionar prazo, data ou intervalo para o próximo retorno.
   - prazo_texto: exatamente como ela disse ("6 semanas", "1 mês", "quando dói")
   - semanas: converter para número de semanas (null se não mencionado)
   - observacao: condição mencionada, ex: "se sentir dor"

3. "orientacao_paciente": instruções ou cuidados que o paciente deve seguir. Reescreva em linguagem simples e acolhedora, como se fosse uma mensagem de WhatsApp da dentista.

4. "novas_preferencias": array de strings com preferências pessoais do paciente mencionadas (ex: "prefere anestesia dupla", "tem medo de barulho"). Array vazio se nada mencionado.

5. "alertas_ia": array de alertas importantes:
   - Se mencionar alergia, reação ou intolerância: inclua "⚠️ Alergia mencionada: [substância]"
   - Se houver risco clínico: inclua o alerta
   - Se a dentista pedir para lembrar algo: inclua
   - Array vazio se nada relevante

Responda APENAS com JSON válido, sem markdown, sem explicação, sem texto extra:

{
  "procedimento": {
    "descricao": "descrição clínica profissional do que foi realizado",
    "prof": "${patientContext.professional}"
  },
  "retorno": {
    "prazo_texto": null,
    "semanas": null,
    "observacao": null
  },
  "orientacao_paciente": {
    "texto": "mensagem acolhedora com orientações para o paciente",
    "alerta_alergia": false,
    "alergia_mencionada": null
  },
  "novas_preferencias": [],
  "alertas_ia": []
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: transcript }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: "Erro na API Anthropic", details: err });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Erro interno", message: err.message });
  }
}
