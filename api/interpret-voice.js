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
O microfone frequentemente transcreve errado palavras odontológicas. Corrija silenciosamente:
- "energia" ou "alergia a energia" → alergia
- "dipirona" pode aparecer como "di pirona", "piróna", "di pirona"
- "anestesia" pode aparecer como "anestecia", "anestecia"
- "retorno" pode aparecer como "ritorno", "retornou"
- Qualquer palavra estranha perto de contexto clínico: interprete pelo contexto.

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

6. "lancamento_financeiro": APENAS se a dentista mencionar pagamento, valor, débito ou inadimplência.
   - descricao: o que foi cobrado (ex: "Limpeza", "Consulta", "Débito pendente")
   - valor: número em reais, sem símbolo (ex: 150.00). null se não mencionado.
   - forma: "Pix", "Dinheiro", "Cartão", "Pendente" — se não souber, use "Pendente"
   - status: "Pago" se pagou, "Pendente" se deve ou não pagou
   - Exemplos que ativam este campo: "paciente pagou 200 reais no pix", "ainda deve a consulta", "não pagou hoje", "cobrei 150", "está devendo", "paciente deve", "ficou devendo", "não pagou", "tem débito pendente"
   - null se nada relacionado a dinheiro foi mencionado

7. "procedimento.data": Data em que o procedimento foi realizado, no formato YYYY-MM-DD.
   - A data de hoje está no início da transcrição como "Data de hoje: YYYY-MM-DD".
   - Se a dentista disser "hoje" ou não mencionar data → use a data de hoje
   - Se disser "ontem" → subtraia 1 dia da data de hoje
   - Se mencionar dia da semana passado ("segunda passada", "sexta") → calcule a data correspondente mais recente
   - Se mencionar uma data específica ("dia 10", "10/05") → converta para YYYY-MM-DD do mês/ano corrente
   - Sempre retorne uma string YYYY-MM-DD, nunca null

Responda APENAS com JSON válido, sem markdown, sem explicação, sem texto extra:

{
  "procedimento": {
    "descricao": "descrição clínica profissional do que foi realizado",
    "data": "YYYY-MM-DD",
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
  "alertas_ia": [],
  "lancamento_financeiro": null
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
        model: "claude-haiku-4-5-20251001",
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
