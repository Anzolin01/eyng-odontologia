import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { SERVICOS } from "./servicos";

// ── Constantes ──
const SLOT_H   = 56;   // px por slot de 30min
const SLOT_MIN = 30;
const START_H  = 8;
const END_H    = 18;   // Clínica fecha às 18h
const PROFS    = ["Dra. Caroline", "Dr. João Beno"];
// Intervalo de almoço: 12:00–13:30
const LUNCH    = ["12:00","12:30","13:00"];
const DURACOES = [30, 45, 60, 90, 120];

// ── Contatos dos profissionais ──
const PROF_CONTATOS = {
  "Dra. Caroline": { phone: "5549984364313", apelido: "Dra. Carol" },
  "Dr. João Beno":  { phone: "5549999324034", apelido: "Dr. João"  },
};

const SLOTS = [];
for (let h = START_H; h < END_H; h++) {
  SLOTS.push(`${String(h).padStart(2,"0")}:00`);
  SLOTS.push(`${String(h).padStart(2,"0")}:30`);
}

const STATUS = {
  agendado:   { bg:"#e0f2fe", border:"#0ea5e9", text:"#0369a1", label:"Agendado"    },
  confirmado: { bg:"#dcfce7", border:"#16a34a", text:"#15803d", label:"Confirmado ✓"},
  realizado:  { bg:"#f0fdf4", border:"#86efac", text:"#16a34a", label:"Realizado"   },
  cancelado:  { bg:"#f8fafc", border:"#e2e8f0", text:"#94a3b8", label:"Cancelado"   },
  faltou:     { bg:"#fef2f2", border:"#fca5a5", text:"#dc2626", label:"Faltou"      },
};

const C = {
  primary:"#c45f82", dark:"#8b3458", bg:"#fdf4f6", bgMed:"#fce8ee",
  text:"#4a2c3a", textLight:"#8b3458", gray:"#94a3b8", green:"#16a34a",
};

// ── Helpers ──
const uid      = () => Math.random().toString(36).slice(2,9);
const todayISO = () => new Date().toISOString().split("T")[0];
const addD     = (d,n) => { const dt=new Date(d+"T12:00:00"); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };
const fmtLong  = (d) => new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
const fmtShort = (d) => { const [y,m,dd]=d.split("-"); return `${dd}/${m}/${y}`; };
const timeToSlot = (t) => { const [h,m]=t.split(":").map(Number); return (h-START_H)*2+(m>=30?1:0); };
const slotToTime = (s) => { const tot=START_H*60+s*SLOT_MIN; return `${String(Math.floor(tot/60)).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`; };
const initials  = (name) => name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase();

// ── Input / Button helpers ──
const inputSt = { width:"100%", border:`1.5px solid #f0d6df`, borderRadius:10, padding:"10px 12px", fontSize:13, fontFamily:"Nunito,sans-serif", color:C.text, outline:"none", background:"#fff" };
const BtnPrim = ({label,onClick,disabled,small,icon})=>(
  <button onClick={onClick} disabled={disabled} style={{background:`linear-gradient(135deg,${C.primary},${C.dark})`,color:"#fff",border:"none",borderRadius:10,padding:small?"7px 14px":"11px 22px",fontSize:small?11:13,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,display:"flex",alignItems:"center",gap:6}}>
    {icon&&<span>{icon}</span>}{label}
  </button>
);
const BtnSec = ({label,onClick,small})=>(
  <button onClick={onClick} style={{background:C.bgMed,color:C.dark,border:"none",borderRadius:10,padding:small?"7px 14px":"11px 18px",fontSize:small?11:13,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>
    {label}
  </button>
);

// ── Modal base ──
function Modal({title,onClose,children,width=480}){
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(74,44,58,0.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:width,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(139,52,88,0.25)"}}>
        <div style={{background:`linear-gradient(135deg,${C.primary},${C.dark})`,padding:"14px 20px",borderRadius:"20px 20px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{color:"#fff",fontWeight:800,fontSize:15,fontFamily:"Nunito,sans-serif"}}>{title}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,padding:"4px 10px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>✕</button>
        </div>
        <div style={{padding:20}}>{children}</div>
      </div>
    </div>
  );
}

// ── Alertas do paciente ──
function AlertasPaciente({ patient }) {
  if (!patient) return null;
  const alertas = patient.notes?.filter(n=>n.type==="alert") || [];
  const prefs   = patient.notes?.filter(n=>n.type==="preference") || [];
  if (!alertas.length && !prefs.length) return null;
  return (
    <div style={{marginBottom:14}}>
      {alertas.map(n=>(
        <div key={n.id} style={{background:"#fff8e1",border:"1.5px solid #fcd34d",borderRadius:10,padding:"8px 12px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{fontSize:14}}>⚠️</span>
          <span style={{fontSize:12,color:"#92400e",fontWeight:700}}>{n.text}</span>
        </div>
      ))}
      {prefs.map(n=>(
        <div key={n.id} style={{background:"#f0f9ff",border:"1.5px solid #bae6fd",borderRadius:10,padding:"8px 12px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{fontSize:14}}>💡</span>
          <span style={{fontSize:12,color:"#0369a1"}}>{n.text}</span>
        </div>
      ))}
    </div>
  );
}

// ── Modal Novo Agendamento ──
function ModalNovoAgendamento({ date, hora, profissional, patients, onSave, onClose }) {
  const [step, setStep]       = useState("paciente");
  const [patient, setPatient] = useState(null);
  const [q, setQ]             = useState("");
  const [form, setForm]       = useState({
    date: date || todayISO(),
    hora: hora || "09:00",
    duracao: 60,
    profissional: profissional || PROFS[0],
    servicoDesc: "",
    servicoId: "",
    obs: "",
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const filtered = q.length>=1
    ? patients.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.phone.includes(q))
    : [];

  const handleSave = () => {
    onSave({
      id: uid(),
      patientId: patient?.id||null,
      patientName: patient?.name || "Paciente avulso",
      phone: patient?.phone || "",
      professional: form.profissional,
      date: form.date,
      hora: form.hora,
      duracao: form.duracao,
      servicoDesc: form.servicoDesc,
      servicoId: form.servicoId,
      obs: form.obs,
      status: "agendado",
    });
  };

  return (
    <Modal title="📅 Novo Agendamento" onClose={onClose} width={520}>
      {/* Passo 1: Paciente */}
      {step === "paciente" && (
        <>
          <div style={{fontSize:11,fontWeight:800,color:C.textLight,letterSpacing:1,marginBottom:12}}>BUSCAR PACIENTE</div>
          <input autoFocus placeholder="Nome ou telefone..." value={q} onChange={e=>setQ(e.target.value)} style={{...inputSt,marginBottom:10}}/>
          <div style={{maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
            {filtered.map(p=>(
              <div key={p.id} onClick={()=>{setPatient(p);setStep("detalhes");}}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,cursor:"pointer",border:`1.5px solid #fce8ee`,background:C.bg,transition:"all .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.primary}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#fce8ee"}>
                <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.dark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12,flexShrink:0}}>{initials(p.name)}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{p.name}</div>
                  <div style={{fontSize:11,color:C.gray}}>{p.specialty} · {p.professional} · {p.phone}</div>
                </div>
              </div>
            ))}
            {q.length>=1&&filtered.length===0&&<div style={{textAlign:"center",padding:16,color:C.gray,fontSize:13}}>Nenhum paciente encontrado.</div>}
          </div>
          <button onClick={()=>{setPatient(null);setStep("detalhes");}} style={{fontSize:12,color:C.gray,background:"none",border:"none",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
            → Continuar sem vincular paciente
          </button>
        </>
      )}

      {/* Passo 2: Detalhes */}
      {step === "detalhes" && (
        <>
          {patient && (
            <div style={{background:C.bgMed,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.dark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12,flexShrink:0}}>{initials(patient.name)}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{patient.name}</div>
                <div style={{fontSize:11,color:C.gray}}>{patient.specialty} · {patient.phone}</div>
              </div>
              <button onClick={()=>{setPatient(null);setStep("paciente");setQ("");}} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:12}}>trocar</button>
            </div>
          )}

          <AlertasPaciente patient={patient}/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:C.textLight,letterSpacing:0.8,marginBottom:5}}>DATA</div>
              <input type="date" style={inputSt} value={form.date} onChange={e=>set("date",e.target.value)}/>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:C.textLight,letterSpacing:0.8,marginBottom:5}}>HORÁRIO</div>
              <select style={inputSt} value={form.hora} onChange={e=>set("hora",e.target.value)}>
                {SLOTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:800,color:C.textLight,letterSpacing:0.8,marginBottom:5}}>DURAÇÃO</div>
            <div style={{display:"flex",gap:8}}>
              {DURACOES.map(d=>(
                <button key={d} onClick={()=>set("duracao",d)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:"none",cursor:"pointer",background:form.duracao===d?C.primary:C.bgMed,color:form.duracao===d?"#fff":C.dark,fontSize:11,fontWeight:700,fontFamily:"Nunito,sans-serif"}}>
                  {d<60?`${d}min`:d===60?"1h":d===90?"1h30":d===120?"2h":""}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:800,color:C.textLight,letterSpacing:0.8,marginBottom:5}}>PROFISSIONAL</div>
            <div style={{display:"flex",gap:8}}>
              {PROFS.map(p=>(
                <button key={p} onClick={()=>set("profissional",p)} style={{flex:1,padding:"9px 8px",borderRadius:10,border:"none",cursor:"pointer",background:form.profissional===p?C.primary:C.bgMed,color:form.profissional===p?"#fff":C.dark,fontSize:12,fontWeight:700,fontFamily:"Nunito,sans-serif"}}>
                  {p.replace("Dra. ","Dra. ").replace("Dr. ","Dr. ")}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:800,color:C.textLight,letterSpacing:0.8,marginBottom:5}}>PROCEDIMENTO</div>
            <select style={inputSt} value={form.servicoId} onChange={e=>{
              const s=SERVICOS.find(x=>x.id===e.target.value);
              set("servicoId",e.target.value);
              if(s) set("servicoDesc",s.desc);
            }}>
              <option value="">Selecione ou deixe em branco...</option>
              {["Consultas","Ortodontia","Implantodontia","Prótese","Estética","Clínico Geral","Documentação"].map(cat=>(
                <optgroup key={cat} label={cat}>
                  {SERVICOS.filter(s=>s.categoria===cat).map(s=>(
                    <option key={s.id} value={s.id}>{s.desc}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {!form.servicoId && (
              <input style={{...inputSt,marginTop:8}} placeholder="Ou descreva o procedimento manualmente..." value={form.servicoDesc} onChange={e=>set("servicoDesc",e.target.value)}/>
            )}
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,fontWeight:800,color:C.textLight,letterSpacing:0.8,marginBottom:5}}>OBSERVAÇÃO (opcional)</div>
            <input style={inputSt} placeholder="Ex: paciente pede cadeira reclinada, trazer exame..." value={form.obs} onChange={e=>set("obs",e.target.value)}/>
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
            <BtnSec label="← Paciente" onClick={()=>setStep("paciente")}/>
            <BtnPrim label="Confirmar Agendamento" icon="📅" onClick={handleSave} disabled={!form.date||!form.hora}/>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── Modal Detalhe do Agendamento ──
function ModalDetalhe({ appt, patient, onUpdate, onDelete, onClose }) {
  const [status, setStatus] = useState(appt.status);
  const st = STATUS[status] || STATUS.agendado;
  const nomePrim = appt.patientName.split(" ")[0];
  const assinante = appt.professional === "Dr. João Beno" ? "Dr. João" : "Dra. Carol";
  const msgWats = encodeURIComponent(`Oi ${nomePrim}! 😊 Aqui é o ${assinante} da Eyng Odontologia.\n\nPassando pra lembrar da sua consulta *${fmtShort(appt.date)} às ${appt.hora}* 🦷\n\nConsegue comparecer? Me fala aqui!`);

  return (
    <Modal title="📋 Detalhes do Agendamento" onClose={onClose}>
      {/* Paciente */}
      <div style={{background:C.bgMed,borderRadius:14,padding:"14px 16px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.dark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:15,flexShrink:0}}>{initials(appt.patientName)}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text}}>{appt.patientName}</div>
            <div style={{fontSize:12,color:C.gray}}>{appt.professional} · {fmtShort(appt.date)} · {appt.hora} · {appt.duracao}min</div>
          </div>
        </div>
        {appt.servicoDesc && <div style={{marginTop:10,fontSize:13,color:C.text,fontWeight:600}}>🩺 {appt.servicoDesc}</div>}
        {appt.obs && <div style={{marginTop:6,fontSize:12,color:C.gray,fontStyle:"italic"}}>💬 {appt.obs}</div>}
      </div>

      {/* Alertas */}
      <AlertasPaciente patient={patient}/>

      {/* Status */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:800,color:C.textLight,letterSpacing:1,marginBottom:8}}>STATUS</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {Object.entries(STATUS).map(([k,v])=>(
            <button key={k} onClick={()=>{setStatus(k);onUpdate({...appt,status:k});}} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${status===k?v.border:"#fce8ee"}`,background:status===k?v.bg:"#fff",color:status===k?v.text:C.gray,fontSize:11,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp */}
      {appt.phone && (
        <a href={`https://wa.me/55${appt.phone.replace(/\D/g,"")}?text=${msgWats}`} target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",gap:10,background:"#dcfce7",border:"1.5px solid #86efac",borderRadius:12,padding:"12px 16px",marginBottom:16,textDecoration:"none"}}>
          <span style={{fontSize:20}}>💬</span>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#15803d"}}>Enviar lembrete no WhatsApp</div>
            <div style={{fontSize:11,color:"#16a34a"}}>{appt.phone}</div>
          </div>
          <span style={{marginLeft:"auto",color:"#16a34a",fontSize:14}}>→</span>
        </a>
      )}

      <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
        <button onClick={()=>onDelete(appt.id)} style={{background:"#fef2f2",color:"#dc2626",border:"none",borderRadius:10,padding:"9px 16px",fontSize:12,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>
          🗑 Excluir
        </button>
        <BtnPrim label="Fechar" onClick={onClose}/>
      </div>
    </Modal>
  );
}

// ── Bloco de agendamento no grid ──
function ApptBlock({ appt, onClick }) {
  const st    = STATUS[appt.status] || STATUS.agendado;
  const slots = appt.duracao / SLOT_MIN;
  const hasAlert = appt._patientAlerts > 0;

  return (
    <div onClick={()=>onClick(appt)}
      style={{
        position:"absolute",
        left:3, right:3,
        top:timeToSlot(appt.hora)*SLOT_H+2,
        height:slots*SLOT_H-4,
        background:st.bg,
        border:`2px solid ${st.border}`,
        borderRadius:10,
        padding:"5px 8px",
        cursor:"pointer",
        overflow:"hidden",
        zIndex:10,
        transition:"all .15s",
        boxShadow:`0 2px 8px ${st.border}33`,
      }}
      onMouseEnter={e=>e.currentTarget.style.filter="brightness(0.97)"}
      onMouseLeave={e=>e.currentTarget.style.filter=""}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:4}}>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{fontSize:11,fontWeight:800,color:st.text,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {hasAlert && <span style={{marginRight:3}}>⚠️</span>}
            {appt.patientName}
          </div>
          {slots >= 2 && appt.servicoDesc && (
            <div style={{fontSize:10,color:st.text,opacity:0.8,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{appt.servicoDesc}</div>
          )}
        </div>
        <div style={{fontSize:9,fontWeight:700,color:st.text,opacity:0.7,flexShrink:0}}>{appt.hora}</div>
      </div>
    </div>
  );
}

// ── Modal Fechar o Dia ──
function ModalFecharDia({ appts, date, onClose }) {
  const amanha    = addD(date, 1);
  const fmtDia    = (d) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long" });
  const ehFimSem  = [0,6].includes(new Date(amanha + "T12:00:00").getDay());

  const porProf = PROFS.map(prof => {
    const consultas = appts
      .filter(a => a.date === amanha && a.professional === prof && a.status !== "cancelado")
      .sort((a, b) => a.hora.localeCompare(b.hora));
    return { prof, consultas };
  });

  const totalAmanha = porProf.reduce((s, g) => s + g.consultas.length, 0);

  const buildMsg = ({ prof, consultas }) => {
    const c = PROF_CONTATOS[prof];
    const linhas = consultas.length > 0
      ? consultas.map(a => {
          const proc = a.servicoDesc ? ` · ${a.servicoDesc}` : "";
          return `• ${a.hora} — ${a.patientName.split(" ")[0]}${proc}`;
        }).join("\n")
      : "Nenhuma consulta agendada.";

    const msg =
`🌙 *Agenda de amanhã — ${c.apelido}*
📅 ${fmtDia(amanha).charAt(0).toUpperCase() + fmtDia(amanha).slice(1)} (${fmtShort(amanha)})

${linhas}

${consultas.length > 0
  ? `Total: *${consultas.length} consulta${consultas.length !== 1 ? "s"  : ""}* ✅`
  : "Dia livre! 🎉"}

Boa noite! 🦷 _Eyng Odontologia_`;

    return `https://wa.me/${c.phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Modal title="🌙 Fechar o Dia" onClose={onClose} width={520}>

      {/* Cabeçalho */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:32,marginBottom:6}}>🌙</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:18,color:C.dark}}>
          Agenda de amanhã
        </div>
        <div style={{fontSize:12,color:C.gray,marginTop:4,textTransform:"capitalize"}}>
          {fmtDia(amanha)} · {totalAmanha} consulta{totalAmanha !== 1 ? "s" : ""} agendada{totalAmanha !== 1 ? "s" : ""}
        </div>
        {ehFimSem && (
          <div style={{marginTop:10,background:"#fff8e1",border:"1px solid #fcd34d",borderRadius:10,padding:"8px 14px",fontSize:12,color:"#92400e",fontWeight:700}}>
            ⚠️ Amanhã é fim de semana — verifique se há plantão
          </div>
        )}
      </div>

      {/* Cards por profissional */}
      {porProf.map(({ prof, consultas }) => {
        const c = PROF_CONTATOS[prof];
        return (
          <div key={prof} style={{background:C.bg,borderRadius:16,padding:16,marginBottom:14}}>

            {/* Header do prof */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.dark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13}}>
                  {c.apelido.split(" ").pop()[0]}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:C.text}}>{c.apelido}</div>
                  <div style={{fontSize:11,color:C.gray}}>{consultas.length} consulta{consultas.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              <a href={buildMsg({ prof, consultas })} target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",gap:6,background:"#dcfce7",border:"1.5px solid #86efac",borderRadius:10,padding:"8px 14px",textDecoration:"none",fontSize:12,fontWeight:800,color:"#15803d"}}>
                <span style={{fontSize:16}}>💬</span> Avisar no WhatsApp
              </a>
            </div>

            {/* Lista de pacientes */}
            {consultas.length === 0 ? (
              <div style={{textAlign:"center",padding:"12px 0",color:C.gray,fontSize:12,fontStyle:"italic"}}>
                Dia livre 🎉
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {consultas.map(a => {
                  const st = STATUS[a.status] || STATUS.agendado;
                  return (
                    <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,background:"#fff",borderRadius:10,padding:"9px 12px",border:`1.5px solid ${st.border}`}}>
                      <div style={{fontSize:12,fontWeight:800,color:st.text,minWidth:38}}>{a.hora}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text}}>{a.patientName}</div>
                        {a.servicoDesc && <div style={{fontSize:10,color:C.gray,marginTop:1}}>{a.servicoDesc}</div>}
                      </div>
                      <div style={{fontSize:10,fontWeight:700,color:st.text,background:st.bg,borderRadius:6,padding:"2px 8px"}}>{st.label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div style={{textAlign:"center",fontSize:11,color:C.gray,marginTop:4}}>
        💡 As mensagens abrem o WhatsApp com o texto pronto — só clicar em enviar
      </div>
    </Modal>
  );
}

// ── Modal Lista de Espera ──
function ModalListaEspera({ onClose }) {
  const LS_KEY = "eyng_lista_espera";
  const loadLista = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
  };

  const [lista, setLista]   = useState(loadLista);
  const [form, setForm]     = useState({ nome: "", telefone: "", preferencia: "" });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const salvar = (novaLista) => {
    setLista(novaLista);
    localStorage.setItem(LS_KEY, JSON.stringify(novaLista));
  };

  const adicionar = () => {
    if (!form.nome.trim() || !form.telefone.trim()) return;
    salvar([...lista, { id: uid(), ...form, criadoEm: new Date().toISOString() }]);
    setForm({ nome: "", telefone: "", preferencia: "" });
  };

  const remover = (id) => salvar(lista.filter(e => e.id !== id));

  const buildWhatsApp = (entry) => {
    const tel = entry.telefone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Oi ${entry.nome.split(" ")[0]}! 😊 Aqui é a equipe da Eyng Odontologia. Temos uma vaga disponível na agenda! Consegue vir? Me fala aqui 😊`
    );
    return `https://wa.me/55${tel}?text=${msg}`;
  };

  return (
    <Modal title="🪑 Fila de Espera" onClose={onClose} width={520}>

      {/* Formulário para adicionar */}
      <div style={{ background: C.bg, borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, letterSpacing: 1, marginBottom: 12 }}>ADICIONAR PACIENTE À FILA</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight, letterSpacing: 0.8, marginBottom: 5 }}>NOME</div>
            <input style={inputSt} placeholder="Nome completo..." value={form.nome} onChange={e => setF("nome", e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight, letterSpacing: 0.8, marginBottom: 5 }}>TELEFONE (com DDD)</div>
            <input style={inputSt} placeholder="Ex: 49984364313" value={form.telefone} onChange={e => setF("telefone", e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight, letterSpacing: 0.8, marginBottom: 5 }}>PREFERÊNCIA DE HORÁRIO</div>
          <input style={inputSt} placeholder="Ex: manhã de terça, qualquer dia à tarde..." value={form.preferencia} onChange={e => setF("preferencia", e.target.value)} />
        </div>
        <BtnPrim label="Adicionar à fila" icon="➕" onClick={adicionar} disabled={!form.nome.trim() || !form.telefone.trim()} small />
      </div>

      {/* Lista de espera */}
      {lista.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: C.gray, fontSize: 13, fontStyle: "italic" }}>
          Nenhum paciente na fila de espera.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lista.map((entry, idx) => (
            <div key={entry.id} style={{ background: "#fff", border: `1.5px solid #fce8ee`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${C.primary},${C.dark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{entry.nome}</div>
                <div style={{ fontSize: 11, color: C.gray, marginTop: 1 }}>📱 {entry.telefone}</div>
                {entry.preferencia && (
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>🕐 {entry.preferencia}</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <a href={buildWhatsApp(entry)} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "#dcfce7", border: "1.5px solid #86efac", borderRadius: 10, padding: "7px 12px", textDecoration: "none", fontSize: 11, fontWeight: 800, color: "#15803d" }}>
                  <span style={{ fontSize: 14 }}>💬</span> WhatsApp
                </a>
                <button onClick={() => remover(entry.id)}
                  style={{ background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 11, fontWeight: 700, fontFamily: "Nunito,sans-serif", cursor: "pointer" }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lista.length > 0 && (
        <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: C.gray }}>
          💡 Clique em WhatsApp para avisar o paciente sobre a vaga disponível
        </div>
      )}
    </Modal>
  );
}

// ── COMPONENTE PRINCIPAL ──
export default function Agenda({ patients }) {
  const [date, setDate]         = useState(todayISO());
  const [appts, setAppts]       = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [modalNovo, setModalNovo]         = useState(null); // { hora, profissional } | null
  const [modalDetalhe, setModalDetalhe]   = useState(null); // appt
  const [modalFechar, setModalFechar]     = useState(false);
  const [modalEspera, setModalEspera]     = useState(false);

  // Contador fila de espera (reativo ao localStorage)
  const [qtdEspera, setQtdEspera] = useState(() => {
    try { return JSON.parse(localStorage.getItem("eyng_lista_espera") || "[]").length; } catch { return 0; }
  });
  const refreshQtdEspera = () => {
    try { setQtdEspera(JSON.parse(localStorage.getItem("eyng_lista_espera") || "[]").length); } catch { setQtdEspera(0); }
  };

  // Carrega do Supabase
  useEffect(() => {
    const load = async () => {
      setLoadingDb(true);
      const { data, error } = await supabase.from("agenda").select("*");
      if (!error && data) {
        setAppts(data.map(row => ({ ...row.data, _dbId: row.id })));
      }
      setLoadingDb(false);
    };
    load();
  }, []);

  const saveAppt = async (appt) => {
    const { data, error } = await supabase.from("agenda").insert({ data: appt }).select();
    if (!error && data?.[0]) {
      setAppts(prev => [...prev, { ...appt, _dbId: data[0].id }]);
    } else {
      setAppts(prev => [...prev, appt]);
    }
    setModalNovo(null);
  };

  const updateAppt = async (updated) => {
    setAppts(prev => prev.map(a => a.id === updated.id ? { ...updated, _dbId: a._dbId } : a));
    const found = appts.find(a => a.id === updated.id);
    if (found?._dbId) {
      const { _dbId, ...data } = { ...updated };
      await supabase.from("agenda").update({ data }).eq("id", found._dbId);
    }
    setModalDetalhe(prev => prev?.id === updated.id ? { ...updated, _dbId: prev._dbId } : prev);
  };

  const deleteAppt = async (id) => {
    const found = appts.find(a => a.id === id);
    setAppts(prev => prev.filter(a => a.id !== id));
    if (found?._dbId) await supabase.from("agenda").delete().eq("id", found._dbId);
    setModalDetalhe(null);
  };

  // Agendamentos do dia, enriquecidos com alertas do paciente
  const apptsDia = appts
    .filter(a => a.date === date)
    .map(a => {
      const p = patients.find(x => x.id === a.patientId);
      return { ...a, _patientAlerts: p?.notes?.filter(n=>n.type==="alert").length || 0 };
    });

  const apptsPorProf = (prof) => apptsDia.filter(a => a.professional === prof);

  // Contador de agendamentos do dia
  const totalDia = apptsDia.filter(a=>a.status!=="cancelado").length;
  const confirmados = apptsDia.filter(a=>a.status==="confirmado").length;

  const isToday = date === todayISO();
  const dayLabel = fmtLong(date);

  return (
    <div style={{fontFamily:"Nunito,sans-serif"}}>

      {/* Header da agenda */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:22,color:C.dark,textTransform:"capitalize"}}>{dayLabel}</div>
          <div style={{fontSize:12,color:C.gray,marginTop:2}}>
            {totalDia} consultas · {confirmados} confirmadas
            {apptsDia.filter(a=>a._patientAlerts>0).length>0 && (
              <span style={{marginLeft:8,color:"#d97706",fontWeight:700}}>⚠️ {apptsDia.filter(a=>a._patientAlerts>0).length} com alerta</span>
            )}
          </div>
        </div>

        {/* Navegação de data */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setDate(d=>addD(d,-1))} style={{background:"#fff",border:`1px solid #fce8ee`,borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:14,color:C.dark,fontWeight:700}}>‹</button>
          {!isToday && (
            <button onClick={()=>setDate(todayISO())} style={{background:C.bgMed,border:"none",borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:12,color:C.dark,fontWeight:700,fontFamily:"Nunito,sans-serif"}}>Hoje</button>
          )}
          <button onClick={()=>setDate(d=>addD(d,1))} style={{background:"#fff",border:`1px solid #fce8ee`,borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:14,color:C.dark,fontWeight:700}}>›</button>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{border:`1.5px solid #fce8ee`,borderRadius:10,padding:"8px 12px",fontSize:12,color:C.text,fontFamily:"Nunito,sans-serif",outline:"none"}}/>
          <BtnPrim label="+ Agendar" icon="📅" onClick={()=>setModalNovo({hora:"09:00",profissional:PROFS[0]})} small/>
          <button onClick={()=>setModalEspera(true)}
            style={{background:`linear-gradient(135deg,${C.primary},${C.dark})`,color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:11,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            🪑 Fila de Espera {qtdEspera > 0 ? `(${qtdEspera})` : ""}
          </button>
          <button onClick={()=>setModalFechar(true)}
            style={{background:"linear-gradient(135deg,#6366f1,#4338ca)",color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:11,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            🌙 Fechar Dia
          </button>
        </div>
      </div>

      {/* Grid da agenda */}
      <div style={{background:"#fff",borderRadius:18,boxShadow:"0 4px 24px rgba(196,95,130,0.1)",overflow:"hidden"}}>

        {/* Cabeçalho dos profissionais */}
        <div style={{display:"grid",gridTemplateColumns:`64px repeat(${PROFS.length},1fr)`,borderBottom:`2px solid #fce8ee`}}>
          <div style={{padding:"14px 8px"}}/>
          {PROFS.map(p=>(
            <div key={p} style={{padding:"14px 16px",borderLeft:"1px solid #fce8ee",background:`linear-gradient(135deg,${C.primary}10,${C.dark}08)`}}>
              <div style={{fontSize:14,fontWeight:800,color:C.dark}}>{p}</div>
              <div style={{fontSize:11,color:C.gray,marginTop:2}}>
                {apptsPorProf(p).filter(a=>a.status!=="cancelado").length} consultas hoje
              </div>
            </div>
          ))}
        </div>

        {loadingDb ? (
          <div style={{textAlign:"center",padding:48,color:C.gray}}>Carregando agenda...</div>
        ) : (
          /* Slots de horário */
          <div style={{display:"grid",gridTemplateColumns:`64px repeat(${PROFS.length},1fr)`,overflowY:"auto",maxHeight:"calc(100vh - 300px)"}}>

            {/* Coluna de horários */}
            <div>
              {SLOTS.map((s,i)=>{
                const isLunch = LUNCH.includes(s);
                return (
                  <div key={s} style={{height:SLOT_H,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",paddingRight:10,paddingTop:4,borderBottom:`1px solid ${i%2===1?"#fdf4f6":"#fce8ee"}`,background:isLunch?"#fffbeb":"transparent"}}>
                    {i%2===0 && <span style={{fontSize:11,fontWeight:700,color:isLunch?"#d97706":C.gray}}>{s}</span>}
                  </div>
                );
              })}
            </div>

            {/* Coluna de cada profissional */}
            {PROFS.map(prof=>(
              <div key={prof} style={{borderLeft:"1px solid #fce8ee",position:"relative",minHeight:SLOTS.length*SLOT_H}}>
                {/* Slots clicáveis */}
                {SLOTS.map((s,i)=>{
                  const isLunch = LUNCH.includes(s);
                  const isFirst = s === LUNCH[0];
                  return (
                    <div key={s}
                      onClick={()=>!isLunch && setModalNovo({hora:s,profissional:prof})}
                      style={{height:SLOT_H,borderBottom:`1px solid ${i%2===1?"#fdf4f6":"#fce8ee"}`,cursor:isLunch?"default":"pointer",transition:"background .1s",background:isLunch?"#fffbeb":"transparent",position:"relative"}}
                      onMouseEnter={e=>{ if(!isLunch) e.currentTarget.style.background=`${C.primary}08`; }}
                      onMouseLeave={e=>{ if(!isLunch) e.currentTarget.style.background=isLunch?"#fffbeb":"transparent"; }}
                    >
                      {isFirst && prof===PROFS[0] && (
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:1}}>
                          <span style={{fontSize:9,fontWeight:800,color:"#d97706",letterSpacing:1,opacity:0.7}}>☕ ALMOÇO 12h–13h30</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Linha "agora" */}
                {isToday && (() => {
                  const now = new Date();
                  const nowSlot = (now.getHours()-START_H)*2 + (now.getMinutes()>=30?1:0);
                  const frac = (now.getMinutes()%30)/30;
                  if (nowSlot < 0 || nowSlot >= SLOTS.length) return null;
                  return (
                    <div style={{position:"absolute",left:0,right:0,top:nowSlot*SLOT_H+frac*SLOT_H,height:2,background:C.primary,zIndex:20,pointerEvents:"none"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:C.primary,position:"absolute",left:-4,top:-3}}/>
                    </div>
                  );
                })()}

                {/* Agendamentos */}
                {apptsPorProf(prof).map(a=>(
                  <ApptBlock key={a.id} appt={a} onClick={setModalDetalhe}/>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      {modalNovo && (
        <ModalNovoAgendamento
          date={date} hora={modalNovo.hora} profissional={modalNovo.profissional}
          patients={patients} onSave={saveAppt} onClose={()=>setModalNovo(null)}
        />
      )}
      {modalDetalhe && (
        <ModalDetalhe
          appt={modalDetalhe}
          patient={patients.find(p=>p.id===modalDetalhe.patientId)}
          onUpdate={updateAppt} onDelete={deleteAppt} onClose={()=>setModalDetalhe(null)}
        />
      )}
      {modalFechar && (
        <ModalFecharDia
          appts={appts} date={date} onClose={()=>setModalFechar(false)}
        />
      )}
      {modalEspera && (
        <ModalListaEspera onClose={()=>{ setModalEspera(false); refreshQtdEspera(); }}/>
      )}
    </div>
  );
}
