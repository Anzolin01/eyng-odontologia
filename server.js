import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// ── Serve o frontend (build do Vite) ──
app.use(express.static(join(__dirname, "dist")));

// ── API: interpretar voz com IA ──
app.post("/api/interpret-voice", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key não configurada" });

  const { transcript, patientContext } = req.body;

  const systemPrompt = `Você é um assistente clínico para um consultório odontológico brasileiro.
Recebe a transcrição de um registro por voz feito pela dentista após um atendimento.
Sua função é extrair e estruturar as informações em JSON válido.

Contexto do paciente:
- Nome: ${patientContext.name}
- Alergias registradas: ${patientContext.allergies?.length > 0 ? patientContext.allergies.join(", ") : "nenhuma"}
- Tratamento atual: ${patientContext.treatment}
- Notas inteligentes existentes: ${patientContext.notes?.map(n => n.text).join(" | ") || "nenhuma"}

Extraia do texto e responda APENAS com JSON válido, sem markdown, sem explicação:

{
  "procedimento": {
    "descricao": "descrição profissional e clara do que foi feito",
    "prof": "${patientContext.professional}"
  },
  "retorno": {
    "prazo_texto": "como a dentista disse (ex: 6 semanas, 1 mês)",
    "semanas": null,
    "observacao": null
  },
  "orientacao_paciente": {
    "texto": "orientações em linguagem acessível para enviar ao paciente",
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
});

// ── Todas as rotas não-API retornam o index.html (SPA) ──
// Express 5: usa regex em vez de "*"
app.get(/(.*)/, (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Eyng Odontologia rodando na porta ${PORT}`));
