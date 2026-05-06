// ─────────────────────────────────────────────────────────────
// INTEL DASHBOARD — Eyng Odontologia
// Visível APENAS para anzolin01@gmail.com (ou localhost)
// Mostra comportamento real dos usuários — não exposto na UI deles
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const DARK = {
  bg: "#0f1117",
  surface: "#1a1d27",
  card: "#21253a",
  border: "#2e3347",
  text: "#e2e8f0",
  muted: "#64748b",
  accent: "#c45f82",
  green: "#10b981",
  yellow: "#f59e0b",
  blue: "#3b82f6",
  red: "#ef4444",
};

const VOICE_FUNNEL_STEPS = [
  { key: "voice_modal_open",   label: "Abriu modal" },
  { key: "voice_record_start", label: "Gravou" },
  { key: "voice_ai_request",   label: "Enviou pra IA" },
  { key: "voice_ai_success",   label: "IA retornou" },
  { key: "voice_save_all",     label: "Salvou tudo ✅" },
];

const TAB_LABELS = {
  mestre:      "Prontuário",
  notas:       "Notas",
  contatos:    "Contatos",
  odontograma: "Odontograma",
  financeiro:  "Financeiro",
  arquivos:    "Arquivos",
  receituario: "Receituário",
};

function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: DARK.card, border: `1px solid ${DARK.border}`,
      borderRadius: 12, padding: "18px 20px", ...style
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: DARK.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function BigNum({ value, label, color = DARK.accent }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1, fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 11, color: DARK.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function BarRow({ label, value, max, color = DARK.accent }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: DARK.text }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700, fontFamily: "monospace" }}>{value}</span>
      </div>
      <div style={{ height: 6, background: DARK.border, borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function FunnelStep({ label, count, pct, isLast }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isLast ? 0 : 6 }}>
      <div style={{ width: 130, fontSize: 11, color: DARK.text, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 22, background: DARK.border, borderRadius: 4, position: "relative", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: pct > 60 ? DARK.green : pct > 30 ? DARK.yellow : DARK.red,
          borderRadius: 4, transition: "width 0.6s ease",
          display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6,
        }}>
          {pct > 15 && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{pct}%</span>}
        </div>
      </div>
      <div style={{ width: 36, fontSize: 12, color: DARK.muted, fontFamily: "monospace", textAlign: "right" }}>{count}</div>
    </div>
  );
}

export default function IntelDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(7); // dias

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const since = new Date();
        since.setDate(since.getDate() - range);
        const { data, error: err } = await supabase
          .from("user_events")
          .select("user_id, session_id, event_name, properties, occurred_at")
          .gte("occurred_at", since.toISOString())
          .order("occurred_at", { ascending: false })
          .limit(2000);
        if (err) throw err;
        setEvents(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  // ── MÉTRICAS ──
  const totalEvents = events.length;
  const uniqueUsers = new Set(events.map(e => e.user_id)).size;
  const uniqueSessions = new Set(events.map(e => e.session_id)).size;

  // Eventos hoje
  const today = new Date().toISOString().split("T")[0];
  const eventsToday = events.filter(e => e.occurred_at?.startsWith(today)).length;

  // Eventos por dia (últimos `range` dias)
  const dayMap = {};
  events.forEach(e => {
    const day = e.occurred_at?.split("T")[0];
    if (day) dayMap[day] = (dayMap[day] || 0) + 1;
  });
  const dayEntries = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b)).slice(-range);
  const maxDay = Math.max(...dayEntries.map(([, v]) => v), 1);

  // Funil de voz — contagem por etapa
  const funnelCounts = VOICE_FUNNEL_STEPS.map(s => ({
    ...s,
    count: events.filter(e => e.event_name === s.key).length,
  }));
  const funnelMax = funnelCounts[0]?.count || 1;

  // Abas visitadas
  const tabMap = {};
  events.filter(e => e.event_name === "tab_view").forEach(e => {
    const t = e.properties?.tab || "desconhecida";
    tabMap[t] = (tabMap[t] || 0) + 1;
  });
  const tabEntries = Object.entries(tabMap).sort(([, a], [, b]) => b - a);
  const maxTab = Math.max(...tabEntries.map(([, v]) => v), 1);

  // Abandono de voz
  const voiceCancels = events.filter(e => e.event_name === "voice_cancel");
  const cancelByStep = {};
  voiceCancels.forEach(e => {
    const step = e.properties?.step || "desconhecido";
    cancelByStep[step] = (cancelByStep[step] || 0) + 1;
  });

  // Últimos 10 eventos
  const recentEvents = events.slice(0, 10);

  // Erros de voz
  const voiceErrors = events.filter(e => e.event_name === "voice_ai_fail");

  if (loading) return (
    <div style={{ background: DARK.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: DARK.muted, fontSize: 14 }}>Carregando inteligência...</div>
    </div>
  );

  if (error) return (
    <div style={{ background: DARK.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: DARK.red, fontSize: 13, maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Erro ao carregar</div>
        <div style={{ color: DARK.muted }}>{error}</div>
        <div style={{ marginTop: 12, fontSize: 11, color: DARK.muted }}>
          Verifique se a política de admin foi criada no Supabase.
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: DARK.bg, minHeight: "100vh", padding: "24px 20px", fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: DARK.text }}>⚡ Intel Layer</div>
          <div style={{ fontSize: 11, color: DARK.muted, marginTop: 2 }}>Comportamento real — invisível pra clínica</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setRange(d)} style={{
              background: range === d ? DARK.accent : DARK.card,
              border: `1px solid ${range === d ? DARK.accent : DARK.border}`,
              color: range === d ? "#fff" : DARK.muted,
              borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { v: eventsToday, l: "Eventos hoje", c: DARK.accent },
          { v: totalEvents, l: `Total ${range} dias`, c: DARK.blue },
          { v: uniqueUsers, l: "Usuários ativos", c: DARK.green },
          { v: uniqueSessions, l: "Sessões", c: DARK.yellow },
        ].map((k, i) => (
          <Card key={i}>
            <BigNum value={k.v} label={k.l} color={k.c} />
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Eventos por dia */}
        <Card title="Atividade por dia">
          {dayEntries.length === 0 ? (
            <div style={{ color: DARK.muted, fontSize: 12 }}>Nenhum dado ainda.</div>
          ) : (
            dayEntries.map(([day, count]) => {
              const [y, m, d] = day.split("-");
              return (
                <BarRow
                  key={day}
                  label={`${d}/${m}`}
                  value={count}
                  max={maxDay}
                  color={day === today ? DARK.accent : DARK.blue}
                />
              );
            })
          )}
        </Card>

        {/* Funil de voz */}
        <Card title={`Funil de voz · abandono`}>
          {funnelMax === 0 ? (
            <div style={{ color: DARK.muted, fontSize: 12 }}>Nenhuma gravação ainda.</div>
          ) : (
            VOICE_FUNNEL_STEPS.map((step, i) => {
              const count = funnelCounts[i].count;
              const pct = funnelMax > 0 ? Math.round((count / funnelMax) * 100) : 0;
              return (
                <FunnelStep
                  key={step.key}
                  label={step.label}
                  count={count}
                  pct={pct}
                  isLast={i === VOICE_FUNNEL_STEPS.length - 1}
                />
              );
            })
          )}
          {voiceCancels.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${DARK.border}` }}>
              <div style={{ fontSize: 10, color: DARK.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Cancelamentos por etapa</div>
              {Object.entries(cancelByStep).map(([step, count]) => (
                <div key={step} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: DARK.text, marginBottom: 4 }}>
                  <span>{step}</span>
                  <span style={{ color: DARK.red, fontWeight: 700 }}>{count}×</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Abas visitadas */}
        <Card title="Abas mais acessadas">
          {tabEntries.length === 0 ? (
            <div style={{ color: DARK.muted, fontSize: 12 }}>Nenhuma navegação registrada.</div>
          ) : (
            tabEntries.map(([tab, count]) => (
              <BarRow
                key={tab}
                label={TAB_LABELS[tab] || tab}
                value={count}
                max={maxTab}
                color={DARK.green}
              />
            ))
          )}
        </Card>

        {/* Erros + Últimos eventos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Erros de voz */}
          <Card title={`Erros de IA · ${voiceErrors.length} ocorrências`}>
            {voiceErrors.length === 0 ? (
              <div style={{ color: DARK.green, fontSize: 12 }}>✅ Nenhum erro de IA registrado.</div>
            ) : (
              voiceErrors.slice(0, 5).map((e, i) => (
                <div key={i} style={{ fontSize: 11, color: DARK.muted, marginBottom: 6, borderBottom: `1px solid ${DARK.border}`, paddingBottom: 6 }}>
                  <span style={{ color: DARK.red }}>{e.properties?.error?.slice(0, 60) || "erro desconhecido"}</span>
                  <div style={{ fontSize: 10, marginTop: 2 }}>{new Date(e.occurred_at).toLocaleString("pt-BR")}</div>
                </div>
              ))
            )}
          </Card>

          {/* Pagamentos via voz */}
          <Card title="Pagamentos registrados">
            {(() => {
              const payments = events.filter(e => e.event_name === "payment_create");
              const bySource = {};
              payments.forEach(e => {
                const src = e.properties?.source || "manual";
                bySource[src] = (bySource[src] || 0) + 1;
              });
              return payments.length === 0 ? (
                <div style={{ color: DARK.muted, fontSize: 12 }}>Nenhum pagamento no período.</div>
              ) : (
                <>
                  <div style={{ fontSize: 28, fontWeight: 900, color: DARK.green, fontFamily: "monospace" }}>{payments.length}</div>
                  <div style={{ marginTop: 10 }}>
                    {Object.entries(bySource).map(([src, count]) => (
                      <div key={src} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: DARK.text, marginBottom: 3 }}>
                        <span>{src === "voice" ? "🎙️ via voz" : "📝 manual"}</span>
                        <span style={{ fontWeight: 700, color: DARK.yellow }}>{count}×</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </Card>
        </div>
      </div>

      {/* Stream de eventos recentes */}
      <Card title="Últimos eventos · stream em tempo real">
        {recentEvents.length === 0 ? (
          <div style={{ color: DARK.muted, fontSize: 12 }}>Nenhum evento ainda.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
            {recentEvents.map((e, i) => (
              <div key={i} style={{
                background: DARK.surface, border: `1px solid ${DARK.border}`,
                borderRadius: 8, padding: "8px 12px",
                borderLeft: `3px solid ${e.event_name.includes("voice") ? DARK.accent : e.event_name.includes("payment") ? DARK.green : DARK.blue}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: DARK.text, fontFamily: "monospace" }}>{e.event_name}</div>
                <div style={{ fontSize: 10, color: DARK.muted, marginTop: 3 }}>
                  {new Date(e.occurred_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </div>
                {Object.keys(e.properties || {}).length > 0 && (
                  <div style={{ fontSize: 10, color: DARK.muted, marginTop: 4 }}>
                    {Object.entries(e.properties).slice(0, 2).map(([k, v]) => (
                      <span key={k} style={{ marginRight: 8 }}>{k}: <span style={{ color: DARK.accent }}>{String(v).slice(0, 20)}</span></span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 10, color: DARK.muted, textAlign: "right" }}>
          {totalEvents} eventos carregados · dados dos últimos {range} dias · atualiza ao reabrir
        </div>
      </Card>
    </div>
  );
}
