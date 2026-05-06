// ─────────────────────────────────────────────────────────────
// TELEMETRIA — Eyng Odontologia
// ─────────────────────────────────────────────────────────────
// Nível 3: cliques + sessão + funis.
//
// Como usar:
//   import { track } from "./tracking";
//   track("voice_record_start", { patient_id: p.id });
//
// A função NUNCA lança erro. Falhas de rede são engolidas
// silenciosamente — telemetria não pode quebrar a UI.
// ─────────────────────────────────────────────────────────────

import { supabase } from "./supabase";

const SESSION_KEY      = "eyng_session_id";
const SESSION_LAST_KEY = "eyng_session_last";
const SESSION_TTL_MS   = 30 * 60 * 1000; // 30 min de inatividade = nova sessão

// Gera ID curto pra sessão
function newSessionId() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Pega ou cria session_id, renovando se ficou 30min ocioso
function getSessionId() {
  try {
    const last = parseInt(sessionStorage.getItem(SESSION_LAST_KEY) || "0", 10);
    const now  = Date.now();
    let id     = sessionStorage.getItem(SESSION_KEY);

    if (!id || (now - last) > SESSION_TTL_MS) {
      id = newSessionId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    sessionStorage.setItem(SESSION_LAST_KEY, String(now));
    return id;
  } catch {
    // sessionStorage indisponível (modo privado etc) — gera por chamada
    return newSessionId();
  }
}

// Função principal — fire-and-forget
export async function track(event_name, properties = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // não logou ainda — ignora

    const session_id = getSessionId();

    // Não usa await pra não bloquear a UI
    supabase.from("user_events").insert({
      user_id: user.id,
      session_id,
      event_name,
      properties,
    }).then(({ error }) => {
      if (error) console.warn("[tracking]", event_name, error.message);
    });
  } catch (err) {
    console.warn("[tracking] silenced:", err.message);
  }
}

// Helper pra funis: marca início e ID compartilhado
export function startFunnel(funnel_name) {
  const funnel_id = `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  track(`${funnel_name}_start`, { funnel_id });
  return funnel_id;
}

// ─────────────────────────────────────────────────────────────
// CATÁLOGO DE EVENTOS — referência rápida
// ─────────────────────────────────────────────────────────────
// Sessão / Navegação:
//   session_first_action    — primeira ação após login (calculado)
//   patient_list_view       — entrou na lista
//   patient_open            { patient_id, patient_name }
//   patient_create          { patient_id }
//   tab_view                { tab, patient_id }
//
// Funil VOZ (mais importante — onde vamos ver o abandono):
//   voice_modal_open        { patient_id, funnel_id }
//   voice_record_start      { funnel_id }
//   voice_record_stop       { funnel_id, duration_ms }
//   voice_ai_request        { funnel_id, transcript_length }
//   voice_ai_success        { funnel_id, has_procedimento, has_retorno, has_orientacao, has_lancamento }
//   voice_ai_fail           { funnel_id, error }
//   voice_save_all          { funnel_id }   ← conversão final do funil
//   voice_cancel            { funnel_id, step }  ← abandono
//
// Receituário:
//   receituario_tab_open    { patient_id }
//   receituario_print       { patient_id, tipo }
//
// WhatsApp / Cefaz / Fotos / $ :
//   whatsapp_confirm_click  { patient_id }
//   cefaz_open              { patient_id, has_id }
//   photo_upload            { patient_id, count }
//   photo_view_fullscreen   { patient_id }
//   payment_create          { patient_id, forma, valor, source }
// ─────────────────────────────────────────────────────────────
