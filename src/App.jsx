import { useState, useEffect } from "react";

const G = {
  gold: "#c9a84c", goldL: "#e8d5a0", goldD: "#a07d2e",
  black: "#1a1a1a", white: "#fafaf8",
  g100: "#f5f4f0", g200: "#e8e6e0", g300: "#d4d1c8",
  g500: "#8a8577", g700: "#4a473f", surface: "#ffffff",
  red: "#c0392b", green: "#27ae60", blue: "#2c6fbb", orange: "#d4850a",
};

const TODAY = new Date("2026-04-10");
let _id = 200;
const uid = () => String(++_id);

const PATIENTS = [
  {
    id: 1, name: "Maria Eduarda Conti", phone: "(49) 99812-3456", birth: "15/03/1985", cpf: "***.***.***-12",
    lastVisit: "2025-11-20", nextReturn: "2026-02-20", returnStatus: "overdue",
    professional: "Dra. Caroline", specialty: "Ortodontia", allergies: ["Dipirona", "Látex"],
    notes: [
      { id: "n1", type: "preference", text: "Não pode segundas e quartas à tarde — busca filhos na escola às 16h" },
      { id: "n2", type: "preference", text: "Prefere ser chamada por WhatsApp, não por ligação" },
    ],
    procedures: [
      { id: "p1", date: "2025-11-20", desc: "Manutenção do aparelho ortodôntico — troca de elásticos", prof: "Dra. Caroline" },
      { id: "p2", date: "2025-09-15", desc: "Ajuste de braquete descolado — dente 23", prof: "Dra. Caroline" },
      { id: "p3", date: "2025-06-10", desc: "Instalação de aparelho ortodôntico fixo — arco superior", prof: "Dra. Caroline" },
    ],
    treatment: "Ortodontia corretiva — Classe II divisão 1. Previsão: 24 meses. Mês 5 de 24.",
    financialStatus: "Em dia", balance: 0, contactLog: [],
  },
  {
    id: 2, name: "João Pedro Almeida", phone: "(49) 99945-6789", birth: "22/07/1972", cpf: "***.***.***-34",
    lastVisit: "2025-08-10", nextReturn: "2025-11-10", returnStatus: "overdue",
    professional: "Dr. João Beno", specialty: "Implantodontia", allergies: [],
    notes: [
      { id: "n3", type: "preference", text: "Só pode sextas-feiras — trabalha em Pinhalzinho durante a semana" },
      { id: "n4", type: "alert", text: "Paciente ansioso — prefere explicação detalhada antes de qualquer procedimento" },
      { id: "n5", type: "preference", text: "Diabético tipo 2 — verificar glicemia antes de procedimentos cirúrgicos" },
    ],
    procedures: [
      { id: "p4", date: "2025-08-10", desc: "Reabertura para instalação do cicatrizador — implante região 36", prof: "Dr. João Beno" },
      { id: "p5", date: "2025-05-15", desc: "Instalação de implante — região 36 (Cone Morse 4.0x10mm)", prof: "Dr. João Beno" },
      { id: "p6", date: "2025-04-20", desc: "Enxerto ósseo autógeno — região 36", prof: "Dr. João Beno" },
    ],
    treatment: "Implante unitário região 36 — osseointegração concluída, aguardando prótese.",
    financialStatus: "Pendente", balance: 1200,
    contactLog: [{ id: "c1", date: "2026-01-15", type: "whatsapp", result: "sem_resposta", obs: "Mensagem enviada às 10h, sem retorno" }],
  },
  {
    id: 3, name: "Ana Clara Fontana", phone: "(49) 98834-2211", birth: "05/11/1998", cpf: "***.***.***-56",
    lastVisit: "2026-03-28", nextReturn: "2026-09-28", returnStatus: "ok",
    professional: "Dra. Caroline", specialty: "Estética", allergies: ["Penicilina"],
    notes: [
      { id: "n6", type: "preference", text: "Prefere horários no início da manhã — trabalha em home office" },
      { id: "n7", type: "alert", text: "Bruxismo severo — usa placa noturna. Verificar ajuste a cada retorno" },
    ],
    procedures: [
      { id: "p7", date: "2026-03-28", desc: "Clareamento dental a laser — sessão 3 de 3", prof: "Dra. Caroline" },
      { id: "p8", date: "2026-03-14", desc: "Clareamento dental a laser — sessão 2 de 3", prof: "Dra. Caroline" },
      { id: "p9", date: "2026-02-28", desc: "Clareamento a laser — sessão 1 de 3. Moldagem para placa de bruxismo", prof: "Dra. Caroline" },
    ],
    treatment: "Clareamento concluído. Acompanhamento de bruxismo com placa oclusal — ajustes semestrais.",
    financialStatus: "Em dia", balance: 0, contactLog: [],
  },
  {
    id: 4, name: "Carlos Roberto Zanella", phone: "(49) 99901-7788", birth: "30/01/1960", cpf: "***.***.***-78",
    lastVisit: "2025-10-05", nextReturn: "2026-01-05", returnStatus: "overdue",
    professional: "Dr. João Beno", specialty: "Prótese", allergies: ["Ibuprofeno"],
    notes: [
      { id: "n8", type: "alert", text: "Hipertenso — Losartana 50mg. Verificar PA antes de qualquer procedimento" },
      { id: "n9", type: "preference", text: "Não atende telefone — contato APENAS por WhatsApp da esposa: (49) 99901-8899" },
      { id: "n10", type: "preference", text: "Prefere terças e quintas pela manhã" },
    ],
    procedures: [
      { id: "p10", date: "2025-10-05", desc: "Prova da infraestrutura metálica — PPR superior", prof: "Dr. João Beno" },
      { id: "p11", date: "2025-09-20", desc: "Moldagem funcional — PPR superior", prof: "Dr. João Beno" },
      { id: "p12", date: "2025-09-01", desc: "Exodontia do dente 15 + moldagem inicial PPR", prof: "Dr. João Beno" },
    ],
    treatment: "Prótese parcial removível superior — em andamento. Paciente não retornou para prova final.",
    financialStatus: "Pendente", balance: 800,
    contactLog: [
      { id: "c2", date: "2026-01-10", type: "ligacao", result: "nao_atendeu", obs: "Ligação sem resposta" },
      { id: "c3", date: "2026-01-12", type: "whatsapp", result: "sem_resposta", obs: "WhatsApp para esposa, sem retorno" },
    ],
  },
  {
    id: 5, name: "Letícia Bortolini", phone: "(49) 98876-5544", birth: "12/09/2012", cpf: "***.***.***-90",
    lastVisit: "2026-04-02", nextReturn: "2026-07-02", returnStatus: "ok",
    professional: "Dra. Caroline", specialty: "Ortodontia", allergies: [],
    notes: [
      { id: "n11", type: "preference", text: "Menor — responsável: Fernanda Bortolini (mãe), tel: (49) 98876-5500" },
      { id: "n12", type: "preference", text: "Consultas apenas depois das 14h — horário escolar pela manhã" },
      { id: "n13", type: "alert", text: "Paciente colaborativa, mas mãe ansiosa — explicar evolução com calma" },
    ],
    procedures: [
      { id: "p13", date: "2026-04-02", desc: "Manutenção do aparelho — ativação do arco inferior", prof: "Dra. Caroline" },
      { id: "p14", date: "2026-01-15", desc: "Instalação de aparelho fixo — arco inferior", prof: "Dra. Caroline" },
      { id: "p15", date: "2025-12-10", desc: "Instalação de aparelho fixo — arco superior", prof: "Dra. Caroline" },
    ],
    treatment: "Ortodontia interceptiva — Classe III funcional. Previsão: 18 meses. Mês 5 de 18.",
    financialStatus: "Em dia", balance: 0, contactLog: [],
  },
  {
    id: 6, name: "Ricardo Henrique Moraes", phone: "(49) 99923-1122", birth: "08/04/1988", cpf: "***.***.***-45",
    lastVisit: "2026-01-10", nextReturn: "2026-04-10", returnStatus: "due_today",
    professional: "Dr. João Beno", specialty: "Cirurgia", allergies: ["AAS"],
    notes: [
      { id: "n14", type: "preference", text: "Trabalha à noite (segurança) — só pode consultas entre 8h e 11h" },
      { id: "n15", type: "alert", text: "Tabagista — orientado sobre impacto na cicatrização. Fumou até véspera da última cirurgia" },
    ],
    procedures: [
      { id: "p16", date: "2026-01-10", desc: "Remoção de sutura — exodontia dos sisos 38 e 48", prof: "Dr. João Beno" },
      { id: "p17", date: "2025-12-20", desc: "Exodontia de terceiros molares inferiores — 38 e 48 (inclusos)", prof: "Dr. João Beno" },
      { id: "p18", date: "2025-12-01", desc: "Avaliação + tomografia para exodontia de sisos", prof: "Dr. João Beno" },
    ],
    treatment: "Pós-operatório de exodontia de sisos inferiores. Retorno para avaliação final da cicatrização.",
    financialStatus: "Em dia", balance: 0, contactLog: [],
  },
];

const getDays = (s) => Math.ceil((new Date(s) - TODAY) / 86400000);
const fmtDate = (s) => { if (!s) return "—"; const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };
const todayISO = () => "2026-04-10";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f5f4f0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #d4d1c8; border-radius: 4px; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .patient-row:hover { border-color: ${G.gold} !important; transform: translateX(4px); }
  .action-btn:hover { opacity: 0.85; }
  .tab-btn:hover { color: ${G.goldD} !important; }
`;

// ── SHARED STYLES ──
const inputSt = { width: "100%", padding: "9px 12px", border: `1px solid ${G.g200}`, borderRadius: 8, fontSize: 13, color: G.black, background: G.white, outline: "none", fontFamily: "'Inter',sans-serif" };
const btnPrim = { background: G.black, color: G.gold, border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: 0.3 };
const btnSec = { background: "none", color: G.g500, border: `1px solid ${G.g200}`, borderRadius: 8, padding: "9px 18px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif" };

// ── COMPONENTS ──
function ReturnBadge({ status, nextReturn }) {
  if (!nextReturn) return null;
  const days = getDays(nextReturn);
  if (status === "overdue") return <span style={{ background: G.red, color: "#fff", padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>ATRASADO {Math.abs(days)}d</span>;
  if (status === "due_today") return <span style={{ background: G.orange, color: "#fff", padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>HOJE</span>;
  return <span style={{ background: G.green, color: "#fff", padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>em {days}d</span>;
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

// ── MODALS ──
function ModalNovoPaciente({ onSave, onClose }) {
  const [f, setF] = useState({ name: "", phone: "", birth: "", cpf: "", professional: "Dra. Caroline", specialty: "Ortodontia", treatment: "", financialStatus: "Em dia", balance: 0 });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Novo Paciente" onClose={onClose} width={520}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
        <Field label="Nome completo"><div style={{ gridColumn: "1/-1" }}><input style={inputSt} value={f.name} onChange={set("name")} placeholder="Nome completo" /></div></Field>
      </div>
      <Field label="Nome completo"><input style={inputSt} value={f.name} onChange={set("name")} placeholder="Nome completo" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
        <Field label="Telefone"><input style={inputSt} value={f.phone} onChange={set("phone")} placeholder="(49) 9xxxx-xxxx" /></Field>
        <Field label="Data de nascimento"><input style={inputSt} value={f.birth} onChange={set("birth")} placeholder="DD/MM/AAAA" /></Field>
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
        <textarea style={{ ...inputSt, height: 70, resize: "vertical" }} value={f.treatment} onChange={set("treatment")} placeholder="Descreva o tratamento..." />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button style={btnSec} onClick={onClose}>Cancelar</button>
        <button style={btnPrim} onClick={() => { if (!f.name.trim() || !f.phone.trim()) return; onSave({ ...f, id: Date.now(), lastVisit: "", nextReturn: "", returnStatus: "ok", allergies: [], notes: [], procedures: [], contactLog: [], balance: 0 }); }}>Salvar Paciente</button>
      </div>
    </Modal>
  );
}

function ModalNota({ onSave, onClose }) {
  const [type, setType] = useState("preference");
  const [text, setText] = useState("");
  return (
    <Modal title="Nova Nota Inteligente" onClose={onClose} width={440}>
      <Field label="Tipo">
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          {[["preference", "📋 Preferência"], ["alert", "⚡ Alerta Clínico"]].map(([v, l]) => (
            <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: 9, borderRadius: 8, border: `1.5px solid ${type === v ? (v === "alert" ? G.orange : G.blue) : G.g200}`, background: type === v ? (v === "alert" ? "#fef9e7" : "#f0f7ff") : G.white, color: type === v ? (v === "alert" ? G.orange : G.blue) : G.g500, fontSize: 12, fontWeight: type === v ? 600 : 400, cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Texto">
        <textarea style={{ ...inputSt, height: 90, resize: "vertical" }} value={text} onChange={e => setText(e.target.value)} placeholder={type === "preference" ? "Ex: Só pode sextas. Contato por WhatsApp da esposa..." : "Ex: Hipertenso — verificar PA antes de procedimentos"} />
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
      <Field label="Data do próximo retorno">
        <input type="date" style={inputSt} value={date} onChange={e => setDate(e.target.value)} />
      </Field>
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

// ── PAINEL DE RETORNOS ──
function PainelRetornos({ patients, onSelect, onUpdate }) {
  const [modalContato, setModalContato] = useState(null);
  const [modalRetorno, setModalRetorno] = useState(null);

  const overdue = patients.filter(p => p.returnStatus === "overdue").sort((a, b) => getDays(a.nextReturn) - getDays(b.nextReturn));
  const todayPts = patients.filter(p => p.returnStatus === "due_today");
  const upcoming = patients.filter(p => p.returnStatus === "ok" && p.nextReturn && getDays(p.nextReturn) <= 30).sort((a, b) => getDays(a.nextReturn) - getDays(b.nextReturn));

  const rLabel = { confirmado: "Confirmou retorno", reagendou: "Reagendou", sem_resposta: "Sem resposta", nao_atendeu: "Não atendeu", recusou: "Recusou" };
  const rColor = { confirmado: G.green, reagendou: G.blue, sem_resposta: G.g500, nao_atendeu: G.orange, recusou: G.red };

  const Card = ({ p, accent }) => {
    const prefs = p.notes.filter(n => n.type === "preference");
    const alerts = p.notes.filter(n => n.type === "alert");
    const last = p.contactLog[0];
    return (
      <div style={{ background: G.surface, borderRadius: 12, border: `1px solid ${G.g200}`, borderLeft: `4px solid ${accent}`, marginBottom: 10, overflow: "hidden", animation: "fadeInUp .3s ease" }}>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <div>
              <button onClick={() => onSelect(p)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 600, color: G.black, padding: 0, textDecoration: "underline", textDecorationColor: `${G.gold}55` }}>
                {p.name}
              </button>
              <div style={{ fontSize: 11, color: G.g500, marginTop: 2 }}>{p.specialty} · {p.professional}</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <ReturnBadge status={p.returnStatus} nextReturn={p.nextReturn} />
              {p.allergies.length > 0 && <span style={{ fontSize: 10, color: G.red, fontWeight: 700 }}>⚠ ALERGIA</span>}
            </div>
          </div>

          {p.financialStatus === "Pendente" && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, background: `${G.orange}12`, border: `1px solid ${G.orange}30`, borderRadius: 6, padding: "3px 10px", fontSize: 11, color: G.orange, fontWeight: 600 }}>
              💰 Pendência: R$ {p.balance.toLocaleString("pt-BR")}
            </div>
          )}

          {prefs.length > 0 && (
            <div style={{ marginTop: 10, background: `${G.gold}08`, border: `1px solid ${G.gold}22`, borderRadius: 8, padding: "9px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: G.goldD, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>💡 Antes de ligar</div>
              {prefs.map(n => <div key={n.id} style={{ fontSize: 12, color: G.g700, lineHeight: 1.5, paddingLeft: 8, borderLeft: `2px solid ${G.gold}44`, marginTop: 4 }}>{n.text}</div>)}
            </div>
          )}
          {alerts.length > 0 && (
            <div style={{ marginTop: 8, background: "#fef9e7", border: "1px solid rgba(212,133,10,.2)", borderRadius: 8, padding: "8px 12px" }}>
              {alerts.map(n => <div key={n.id} style={{ fontSize: 12, color: G.g700, lineHeight: 1.5, paddingLeft: 8, borderLeft: `2px solid ${G.orange}88`, marginTop: 4 }}><span style={{ fontSize: 10, fontWeight: 700, color: G.orange, marginRight: 4 }}>⚡ ALERTA</span>{n.text}</div>)}
            </div>
          )}

          {last && (
            <div style={{ marginTop: 8, fontSize: 11, color: G.g500 }}>
              Último contato: {fmtDate(last.date)} · <span style={{ color: rColor[last.result] || G.g500, fontWeight: 600 }}>{rLabel[last.result]}</span>{last.obs ? ` · ${last.obs}` : ""}
            </div>
          )}
        </div>
        <div style={{ borderTop: `1px solid ${G.g100}`, padding: "9px 14px", background: G.g100, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="action-btn" onClick={() => setModalContato(p)} style={{ ...btnPrim, padding: "6px 14px", fontSize: 11 }}>📞 Registrar Contato</button>
          <button className="action-btn" onClick={() => setModalRetorno(p)} style={{ ...btnSec, padding: "6px 12px", fontSize: 11 }}>🗓 Definir Retorno</button>
          <button className="action-btn" onClick={() => onSelect(p)} style={{ ...btnSec, padding: "6px 12px", fontSize: 11 }}>Ver Ficha →</button>
        </div>
      </div>
    );
  };

  const Section = ({ title, count, accent, items }) => items.length > 0 && (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 4, height: 18, background: accent, borderRadius: 2 }} />
        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 600, color: G.black }}>{title}</h3>
        <span style={{ background: accent, color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{count}</span>
      </div>
      {items.map(p => <Card key={p.id} p={p} accent={accent} />)}
    </div>
  );

  return (
    <div>
      {overdue.length === 0 && todayPts.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: G.g700 }}>Nenhum retorno atrasado</div>
          <div style={{ fontSize: 13, color: G.g500, marginTop: 4 }}>Todos os pacientes estão em dia.</div>
        </div>
      )}
      <Section title="Retornos atrasados" count={overdue.length} accent={G.red} items={overdue} />
      <Section title="Retorno hoje" count={todayPts.length} accent={G.orange} items={todayPts} />
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 4, height: 18, background: G.green, borderRadius: 2 }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 600, color: G.black }}>Próximos 30 dias</h3>
          </div>
          {upcoming.map(p => (
            <div key={p.id} onClick={() => onSelect(p)} style={{ background: G.surface, borderRadius: 10, border: `1px solid ${G.g200}`, borderLeft: `4px solid ${G.green}`, padding: "12px 16px", marginBottom: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .15s" }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 600, color: G.black }}>{p.name}</div>
                <div style={{ fontSize: 11, color: G.g500, marginTop: 1 }}>{p.specialty} · {p.professional}</div>
              </div>
              <ReturnBadge status={p.returnStatus} nextReturn={p.nextReturn} />
            </div>
          ))}
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
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input type="text" placeholder="Buscar por nome, telefone, especialidade..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputSt, paddingLeft: 36, fontSize: 13 }} onFocus={e => e.target.style.borderColor = G.gold} onBlur={e => e.target.style.borderColor = G.g200} />
        <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
      </div>
      <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
        {[["all", `Todos (${patients.length})`], ["overdue", `⚠ Atrasados (${overdueCount})`], ["pending", `💰 Pendências (${pendingCount})`], ["caroline", "Dra. Caroline"], ["joao", "Dr. João Beno"]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ padding: "5px 12px", borderRadius: 14, border: `1px solid ${filter === id ? G.gold : G.g200}`, background: filter === id ? `${G.gold}18` : G.surface, color: filter === id ? G.goldD : G.g500, fontSize: 11, fontWeight: filter === id ? 700 : 400, cursor: "pointer", transition: "all .15s" }}>{label}</button>
        ))}
      </div>
      {filtered.map((p, i) => {
        const ac = p.returnStatus === "overdue" ? G.red : p.returnStatus === "due_today" ? G.orange : G.green;
        return (
          <div key={p.id} className="patient-row" onClick={() => onSelect(p)} style={{ background: G.surface, border: `1px solid ${G.g200}`, borderLeft: `4px solid ${ac}`, borderRadius: 10, padding: "13px 16px", cursor: "pointer", marginBottom: 8, transition: "all .15s", animation: `fadeInUp .3s ease ${i * 0.04}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 600, color: G.black }}>{p.name}</div>
                <div style={{ fontSize: 11, color: G.g500, marginTop: 2 }}>{p.specialty} · {p.professional} · Último: {fmtDate(p.lastVisit)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <ReturnBadge status={p.returnStatus} nextReturn={p.nextReturn || "2099-01-01"} />
                {p.allergies.length > 0 && <span style={{ fontSize: 10, color: G.red, fontWeight: 700 }}>⚠ ALERGIAS</span>}
                {p.financialStatus === "Pendente" && <span style={{ fontSize: 10, color: G.orange, fontWeight: 700 }}>💰 PENDENTE</span>}
              </div>
            </div>
            {p.notes.find(n => n.type === "preference") && p.returnStatus !== "ok" && (
              <div style={{ marginTop: 8, padding: "5px 10px", background: `${G.gold}08`, borderRadius: 6, fontSize: 11, color: G.g700, borderLeft: `2px solid ${G.gold}44` }}>
                💡 {p.notes.find(n => n.type === "preference").text}
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: G.g500, fontSize: 13 }}>Nenhum paciente encontrado.</div>}
    </div>
  );
}

// ── DETALHE DO PACIENTE ──
function DetalhePaciente({ patient, onBack, onUpdate }) {
  const [p, setP] = useState(patient);
  const [tab, setTab] = useState("prontuario");
  const [modal, setModal] = useState(null);

  const save = u => { setP(u); onUpdate(u); };

  return (
    <div style={{ animation: "fadeIn .25s ease" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: G.goldD, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0, fontFamily: "'Cormorant Garamond',serif", letterSpacing: 0.3 }}>← Voltar</button>

      {/* Header */}
      <div style={{ background: G.black, borderRadius: 12, padding: "20px 22px", marginBottom: 18, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: "100%", background: `linear-gradient(135deg,transparent 30%,${G.gold}10)` }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: G.white, margin: 0 }}>{p.name}</h2>
              <div style={{ color: G.g300, fontSize: 12, marginTop: 3 }}>{p.phone} · Nasc: {p.birth}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ background: `${G.gold}22`, color: G.goldL, padding: "2px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${G.gold}44` }}>{p.specialty}</span>
                <span style={{ color: G.g300, fontSize: 12 }}>{p.professional}</span>
                {p.nextReturn && <ReturnBadge status={p.returnStatus} nextReturn={p.nextReturn} />}
              </div>
            </div>
            <div style={{ padding: "7px 13px", borderRadius: 8, border: `1px solid ${p.financialStatus === "Pendente" ? G.orange : G.green}44`, background: `${p.financialStatus === "Pendente" ? G.orange : G.green}15`, cursor: "pointer" }} onClick={() => save({ ...p, financialStatus: p.financialStatus === "Em dia" ? "Pendente" : "Em dia" })}>
              {p.financialStatus === "Pendente" ? <><div style={{ color: G.orange, fontSize: 10, fontWeight: 700 }}>PENDENTE</div><div style={{ color: G.white, fontSize: 15, fontFamily: "'Cormorant Garamond',serif", fontWeight: 700 }}>R$ {p.balance.toLocaleString("pt-BR")}</div></> : <div style={{ color: G.green, fontSize: 11, fontWeight: 700 }}>✓ EM DIA</div>}
            </div>
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {p.allergies.map((a, i) => (
              <span key={i} onClick={() => save({ ...p, allergies: p.allergies.filter(x => x !== a) })} title="Clique para remover" style={{ background: `${G.red}22`, color: "#ff8a80", padding: "2px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${G.red}44`, cursor: "pointer" }}>⚠ {a} ×</span>
            ))}
            <button onClick={() => setModal("alergia")} style={{ background: "none", border: `1px dashed ${G.red}55`, color: "#ff8a80", borderRadius: 8, padding: "2px 10px", fontSize: 11, cursor: "pointer" }}>+ alergia</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `2px solid ${G.g200}`, marginBottom: 18, overflowX: "auto" }}>
        {[["prontuario", "Prontuário"], ["historico", `Histórico (${p.procedures.length})`], ["notas", `Notas (${p.notes.length})`], ["contatos", `Contatos (${p.contactLog.length})`]].map(([id, label]) => (
          <button key={id} className="tab-btn" onClick={() => setTab(id)} style={{ background: "none", border: "none", borderBottom: tab === id ? `2px solid ${G.gold}` : "2px solid transparent", padding: "9px 15px", cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 700 : 400, color: tab === id ? G.goldD : G.g500, marginBottom: -2, fontFamily: "'Cormorant Garamond',serif", whiteSpace: "nowrap", transition: "all .2s" }}>{label}</button>
        ))}
      </div>

      {/* PRONTUÁRIO */}
      {tab === "prontuario" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: G.surface, border: `1px solid ${G.g200}`, borderRadius: 10, padding: 18 }}>
            <h4 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 600, color: G.black, marginBottom: 8 }}>Plano de Tratamento</h4>
            <p style={{ margin: 0, color: G.g700, fontSize: 13, lineHeight: 1.6 }}>{p.treatment || <span style={{ color: G.g500, fontStyle: "italic" }}>Nenhum plano registrado.</span>}</p>
          </div>
          {p.procedures.length > 0 && (
            <div style={{ background: G.surface, border: `1px solid ${G.g200}`, borderRadius: 10, padding: 18 }}>
              <h4 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 600, color: G.black, marginBottom: 8 }}>Último Procedimento</h4>
              <p style={{ margin: 0, color: G.g700, fontSize: 13 }}><span style={{ color: G.goldD, fontWeight: 600 }}>{fmtDate(p.procedures[0].date)}</span> — {p.procedures[0].desc}</p>
            </div>
          )}
          <div style={{ background: G.surface, border: `1px solid ${G.g200}`, borderRadius: 10, padding: 18 }}>
            <h4 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 600, color: G.black, marginBottom: 10 }}>Próximo Retorno</h4>
            {p.nextReturn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: G.g700 }}>{fmtDate(p.nextReturn)}</span>
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

      {/* HISTÓRICO */}
      {tab === "historico" && (
        <div>
          <button onClick={() => setModal("procedimento")} style={{ ...btnPrim, marginBottom: 14, padding: "8px 16px", fontSize: 12 }}>+ Registrar Procedimento</button>
          {p.procedures.length === 0 && <div style={{ textAlign: "center", padding: 30, color: G.g500, fontSize: 13 }}>Nenhum procedimento registrado.</div>}
          {p.procedures.map((proc, i) => (
            <div key={proc.id} style={{ padding: "12px 0", borderBottom: i < p.procedures.length - 1 ? `1px solid ${G.g200}` : "none", display: "flex", gap: 14 }}>
              <div style={{ minWidth: 78, fontSize: 12, color: G.goldD, fontWeight: 600, paddingTop: 2 }}>{fmtDate(proc.date)}</div>
              <div><div style={{ fontSize: 13, color: G.g700, lineHeight: 1.5 }}>{proc.desc}</div><div style={{ fontSize: 11, color: G.g500, marginTop: 2 }}>{proc.prof}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* NOTAS */}
      {tab === "notas" && (
        <div>
          <div style={{ background: `linear-gradient(135deg,${G.black},#2a2a28)`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: G.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>✨ Por que isso existe</div>
            <p style={{ margin: 0, color: G.g300, fontSize: 12, lineHeight: 1.6 }}>Informações que <strong style={{ color: G.white }}>evitam conflitos</strong> e mostram ao paciente que a clínica <strong style={{ color: G.white }}>se lembra dele</strong> — mesmo quando a secretária troca.</p>
          </div>
          <button onClick={() => setModal("nota")} style={{ ...btnPrim, marginBottom: 14, padding: "8px 16px", fontSize: 12 }}>+ Nova Nota</button>
          {p.notes.length === 0 && <div style={{ textAlign: "center", padding: 30, color: G.g500, fontSize: 13 }}>Nenhuma nota registrada.</div>}
          {p.notes.map(n => {
            const isAlert = n.type === "alert";
            return (
              <div key={n.id} style={{ background: isAlert ? "#fef9e7" : "#f0f7ff", border: `1px solid ${isAlert ? G.orange : G.blue}33`, borderLeft: `3px solid ${isAlert ? G.orange : G.blue}`, borderRadius: 6, padding: "9px 12px", marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div><span style={{ fontSize: 10, fontWeight: 700, color: isAlert ? G.orange : G.blue, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 6 }}>{isAlert ? "⚡ Alerta" : "📋 Preferência"}</span><span style={{ fontSize: 13, color: G.g700, lineHeight: 1.5 }}>{n.text}</span></div>
                <button onClick={() => save({ ...p, notes: p.notes.filter(x => x.id !== n.id) })} style={{ background: "none", border: "none", color: G.g300, cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* CONTATOS */}
      {tab === "contatos" && (
        <div>
          <button onClick={() => setModal("contato")} style={{ ...btnPrim, marginBottom: 14, padding: "8px 16px", fontSize: 12 }}>📞 Registrar Contato</button>
          {p.contactLog.length === 0 && <div style={{ textAlign: "center", padding: 30, color: G.g500, fontSize: 13 }}>Nenhum registro de contato.</div>}
          {p.contactLog.map(log => {
            const rColor = { confirmado: G.green, reagendou: G.blue, sem_resposta: G.g500, nao_atendeu: G.orange, recusou: G.red };
            const rLabel = { confirmado: "Confirmou retorno", reagendou: "Reagendou", sem_resposta: "Sem resposta", nao_atendeu: "Não atendeu", recusou: "Recusou" };
            return (
              <div key={log.id} style={{ background: G.surface, border: `1px solid ${G.g200}`, borderRadius: 8, padding: "11px 14px", marginBottom: 8, display: "flex", gap: 12 }}>
                <div style={{ fontSize: 11, color: G.goldD, fontWeight: 600, minWidth: 80 }}>{fmtDate(log.date)}</div>
                <div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: G.g700 }}>{log.type === "whatsapp" ? "💬 WhatsApp" : "📞 Ligação"}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: rColor[log.result] || G.g500 }}>· {rLabel[log.result] || log.result}</span>
                  </div>
                  {log.obs && <div style={{ fontSize: 11, color: G.g500, marginTop: 2 }}>{log.obs}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal === "nota" && <ModalNota onSave={n => { save({ ...p, notes: [...p.notes, n] }); setModal(null); }} onClose={() => setModal(null)} />}
      {modal === "procedimento" && <ModalProcedimento patient={p} onSave={pr => { save({ ...p, procedures: [pr, ...p.procedures], lastVisit: pr.date }); setModal(null); }} onClose={() => setModal(null)} />}
      {modal === "retorno" && <ModalRetorno patient={p} onSave={date => { const days = getDays(date); save({ ...p, nextReturn: date, returnStatus: days < 0 ? "overdue" : days === 0 ? "due_today" : "ok" }); setModal(null); }} onClose={() => setModal(null)} />}
      {modal === "contato" && <ModalContato patient={p} onSave={log => { save({ ...p, contactLog: [log, ...p.contactLog] }); setModal(null); }} onClose={() => setModal(null)} />}
      {modal === "alergia" && <ModalNota onSave={n => { }} onClose={() => setModal(null)} />}
    </div>
  );
}

// ── APP ──
export default function App() {
  const [patients, setPatients] = useState(PATIENTS);
  const [view, setView] = useState("painel");
  const [selected, setSelected] = useState(null);
  const [splash, setSplash] = useState(true);
  const [modalNovo, setModalNovo] = useState(false);

  useEffect(() => { const t = setTimeout(() => setSplash(false), 2400); return () => clearTimeout(t); }, []);

  const updatePatient = u => {
    setPatients(ps => ps.map(p => p.id === u.id ? u : p));
    if (selected?.id === u.id) setSelected(u);
  };

  const overdueCount = patients.filter(p => p.returnStatus === "overdue" || p.returnStatus === "due_today").length;
  const pendingCount = patients.filter(p => p.financialStatus === "Pendente").length;

  if (splash) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: G.black }}>
      <style>{css}</style>
      <div style={{ textAlign: "center", animation: "fadeInUp .8s ease" }}>
        <div style={{ width: 54, height: 54, border: `1.5px solid ${G.gold}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <span style={{ transform: "rotate(-45deg)", color: G.gold, fontSize: 18, fontFamily: "'Cormorant Garamond',serif", fontWeight: 300 }}>E</span>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: G.white, letterSpacing: 8, fontWeight: 300 }}>EYNG</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 10, color: G.gold, letterSpacing: 5, marginTop: 3 }}>ODONTOLOGIA</div>
        <div style={{ marginTop: 20, height: 1, width: 100, margin: "18px auto 0", background: `linear-gradient(90deg,transparent,${G.gold},transparent)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 9, color: G.g500, marginTop: 12, letterSpacing: 2 }}>PLATAFORMA DE GESTÃO INTELIGENTE</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: G.g100 }}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{ background: G.black, padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${G.gold}33`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, border: `1.5px solid ${G.gold}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ transform: "rotate(-45deg)", color: G.gold, fontSize: 12, fontFamily: "'Cormorant Garamond',serif", fontWeight: 300 }}>E</span>
          </div>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", color: G.white, fontSize: 15, letterSpacing: 4, fontWeight: 300 }}>EYNG</span>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", color: G.gold, fontSize: 9, letterSpacing: 3, marginLeft: 8 }}>ODONTOLOGIA</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {overdueCount > 0 && <div style={{ background: `${G.red}22`, color: "#ff8a80", padding: "3px 10px", borderRadius: 14, fontSize: 10, fontWeight: 700 }}>{overdueCount} atrasados</div>}
          {pendingCount > 0 && <div style={{ background: `${G.orange}22`, color: G.orange, padding: "3px 10px", borderRadius: 14, fontSize: 10, fontWeight: 700 }}>{pendingCount} pendências</div>}
          <div style={{ color: G.g500, fontSize: 10, fontFamily: "'Cormorant Garamond',serif" }}>10/04/2026</div>
        </div>
      </div>

      {/* NAV */}
      {!selected && (
        <div style={{ background: G.surface, borderBottom: `1px solid ${G.g200}`, padding: "0 18px", display: "flex", alignItems: "center", gap: 0 }}>
          {[["painel", "🚨 Retornos"], ["pacientes", "👥 Pacientes"]].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)} style={{ background: "none", border: "none", borderBottom: view === id ? `2px solid ${G.gold}` : "2px solid transparent", padding: "11px 15px", cursor: "pointer", fontSize: 12, fontWeight: view === id ? 700 : 400, color: view === id ? G.goldD : G.g500, marginBottom: -1, transition: "all .2s" }}>
              {label}
              {id === "painel" && overdueCount > 0 && <span style={{ marginLeft: 5, background: G.red, color: "#fff", borderRadius: 8, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>{overdueCount}</span>}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setModalNovo(true)} style={{ ...btnPrim, margin: "7px 0", padding: "6px 14px", fontSize: 11 }}>+ Novo Paciente</button>
        </div>
      )}

      {/* CONTENT */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "18px 16px" }}>
        {selected ? (
          <DetalhePaciente patient={selected} onBack={() => setSelected(null)} onUpdate={updatePatient} />
        ) : view === "painel" ? (
          <PainelRetornos patients={patients} onSelect={setSelected} onUpdate={updatePatient} />
        ) : (
          <ListaPacientes patients={patients} onSelect={setSelected} />
        )}
      </div>

      <div style={{ textAlign: "center", padding: 14, color: G.g500, fontSize: 9, borderTop: `1px solid ${G.g200}`, marginTop: 20, letterSpacing: 1, fontFamily: "'Cormorant Garamond',serif" }}>
        CAMADA DE AUTOMAÇÃO PARA SERVIÇOS DE SAÚDE · DADOS FICTÍCIOS — DEMONSTRAÇÃO
      </div>

      {modalNovo && <ModalNovoPaciente onSave={p => { setPatients(ps => [...ps, p]); setModalNovo(false); }} onClose={() => setModalNovo(false)} />}
    </div>
  );
}
