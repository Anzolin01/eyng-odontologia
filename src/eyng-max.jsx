import { useState, useEffect } from "react";

const SP = {
  "Ortodontia":     { from:"#7C3AED", to:"#A78BFA", emoji:"🦷" },
  "Implantodontia": { from:"#0EA5E9", to:"#38BDF8", emoji:"🔩" },
  "Estética":       { from:"#EC4899", to:"#F9A8D4", emoji:"✨" },
  "Prótese":        { from:"#F59E0B", to:"#FCD34D", emoji:"🦷" },
  "Cirurgia":       { from:"#10B981", to:"#6EE7B7", emoji:"⚕️" },
};

const patients = [
  { id:1, name:"Maria Eduarda Conti",    phone:"49998123456", lastVisit:"20/11/2025", nextReturn:"2026-02-20", returnStatus:"overdue",   professional:"Dra. Caroline", specialty:"Ortodontia",     allergies:["Dipirona","Látex"],  notes:[{type:"preference",text:"Prefere WhatsApp, não ligação"},{type:"preference",text:"Não pode seg/qua à tarde"}], treatment:"Ortodontia corretiva — Mês 5 de 24", financialStatus:"Em dia",  balance:0,    avatar:"https://i.pravatar.cc/100?img=47", progress:21 },
  { id:2, name:"João Pedro Almeida",     phone:"49999456789", lastVisit:"10/08/2025", nextReturn:"2025-11-10", returnStatus:"overdue",   professional:"Dr. João Beno", specialty:"Implantodontia", allergies:[],                   notes:[{type:"alert",text:"Diabético tipo 2 — verificar glicemia"},{type:"preference",text:"Só sextas-feiras"}], treatment:"Implante região 36 — osseointegração concluída", financialStatus:"Pendente", balance:1200, avatar:"https://i.pravatar.cc/100?img=68", progress:80 },
  { id:3, name:"Ana Clara Fontana",      phone:"49988342211", lastVisit:"28/03/2026", nextReturn:"2026-09-28", returnStatus:"ok",        professional:"Dra. Caroline", specialty:"Estética",       allergies:["Penicilina"],        notes:[{type:"alert",text:"Bruxismo severo — placa noturna"},{type:"preference",text:"Manhãs cedo"}], treatment:"Clareamento concluído. Acomp. bruxismo semestral", financialStatus:"Em dia",  balance:0,    avatar:"https://i.pravatar.cc/100?img=44", progress:100 },
  { id:4, name:"Carlos Roberto Zanella", phone:"49999017788", lastVisit:"05/10/2025", nextReturn:"2026-01-05", returnStatus:"overdue",   professional:"Dr. João Beno", specialty:"Prótese",        allergies:["Ibuprofeno"],        notes:[{type:"alert",text:"Hipertenso — Losartana 50mg"},{type:"preference",text:"WhatsApp da esposa: 49999018899"}], treatment:"PPR superior — paciente não retornou para prova final", financialStatus:"Pendente", balance:800, avatar:"https://i.pravatar.cc/100?img=52", progress:60 },
  { id:5, name:"Letícia Bortolini",      phone:"49988765544", lastVisit:"02/04/2026", nextReturn:"2026-07-02", returnStatus:"ok",        professional:"Dra. Caroline", specialty:"Ortodontia",     allergies:[],                   notes:[{type:"preference",text:"Menor — responsável: mãe Fernanda"},{type:"alert",text:"Mãe ansiosa — explicar com calma"}], treatment:"Ortodontia interceptiva — Mês 5 de 18", financialStatus:"Em dia",  balance:0,    avatar:"https://i.pravatar.cc/100?img=45", progress:28 },
  { id:6, name:"Ricardo H. Moraes",      phone:"49999231122", lastVisit:"10/01/2026", nextReturn:"2026-04-10", returnStatus:"due_today", professional:"Dr. João Beno", specialty:"Cirurgia",       allergies:["AAS"],              notes:[{type:"preference",text:"Só 8h–11h"},{type:"alert",text:"Tabagista — orientar cicatrização"}], treatment:"Pós-op exodontia de sisos — avaliação final", financialStatus:"Em dia",  balance:0,    avatar:"https://i.pravatar.cc/100?img=59", progress:90 },
];

const getDays = d => Math.ceil((new Date(d) - new Date("2026-04-10")) / 86400000);

const BTN = ({ label, icon, color, bg, onClick, small }) => (
  <button onClick={e => { e.stopPropagation(); onClick && onClick(); }} style={{
    background: bg || color, color: bg ? color : "#fff",
    border: bg ? `1.5px solid ${color}33` : "none",
    borderRadius: small ? 10 : 12,
    padding: small ? "6px 12px" : "9px 16px",
    fontSize: small ? 11 : 12, fontWeight: 700,
    fontFamily:"'Nunito',sans-serif", cursor:"pointer",
    display:"flex", alignItems:"center", gap:5,
    whiteSpace:"nowrap",
    boxShadow: bg ? "none" : `0 4px 12px ${color}44`,
    transition:"all 0.18s",
  }}>
    <span style={{fontSize: small ? 12 : 14}}>{icon}</span> {label}
  </button>
);

function Splash({ onDone }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(()=>setP(1),200), setTimeout(()=>setP(2),700),
      setTimeout(()=>setP(3),1300), setTimeout(()=>onDone(),2400),
    ];
    return () => t.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Cormorant+Garamond:wght@400;600&display=swap');
        @keyframes pop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse2{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
      <div style={{ width:80,height:80,borderRadius:24,background:"rgba(255,255,255,0.95)",
        display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24,
        animation:p>=1?"pop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards, pulse2 2s ease-in-out 1s infinite":"none",
        opacity:p>=1?1:0, boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <span style={{fontSize:36,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:"#764ba2"}}>E</span>
      </div>
      <div style={{opacity:p>=2?1:0,transform:p>=2?"translateY(0)":"translateY(12px)",transition:"all 0.5s ease",textAlign:"center"}}>
        <div style={{fontSize:30,fontWeight:900,color:"#fff",fontFamily:"'Nunito',sans-serif",letterSpacing:1}}>Eyng</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",fontFamily:"'Nunito',sans-serif",fontWeight:600,letterSpacing:2}}>Odontologia</div>
      </div>
      <div style={{marginTop:24,opacity:p>=3?1:0,transition:"opacity 0.4s ease 0.2s",
        background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"6px 20px"}}>
        <span style={{color:"#fff",fontSize:12,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>Plataforma de Gestão Inteligente ✨</span>
      </div>
    </div>
  );
}

function CircleProgress({ value, color, size=44 }) {
  const r = size/2-5; const circ = 2*Math.PI*r; const dash = (value/100)*circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={4}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
    </svg>
  );
}

function QuickActions({ overdue, pending }) {
  return (
    <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4,marginBottom:20}}>
      {[
        {icon:"⏰", label:"Ver atrasados", color:"#EF4444", count:overdue},
        {icon:"💰", label:"Cobranças", color:"#F59E0B", count:pending},
        {icon:"📅", label:"Agenda hoje", color:"#7C3AED", count:1},
        {icon:"➕", label:"Novo paciente", color:"#10B981", count:null},
        {icon:"📊", label:"Relatório", color:"#0EA5E9", count:null},
      ].map((a,i) => (
        <div key={i} style={{
          background:"#fff", borderRadius:16, padding:"12px 16px",
          display:"flex",flexDirection:"column",alignItems:"center",gap:6,
          minWidth:80, boxShadow:"0 2px 12px rgba(0,0,0,0.07)", cursor:"pointer",
          border:`1.5px solid ${a.color}22`,
          transition:"all 0.2s", flexShrink:0,
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 24px ${a.color}33`;}}
          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.07)";}}>
          <div style={{position:"relative"}}>
            <span style={{fontSize:22}}>{a.icon}</span>
            {a.count != null && (
              <div style={{position:"absolute",top:-4,right:-8,background:a.color,color:"#fff",
                borderRadius:10,fontSize:9,fontWeight:800,padding:"1px 5px",fontFamily:"'Nunito',sans-serif"}}>
                {a.count}
              </div>
            )}
          </div>
          <div style={{fontSize:10,fontWeight:700,color:"#64748b",fontFamily:"'Nunito',sans-serif",textAlign:"center",lineHeight:1.2}}>
            {a.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function PatientCard({ p, onClick, index }) {
  const [hov, setHov] = useState(false);
  const sp = SP[p.specialty] || SP["Ortodontia"];
  const days = getDays(p.nextReturn);
  const isOverdue = p.returnStatus==="overdue";
  const isToday = p.returnStatus==="due_today";
  const stCfg = isOverdue
    ? {bg:"#FEF2F2", badge:"#EF4444", text:`Atrasado ${Math.abs(days)}d`}
    : isToday ? {bg:"#FFFBEB", badge:"#F59E0B", text:"Hoje!"}
    : {bg:"#F0FDF4", badge:"#10B981", text:`Em ${days}d`};

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background:"#fff", borderRadius:20, overflow:"hidden",
        boxShadow:hov?"0 16px 48px rgba(0,0,0,0.14)":"0 4px 16px rgba(0,0,0,0.07)",
        transform:hov?"translateY(-3px)":"translateY(0)",
        transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        cursor:"pointer",
        animation:`cardIn 0.4s ease ${index*0.07}s both`,
      }}>

      <div onClick={onClick}
        style={{background:`linear-gradient(135deg,${sp.from},${sp.to})`, padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src={p.avatar} alt={p.name}
              style={{width:46,height:46,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,0.85)",objectFit:"cover"}}/>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:"#fff",fontFamily:"'Nunito',sans-serif",lineHeight:1.2}}>{p.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.85)",fontFamily:"'Nunito',sans-serif",marginTop:2}}>
                {sp.emoji} {p.specialty} · {p.professional}
              </div>
            </div>
          </div>
          <div style={{textAlign:"center"}}>
            <CircleProgress value={p.progress} color="rgba(255,255,255,0.9)" size={44}/>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.9)",fontFamily:"'Nunito',sans-serif",fontWeight:800,marginTop:-4}}>{p.progress}%</div>
          </div>
        </div>
      </div>

      <div style={{padding:"10px 18px 0", background:stCfg.bg, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
        <span style={{background:stCfg.badge,color:"#fff",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>
          {stCfg.text}
        </span>
        {p.allergies.length>0 && (
          <span style={{background:"#FEE2E2",color:"#DC2626",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>
            ⚠ {p.allergies.join(", ")}
          </span>
        )}
        {p.financialStatus==="Pendente" && (
          <span style={{background:"#FEF3C7",color:"#D97706",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>
            💰 R$ {p.balance.toLocaleString("pt-BR")}
          </span>
        )}
      </div>

      {p.notes.find(n=>n.type==="preference") && (
        <div style={{padding:"8px 18px 0",background:stCfg.bg}}>
          <div style={{fontSize:11,color:"#64748b",fontFamily:"'Nunito',sans-serif",fontStyle:"italic",display:"flex",gap:4,alignItems:"flex-start"}}>
            <span>💡</span>
            <span>{p.notes.find(n=>n.type==="preference").text}</span>
          </div>
        </div>
      )}

      <div style={{padding:"12px 18px 14px",background:stCfg.bg,display:"flex",gap:8,flexWrap:"wrap"}}>
        <BTN small label="WhatsApp" icon="💬" color="#25D366"
          onClick={()=>window.open(`https://wa.me/55${p.phone.replace(/\D/g,"")}?text=Olá ${p.name.split(" ")[0]}, tudo bem? Entramos em contato para agendar seu retorno na Eyng Odontologia 😊`)}/>
        <BTN small label="Ligar" icon="📞" color="#0EA5E9"
          onClick={()=>window.open(`tel:${p.phone.replace(/\D/g,"")}`)}/>
        <BTN small label="Agendar" icon="📅" color="#7C3AED"
          onClick={()=>{}}/>
        {isOverdue && <BTN small label="Enviar lembrete" icon="🔔" color="#EF4444" onClick={()=>{}}/>}
        {p.financialStatus==="Pendente" && <BTN small label="Cobrar" icon="💰" color="#F59E0B" onClick={()=>{}}/>}
      </div>
    </div>
  );
}

function PatientDetail({ p, onBack }) {
  const [tab, setTab] = useState("info");
  const sp = SP[p.specialty] || SP["Ortodontia"];
  const isOverdue = p.returnStatus==="overdue";
  const isToday = p.returnStatus==="due_today";

  return (
    <div style={{animation:"slideUp 0.35s ease"}}>
      <button onClick={onBack} style={{
        background:"none",border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",gap:6,
        fontSize:13,fontWeight:800,color:"#7C3AED",
        fontFamily:"'Nunito',sans-serif",marginBottom:20,padding:0,
      }}>← Voltar</button>

      <div style={{
        background:`linear-gradient(135deg,${sp.from},${sp.to})`,
        borderRadius:24,padding:"22px 22px 18px",marginBottom:16,
        boxShadow:`0 12px 40px ${sp.from}44`,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
          <img src={p.avatar} alt={p.name}
            style={{width:72,height:72,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.9)",objectFit:"cover"}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"'Nunito',sans-serif"}}>{p.name}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",fontFamily:"'Nunito',sans-serif",marginTop:2}}>{sp.emoji} {p.specialty}</div>
            <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
              {p.allergies.map((a,i)=>(
                <span key={i} style={{background:"rgba(255,255,255,0.2)",color:"#fff",
                  padding:"2px 10px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>
                  ⚠ {a}
                </span>
              ))}
              {p.financialStatus==="Pendente" && (
                <span style={{background:"#FEF3C7",color:"#D97706",
                  padding:"2px 10px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>
                  💰 R$ {p.balance.toLocaleString("pt-BR")}
                </span>
              )}
            </div>
          </div>
          <div style={{textAlign:"center"}}>
            <CircleProgress value={p.progress} color="rgba(255,255,255,0.9)" size={52}/>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontFamily:"'Nunito',sans-serif",fontWeight:800,marginTop:-6}}>{p.progress}%</div>
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.8)",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>PROGRESSO DO TRATAMENTO</span>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.9)",fontFamily:"'Nunito',sans-serif",fontWeight:800}}>{p.progress}%</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.2)",borderRadius:10,height:8}}>
            <div style={{width:`${p.progress}%`,height:"100%",background:"#fff",borderRadius:10}}/>
          </div>
        </div>

        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <BTN label="WhatsApp" icon="💬" color="#25D366"
            onClick={()=>window.open(`https://wa.me/55${p.phone.replace(/\D/g,"")}?text=Olá ${p.name.split(" ")[0]}, tudo bem? Entramos em contato para agendar seu retorno na Eyng Odontologia 😊`)}/>
          <BTN label="Ligar" icon="📞" color="#0EA5E9"
            onClick={()=>window.open(`tel:${p.phone.replace(/\D/g,"")}`)}/>
          <BTN label="Agendar" icon="📅" color="rgba(255,255,255,0.9)" bg="rgba(255,255,255,0.15)"
            onClick={()=>{}}/>
          {(isOverdue||isToday) && (
            <BTN label="Enviar lembrete" icon="🔔" color="rgba(255,255,255,0.9)" bg="rgba(255,255,255,0.15)"
              onClick={()=>{}}/>
          )}
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["info","📋 Prontuário"],["notas","💡 Notas"],["contato","📞 Contato"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:"10px",borderRadius:14,border:"none",cursor:"pointer",
            background:tab===t?`linear-gradient(135deg,${sp.from},${sp.to})`:"#f1f5f9",
            color:tab===t?"#fff":"#64748b",
            fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif",
            boxShadow:tab===t?`0 4px 16px ${sp.from}44`:"none",
            transition:"all 0.2s",
          }}>{l}</button>
        ))}
      </div>

      {tab==="info" && (
        <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeIn 0.3s ease"}}>
          <div style={{background:"#fff",borderRadius:16,padding:"16px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:10,color:"#94a3b8",fontFamily:"'Nunito',sans-serif",fontWeight:800,marginBottom:8,letterSpacing:1}}>📋 PLANO DE TRATAMENTO</div>
            <div style={{fontSize:14,color:"#334155",fontFamily:"'Nunito',sans-serif",lineHeight:1.7}}>{p.treatment}</div>
          </div>
          <div style={{background:"#fff",borderRadius:16,padding:"16px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:10,color:"#94a3b8",fontFamily:"'Nunito',sans-serif",fontWeight:800,marginBottom:8,letterSpacing:1}}>📅 ÚLTIMO ATENDIMENTO</div>
            <div style={{fontSize:14,color:"#334155",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{p.lastVisit}</div>
          </div>
          {p.financialStatus==="Pendente" && (
            <div style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:16,padding:"16px 18px"}}>
              <div style={{fontSize:10,color:"#D97706",fontFamily:"'Nunito',sans-serif",fontWeight:800,marginBottom:8,letterSpacing:1}}>💰 PENDÊNCIA FINANCEIRA</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:22,fontWeight:900,color:"#D97706",fontFamily:"'Nunito',sans-serif"}}>R$ {p.balance.toLocaleString("pt-BR")}</span>
                <BTN label="Cobrar agora" icon="💬" color="#F59E0B" onClick={()=>window.open(`https://wa.me/55${p.phone.replace(/\D/g,"")}?text=Olá ${p.name.split(" ")[0]}, temos um valor em aberto de R$ ${p.balance} referente ao seu tratamento. Podemos conversar?`)}/>
              </div>
            </div>
          )}
        </div>
      )}

      {tab==="notas" && (
        <div style={{display:"flex",flexDirection:"column",gap:10,animation:"fadeIn 0.3s ease"}}>
          {p.notes.map((n,i)=>(
            <div key={i} style={{
              background:n.type==="alert"?"#FFFBEB":"#F0F9FF",
              border:`1.5px solid ${n.type==="alert"?"#FCD34D":"#BAE6FD"}`,
              borderRadius:16,padding:"14px 16px",
            }}>
              <div style={{fontSize:10,fontWeight:800,fontFamily:"'Nunito',sans-serif",
                color:n.type==="alert"?"#D97706":"#0EA5E9",marginBottom:6,letterSpacing:0.5}}>
                {n.type==="alert"?"⚡ ALERTA":"💡 PREFERÊNCIA"}
              </div>
              <div style={{fontSize:13,color:"#334155",fontFamily:"'Nunito',sans-serif",lineHeight:1.6}}>{n.text}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="contato" && (
        <div style={{display:"flex",flexDirection:"column",gap:10,animation:"fadeIn 0.3s ease"}}>
          {[
            {icon:"💬",label:"Abrir WhatsApp",color:"#25D366",action:()=>window.open(`https://wa.me/55${p.phone.replace(/\D/g,"")}?text=Olá ${p.name.split(" ")[0]}, tudo bem? Entramos em contato para agendar seu retorno na Eyng Odontologia 😊`)},
            {icon:"📞",label:"Ligar agora",color:"#0EA5E9",action:()=>window.open(`tel:${p.phone.replace(/\D/g,"")}`)}  ,
            {icon:"🔔",label:"Enviar lembrete de retorno",color:"#7C3AED",action:()=>window.open(`https://wa.me/55${p.phone.replace(/\D/g,"")}?text=Olá ${p.name.split(" ")[0]}, temos um retorno agendado para você na Eyng Odontologia! Vamos confirmar? 😊`)},
            {icon:"📋",label:"Enviar orientações pós-consulta",color:"#EC4899",action:()=>{}},
          ].map((a,i)=>(
            <button key={i} onClick={a.action} style={{
              background:"#fff",border:`2px solid ${a.color}22`,borderRadius:16,padding:"16px 18px",
              display:"flex",alignItems:"center",gap:14,cursor:"pointer",
              boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
              transition:"all 0.2s",fontFamily:"'Nunito',sans-serif",
              textAlign:"left",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background=`${a.color}08`;e.currentTarget.style.borderColor=`${a.color}55`;}}
              onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=`${a.color}22`;}}>
              <div style={{width:44,height:44,borderRadius:14,background:`${a.color}15`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                {a.icon}
              </div>
              <div style={{fontSize:14,fontWeight:700,color:"#334155"}}>{a.label}</div>
              <div style={{marginLeft:"auto",color:a.color,fontSize:16}}>→</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EyngMax() {
  const [splash, setSplash] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const overdue = patients.filter(p=>p.returnStatus==="overdue"||p.returnStatus==="due_today").length;
  const pending  = patients.filter(p=>p.financialStatus==="Pendente").length;

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const m = p.name.toLowerCase().includes(q)||p.specialty.toLowerCase().includes(q)||p.professional.toLowerCase().includes(q);
    if(filter==="overdue")   return m&&(p.returnStatus==="overdue"||p.returnStatus==="due_today");
    if(filter==="pending")   return m&&p.financialStatus==="Pendente";
    if(filter==="caroline")  return m&&p.professional==="Dra. Caroline";
    if(filter==="joao")      return m&&p.professional==="Dr. João Beno";
    return m;
  });

  if(splash) return <Splash onDone={()=>setSplash(false)}/>;

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Nunito',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Cormorant+Garamond:wght@400;600&display=swap');
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#c4b5fd;border-radius:10px;}
        input::placeholder{color:#cbd5e1;}
      `}</style>

      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
        padding:"18px 24px 22px",
        boxShadow:"0 4px 24px rgba(102,126,234,0.45)",
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,borderRadius:14,background:"rgba(255,255,255,0.95)",
              display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>
              <span style={{fontSize:20,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:"#764ba2"}}>E</span>
            </div>
            <div>
              <div style={{fontSize:20,fontWeight:900,color:"#fff",lineHeight:1}}>Eyng</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",letterSpacing:1,fontWeight:700}}>ODONTOLOGIA</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 12px",
              fontSize:11,color:"#fff",fontWeight:700}}>
              10 · 04 · 2026
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[
            {v:patients.length, l:"Pacientes",  c:"#7C3AED", icon:"👥"},
            {v:overdue,         l:"Atrasados",  c:"#EF4444", icon:"⏰"},
            {v:pending,         l:"Pendências", c:"#F59E0B", icon:"💰"},
          ].map((s,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.95)",borderRadius:16,padding:"12px 10px",
              textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}>
              <div style={{fontSize:18,marginBottom:2}}>{s.icon}</div>
              <div style={{fontSize:22,fontWeight:900,color:s.c,lineHeight:1,fontFamily:"'Nunito',sans-serif"}}>{s.v}</div>
              <div style={{fontSize:9,color:"#94a3b8",fontWeight:700,letterSpacing:0.5,marginTop:2}}>{s.l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"20px 16px"}}>
        {selected ? (
          <PatientDetail p={selected} onBack={()=>setSelected(null)}/>
        ) : (
          <>
            <QuickActions overdue={overdue} pending={pending}/>

            <div style={{background:"#fff",borderRadius:16,padding:"10px 16px",
              display:"flex",alignItems:"center",gap:10,
              boxShadow:"0 2px 12px rgba(0,0,0,0.06)",marginBottom:14}}>
              <span style={{fontSize:16,color:"#94a3b8"}}>🔍</span>
              <input type="text" placeholder="Buscar paciente..."
                value={search} onChange={e=>setSearch(e.target.value)}
                style={{border:"none",outline:"none",fontSize:14,width:"100%",
                  color:"#334155",fontFamily:"'Nunito',sans-serif"}}/>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
              {[
                {id:"all",      label:`Todos (${patients.length})`, color:"#7C3AED"},
                {id:"overdue",  label:`⏰ Atrasados (${overdue})`,  color:"#EF4444"},
                {id:"pending",  label:`💰 Cobranças (${pending})`,  color:"#F59E0B"},
                {id:"caroline", label:"👩‍⚕️ Dra. Caroline",          color:"#EC4899"},
                {id:"joao",     label:"👨‍⚕️ Dr. João Beno",           color:"#0EA5E9"},
              ].map(f=>(
                <button key={f.id} onClick={()=>setFilter(f.id)} style={{
                  padding:"7px 16px",borderRadius:20,
                  border:filter===f.id?"none":"1.5px solid #e2e8f0",
                  background:filter===f.id?f.color:"#fff",
                  color:filter===f.id?"#fff":"#64748b",
                  fontSize:12,fontWeight:700,cursor:"pointer",
                  fontFamily:"'Nunito',sans-serif",
                  boxShadow:filter===f.id?`0 4px 14px ${f.color}44`:"none",
                  transition:"all 0.2s",
                }}>{f.label}</button>
              ))}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {filtered.map((p,i)=>(
                <PatientCard key={p.id} p={p} onClick={()=>setSelected(p)} index={i}/>
              ))}
            </div>

            {filtered.length===0 && (
              <div style={{textAlign:"center",padding:48,color:"#94a3b8",fontSize:15}}>
                Nenhum paciente encontrado.
              </div>
            )}
          </>
        )}
      </div>

      <div style={{textAlign:"center",padding:"20px 16px",borderTop:"1px solid #f1f5f9",marginTop:20,
        fontSize:11,color:"#cbd5e1",fontWeight:700,letterSpacing:1}}>
        EYNG ODONTOLOGIA · PLATAFORMA DE GESTÃO INTELIGENTE
      </div>
    </div>
  );
}
