export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.json({ status: "ERRO", motivo: "ANTHROPIC_API_KEY não definida no Vercel" });

  const keyPreview = apiKey.slice(0, 20) + "..." + apiKey.slice(-6);

  // Tenta listar modelos disponíveis
  try {
    const r = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });
    const body = await r.json();
    return res.json({
      status: r.ok ? "CHAVE OK" : "CHAVE COM ERRO",
      http: r.status,
      keyPreview,
      modelos: body.data?.map(m => m.id) || body,
    });
  } catch (e) {
    return res.json({ status: "ERRO DE REDE", keyPreview, erro: e.message });
  }
}
