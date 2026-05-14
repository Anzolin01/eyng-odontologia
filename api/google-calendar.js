/**
 * POST /api/google-calendar
 * Cria um evento no Google Calendar da clínica.
 * Body: { patientName, date, time, notes }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return res.status(500).json({ error: "Google Calendar não configurado" });
  }

  const { patientName, date, time, notes } = req.body;
  if (!patientName || !date) return res.status(400).json({ error: "patientName e date são obrigatórios" });

  try {
    // 1. Trocar refresh_token por access_token
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

    // 2. Montar o evento
    const startDateTime = time
      ? `${date}T${time}:00`   // ex: "2026-05-19T14:30:00"
      : `${date}T08:00:00`;    // sem hora → padrão 08:00

    const endDateTime = time
      ? `${date}T${addHour(time)}:00`
      : `${date}T09:00:00`;

    const event = {
      summary:     `Consulta – ${patientName}`,
      description: notes || `Retorno agendado via Eyng Odontologia`,
      start: { dateTime: startDateTime, timeZone: "America/Sao_Paulo" },
      end:   { dateTime: endDateTime,   timeZone: "America/Sao_Paulo" },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup",  minutes: 60 },
          { method: "popup",  minutes: 1440 }, // 1 dia antes
        ],
      },
    };

    // 3. Inserir no calendário primário
    const calRes = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );
    const calData = await calRes.json();
    if (!calRes.ok) {
      return res.status(calRes.status).json({ error: "Erro ao criar evento", details: calData });
    }

    return res.json({ ok: true, eventId: calData.id, htmlLink: calData.htmlLink });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno", message: err.message });
  }
}

// "14:30" → "15:30" (adiciona 1 hora)
function addHour(time) {
  const [h, m] = time.split(":").map(Number);
  const next = (h + 1) % 24;
  return `${String(next).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
