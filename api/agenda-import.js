/**
 * GET /api/agenda-import
 * Lê eventos do Google Calendar da clínica e retorna:
 *  - Lista de calendários disponíveis
 *  - Eventos dos últimos 30 + próximos 90 dias
 *  - Nomes extraídos dos títulos ("Consulta – Nome")
 */

// Palavras que NÃO são nomes de paciente — evita lixo do regex fallback
const BLACKLIST_NOMES = new Set([
  "reunião","reuniao","almoço","almoco","férias","ferias","folga","recesso","feriado",
  "plantão","plantao","cirurgia","treinamento","palestra","congresso","simpósio","simposio",
  "lembrete","tarefa","nota","aviso","plenária","plenaria","bancário","bancario",
  "pagamento","receber","entregar","buscar","compras","mercado","academia",
  "dentista","médico","medico","consulta","retorno","avaliação","avaliacao",
  "aniversário","aniversario","entrega","buscar","ligar","ligar para",
  "reunião de","reuniao de","visita","visita técnica","visita tecnica",
]);

const isNomeValido = (nome) => {
  if (!nome || nome.length < 3) return false;
  const base = nome.toLowerCase().trim();
  // Rejeita se for só uma palavra e ela estiver na blacklist
  const primeiraPalavra = base.split(/\s+/)[0];
  if (BLACKLIST_NOMES.has(base) || BLACKLIST_NOMES.has(primeiraPalavra)) return false;
  // Rejeita se parecer número/código
  if (/^\d/.test(base)) return false;
  return true;
};

const extrairHora = (dateTime) => {
  if (!dateTime) return null;
  try {
    // Usa Intl pra converter para horário de Brasília independente do timezone do evento
    return new Date(dateTime).toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    // Fallback: pega os 5 chars após o T (funciona se o evento já está em -03:00)
    return dateTime.split("T")[1]?.slice(0, 5) || null;
  }
};

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
      id:      c.id,
      nome:    c.summary,
      cor:     c.backgroundColor || null,
      primary: c.primary || false,
    }));

    // 3. Buscar eventos dos últimos 30 dias + próximos 90 dias em todos os calendários
    const agora   = new Date();
    const inicio  = new Date(agora); inicio.setDate(agora.getDate() - 30);
    const fim     = new Date(agora); fim.setDate(agora.getDate() + 90);
    const timeMin = inicio.toISOString();
    const timeMax = fim.toISOString();

    const todosEventos = [];

    for (const cal of calendarios) {
      // Pula calendários de feriados e contatos — não têm consultas
      if (cal.id.includes("holiday") || cal.id.includes("contacts")) continue;

      // Paginação: Google retorna no máximo 250 por página
      let pageToken = null;
      do {
        const params = new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: "true",
          orderBy:      "startTime",
          maxResults:   "250",
        });
        if (pageToken) params.set("pageToken", pageToken);

        const evRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
          { headers }
        );
        const evData = await evRes.json();
        if (!evData.items) break;

        for (const ev of evData.items) {
          const titulo = ev.summary || "";

          // Extrai nome do padrão "Consulta – Nome" ou "Retorno – Nome"
          const match =
            titulo.match(/consulta\s*[–\-]\s*(.+)/i) ||
            titulo.match(/retorno\s*[–\-]\s*(.+)/i)  ||
            titulo.match(/avaliação\s*[–\-]\s*(.+)/i)||
            titulo.match(/avaliacao\s*[–\-]\s*(.+)/i)||
            // Fallback: pega tudo antes do primeiro traço/parêntese
            titulo.match(/^(.+?)\s*[-–(]/i);

          const nomeBruto = match
            ? match[1].trim().replace(/\s*\(.*\)\s*$/, "").trim()
            : null;

          const nomePaciente = isNomeValido(nomeBruto) ? nomeBruto : null;

          const data = ev.start?.date || ev.start?.dateTime?.split("T")[0] || null;
          const hora = extrairHora(ev.start?.dateTime);

          todosEventos.push({
            id:           ev.id,
            titulo,
            nomePaciente,
            data,
            hora,
            calendarId:   cal.id,
            calendarNome: cal.nome,
            calendarCor:  cal.cor,
          });
        }

        pageToken = evData.nextPageToken || null;
      } while (pageToken);
    }

    // 4. Deduplica nomes e coleta a data MAIS RECENTE de cada paciente
    const nomesMap = new Map();
    for (const ev of todosEventos) {
      if (!ev.nomePaciente) continue;
      const chave = ev.nomePaciente.toLowerCase();

      if (!nomesMap.has(chave)) {
        nomesMap.set(chave, {
          nome:           ev.nomePaciente,
          ultimaConsulta: ev.data,
          totalEventos:   0,
        });
      }
      const entry = nomesMap.get(chave);
      entry.totalEventos++;

      // Mantém a data mais recente (ISO: comparação lexicográfica funciona)
      if (ev.data && (!entry.ultimaConsulta || ev.data > entry.ultimaConsulta)) {
        entry.ultimaConsulta = ev.data;
        // Usa o nome do evento mais recente (tende a ser o mais bem formatado)
        entry.nome = ev.nomePaciente;
      }
    }
    const nomesPacientes = [...nomesMap.values()];

    return res.json({
      calendarios,
      eventos: todosEventos,
      nomesPacientes,
      periodo: {
        inicio: inicio.toISOString().split("T")[0],
        fim:    fim.toISOString().split("T")[0],
      },
    });

  } catch (err) {
    return res.status(500).json({ error: "Erro interno", message: err.message });
  }
}
