/**
 * GET /api/agenda-import
 * Lê eventos futuros do Google Calendar da clínica e retorna:
 *  - Lista de calendários disponíveis
 *  - Eventos dos próximos 90 dias
 *  - Nomes extraídos dos títulos ("Consulta – Nome")
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return res.status(500).json({ error: "Google Calendar não configurado" });
  }

  try {
    // 1. Obter access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: GOOGLE_REFRESH_TOKEN,
        grant_type:    "refresh_token",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(500).json({ error: "Falha ao obter access token", details: tokenData });
    }
    const token = tokenData.access_token;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Listar calendários da conta
    const calListRes = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      { headers }
    );
    const calListData = await calListRes.json();
    const calendarios = (calListData.items || []).map(c => ({
      id:    c.id,
      nome:  c.summary,
      cor:   c.backgroundColor || null,
      primary: c.primary || false,
    }));

    // 3. Buscar eventos dos últimos 30 dias + próximos 90 dias em todos os calendários
    const agora      = new Date();
    const inicio     = new Date(agora); inicio.setDate(agora.getDate() - 30);
    const fim        = new Date(agora); fim.setDate(agora.getDate() + 90);
    const timeMin    = inicio.toISOString();
    const timeMax    = fim.toISOString();

    const todosEventos = [];

    for (const cal of calendarios) {
      // Pula calendários de feriados e outros irrelevantes
      if (cal.id.includes("holiday") || cal.id.includes("contacts")) continue;

      const evRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?` +
        new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: "true",
          orderBy:      "startTime",
          maxResults:   "250",
        }),
        { headers }
      );
      const evData = await evRes.json();
      if (!evData.items) continue;

      for (const ev of evData.items) {
        const titulo = ev.summary || "";
        // Extrai nome do padrão "Consulta – Nome" ou "Consulta - Nome" ou "Nome (consulta)"
        const match = titulo.match(/consulta\s*[–\-]\s*(.+)/i)
                   || titulo.match(/retorno\s*[–\-]\s*(.+)/i)
                   || titulo.match(/^(.+?)\s*[-–(]/i);

        const nomePaciente = match
          ? match[1].trim().replace(/\s*\(.*\)\s*$/, "").trim()
          : null;

        todosEventos.push({
          id:           ev.id,
          titulo,
          nomePaciente,
          data:         ev.start?.date || ev.start?.dateTime?.split("T")[0] || null,
          hora:         ev.start?.dateTime
                          ? ev.start.dateTime.split("T")[1]?.slice(0,5)
                          : null,
          calendarId:   cal.id,
          calendarNome: cal.nome,
          calendarCor:  cal.cor,
        });
      }
    }

    // 4. Deduplica nomes extraídos
    const nomesSet = new Set();
    const nomesPacientes = [];
    for (const ev of todosEventos) {
      if (!ev.nomePaciente) continue;
      const chave = ev.nomePaciente.toLowerCase();
      if (!nomesSet.has(chave)) {
        nomesSet.add(chave);
        nomesPacientes.push({
          nome: ev.nomePaciente,
          ultimaConsulta: ev.data,
          totalEventos: todosEventos.filter(
            e => e.nomePaciente?.toLowerCase() === chave
          ).length,
        });
      }
    }

    return res.json({
      calendarios,
      eventos: todosEventos,
      nomesPacientes,
      periodo: { inicio: inicio.toISOString().split("T")[0], fim: fim.toISOString().split("T")[0] },
    });

  } catch (err) {
    return res.status(500).json({ error: "Erro interno", message: err.message });
  }
}
