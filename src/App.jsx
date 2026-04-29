import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import Odontograma2D from "./Odontograma2D";
import FinanceiroModule, { calcResumo } from "./FinanceiroModule";
import CaixaDia from "./CaixaDia";
import Agenda from "./Agenda";
import p1 from "./assets/personagens/1_sabio_prontuario.png";
import p2 from "./assets/personagens/2_sonolento_historico.png";
import p3 from "./assets/personagens/3_atento_notas.png";
import p4 from "./assets/personagens/4_alegre_contatos.png";
import p5 from "./assets/personagens/5_vaidoso_odontograma.png";
import p6 from "./assets/personagens/6_serio_financeiro.png";
import p7 from "./assets/personagens/7_voz_ia.png";

// ── TEMA CLÁSSICO (modais / detalhe) ──
const G = {
  gold: "#c9a84c", goldL: "#e8d5a0", goldD: "#a07d2e",
  black: "#1a1a1a", white: "#fafaf8",
  g100: "#f5f4f0", g200: "#e8e6e0", g300: "#d4d1c8",
  g500: "#8a8577", g700: "#4a473f", surface: "#ffffff",
  red: "#c0392b", green: "#27ae60", blue: "#2c6fbb", orange: "#d4850a",
};

// ── CORES POR ESPECIALIDADE ──
const SP = {
  "Ortodontia":     { from: "#c45f82", to: "#e8a0b8", emoji: "🦷" },
  "Implantodontia": { from: "#0EA5E9", to: "#38BDF8", emoji: "🔩" },
  "Estética":       { from: "#EC4899", to: "#F9A8D4", emoji: "✨" },
  "Prótese":        { from: "#F59E0B", to: "#FCD34D", emoji: "🦷" },
  "Cirurgia":       { from: "#10B981", to: "#6EE7B7", emoji: "⚕️" },
  "Clínico Geral":  { from: "#64748B", to: "#94A3B8", emoji: "🩺" },
};

const TODAY = new Date();
let _id = 200;
const uid = () => String(++_id);
const getDays = (s) => Math.ceil((new Date(s + "T12:00:00") - TODAY) / 86400000);
const fmtDate = (s) => { if (!s) return "—"; const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };
const todayISO = () => new Date().toISOString().split("T")[0];
const addWeeks = (w) => { const d = new Date(TODAY); d.setDate(d.getDate() + w * 7); return d.toISOString().split("T")[0]; };

const PATIENTS = [
  { id: 1, name: "Maria Eduarda Conti", phone: "(49) 99812-3456", birth: "15/03/1985", cpf: "***.***.***-12", lastVisit: "2025-11-20", nextReturn: "2026-02-20", returnStatus: "overdue", professional: "Dra. Caroline", specialty: "Ortodontia", allergies: ["Dipirona", "Látex"], notes: [{ id: "n1", type: "preference", text: "Não pode segundas e quartas à tarde" }, { id: "n2", type: "preference", text: "Prefere WhatsApp, não ligação" }], procedures: [{ id: "p1", date: "2025-11-20", desc: "Manutenção do aparelho — troca de elásticos", prof: "Dra. Caroline" }], treatment: "Ortodontia corretiva — Classe II. Mês 5 de 24.", financialStatus: "Em dia", balance: 0, contactLog: [] },
  { id: 2, name: "João Pedro Almeida", phone: "(49) 99945-6789", birth: "22/07/1972", cpf: "***.***.***-34", lastVisit: "2025-08-10", nextReturn: "2025-11-10", returnStatus: "overdue", professional: "Dr. João Beno", specialty: "Implantodontia", allergies: [], notes: [{ id: "n3", type: "preference", text: "Só sextas-feiras" }, { id: "n4", type: "alert", text: "Diabético tipo 2 — verificar glicemia" }], procedures: [{ id: "p4", date: "2025-08-10", desc: "Reabertura para cicatrizador — implante 36", prof: "Dr. João Beno" }], treatment: "Implante unitário região 36 — osseointegração concluída.", financialStatus: "Pendente", balance: 1200, contactLog: [{ id: "c1", date: "2026-01-15", type: "whatsapp", result: "sem_resposta", obs: "Sem retorno" }] },
  { id: 3, name: "Ana Clara Fontana", phone: "(49) 98834-2211", birth: "05/11/1998", cpf: "***.***.***-56", lastVisit: "2026-03-28", nextReturn: "2026-09-28", returnStatus: "ok", professional: "Dra. Caroline", specialty: "Estética", allergies: ["Penicilina"], notes: [{ id: "n6", type: "preference", text: "Horários no início da manhã" }, { id: "n7", type: "alert", text: "Bruxismo severo — placa noturna" }], procedures: [{ id: "p7", date: "2026-03-28", desc: "Clareamento a laser — sessão 3/3", prof: "Dra. Caroline" }], treatment: "Clareamento concluído. Acomp. bruxismo semestral.", financialStatus: "Em dia", balance: 0, contactLog: [] },
  { id: 4, name: "Carlos Roberto Zanella", phone: "(49) 99901-7788", birth: "30/01/1960", cpf: "***.***.***-78", lastVisit: "2025-10-05", nextReturn: "2026-01-05", returnStatus: "overdue", professional: "Dr. João Beno", specialty: "Prótese", allergies: ["Ibuprofeno"], notes: [{ id: "n8", type: "alert", text: "Hipertenso — Losartana 50mg" }, { id: "n9", type: "preference", text: "Contato só por WhatsApp da esposa: (49) 99901-8899" }], procedures: [{ id: "p10", date: "2025-10-05", desc: "Prova da infraestrutura metálica — PPR superior", prof: "Dr. João Beno" }], treatment: "PPR superior em andamento. Não retornou para prova final.", financialStatus: "Pendente", balance: 800, contactLog: [] },
  { id: 5, name: "Letícia Bortolini", phone: "(49) 98876-5544", birth: "12/09/2012", cpf: "***.***.***-90", lastVisit: "2026-04-02", nextReturn: "2026-07-02", returnStatus: "ok", professional: "Dra. Caroline", specialty: "Ortodontia", allergies: [], notes: [{ id: "n11", type: "preference", text: "Menor — responsável: mãe Fernanda, (49) 98876-5500" }, { id: "n13", type: "alert", text: "Mãe ansiosa — explicar evolução com calma" }], procedures: [{ id: "p13", date: "2026-04-02", desc: "Manutenção — ativação do arco inferior", prof: "Dra. Caroline" }], treatment: "Ortodontia interceptiva — Mês 5 de 18.", financialStatus: "Em dia", balance: 0, contactLog: [] },
  { id: 6, name: "Ricardo Henrique Moraes", phone: "(49) 99923-1122", birth: "08/04/1988", cpf: "***.***.***-45", lastVisit: "2026-01-10", nextReturn: "2026-04-10", returnStatus: "due_today", professional: "Dr. João Beno", specialty: "Cirurgia", allergies: ["AAS"], notes: [{ id: "n14", type: "preference", text: "Só pode 8h–11h" }, { id: "n15", type: "alert", text: "Tabagista — orientar cicatrização" }], procedures: [{ id: "p16", date: "2026-01-10", desc: "Remoção de sutura — sisos 38 e 48", prof: "Dr. João Beno" }], treatment: "Pós-op exodontia de sisos. Retorno para avaliação final.", financialStatus: "Em dia", balance: 0, contactLog: [] },
];

// ── CSS ──
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@400;500;600;700;800;900&family=Cormorant+Garamond:wght@300;400;600;700&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; background: #fdf4f6; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #e8a0b8; border-radius: 4px; }
  input::placeholder { color: #cbd5e1; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes cardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.8; } }
  @keyframes pulse2 { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
  @keyframes pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes ripple { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(2.2); opacity: 0; } }
  @keyframes checkPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes waveBar { 0%, 100% { height: 6px; } 50% { height: 22px; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .review-card { animation: fadeInUp 0.3s ease both; }
`;

const inputSt = {
  width: "100%", padding: "9px 12px", border: `1px solid ${G.g200}`,
  borderRadius: 8, fontSize: 13, color: G.black, background: G.white,
  outline: "none", fontFamily: "'Inter',sans-serif",
};
const btnPrim = {
  background: G.black, color: G.gold, border: "none", borderRadius: 8,
  padding: "9px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
  fontFamily: "'Inter',sans-serif", letterSpacing: 0.3,
};
const btnSec = {
  background: "none", color: G.g500, border: `1px solid ${G.g200}`,
  borderRadius: 8, padding: "9px 18px", fontSize: 12, fontWeight: 500,
  cursor: "pointer", fontFamily: "'Inter',sans-serif",
};

// ── SHARED COMPONENTS ──
function ReturnBadge({ status, nextReturn }) {
  if (!nextReturn) return null;
  const days = getDays(nextReturn);
  if (status === "overdue") return <span style={{ background: "#EF4444", color: "#fff", padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>ATRASADO {Math.abs(days)}d</span>;
  if (status === "due_today") return <span style={{ background: "#F59E0B", color: "#fff", padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>HOJE</span>;
  return <span style={{ background: "#10B981", color: "#fff", padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>em {days}d</span>;
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.white, borderRadius: 14, width: "100%", maxWidth: width, maxHeight: "88vh", overflowY: "auto", animation: "fadeInUp .2s ease", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${G.g200}` }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: G.black }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: G.g500, fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "18px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: G.g500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

// ── MODAIS ──
function ModalNota({ onSave, onClose }) {
  const [type, setType] = useState("preference");
  const [text, setText] = useState("");
  return (
    <Modal title="Nova Nota Inteligente" onClose={onClose} width={440}>
      <Field label="Tipo">
        <div style={{ display: "flex", gap: 8 }}>
          {[["preference", "📋 Preferência"], ["alert", "⚡ Alerta Clínico"]].map(([v, l]) => (
            <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: 9, borderRadius: 8, border: `1.5px solid ${type === v ? (v === "alert" ? G.orange : G.blue) : G.g200}`, background: type === v ? (v === "alert" ? "#fef9e7" : "#f0f7ff") : G.white, color: type === v ? (v === "alert" ? G.orange : G.blue) : G.g500, fontSize: 12, fontWeight: type === v ? 600 : 400, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      </Field>
      <Field label="Texto">
        <textarea style={{ ...inputSt, height: 90, resize: "vertical" }} value={text} onChange={e => setText(e.target.value)} placeholder="Digite a nota..." />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={onClose}>Cancelar</button>
        <button style={btnPrim} onClick={() => { if (text.trim()) onSave({ id: uid(), type, text }); }}>Adicionar</button>
      </div>
    </Modal>
  );
}

function ModalProcedimento({ patient, onSave, onClose }) {
  const [f, setF] = useState({ date: todayISO(), desc: "", prof: patient.professional });
  return (
    <Modal title="Registrar Procedimento" onClose={onClose} width={440}>
      <Field label="Data"><input type="date" style={inputSt} value={f.date} onChange={e => setF(p => ({ ...p, date: e.target.value }))} /></Field>
      <Field label="Profissional">
        <select style={inputSt} value={f.prof} onChange={e => setF(p => ({ ...p, prof: e.target.value }))}>
          <option>Dra. Caroline</option><option>Dr. João Beno</option>
        </select>
      </Field>
      <Field label="Descrição">
        <textarea style={{ ...inputSt, height: 80, resize: "vertical" }} value={f.desc} onChange={e => setF(p => ({ ...p, desc: e.target.value }))} placeholder="Ex: Manutenção do aparelho — troca de elásticos" />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={onClose}>Cancelar</button>
        <button style={btnPrim} onClick={() => { if (f.desc.trim()) onSave({ id: uid(), ...f }); }}>Registrar</button>
      </div>
    </Modal>
  );
}

function ModalRetorno({ patient, onSave, onClose }) {
  const [date, setDate] = useState(patient.nextReturn || "");
  return (
    <Modal title="Definir Próximo Retorno" onClose={onClose} width={340}>
      <Field label="Data"><input type="date" style={inputSt} value={date} onChange={e => setDate(e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={onClose}>Cancelar</button>
        <button style={btnPrim} onClick={() => { if (date) onSave(date); }}>Confirmar</button>
      </div>
    </Modal>
  );
}

function ModalContato({ patient, onSave, onClose }) {
  const [f, setF] = useState({ type: "whatsapp", result: "confirmado", obs: "" });
  const results = [["confirmado", "✅ Confirmou retorno"], ["reagendou", "🗓 Reagendou"], ["sem_resposta", "📵 Sem resposta"], ["nao_atendeu", "📞 Não atendeu"], ["recusou", "❌ Recusou"]];
  return (
    <Modal title="Registrar Contato" onClose={onClose} width={440}>
      {patient.notes.length > 0 && (
        <div style={{ background: `${G.gold}10`, border: `1px solid ${G.gold}30`, borderRadius: 8, padding: "10px 13px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: G.goldD, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>💡 Notas do paciente</div>
          {patient.notes.map(n => <div key={n.id} style={{ fontSize: 12, color: G.g700, lineHeight: 1.5, paddingLeft: 8, borderLeft: `2px solid ${n.type === "alert" ? G.orange : G.gold}55`, marginTop: 4 }}>{n.text}</div>)}
        </div>
      )}
      <Field label="Canal">
        <div style={{ display: "flex", gap: 8 }}>
          {[["whatsapp", "💬 WhatsApp"], ["ligacao", "📞 Ligação"]].map(([v, l]) => (
            <button key={v} onClick={() => setF(p => ({ ...p, type: v }))} style={{ flex: 1, padding: 9, borderRadius: 8, border: `1.5px solid ${f.type === v ? G.green : G.g200}`, background: f.type === v ? "#e8f8ef" : G.white, color: f.type === v ? G.green : G.g500, fontSize: 12, fontWeight: f.type === v ? 600 : 400, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      </Field>
      <Field label="Resultado">
        <select style={inputSt} value={f.result} onChange={e => setF(p => ({ ...p, result: e.target.value }))}>
          {results.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <Field label="Observação (opcional)">
        <input style={inputSt} value={f.obs} onChange={e => setF(p => ({ ...p, obs: e.target.value }))} placeholder="Mensagem, horário combinado..." />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={onClose}>Cancelar</button>
        <button style={btnPrim} onClick={() => onSave({ id: uid(), date: todayISO(), ...f })}>Registrar</button>
      </div>
    </Modal>
  );
}

function ModalNovoPaciente({ onSave, onClose }) {
  const [f, setF] = useState({ name: "", phone: "", birth: "", cpf: "", professional: "Dra. Caroline", specialty: "Ortodontia", treatment: "", financialStatus: "Em dia" });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Novo Paciente" onClose={onClose} width={500}>
      <Field label="Nome completo"><input style={inputSt} value={f.name} onChange={set("name")} placeholder="Nome completo" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
        <Field label="Telefone"><input style={inputSt} value={f.phone} onChange={set("phone")} placeholder="(49) 9xxxx-xxxx" /></Field>
        <Field label="Nascimento"><input style={inputSt} value={f.birth} onChange={set("birth")} placeholder="DD/MM/AAAA" /></Field>
      </div>
      <Field label="Profissional">
        <select style={inputSt} value={f.professional} onChange={set("professional")}>
          <option>Dra. Caroline</option><option>Dr. João Beno</option>
        </select>
      </Field>
      <Field label="Especialidade">
        <select style={inputSt} value={f.specialty} onChange={set("specialty")}>
          {["Ortodontia", "Estética", "Implantodontia", "Cirurgia", "Prótese", "Clínico Geral"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Plano de tratamento">
        <textarea style={{ ...inputSt, height: 65, resize: "vertical" }} value={f.treatment} onChange={set("treatment")} placeholder="Descreva o tratamento..." />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={onClose}>Cancelar</button>
        <button style={btnPrim} onClick={() => { if (!f.name.trim() || !f.phone.trim()) return; onSave({ ...f, id: Date.now(), lastVisit: "", nextReturn: "", returnStatus: "ok", allergies: [], notes: [], procedures: [], contactLog: [], balance: 0 }); }}>Salvar</button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════
// MÓDULO DE VOZ
// ══════════════════════════════════════════════
function VoiceModule({ patient, onSave, onClose }) {
  const [stage, setStage] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [result, setResult] = useState(null);
  const [editedResult, setEditedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const isRecordingRef = useRef(false);

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setStage("fallback"); return; }
    transcriptRef.current = "";
    setTranscript(""); setInterimText(""); setStage("recording");
    isRecordingRef.current = true;
    const startRec = () => {
      const rec = new SpeechRecognition();
      rec.lang = "pt-BR"; rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        let interim = "";
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) { transcriptRef.current += e.results[i][0].transcript + " "; setTranscript(transcriptRef.current); setInterimText(""); }
          else { interim += e.results[i][0].transcript; setInterimText(interim); }
        }
      };
      rec.onerror = (e) => { if (e.error === "not-allowed") { setErrorMsg("Permita o acesso ao microfone."); setStage("error"); } };
      rec.onend = () => { if (isRecordingRef.current) startRec(); };
      recognitionRef.current = rec; rec.start();
    };
    startRec();
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    if (recognitionRef.current) recognitionRef.current.stop();
    const finalText = transcriptRef.current.trim();
    if (!finalText || finalText.length < 5) { setErrorMsg("Não captei nada. Tente novamente."); setStage("error"); return; }
    processTranscript(finalText);
  }, []);

  const processTranscript = async (text) => {
    setStage("processing");
    try {
      const response = await fetch("/api/interpret-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: `Transcrição da dentista após atendimento de ${patient.name}:\n\n"${text}"\n\nData de hoje: ${todayISO()}`,
          patientContext: { name: patient.name, allergies: patient.allergies, treatment: patient.treatment, notes: patient.notes, professional: patient.professional },
        }),
      });
      if (!response.ok) throw new Error("Function error");
      const parsed = await response.json();
      if (parsed.retorno?.semanas) parsed.retorno.data_calculada = addWeeks(parsed.retorno.semanas);
      setResult(parsed); setEditedResult(JSON.parse(JSON.stringify(parsed))); setStage("review");
    } catch {
      setEditedResult({ procedimento: { descricao: text, prof: patient.professional }, retorno: { prazo_texto: null, semanas: null, data_calculada: null, observacao: null }, orientacao_paciente: { texto: null, alerta_alergia: false }, novas_preferencias: [], alertas_ia: [] });
      setStage("review");
    }
  };

  const runDemo = () => {
    const demoText = `Troquei os elásticos do arco superior, braquete do 23 tava com folga, recolei. Sensibilidade no 15. Volta em 6 semanas. Pediu pra não marcar mais quarta de manhã.`;
    setTranscript(demoText); processTranscript(demoText);
  };

  const saveAll = () => {
    if (!editedResult) return; setSaving(true);
    const updates = {};
    if (editedResult.procedimento?.descricao) { updates.procedures = [{ id: uid(), date: todayISO(), desc: editedResult.procedimento.descricao, prof: editedResult.procedimento.prof || patient.professional }, ...patient.procedures]; updates.lastVisit = todayISO(); }
    if (editedResult.retorno?.data_calculada) { const days = getDays(editedResult.retorno.data_calculada); updates.nextReturn = editedResult.retorno.data_calculada; updates.returnStatus = days < 0 ? "overdue" : days === 0 ? "due_today" : "ok"; }
    if (editedResult.novas_preferencias?.length > 0) { updates.notes = [...patient.notes, ...editedResult.novas_preferencias.map(p => ({ id: uid(), type: p.tipo || "preference", text: p.texto }))]; }
    setTimeout(() => { onSave({ ...patient, ...updates }); setStage("success"); setSaving(false); setTimeout(() => onClose(), 2000); }, 600);
  };

  const updateField = (path, value) => {
    setEditedResult(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const WaveBar = ({ delay }) => <div style={{ width: 3, height: 6, background: G.gold, borderRadius: 2, animation: `waveBar 0.8s ease-in-out ${delay}s infinite` }} />;
  const ReviewCard = ({ color, icon, title, children, delay = 0 }) => (
    <div className="review-card" style={{ background: G.surface, border: `1px solid ${G.g200}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: "14px 16px", marginBottom: 12, animationDelay: `${delay}s` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>{icon} {title}</div>
      {children}
    </div>
  );

  if (stage === "idle") return (
    <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
      <div style={{ fontSize: 13, color: G.g500, marginBottom: 24, lineHeight: 1.6 }}>Fale naturalmente o que foi feito.<br /><span style={{ color: G.g700 }}>A IA interpreta, organiza e preenche a ficha.</span></div>
      <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
        <button onClick={startRecording} style={{ width: 80, height: 80, borderRadius: "50%", background: G.black, border: `2px solid ${G.gold}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.background = G.gold; }} onMouseLeave={e => { e.currentTarget.style.background = G.black; }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill={G.gold}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={G.gold} strokeWidth="2" fill="none" strokeLinecap="round" /><line x1="12" y1="19" x2="12" y2="23" stroke={G.gold} strokeWidth="2" strokeLinecap="round" /><line x1="8" y1="23" x2="16" y2="23" stroke={G.gold} strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: G.black, fontWeight: 600, marginBottom: 6 }}>Toque para falar</div>
      <div style={{ fontSize: 11, color: G.g500, marginBottom: 24 }}>Após terminar, toque em "Pronto" — a IA faz o resto</div>
      <button onClick={runDemo} style={{ background: "none", border: `1px dashed ${G.g300}`, color: G.g500, borderRadius: 8, padding: "6px 16px", fontSize: 11, cursor: "pointer" }}>✨ Ver demonstração sem microfone</button>
    </div>
  );

  if (stage === "recording") return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
        {[0, 0.4, 0.8].map((d, i) => <div key={i} style={{ position: "absolute", inset: -16 - i * 10, borderRadius: "50%", border: `1px solid ${G.red}`, animation: `ripple 1.5s ease-out ${d}s infinite`, opacity: 0 }} />)}
        <button onClick={stopRecording} style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", background: G.red, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.5s ease-in-out infinite" }}>
          <div style={{ width: 18, height: 18, background: "#fff", borderRadius: 3 }} />
        </button>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: G.red, fontWeight: 600, marginBottom: 4 }}>Ouvindo...</div>
      <div style={{ fontSize: 11, color: G.g500, marginBottom: 16 }}>Toque no quadrado quando terminar</div>
      <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 16 }}>
        {[0, 0.1, 0.2, 0.3, 0.2, 0.1, 0, 0.15, 0.3, 0.15].map((d, i) => <WaveBar key={i} delay={d} />)}
      </div>
      <div style={{ background: G.g100, borderRadius: 10, padding: "12px 14px", minHeight: 60, textAlign: "left", fontSize: 13, color: G.g700, lineHeight: 1.6 }}>
        {transcript && <span style={{ color: G.black }}>{transcript}</span>}
        {interimText && <span style={{ color: G.g500 }}>{interimText}</span>}
        {!transcript && !interimText && <span style={{ color: G.g300 }}>Fale agora...</span>}
      </div>
    </div>
  );

  if (stage === "processing") return (
    <div style={{ textAlign: "center", padding: "30px 0" }}>
      <div style={{ width: 50, height: 50, border: `2px solid ${G.g200}`, borderTop: `2px solid ${G.gold}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: G.black, fontWeight: 600, marginBottom: 6 }}>A IA está interpretando...</div>
      <div style={{ fontSize: 12, color: G.g500 }}>Extraindo procedimento, retorno, orientações e preferências</div>
    </div>
  );

  if (stage === "error") return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🎤</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: G.red, fontWeight: 600, marginBottom: 8 }}>Ops</div>
      <div style={{ fontSize: 13, color: G.g700, marginBottom: 20 }}>{errorMsg}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button style={btnSec} onClick={() => setStage("idle")}>Tentar de novo</button>
        <button style={btnPrim} onClick={() => setStage("fallback")}>Digitar manualmente</button>
      </div>
    </div>
  );

  if (stage === "fallback") return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ background: `${G.orange}12`, border: `1px solid ${G.orange}30`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: G.orange, marginBottom: 14 }}>Gravação de voz não disponível. Digite o registro abaixo.</div>
      <Field label="Registro do procedimento">
        <textarea style={{ ...inputSt, height: 100, resize: "vertical" }} value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Descreva o que foi feito..." autoFocus />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={() => setStage("idle")}>Voltar</button>
        <button style={btnPrim} onClick={() => { if (transcript.trim().length > 5) processTranscript(transcript); }}>Interpretar com IA →</button>
      </div>
    </div>
  );

  if (stage === "success") return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${G.green}15`, border: `2px solid ${G.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "checkPop .4s cubic-bezier(.175,.885,.32,1.275)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: G.black, fontWeight: 600, marginBottom: 6 }}>Tudo registrado</div>
      <div style={{ fontSize: 12, color: G.g500 }}>Procedimento, retorno e notas atualizados.</div>
    </div>
  );

  if (stage === "review" && editedResult) {
    const r = editedResult;
    return (
      <div>
        <div style={{ background: G.g100, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: G.g500, lineHeight: 1.5, marginBottom: 16 }}>
          <span style={{ fontWeight: 600, color: G.g700 }}>Você disse: </span>{transcript}
        </div>
        {r.procedimento?.descricao && (
          <ReviewCard color={G.goldD} icon="📋" title="Procedimento" delay={0}>
            <textarea value={r.procedimento.descricao} onChange={e => updateField("procedimento.descricao", e.target.value)} style={{ ...inputSt, height: 70, resize: "vertical", fontSize: 13 }} />
            <div style={{ marginTop: 6, fontSize: 11, color: G.g500 }}>Prof: {r.procedimento.prof} · {fmtDate(todayISO())}</div>
          </ReviewCard>
        )}
        {r.retorno?.prazo_texto && (
          <ReviewCard color={G.blue} icon="🗓" title="Próximo Retorno" delay={0.06}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: G.g700 }}><span style={{ fontWeight: 600, color: G.blue }}>{r.retorno.prazo_texto}</span>{r.retorno.data_calculada && <span style={{ color: G.g500 }}> → {fmtDate(r.retorno.data_calculada)}</span>}</span>
              <input type="date" value={r.retorno.data_calculada || ""} onChange={e => updateField("retorno.data_calculada", e.target.value)} style={{ ...inputSt, width: "auto", fontSize: 12, padding: "5px 10px" }} />
            </div>
          </ReviewCard>
        )}
        {r.orientacao_paciente?.texto && (
          <ReviewCard color={G.green} icon="💬" title="Orientação ao Paciente" delay={0.12}>
            <textarea value={r.orientacao_paciente.texto} onChange={e => updateField("orientacao_paciente.texto", e.target.value)} style={{ ...inputSt, height: 70, resize: "vertical", fontSize: 13 }} />
            <button onClick={() => navigator.clipboard?.writeText(r.orientacao_paciente.texto)} style={{ marginTop: 6, background: "none", border: `1px solid ${G.g200}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: G.g500, cursor: "pointer" }}>📋 Copiar</button>
          </ReviewCard>
        )}
        {r.novas_preferencias?.length > 0 && r.novas_preferencias.map((pref, i) => (
          <ReviewCard key={i} color={G.goldD} icon="💡" title="Nova Preferência Detectada" delay={0.18 + i * 0.06}>
            <div style={{ flex: 1, background: `${G.gold}08`, borderLeft: `3px solid ${G.gold}44`, borderRadius: 6, padding: "8px 12px", fontSize: 13, color: G.g700 }}>{pref.texto}</div>
          </ReviewCard>
        ))}
        <div style={{ position: "sticky", bottom: 0, background: G.white, borderTop: `1px solid ${G.g200}`, padding: "12px 0 4px", marginTop: 8 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...btnSec, flex: "0 0 auto" }} onClick={() => setStage("idle")}>← Regravar</button>
            <button style={{ ...btnPrim, flex: 1, opacity: saving ? 0.7 : 1 }} onClick={saveAll} disabled={saving}>{saving ? "Salvando..." : "✓ Salvar tudo na ficha"}</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ── COMPONENTES EYNG-MAX ──
function BTN({ label, icon, color, bg, onClick, small }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick && onClick(); }} style={{
      background: bg || color, color: bg ? color : "#fff",
      border: bg ? `1.5px solid ${color}33` : "none",
      borderRadius: small ? 10 : 12,
      padding: small ? "6px 12px" : "9px 16px",
      fontSize: small ? 11 : 12, fontWeight: 700,
      fontFamily: "'Nunito',sans-serif", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 5,
      whiteSpace: "nowrap",
      boxShadow: bg ? "none" : `0 4px 12px ${color}44`,
      transition: "all 0.18s",
    }}>
      <span style={{ fontSize: small ? 12 : 14 }}>{icon}</span> {label}
    </button>
  );
}

function Splash({ onDone }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setP(1), 200), setTimeout(() => setP(2), 700), setTimeout(() => setP(3), 1300), setTimeout(() => onDone(), 2400)];
    return () => t.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#c45f82 0%,#8b3458 50%,#f093fb 100%)", flexDirection: "column" }}>
      <style>{css}</style>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, animation: p >= 1 ? "pop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards, pulse2 2s ease-in-out 1s infinite" : "none", opacity: p >= 1 ? 1 : 0, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <span style={{ fontSize: 36, fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 600, color: "#8b3458" }}>E</span>
      </div>
      <div style={{ opacity: p >= 2 ? 1 : 0, transform: p >= 2 ? "translateY(0)" : "translateY(12px)", transition: "all 0.5s ease", textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", fontFamily: "'Nunito',sans-serif", letterSpacing: 1 }}>Eyng</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "'Nunito',sans-serif", fontWeight: 600, letterSpacing: 2 }}>Odontologia</div>
      </div>
      <div style={{ marginTop: 24, opacity: p >= 3 ? 1 : 0, transition: "opacity 0.4s ease 0.2s", background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "6px 20px" }}>
        <span style={{ color: "#fff", fontSize: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>Plataforma de Gestão Inteligente ✨</span>
      </div>
    </div>
  );
}

function PatientCard({ p, onClick, index, onContact, onReturn }) {
  const [hov, setHov] = useState(false);
  const sp = SP[p.specialty] || SP["Ortodontia"];
  const days = p.nextReturn ? getDays(p.nextReturn) : null;
  const isOverdue = p.returnStatus === "overdue";
  const isToday = p.returnStatus === "due_today";
  const stCfg = isOverdue
    ? { bg: "#FEF2F2", badge: "#EF4444", text: `Atrasado ${Math.abs(days)}d` }
    : isToday ? { bg: "#FFFBEB", badge: "#F59E0B", text: "Hoje!" }
    : { bg: "#F0FDF4", badge: "#10B981", text: days != null ? `Em ${days}d` : "—" };
  const initials = p.name.split(" ").slice(0, 2).map(w => w[0]).join("");

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: hov ? "0 16px 48px rgba(0,0,0,0.14)" : "0 4px 16px rgba(0,0,0,0.07)", transform: hov ? "translateY(-3px)" : "translateY(0)", transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)", cursor: "pointer", animation: `cardIn 0.4s ease ${index * 0.07}s both` }}>

      <div onClick={onClick} style={{ background: "linear-gradient(135deg,#c45f82,#8b3458)", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "2.5px solid rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "'Nunito',sans-serif" }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Nunito',sans-serif", lineHeight: 1.2 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: "'Nunito',sans-serif", marginTop: 2 }}>{sp.emoji} {p.specialty} · {p.professional}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 18px 0", background: stCfg.bg, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ background: stCfg.badge, color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: "'Nunito',sans-serif" }}>{stCfg.text}</span>
        {p.allergies.length > 0 && <span style={{ background: "#FEE2E2", color: "#DC2626", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: "'Nunito',sans-serif" }}>⚠ {p.allergies.join(", ")}</span>}
        {p.financialStatus === "Pendente" && <span style={{ background: "#FEF3C7", color: "#D97706", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: "'Nunito',sans-serif" }}>💰 R$ {p.balance.toLocaleString("pt-BR")}</span>}
      </div>

      {p.notes.find(n => n.type === "preference") && (
        <div style={{ padding: "8px 18px 0", background: stCfg.bg }}>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'Nunito',sans-serif", fontStyle: "italic", display: "flex", gap: 4, alignItems: "flex-start" }}>
            <span>💡</span><span>{p.notes.find(n => n.type === "preference").text}</span>
          </div>
        </div>
      )}

      <div style={{ padding: "12px 18px 14px", background: stCfg.bg, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <BTN small label="WhatsApp" icon="💬" color="#25D366" onClick={() => window.open(`https://wa.me/55${p.phone.replace(/\D/g, "")}?text=Olá ${p.name.split(" ")[0]}, tudo bem? Entramos em contato para agendar seu retorno na Eyng Odontologia 😊`)} />
        <BTN small label="Ligar" icon="📞" color="#0EA5E9" onClick={() => window.open(`tel:${p.phone.replace(/\D/g, "")}`)} />
        {onContact && <BTN small label="Contato" icon="📋" color="#c45f82" onClick={onContact} />}
        <span title="Em breve" style={{ opacity: 0.5, cursor: "not-allowed" }}><BTN small label="Agendar" icon="📅" color="#94a3b8" bg="#f1f5f9" onClick={() => {}} /></span>
        <BTN small label="Ver ficha →" icon="" color="#64748b" bg="#e2e8f0" onClick={onClick} />
      </div>
    </div>
  );
}

// ── PAINEL DE RETORNOS ──
function PainelRetornos({ patients, onSelect, onUpdate }) {
  const [modalContato, setModalContato] = useState(null);
  const [modalRetorno, setModalRetorno] = useState(null);

  const overdue = patients.filter(p => p.returnStatus === "overdue").sort((a, b) => getDays(a.nextReturn) - getDays(b.nextReturn));
  const todayPts = patients.filter(p => p.returnStatus === "due_today");
  const upcoming = patients.filter(p => p.returnStatus === "ok" && p.nextReturn && getDays(p.nextReturn) <= 30).sort((a, b) => getDays(a.nextReturn) - getDays(b.nextReturn));

  const Section = ({ title, accent, items, showActions }) => items.length > 0 && (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 4, height: 18, background: accent, borderRadius: 2 }} />
        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, color: "#1e293b" }}>{title}</h3>
        <span style={{ background: accent, color: "#fff", borderRadius: 10, padding: "1px 9px", fontSize: 11, fontWeight: 700 }}>{items.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((p, i) => (
          <PatientCard key={p.id} p={p} onClick={() => onSelect(p)} index={i}
            onContact={showActions ? () => setModalContato(p) : undefined}
            onReturn={showActions ? () => setModalRetorno(p) : undefined} />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {overdue.length === 0 && todayPts.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#64748b" }}>Nenhum retorno atrasado</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Todos os pacientes estão em dia.</div>
        </div>
      )}
      <Section title="Retornos atrasados" accent="#EF4444" items={overdue} showActions />
      <Section title="Retorno hoje" accent="#F59E0B" items={todayPts} showActions />
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 4, height: 18, background: "#10B981", borderRadius: 2 }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, color: "#1e293b" }}>Próximos 30 dias</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcoming.map((p, i) => <PatientCard key={p.id} p={p} onClick={() => onSelect(p)} index={i} />)}
          </div>
        </div>
      )}
      {modalContato && <ModalContato patient={modalContato} onSave={log => { onUpdate({ ...modalContato, contactLog: [log, ...modalContato.contactLog] }); setModalContato(null); }} onClose={() => setModalContato(null)} />}
      {modalRetorno && <ModalRetorno patient={modalRetorno} onSave={date => { const days = getDays(date); onUpdate({ ...modalRetorno, nextReturn: date, returnStatus: days < 0 ? "overdue" : days === 0 ? "due_today" : "ok" }); setModalRetorno(null); }} onClose={() => setModalRetorno(null)} />}
    </div>
  );
}

// ── LISTA DE PACIENTES ──
function ListaPacientes({ patients, onSelect }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const overdueCount = patients.filter(p => p.returnStatus === "overdue" || p.returnStatus === "due_today").length;
  const pendingCount = patients.filter(p => p.financialStatus === "Pendente").length;
  const filtered = patients.filter(p => {
    const s = search.toLowerCase();
    const m = p.name.toLowerCase().includes(s) || p.phone.includes(s) || p.specialty.toLowerCase().includes(s) || p.professional.toLowerCase().includes(s);
    if (filter === "overdue") return m && (p.returnStatus === "overdue" || p.returnStatus === "due_today");
    if (filter === "pending") return m && p.financialStatus === "Pendente";
    if (filter === "caroline") return m && p.professional === "Dra. Caroline";
    if (filter === "joao") return m && p.professional === "Dr. João Beno";
    return m;
  });
  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 16, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 14 }}>
        <span style={{ fontSize: 16, color: "#94a3b8" }}>🔍</span>
        <input type="text" placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", fontSize: 14, width: "100%", color: "#334155", fontFamily: "'Nunito',sans-serif" }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["all", `Todos (${patients.length})`, "#c45f82"], ["overdue", `⏰ Atrasados (${overdueCount})`, "#EF4444"], ["pending", `💰 Cobranças (${pendingCount})`, "#F59E0B"], ["caroline", "👩‍⚕️ Dra. Caroline", "#EC4899"], ["joao", "👨‍⚕️ Dr. João Beno", "#0EA5E9"]].map(([id, label, color]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ padding: "7px 16px", borderRadius: 20, border: filter === id ? "none" : "1.5px solid #e2e8f0", background: filter === id ? color : "#fff", color: filter === id ? "#fff" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif", boxShadow: filter === id ? `0 4px 14px ${color}44` : "none", transition: "all 0.2s" }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((p, i) => <PatientCard key={p.id} p={p} onClick={() => onSelect(p)} index={i} />)}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 15 }}>Nenhum paciente encontrado.</div>}
    </div>
  );
}

// ── DETALHE DO PACIENTE ──
function DetalhePaciente({ patient, onBack, onUpdate }) {
  const [p, setP] = useState(patient);
  const [tab, setTab] = useState("prontuario");
  const [modal, setModal] = useState(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const sp = SP[p.specialty] || SP["Ortodontia"];

  const save = u => { setP(u); onUpdate(u); };
  const rLabel = { confirmado: "Confirmou retorno", reagendou: "Reagendou", sem_resposta: "Sem resposta", nao_atendeu: "Não atendeu", recusou: "Recusou" };
  const rColor = { confirmado: G.green, reagendou: G.blue, sem_resposta: G.g500, nao_atendeu: G.orange, recusou: G.red };
  const initials = p.name.split(" ").slice(0, 2).map(w => w[0]).join("");

  return (
    <div style={{ animation: "slideUp 0.35s ease" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#8b3458", fontFamily: "'Nunito',sans-serif", marginBottom: 20, padding: 0 }}>← Voltar</button>

      {/* Header do paciente */}
      <div style={{ background: "linear-gradient(135deg,#c45f82,#8b3458)", borderRadius: 24, padding: "22px 22px 18px", marginBottom: 16, boxShadow: "0 12px 40px rgba(196,95,130,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 24, fontFamily: "'Nunito',sans-serif" }}>{initials}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'Playfair Display',serif", fontStyle: "italic" }}>{p.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "'Nunito',sans-serif", marginTop: 2 }}>{sp.emoji} {p.specialty} · {p.professional}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{p.phone} · Nasc: {p.birth}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {p.allergies.map((a, i) => (
                <span key={i} onClick={() => save({ ...p, allergies: p.allergies.filter(x => x !== a) })} title="Clique para remover"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: "'Nunito',sans-serif", cursor: "pointer" }}>
                  ⚠ {a} ×
                </span>
              ))}
              <button onClick={() => setModal("alergia")} style={{ background: "rgba(255,255,255,0.15)", border: "1px dashed rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 10, cursor: "pointer" }}>+ alergia</button>
            </div>
          </div>
          <div onClick={() => save({ ...p, financialStatus: p.financialStatus === "Em dia" ? "Pendente" : "Em dia" })}
            style={{ padding: "8px 14px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)", cursor: "pointer", textAlign: "center" }}>
            {p.financialStatus === "Pendente" ? (
              <><div style={{ color: "#FCD34D", fontSize: 10, fontWeight: 800 }}>PENDENTE</div><div style={{ color: "#fff", fontSize: 15, fontFamily: "'Cormorant Garamond',serif", fontWeight: 700 }}>R$ {p.balance.toLocaleString("pt-BR")}</div></>
            ) : (
              <div style={{ color: "#86efac", fontSize: 11, fontWeight: 700 }}>✓ EM DIA</div>
            )}
          </div>
        </div>

        {/* Botão Voz */}
        <button onClick={() => setVoiceOpen(true)} style={{ width: "100%", padding: "12px 20px", borderRadius: 14, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, color: "#fff" }}>🎙 Registrar por Voz</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>Fale o que foi feito — a IA preenche a ficha</div>
          </div>
        </button>
      </div>

      {/* Tabs — 7 Anões */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "nowrap", justifyContent: "space-between" }}>
        {[
          ["prontuario",  p1, "Prontuário",  "MESTRE"  ],
          ["historico",   p2, "Histórico",   "SONECA"  ],
          ["notas",       p3, "Notas",       "ATCHIM"  ],
          ["contatos",    p4, "Contatos",    "FELIZ"   ],
          ["odontograma", p5, "Odontograma", "DENGOSO" ],
          ["financeiro",  p6, "Financeiro",  "ZANGADO" ],
          ["arquivos",    p7, "Arquivos",    "TÍMIDO"  ],
        ].map(([id, img, label, dwarf]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: "1 1 0", minWidth: 100, padding: "12px 8px 10px",
            borderRadius: 18, border: "none", cursor: "pointer",
            background: tab === id ? "linear-gradient(135deg,#c45f82,#8b3458)" : "#fff",
            color: tab === id ? "#fff" : "#8b3458",
            fontFamily: "'Nunito',sans-serif",
            boxShadow: tab === id ? "0 6px 20px rgba(196,95,130,0.5)" : "0 1px 4px rgba(0,0,0,0.06)",
            transform: tab === id ? "translateY(-3px)" : "translateY(0)",
            transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}>
            <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 14, padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={img} alt={dwarf} style={{ width: 96, height: 96, objectFit: "contain", borderRadius: 10, filter: tab === id ? "brightness(1.05)" : "none", transition: "filter 0.2s" }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, lineHeight: 1.2 }}>{label}</span>
            <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: 0.8, opacity: tab === id ? 1 : 0.5 }}>{dwarf}</span>
          </button>
        ))}
      </div>

      {/* PRONTUÁRIO */}
      {tab === "prontuario" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, marginBottom: 8, letterSpacing: 1 }}>📋 PLANO DE TRATAMENTO</div>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.7 }}>{p.treatment || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Nenhum plano registrado.</span>}</div>
          </div>
          {p.procedures.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, marginBottom: 8, letterSpacing: 1 }}>📅 ÚLTIMO PROCEDIMENTO</div>
              <div style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>{fmtDate(p.procedures[0].date)}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{p.procedures[0].desc}</div>
            </div>
          )}
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, marginBottom: 10, letterSpacing: 1 }}>🗓 PRÓXIMO RETORNO</div>
            {p.nextReturn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>{fmtDate(p.nextReturn)}</span>
                <ReturnBadge status={p.returnStatus} nextReturn={p.nextReturn} />
                <button onClick={() => setModal("retorno")} style={{ ...btnSec, padding: "4px 10px", fontSize: 11 }}>Alterar</button>
              </div>
            ) : (
              <button onClick={() => setModal("retorno")} style={{ ...btnPrim, padding: "7px 14px", fontSize: 12 }}>Definir Retorno</button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setModal("contato")} style={{ ...btnPrim, flex: 1 }}>📞 Registrar Contato</button>
            <button onClick={() => setModal("procedimento")} style={{ ...btnSec, flex: 1 }}>+ Procedimento</button>
          </div>
        </div>
      )}

      {tab === "historico" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <button onClick={() => setModal("procedimento")} style={{ ...btnPrim, marginBottom: 14, padding: "8px 16px", fontSize: 12 }}>+ Registrar Procedimento</button>
          {p.procedures.length === 0 && <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 13 }}>Nenhum procedimento registrado.</div>}
          {p.procedures.map((proc, i) => (
            <div key={proc.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", gap: 14 }}>
              <div style={{ minWidth: 78, fontSize: 12, color: sp.from, fontWeight: 700, paddingTop: 2 }}>{fmtDate(proc.date)}</div>
              <div><div style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{proc.desc}</div><div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{proc.prof}</div></div>
            </div>
          ))}
        </div>
      )}

      {tab === "notas" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <button onClick={() => setModal("nota")} style={{ ...btnPrim, marginBottom: 14, padding: "8px 16px", fontSize: 12 }}>+ Nova Nota</button>
          {p.notes.length === 0 && <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 13 }}>Nenhuma nota registrada.</div>}
          {p.notes.map(n => {
            const isAlert = n.type === "alert";
            return (
              <div key={n.id} style={{ background: isAlert ? "#FFFBEB" : "#F0F9FF", border: `1.5px solid ${isAlert ? "#FCD34D" : "#BAE6FD"}`, borderRadius: 16, padding: "14px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: isAlert ? "#D97706" : "#0EA5E9", marginBottom: 6, letterSpacing: 0.5 }}>{isAlert ? "⚡ ALERTA" : "💡 PREFERÊNCIA"}</div>
                  <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{n.text}</div>
                </div>
                <button onClick={() => save({ ...p, notes: p.notes.filter(x => x.id !== n.id) })} style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "contatos" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <button onClick={() => setModal("contato")} style={{ ...btnPrim, marginBottom: 14, padding: "8px 16px", fontSize: 12 }}>📞 Registrar Contato</button>
          {p.contactLog.length === 0 && <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 13 }}>Nenhum registro de contato.</div>}
          {p.contactLog.map(log => (
            <div key={log.id} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: "12px 16px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", gap: 12 }}>
              <div style={{ fontSize: 11, color: sp.from, fontWeight: 700, minWidth: 80 }}>{fmtDate(log.date)}</div>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#334155" }}>{log.type === "whatsapp" ? "💬 WhatsApp" : "📞 Ligação"}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: rColor[log.result] || "#64748b" }}>· {rLabel[log.result] || log.result}</span>
                </div>
                {log.obs && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{log.obs}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "odontograma" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <Odontograma2D
            patientName={p.name}
            initialData={p.odontograma || {}}
            onSave={(data) => save({ ...p, odontograma: data })}
          />
        </div>
      )}

      {tab === "financeiro" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <FinanceiroModule patient={p} onSave={save} />
        </div>
      )}

      {tab === "arquivos" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <AbaArquivos patient={p} onSave={save} />
        </div>
      )}

      {modal === "nota" && <ModalNota onSave={n => { save({ ...p, notes: [...p.notes, n] }); setModal(null); }} onClose={() => setModal(null)} />}
      {modal === "procedimento" && <ModalProcedimento patient={p} onSave={pr => { save({ ...p, procedures: [pr, ...p.procedures], lastVisit: pr.date }); setModal(null); }} onClose={() => setModal(null)} />}
      {modal === "retorno" && <ModalRetorno patient={p} onSave={date => { const days = getDays(date); save({ ...p, nextReturn: date, returnStatus: days < 0 ? "overdue" : days === 0 ? "due_today" : "ok" }); setModal(null); }} onClose={() => setModal(null)} />}
      {modal === "contato" && <ModalContato patient={p} onSave={log => { save({ ...p, contactLog: [log, ...p.contactLog] }); setModal(null); }} onClose={() => setModal(null)} />}
      {modal === "alergia" && <ModalNota onSave={n => { save({ ...p, allergies: [...p.allergies, n.text] }); setModal(null); }} onClose={() => setModal(null)} />}

      {voiceOpen && (
        <Modal title="🎙 Registrar por Voz" onClose={() => setVoiceOpen(false)} width={500}>
          <VoiceModule patient={p} onSave={updated => { save(updated); setVoiceOpen(false); }} onClose={() => setVoiceOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

// ── ABA ARQUIVOS ──
const TIPOS_ARQUIVO = {
  foto:  { icon: "📸", label: "Foto clínica",    cor: "#ec4899" },
  exame: { icon: "📄", label: "Exame / Laudo",   cor: "#0ea5e9" },
  stl:   { icon: "🦷", label: "Arquivo 3D (STL)", cor: "#8b5cf6" },
  outro: { icon: "📎", label: "Outro",            cor: "#64748b" },
};

const BUCKET     = "arquivos-pacientes";
const EXTS_FOTO  = ["jpg","jpeg","png","webp","gif","heic","bmp","tiff"];
const EXTS_EXAME = ["pdf","doc","docx","xls","xlsx","dcm"];

function detectTipo(filename) {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  if (EXTS_FOTO.includes(ext))  return "foto";
  if (EXTS_EXAME.includes(ext)) return "exame";
  if (ext === "stl")            return "stl";
  return "outro";
}
function cleanName(filename) {
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}
function sanitizePath(s) {
  return String(s).replace(/[^a-zA-Z0-9._-]/g, "_");
}
function fmtSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function AbaArquivos({ patient, onSave }) {
  const [arquivos,   setArquivos]   = useState(patient.arquivos || []);
  const [fila,       setFila]       = useState([]);   // uploads em andamento
  const [dragging,   setDragging]   = useState(false);
  const [preview,    setPreview]    = useState(null);
  const [erroBucket, setErroBucket] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { setArquivos(patient.arquivos || []); }, [patient.id]);

  const handleFiles = async (files) => {
    const arr = Array.from(files);
    for (const file of arr) {
      const filaId = `${Date.now()}-${Math.random()}`;
      setFila(f => [...f, { id: filaId, nome: file.name }]);

      try {
        const path = `${sanitizePath(patient.id || patient.name)}/${Date.now()}_${sanitizePath(file.name)}`;
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: true });

        if (error) {
          if (error.message?.includes("Bucket not found") || error.message?.includes("bucket")) {
            setErroBucket(true);
          }
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

        const novo = {
          id: String(Date.now()),
          tipo: detectTipo(file.name),
          nome: cleanName(file.name),
          url: publicUrl,
          data: todayISO(),
          obs: "",
          storagePath: data.path,
          tamanho: file.size,
        };

        setArquivos(prev => {
          const updated = [novo, ...prev];
          onSave({ ...patient, arquivos: updated });
          return updated;
        });
      } finally {
        setFila(f => f.filter(x => x.id !== filaId));
      }
    }
  };

  const remover = async (a) => {
    if (a.storagePath) {
      await supabase.storage.from(BUCKET).remove([a.storagePath]);
    }
    const updated = arquivos.filter(x => x.id !== a.id);
    setArquivos(updated);
    onSave({ ...patient, arquivos: updated });
  };

  const onDragOver  = e => { e.preventDefault(); setDragging(true); };
  const onDragLeave = e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); };
  const onDrop      = e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };

  const porData = arquivos.reduce((acc, a) => {
    const d = a.data || "sem data";
    if (!acc[d]) acc[d] = [];
    acc[d].push(a);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, color:"#c45f82", fontWeight:800, letterSpacing:1 }}>😶 TÍMIDO · ARQUIVOS DO PACIENTE</div>
        <div style={{ fontSize:12, color:G.g500, marginTop:2 }}>
          {arquivos.length} arquivo{arquivos.length !== 1 ? "s" : ""}
          {fila.length > 0 && <span style={{ color:"#8b5cf6", marginLeft:6 }}>· {fila.length} enviando…</span>}
        </div>
      </div>

      {/* Aviso: bucket não encontrado */}
      {erroBucket && (
        <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
          <div style={{ fontWeight:800, color:"#dc2626", fontSize:12, marginBottom:4 }}>⚠️ Bucket de armazenamento não encontrado</div>
          <div style={{ fontSize:11, color:"#ef4444", lineHeight:1.6 }}>
            No painel do Supabase → <strong>Storage</strong>, crie um bucket chamado{" "}
            <code style={{ background:"#fee2e2", padding:"1px 6px", borderRadius:4, fontFamily:"monospace" }}>arquivos-pacientes</code>{" "}
            com acesso <strong>público</strong> e tente novamente.
          </div>
        </div>
      )}

      {/* ── Zona de drop ── */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2.5px dashed ${dragging ? "#764ba2" : "#d1c0e8"}`,
          borderRadius: 18,
          padding: "30px 20px",
          marginBottom: 20,
          background: dragging ? "#f3e8ff" : "#faf7ff",
          cursor: "pointer",
          transition: "all .2s",
          textAlign: "center",
          transform: dragging ? "scale(1.015)" : "scale(1)",
          boxShadow: dragging ? "0 6px 24px rgba(118,75,162,0.18)" : "none",
          userSelect: "none",
        }}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.stl,.dcm"
          style={{ display:"none" }}
          onChange={e => handleFiles(e.target.files)}
        />
        <div style={{ fontSize: dragging ? 46 : 38, marginBottom:8, transition:"font-size .2s", lineHeight:1 }}>
          {dragging ? "📂" : "📎"}
        </div>
        <div style={{ fontWeight:800, fontSize:14, color: dragging ? "#764ba2" : "#5b4b8a", marginBottom:4 }}>
          {dragging ? "Solte para enviar!" : "Arraste arquivos aqui"}
        </div>
        <div style={{ fontSize:11, color:"#b0a0cc" }}>
          ou clique para selecionar · Fotos, PDFs, STL, Raio-X…
        </div>
      </div>

      {/* ── Fila de upload ── */}
      {fila.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <style>{`@keyframes giro{to{transform:rotate(360deg)}}`}</style>
          {fila.map(f => (
            <div key={f.id} style={{
              display:"flex", alignItems:"center", gap:10,
              background:"#f5f3ff", border:"1px solid #e0d7f5",
              borderRadius:10, padding:"10px 14px", marginBottom:6,
            }}>
              <div style={{
                width:15, height:15, borderRadius:"50%", flexShrink:0,
                border:"2.5px solid #8b5cf6", borderTopColor:"transparent",
                animation:"giro .7s linear infinite",
              }}/>
              <span style={{ fontSize:12, color:"#5b4b8a", fontWeight:600, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {f.nome}
              </span>
              <span style={{ fontSize:10, color:"#a090c0", flexShrink:0 }}>Enviando…</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Arquivos agrupados por data ── */}
      {Object.entries(porData).sort(([a],[b]) => b.localeCompare(a)).map(([data, items]) => (
        <div key={data} style={{ marginBottom:22 }}>
          <div style={{ fontSize:11, fontWeight:800, color:G.g500, letterSpacing:0.8, marginBottom:10 }}>
            📅 {fmtDate(data)}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
            {items.map(a => {
              const t   = TIPOS_ARQUIVO[a.tipo] || TIPOS_ARQUIVO.outro;
              const isImg = a.tipo === "foto" || /\.(jpg|jpeg|png|webp|gif)/i.test(a.url || "");
              return (
                <div
                  key={a.id}
                  style={{ background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.07)", transition:"all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div
                    onClick={() => setPreview(a)}
                    style={{ width:"100%", height:110, background: isImg ? "#f1f5f9" : `${t.cor}15`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", cursor:"pointer" }}
                  >
                    {isImg
                      ? <img src={a.url} alt={a.nome} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display = "none"; }}/>
                      : <span style={{ fontSize:38 }}>{t.icon}</span>
                    }
                  </div>
                  <div style={{ padding:"8px 10px" }}>
                    <div style={{ fontSize:11, fontWeight:800, color:G.black, lineHeight:1.3, marginBottom:3 }}>{a.nome}</div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:9, fontWeight:700, color:t.cor, background:`${t.cor}15`, borderRadius:6, padding:"2px 6px" }}>
                        {t.icon} {t.label}
                      </span>
                      <button
                        onClick={() => remover(a)}
                        style={{ background:"none", border:"none", color:G.g300, cursor:"pointer", fontSize:17, lineHeight:1, padding:"0 2px" }}
                        title="Remover"
                      >×</button>
                    </div>
                    {a.obs     && <div style={{ fontSize:10, color:G.g500, marginTop:4, fontStyle:"italic" }}>{a.obs}</div>}
                    {a.tamanho && <div style={{ fontSize:9, color:G.g300, marginTop:2 }}>{fmtSize(a.tamanho)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {arquivos.length === 0 && fila.length === 0 && (
        <div style={{ textAlign:"center", padding:"32px 0", color:G.g500 }}>
          <div style={{ fontSize:42, marginBottom:8 }}>📂</div>
          <div style={{ fontSize:13, fontWeight:600 }}>Nenhum arquivo ainda</div>
          <div style={{ fontSize:11, color:G.g300, marginTop:4 }}>Arraste uma foto ou documento acima para começar</div>
        </div>
      )}

      {/* ── Modal preview ── */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth:820, width:"100%", background:"#fff", borderRadius:16, overflow:"hidden" }}>
            <div style={{ background:G.black, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ color:G.gold, fontWeight:700, fontSize:14 }}>{preview.nome}</span>
              <div style={{ display:"flex", gap:10 }}>
                <a href={preview.url} target="_blank" rel="noopener noreferrer" style={{ background:G.gold, color:G.black, padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none" }}>↗ Abrir original</a>
                <button onClick={() => setPreview(null)} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", borderRadius:8, padding:"5px 12px", cursor:"pointer", fontSize:14 }}>×</button>
              </div>
            </div>
            {(preview.tipo === "foto" || /\.(jpg|jpeg|png|webp|gif)/i.test(preview.url || ""))
              ? <img src={preview.url} alt={preview.nome} style={{ width:"100%", maxHeight:"72vh", objectFit:"contain", background:"#f1f5f9" }}/>
              : (
                <div style={{ padding:48, textAlign:"center" }}>
                  <div style={{ fontSize:64, marginBottom:14 }}>{TIPOS_ARQUIVO[preview.tipo]?.icon || "📎"}</div>
                  <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{preview.nome}</div>
                  {preview.tamanho && <div style={{ fontSize:12, color:G.g500, marginBottom:20 }}>{fmtSize(preview.tamanho)}</div>}
                  <a href={preview.url} target="_blank" rel="noopener noreferrer" style={{ background:"#764ba2", color:"#fff", padding:"11px 28px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>
                    Abrir arquivo ↗
                  </a>
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── AUTH ──
const isDev = window.location.hostname === "localhost";

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError("E-mail ou senha inválidos.");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#c45f82 0%,#8b3458 100%)" }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "pop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
            <span style={{ fontSize: 32, fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 600, color: "#8b3458" }}>E</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'Nunito',sans-serif", letterSpacing: 1 }}>Eyng</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "'Nunito',sans-serif", fontWeight: 600, letterSpacing: 3 }}>ODONTOLOGIA</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 24, padding: "32px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", marginBottom: 6, fontFamily: "'Nunito',sans-serif" }}>Bem-vinda 👋</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Faça login para acessar a plataforma</div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "13px 16px", color: "#1e293b", fontSize: 14, outline: "none", fontFamily: "'Nunito',sans-serif", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#c45f82"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "13px 16px", color: "#1e293b", fontSize: 14, outline: "none", fontFamily: "'Nunito',sans-serif", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#c45f82"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
            {error && <div style={{ color: "#EF4444", fontSize: 12, textAlign: "center", fontFamily: "'Nunito',sans-serif" }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#c45f82,#8b3458)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800, fontFamily: "'Nunito',sans-serif", letterSpacing: 1, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4, boxShadow: "0 8px 24px rgba(196,95,130,0.5)" }}>
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </button>
          </form>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "'Nunito',sans-serif", letterSpacing: 1 }}>PLATAFORMA DE GESTÃO INTELIGENTE</div>
      </div>
    </div>
  );
}

// ── APP PRINCIPAL ──
export default function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [splash, setSplash] = useState(true);
  const [view, setView] = useState("painel"); // "painel" | "pacientes" | "caixa"
  const [selected, setSelected] = useState(null);
  const [modalNovo, setModalNovo] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(!isDev);

  // Auth
  useEffect(() => {
    if (isDev) return;
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Carrega pacientes
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("patients").select("*");
      console.log("[Supabase] result:", { data, error });
      if (!error && data && data.length > 0) {
        setPatients(data.map(row => ({ ...row.data, supabaseId: row.id })));
      } else {
        setPatients(PATIENTS);
      }
      setLoading(false);
    };
    load();
  }, []);

  const updatePatient = async (u) => {
    setPatients(ps => ps.map(p => p.id === u.id ? u : p));
    if (selected?.id === u.id) setSelected(u);
    if (u.supabaseId) {
      const { supabaseId, ...data } = u;
      await supabase.from("patients").update({ data }).eq("id", supabaseId);
    }
  };

  const overdueCount = patients.filter(p => p.returnStatus === "overdue" || p.returnStatus === "due_today").length;
  const pendingCount = patients.filter(p => p.financialStatus === "Pendente").length;
  const mesAtual = new Date().toISOString().slice(0, 7);
  const totalRecebidoMes = patients.reduce((sum, p) => {
    const pags = p.financeiro?.pagamentos || [];
    return sum + pags.filter(x => x.data?.startsWith(mesAtual)).reduce((s, x) => s + (x.valor || 0), 0);
  }, 0);
  const totalInadimplente = patients.reduce((sum, p) => {
    const { saldo } = calcResumo(p.financeiro);
    return sum + (saldo > 0 ? saldo : 0);
  }, 0);

  if (authLoading) return <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#c45f82,#8b3458)" }} />;
  if (!isDev && !user) return <LoginScreen />;
  if (splash || loading) return <Splash onDone={() => setSplash(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#fdf4f6" }}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#c45f82 0%,#8b3458 100%)", padding: "18px 24px 22px", boxShadow: "0 4px 24px rgba(196,95,130,0.45)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              <span style={{ fontSize: 20, fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 600, color: "#8b3458" }}>E</span>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "'Nunito',sans-serif" }}>Eyng</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: 1, fontWeight: 700 }}>ODONTOLOGIA</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#fff", fontWeight: 700 }}>{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, " · ")}</div>
            {!isDev && <button onClick={() => supabase.auth.signOut()} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, padding: "4px 12px", color: "#fff", fontSize: 10, cursor: "pointer", fontWeight: 700, letterSpacing: 1 }}>SAIR</button>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
          {[
            { v: patients.length, l: "Pacientes", c: "#c45f82", val: null },
            { v: overdueCount, l: "Atrasados", c: "#EF4444", val: null },
            { v: pendingCount, l: "Inadimpl.", c: "#d97706", val: null },
            { v: null, l: "Recebido/mês", c: "#16a34a", val: `R$ ${totalRecebidoMes.toLocaleString("pt-BR",{minimumFractionDigits:0})}` },
            { v: null, l: "A receber", c: "#dc2626", val: `R$ ${totalInadimplente.toLocaleString("pt-BR",{minimumFractionDigits:0})}` },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "6px 8px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: s.val ? 13 : 20, fontWeight: 900, color: s.c, lineHeight: 1, fontFamily: "'Nunito',sans-serif" }}>{s.val ?? s.v}</div>
              <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.5, marginTop: 3 }}>{s.l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NAV */}
      {!selected && (
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "0 20px", display: "flex", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {[["painel", "🚨 Retornos"], ["agenda", "📅 Agenda"], ["pacientes", "👥 Pacientes"], ["caixa", "💸 Caixa do Dia"]].map(([id, label]) => (
            <button key={id} onClick={() => { setView(id); setSelected(null); }} style={{ background: "none", border: "none", borderBottom: view === id ? "2.5px solid #c45f82" : "2.5px solid transparent", padding: "13px 16px", cursor: "pointer", fontSize: 13, fontWeight: view === id ? 800 : 500, color: view === id ? "#c45f82" : "#64748b", marginBottom: -1, transition: "all .2s", fontFamily: "'Nunito',sans-serif" }}>
              {label}
              {id === "painel" && overdueCount > 0 && <span style={{ marginLeft: 6, background: "#EF4444", color: "#fff", borderRadius: 8, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>{overdueCount}</span>}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setModalNovo(true)} style={{ background: "linear-gradient(135deg,#c45f82,#8b3458)", color: "#fff", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif", margin: "6px 0" }}>+ Novo Paciente</button>
        </div>
      )}

      {/* CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
        {selected ? (
          <DetalhePaciente patient={selected} onBack={() => setSelected(null)} onUpdate={updatePatient} />
        ) : view === "painel" ? (
          <PainelRetornos patients={patients} onSelect={setSelected} onUpdate={updatePatient} />
        ) : view === "agenda" ? (
          <Agenda patients={patients} />
        ) : view === "caixa" ? (
          <CaixaDia patients={patients} onSavePatient={updatePatient} />
        ) : (
          <ListaPacientes patients={patients} onSelect={setSelected} />
        )}
      </div>

      <div style={{ textAlign: "center", padding: "20px 16px", borderTop: "1px solid #f1f5f9", marginTop: 20, fontSize: 11, color: "#cbd5e1", fontWeight: 700, letterSpacing: 1, fontFamily: "'Nunito',sans-serif" }}>
        EYNG ODONTOLOGIA · PLATAFORMA DE GESTÃO INTELIGENTE
      </div>

      {modalNovo && <ModalNovoPaciente onSave={async p => {
        const { data, error } = await supabase.from("patients").insert({ data: p }).select();
        if (!error && data?.[0]) {
          setPatients(ps => [...ps, { ...p, supabaseId: data[0].id }]);
        } else {
          setPatients(ps => [...ps, p]);
        }
        setModalNovo(false);
      }} onClose={() => setModalNovo(false)} />}
    </div>
  );
}
