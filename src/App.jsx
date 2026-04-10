import { useState, useEffect, useRef } from "react";

const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e8d5a0";
const GOLD_DARK = "#a07d2e";
const BLACK = "#1a1a1a";
const WHITE = "#fafaf8";
const GRAY_100 = "#f5f4f0";
const GRAY_200 = "#e8e6e0";
const GRAY_300 = "#d4d1c8";
const GRAY_500 = "#8a8577";
const GRAY_700 = "#4a473f";
const RED = "#c0392b";
const GREEN = "#27ae60";
const BLUE = "#2c6fbb";
const ORANGE = "#d4850a";

const patients = [
  {
    id: 1,
    name: "Maria Eduarda Conti",
    phone: "(49) 99812-3456",
    birth: "15/03/1985",
    cpf: "***.***.***-12",
    lastVisit: "2025-11-20",
    nextReturn: "2026-02-20",
    returnStatus: "overdue",
    professional: "Dra. Caroline",
    specialty: "Ortodontia",
    allergies: ["Dipirona", "Látex"],
    notes: [
      { type: "preference", text: "Não pode segundas e quartas à tarde — busca filhos na escola às 16h" },
      { type: "preference", text: "Prefere ser chamada por WhatsApp, não por ligação" },
    ],
    procedures: [
      { date: "2025-11-20", desc: "Manutenção do aparelho ortodôntico — troca de elásticos", prof: "Dra. Caroline" },
      { date: "2025-09-15", desc: "Ajuste de braquete descolado — dente 23", prof: "Dra. Caroline" },
      { date: "2025-06-10", desc: "Instalação de aparelho ortodôntico fixo — arco superior", prof: "Dra. Caroline" },
      { date: "2025-06-01", desc: "Documentação ortodôntica completa", prof: "Dra. Caroline" },
    ],
    treatment: "Ortodontia corretiva — Classe II divisão 1. Previsão: 24 meses. Mês 5 de 24.",
    financialStatus: "Em dia",
    balance: 0,
  },
  {
    id: 2,
    name: "João Pedro Almeida",
    phone: "(49) 99945-6789",
    birth: "22/07/1972",
    cpf: "***.***.***-34",
    lastVisit: "2025-08-10",
    nextReturn: "2025-11-10",
    returnStatus: "overdue",
    professional: "Dr. João Beno",
    specialty: "Implantodontia",
    allergies: [],
    notes: [
      { type: "preference", text: "Só pode sextas-feiras — trabalha em Pinhalzinho durante a semana" },
      { type: "alert", text: "Paciente ansioso com procedimentos — prefere explicação detalhada antes" },
      { type: "preference", text: "Diabético tipo 2 — verificar glicemia antes de procedimentos cirúrgicos" },
    ],
    procedures: [
      { date: "2025-08-10", desc: "Reabertura para instalação do cicatrizador — implante região 36", prof: "Dr. João Beno" },
      { date: "2025-05-15", desc: "Instalação de implante — região 36 (Cone Morse 4.0x10mm)", prof: "Dr. João Beno" },
      { date: "2025-04-20", desc: "Enxerto ósseo autógeno — região 36", prof: "Dr. João Beno" },
      { date: "2025-03-10", desc: "Planejamento com tomografia — região 36", prof: "Dr. João Beno" },
    ],
    treatment: "Implante unitário região 36 — fase de osseointegração concluída, aguardando prótese sobre implante.",
    financialStatus: "Pendente",
    balance: 1200,
  },
  {
    id: 3,
    name: "Ana Clara Fontana",
    phone: "(49) 98834-2211",
    birth: "05/11/1998",
    cpf: "***.***.***-56",
    lastVisit: "2026-03-28",
    nextReturn: "2026-09-28",
    returnStatus: "ok",
    professional: "Dra. Caroline",
    specialty: "Estética",
    allergies: ["Penicilina"],
    notes: [
      { type: "preference", text: "Prefere horários no início da manhã — trabalha em home office" },
      { type: "alert", text: "Bruxismo severo — usa placa noturna. Verificar ajuste a cada retorno" },
    ],
    procedures: [
      { date: "2026-03-28", desc: "Clareamento dental a laser — sessão 3 de 3", prof: "Dra. Caroline" },
      { date: "2026-03-14", desc: "Clareamento dental a laser — sessão 2 de 3", prof: "Dra. Caroline" },
      { date: "2026-02-28", desc: "Clareamento dental a laser — sessão 1 de 3. Moldagem para placa de bruxismo", prof: "Dra. Caroline" },
      { date: "2026-02-10", desc: "Avaliação para clareamento + ajuste de placa de bruxismo", prof: "Dra. Caroline" },
    ],
    treatment: "Clareamento concluído. Acompanhamento de bruxismo com placa oclusal — ajustes semestrais.",
    financialStatus: "Em dia",
    balance: 0,
  },
  {
    id: 4,
    name: "Carlos Roberto Zanella",
    phone: "(49) 99901-7788",
    birth: "30/01/1960",
    cpf: "***.***.***-78",
    lastVisit: "2025-10-05",
    nextReturn: "2026-01-05",
    returnStatus: "overdue",
    professional: "Dr. João Beno",
    specialty: "Prótese",
    allergies: ["Ibuprofeno"],
    notes: [
      { type: "alert", text: "⚠ Hipertenso — medicamento: Losartana 50mg. Verificar PA antes de procedimentos" },
      { type: "preference", text: "Não atende telefone — contato apenas por WhatsApp da esposa: (49) 99901-8899" },
      { type: "preference", text: "Prefere terças e quintas pela manhã" },
    ],
    procedures: [
      { date: "2025-10-05", desc: "Prova da infraestrutura metálica — PPR superior", prof: "Dr. João Beno" },
      { date: "2025-09-20", desc: "Moldagem funcional — PPR superior", prof: "Dr. João Beno" },
      { date: "2025-09-01", desc: "Exodontia do dente 15 (raiz residual) + moldagem inicial PPR", prof: "Dr. João Beno" },
    ],
    treatment: "Prótese parcial removível superior — em andamento. Paciente não retornou para prova final.",
    financialStatus: "Pendente",
    balance: 800,
  },
  {
    id: 5,
    name: "Letícia Bortolini",
    phone: "(49) 98876-5544",
    birth: "12/09/2012",
    cpf: "***.***.***-90",
    lastVisit: "2026-04-02",
    nextReturn: "2026-07-02",
    returnStatus: "ok",
    professional: "Dra. Caroline",
    specialty: "Ortodontia",
    allergies: [],
    notes: [
      { type: "preference", text: "Menor — responsável: Fernanda Bortolini (mãe), tel: (49) 98876-5500" },
      { type: "preference", text: "Consultas apenas depois das 14h — horário escolar pela manhã" },
      { type: "alert", text: "Paciente colaborativa, mas mãe ansiosa — explicar evolução com calma" },
    ],
    procedures: [
      { date: "2026-04-02", desc: "Manutenção do aparelho ortodôntico — ativação do arco inferior", prof: "Dra. Caroline" },
      { date: "2026-01-15", desc: "Instalação de aparelho fixo — arco inferior", prof: "Dra. Caroline" },
      { date: "2025-12-10", desc: "Instalação de aparelho fixo — arco superior", prof: "Dra. Caroline" },
      { date: "2025-11-20", desc: "Documentação ortodôntica + plano de tratamento interceptivo", prof: "Dra. Caroline" },
    ],
    treatment: "Ortodontia interceptiva — Classe III funcional. Previsão: 18 meses. Mês 5 de 18.",
    financialStatus: "Em dia",
    balance: 0,
  },
  {
    id: 6,
    name: "Ricardo Henrique Moraes",
    phone: "(49) 99923-1122",
    birth: "08/04/1988",
    cpf: "***.***.***-45",
    lastVisit: "2026-01-10",
    nextReturn: "2026-04-10",
    returnStatus: "due_today",
    professional: "Dr. João Beno",
    specialty: "Cirurgia",
    allergies: ["AAS"],
    notes: [
      { type: "preference", text: "Trabalha à noite (segurança) — só pode consultas entre 8h e 11h" },
      { type: "alert", text: "Tabagista — orientado sobre impacto na cicatrização. Fumou até véspera da última cirurgia" },
    ],
    procedures: [
      { date: "2026-01-10", desc: "Remoção de sutura — exodontia dos sisos 38 e 48", prof: "Dr. João Beno" },
      { date: "2025-12-20", desc: "Exodontia de terceiros molares inferiores — 38 e 48 (inclusos)", prof: "Dr. João Beno" },
      { date: "2025-12-01", desc: "Avaliação + tomografia para exodontia de sisos", prof: "Dr. João Beno" },
    ],
    treatment: "Pós-operatório de exodontia de sisos inferiores. Retorno para avaliação final da cicatrização.",
    financialStatus: "Em dia",
    balance: 0,
  },
];

function getDaysUntilReturn(dateStr) {
  const today = new Date("2026-04-10");
  const ret = new Date(dateStr);
  return Math.ceil((ret - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function ReturnBadge({ status, nextReturn }) {
  const days = getDaysUntilReturn(nextReturn);
  if (status === "overdue") {
    return (
      <span style={{ background: RED, color: "#fff", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>
        RETORNO ATRASADO — {Math.abs(days)} dias
      </span>
    );
  }
  if (status === "due_today") {
    return (
      <span style={{ background: ORANGE, color: "#fff", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
        RETORNO HOJE
      </span>
    );
  }
  return (
    <span style={{ background: GREEN, color: "#fff", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
      Retorno em {days} dias
    </span>
  );
}

function AllergyTag({ name }) {
  return (
    <span style={{ background: "#fdecea", color: RED, padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${RED}33` }}>
      ⚠ {name}
    </span>
  );
}

function NoteCard({ note }) {
  const isAlert = note.type === "alert";
  return (
    <div style={{
      background: isAlert ? "#fef9e7" : "#f0f7ff",
      border: `1px solid ${isAlert ? GOLD : BLUE}33`,
      borderLeft: `3px solid ${isAlert ? GOLD : BLUE}`,
      borderRadius: 6,
      padding: "8px 12px",
      fontSize: 13,
      color: GRAY_700,
      lineHeight: 1.5,
    }}>
      <span style={{ fontWeight: 600, color: isAlert ? GOLD_DARK : BLUE, marginRight: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {isAlert ? "⚡ Alerta" : "📋 Preferência"}
      </span>
      {note.text}
    </div>
  );
}

function PatientDetail({ patient, onBack }) {
  const [activeTab, setActiveTab] = useState("prontuario");
  const tabs = [
    { id: "prontuario", label: "Prontuário" },
    { id: "historico", label: "Histórico" },
    { id: "notas", label: `Notas Inteligentes (${patient.notes.length})` },
  ];

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: GOLD_DARK, cursor: "pointer",
        fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0,
        fontFamily: "'Cormorant Garamond', serif",
      }}>
        ← Voltar à lista
      </button>

      <div style={{
        background: BLACK, borderRadius: 12, padding: "24px 28px", marginBottom: 20,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0, width: 200, height: "100%",
          background: `linear-gradient(135deg, transparent 30%, ${GOLD}15)`,
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <h2 style={{ color: WHITE, margin: 0, fontSize: 22, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              {patient.name}
            </h2>
            <div style={{ color: GRAY_300, fontSize: 13, marginTop: 4 }}>
              {patient.phone} · Nasc: {patient.birth} · CPF: {patient.cpf}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ background: `${GOLD}22`, color: GOLD_LIGHT, padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${GOLD}44` }}>
                {patient.specialty}
              </span>
              <span style={{ color: GRAY_300, fontSize: 12 }}>
                {patient.professional}
              </span>
              <ReturnBadge status={patient.returnStatus} nextReturn={patient.nextReturn} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            {patient.financialStatus === "Pendente" ? (
              <div>
                <div style={{ color: ORANGE, fontSize: 12, fontWeight: 600 }}>PENDÊNCIA</div>
                <div style={{ color: WHITE, fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>
                  R$ {patient.balance.toLocaleString("pt-BR")}
                </div>
              </div>
            ) : (
              <div style={{ color: GREEN, fontSize: 12, fontWeight: 600 }}>✓ EM DIA</div>
            )}
          </div>
        </div>
        {patient.allergies.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {patient.allergies.map((a, i) => (
              <span key={i} style={{
                background: `${RED}22`, color: "#ff8a80", padding: "3px 10px", borderRadius: 8,
                fontSize: 11, fontWeight: 600, border: `1px solid ${RED}44`,
              }}>
                ⚠ ALERGIA: {a}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `2px solid ${GRAY_200}` }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: "none", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${GOLD}` : "2px solid transparent",
            padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 400,
            color: activeTab === tab.id ? GOLD_DARK : GRAY_500, marginBottom: -2,
            fontFamily: "'Cormorant Garamond', serif", letterSpacing: 0.3,
            transition: "all 0.2s",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "prontuario" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: WHITE, border: `1px solid ${GRAY_200}`, borderRadius: 10, padding: 20 }}>
            <h4 style={{ margin: "0 0 8px", color: BLACK, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600 }}>
              Plano de Tratamento
            </h4>
            <p style={{ margin: 0, color: GRAY_700, fontSize: 13, lineHeight: 1.6 }}>{patient.treatment}</p>
          </div>
          <div style={{ background: WHITE, border: `1px solid ${GRAY_200}`, borderRadius: 10, padding: 20 }}>
            <h4 style={{ margin: "0 0 8px", color: BLACK, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600 }}>
              Último Procedimento
            </h4>
            <p style={{ margin: 0, color: GRAY_700, fontSize: 13 }}>
              <span style={{ color: GOLD_DARK, fontWeight: 600 }}>{formatDate(patient.procedures[0].date)}</span> — {patient.procedures[0].desc}
            </p>
          </div>
          <div style={{ background: WHITE, border: `1px solid ${GRAY_200}`, borderRadius: 10, padding: 20 }}>
            <h4 style={{ margin: "0 0 12px", color: BLACK, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600 }}>
              Próximo Retorno
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: GRAY_700 }}>{formatDate(patient.nextReturn)}</span>
              <ReturnBadge status={patient.returnStatus} nextReturn={patient.nextReturn} />
            </div>
            {patient.returnStatus === "overdue" && patient.notes.filter(n => n.type === "preference").length > 0 && (
              <div style={{
                marginTop: 12, background: `${GOLD}08`, border: `1px solid ${GOLD}22`,
                borderRadius: 8, padding: 12,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GOLD_DARK, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  💡 Antes de ligar — leia as preferências do paciente:
                </div>
                {patient.notes.filter(n => n.type === "preference").map((n, i) => (
                  <div key={i} style={{ fontSize: 12, color: GRAY_700, lineHeight: 1.5, paddingLeft: 8, borderLeft: `2px solid ${GOLD}44`, marginTop: i > 0 ? 6 : 0 }}>
                    {n.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "historico" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {patient.procedures.map((proc, i) => (
            <div key={i} style={{
              padding: "14px 0", borderBottom: i < patient.procedures.length - 1 ? `1px solid ${GRAY_200}` : "none",
              display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <div style={{ minWidth: 80, fontSize: 12, color: GOLD_DARK, fontWeight: 600, paddingTop: 2 }}>
                {formatDate(proc.date)}
              </div>
              <div>
                <div style={{ fontSize: 13, color: GRAY_700, lineHeight: 1.5 }}>{proc.desc}</div>
                <div style={{ fontSize: 11, color: GRAY_500, marginTop: 2 }}>{proc.prof}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "notas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            background: `linear-gradient(135deg, ${BLACK} 0%, #2a2a28 100%)`,
            borderRadius: 10, padding: 16, marginBottom: 6,
          }}>
            <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              ✨ Por que isso existe
            </div>
            <p style={{ margin: 0, color: GRAY_300, fontSize: 12, lineHeight: 1.6 }}>
              Cada paciente tem preferências que só quem atende todo dia conhece — e que se perdem quando a secretária troca.
              Aqui ficam registradas as informações que <strong style={{ color: WHITE }}>evitam conflitos</strong> e mostram ao paciente que
              a clínica <strong style={{ color: WHITE }}>se lembra dele</strong>.
            </p>
          </div>
          {patient.notes.map((note, i) => <NoteCard key={i} note={note} />)}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.specialty.toLowerCase().includes(search.toLowerCase()) ||
      p.professional.toLowerCase().includes(search.toLowerCase());
    if (filter === "overdue") return matchesSearch && (p.returnStatus === "overdue" || p.returnStatus === "due_today");
    if (filter === "pending") return matchesSearch && p.financialStatus === "Pendente";
    if (filter === "caroline") return matchesSearch && p.professional === "Dra. Caroline";
    if (filter === "joao") return matchesSearch && p.professional === "Dr. João Beno";
    return matchesSearch;
  });

  const overdueCount = patients.filter(p => p.returnStatus === "overdue" || p.returnStatus === "due_today").length;
  const pendingCount = patients.filter(p => p.financialStatus === "Pendente").length;

  if (showSplash) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: BLACK, fontFamily: "'Cormorant Garamond', serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
          @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
          @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        `}</style>
        <div style={{ textAlign: "center", animation: "fadeInUp 0.8s ease" }}>
          <div style={{
            width: 60, height: 60, border: `2px solid ${GOLD}`,
            transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <span style={{ transform: "rotate(-45deg)", color: GOLD, fontSize: 20, fontWeight: 300 }}>E</span>
          </div>
          <div style={{ fontSize: 28, color: WHITE, letterSpacing: 8, fontWeight: 300 }}>EYNG</div>
          <div style={{ fontSize: 12, color: GOLD, letterSpacing: 5, marginTop: 4, fontWeight: 400 }}>ODONTOLOGIA</div>
          <div style={{
            marginTop: 24, height: 1, width: 120, margin: "24px auto 0",
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
          }} />
          <div style={{ fontSize: 11, color: GRAY_500, marginTop: 16, letterSpacing: 2, fontWeight: 400 }}>
            PLATAFORMA DE GESTÃO INTELIGENTE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: GRAY_100,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; }
        input::placeholder { color: ${GRAY_500}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${GRAY_300}; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{
        background: BLACK, padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${GOLD}33`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 32, height: 32, border: `1.5px solid ${GOLD}`,
            transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ transform: "rotate(-45deg)", color: GOLD, fontSize: 13, fontWeight: 300 }}>E</span>
          </div>
          <div>
            <span style={{ color: WHITE, fontSize: 16, letterSpacing: 4, fontWeight: 300 }}>EYNG</span>
            <span style={{ color: GOLD, fontSize: 9, letterSpacing: 3, marginLeft: 8, fontWeight: 400 }}>ODONTOLOGIA</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            background: `${RED}22`, color: "#ff8a80", padding: "4px 12px",
            borderRadius: 20, fontSize: 11, fontWeight: 600,
          }}>
            {overdueCount} retornos atrasados
          </div>
          {pendingCount > 0 && (
            <div style={{
              background: `${ORANGE}22`, color: ORANGE, padding: "4px 12px",
              borderRadius: 20, fontSize: 11, fontWeight: 600,
            }}>
              {pendingCount} pendências
            </div>
          )}
          <div style={{ color: GRAY_500, fontSize: 11 }}>10/04/2026</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px" }}>
        {selectedPatient ? (
          <PatientDetail patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
        ) : (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Buscar paciente por nome, telefone, especialidade..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px 12px 40px", fontSize: 14,
                  border: `1px solid ${GRAY_200}`, borderRadius: 10, outline: "none",
                  background: WHITE, color: BLACK,
                  fontFamily: "'Cormorant Garamond', serif",
                  transition: "border 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e => e.target.style.borderColor = GRAY_200}
              />
              <span style={{ position: "absolute", left: 14, top: 13, color: GRAY_500, fontSize: 16 }}>🔍</span>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "all", label: `Todos (${patients.length})` },
                { id: "overdue", label: `⚠ Retornos (${overdueCount})` },
                { id: "pending", label: `💰 Pendências (${pendingCount})` },
                { id: "caroline", label: "Dra. Caroline" },
                { id: "joao", label: "Dr. João Beno" },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{
                  padding: "6px 14px", borderRadius: 20, border: `1px solid ${filter === f.id ? GOLD : GRAY_200}`,
                  background: filter === f.id ? `${GOLD}15` : WHITE, color: filter === f.id ? GOLD_DARK : GRAY_500,
                  fontSize: 12, fontWeight: filter === f.id ? 600 : 400, cursor: "pointer",
                  fontFamily: "'Cormorant Garamond', serif",
                  transition: "all 0.2s",
                }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Patient list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  style={{
                    background: WHITE, border: `1px solid ${GRAY_200}`, borderRadius: 10,
                    padding: "14px 18px", cursor: "pointer",
                    borderLeft: p.returnStatus === "overdue" ? `3px solid ${RED}` :
                      p.returnStatus === "due_today" ? `3px solid ${ORANGE}` : `3px solid ${GREEN}`,
                    transition: "all 0.15s",
                    animation: `fadeInUp 0.3s ease ${idx * 0.05}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = GRAY_200; e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: BLACK }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: GRAY_500, marginTop: 2 }}>
                        {p.specialty} · {p.professional} · Último atend: {formatDate(p.lastVisit)}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <ReturnBadge status={p.returnStatus} nextReturn={p.nextReturn} />
                      {p.allergies.length > 0 && (
                        <span style={{ fontSize: 10, color: RED, fontWeight: 600 }}>⚠ ALERGIAS</span>
                      )}
                    </div>
                  </div>
                  {p.notes.filter(n => n.type === "preference").length > 0 && p.returnStatus !== "ok" && (
                    <div style={{
                      marginTop: 8, padding: "6px 10px", background: `${GOLD}08`,
                      borderRadius: 6, fontSize: 11, color: GRAY_700,
                      borderLeft: `2px solid ${GOLD}44`,
                    }}>
                      💡 {p.notes.find(n => n.type === "preference").text}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: GRAY_500, fontSize: 14 }}>
                Nenhum paciente encontrado.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "20px 16px", color: GRAY_500, fontSize: 10,
        borderTop: `1px solid ${GRAY_200}`, marginTop: 40, letterSpacing: 1,
      }}>
        CAMADA DE AUTOMAÇÃO PARA SERVIÇOS DE SAÚDE · DADOS FICTÍCIOS — DEMONSTRAÇÃO
      </div>
    </div>
  );
}
