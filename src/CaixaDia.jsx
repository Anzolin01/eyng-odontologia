import { useState, useMemo } from "react";
import { SERVICOS, CATEGORIAS } from "./servicos";
import { FORMAS } from "./FinanceiroModule";

const C = {
  primary: "#c45f82", dark: "#8b3458", bg: "#fdf4f6", bgMed: "#fce8ee",
  text: "#4a2c3a", textLight: "#8b3458", green: "#16a34a",
  red: "#dc2626", yellow: "#d97706", gray: "#94a3b8",
};

const uid  = () => Math.random().toString(36).slice(2, 9);
const brl  = (v) => `R$ ${Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
const fmt  = (s) => { if(!s) return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; };
const now  = () => new Date().toISOString().split("T")[0];
const hora = () => new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});

// Passos do fluxo
const STEPS = ["paciente","servico","pagamento","conferencia","confirmado"];

function StepBar({ step }) {
  const labels = ["1. Paciente","2. Serviço","3. Pagamento","4. Conferência","✓ Pronto"];
  return (
    <div style={{display:"flex",gap:0,marginBottom:24}}>
      {labels.map((l,i)=>{
        const done    = STEPS.indexOf(step) > i;
        const current = STEPS[i] === step;
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:"100%",height:4,background: done||current ? C.primary : "#fce8ee",borderRadius:2,transition:"background .3s"}}/>
            <span style={{fontSize:9,fontWeight:700,color: current ? C.primary : done ? C.dark : C.gray,fontFamily:"Nunito,sans-serif"}}>{l}</span>
          </div>
        );
      })}
    </div>
  );
}

function Card({ children, style={} }) {
  return <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 2px 16px rgba(196,95,130,0.1)",...style}}>{children}</div>;
}

function BtnPrim({ label, onClick, disabled, icon }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{background:`linear-gradient(135deg,${C.primary},${C.dark})`,color:"#fff",border:"none",borderRadius:12,padding:"12px 24px",fontSize:14,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,display:"flex",alignItems:"center",gap:8}}>
      {icon && <span>{icon}</span>}{label}
    </button>
  );
}
function BtnSec({ label, onClick }) {
  return <button onClick={onClick} style={{background:C.bgMed,color:C.dark,border:"none",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>{label}</button>;
}

// ── PASSO 1: Selecionar paciente ──
function StepPaciente({ patients, onSelect }) {
  const [q, setQ] = useState("");
  const filtered = q.length >= 1
    ? patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q))
    : [];

  return (
    <Card>
      <div style={{fontSize:11,fontWeight:800,color:C.textLight,letterSpacing:1,marginBottom:16}}>QUEM ESTÁ PAGANDO?</div>
      <input
        autoFocus
        placeholder="Digite o nome ou telefone do paciente..."
        value={q} onChange={e=>setQ(e.target.value)}
        style={{width:"100%",border:`1.5px solid #f0d6df`,borderRadius:12,padding:"12px 16px",fontSize:14,fontFamily:"Nunito,sans-serif",color:C.text,outline:"none",marginBottom:12,background:"#fff"}}
      />
      {filtered.map(p => (
        <div key={p.id} onClick={()=>onSelect(p)}
          style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:12,cursor:"pointer",border:`1.5px solid #fce8ee`,marginBottom:8,transition:"all .15s",background:C.bg}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.primary}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#fce8ee"}>
          <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.dark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0}}>
            {p.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:C.text}}>{p.name}</div>
            <div style={{fontSize:11,color:C.gray}}>{p.specialty} · {p.professional} · {p.phone}</div>
          </div>
        </div>
      ))}
      {q.length >= 1 && filtered.length === 0 && (
        <div style={{textAlign:"center",padding:20,color:C.gray,fontSize:13}}>Nenhum paciente encontrado.</div>
      )}
    </Card>
  );
}

// ── PASSO 2: Selecionar serviço ──
function StepServico({ patient, onSelect, onBack }) {
  const [catFiltro, setCatFiltro] = useState("Todos");
  const [custom, setCustom] = useState({ desc:"", valor:"" });
  const [modo, setModo] = useState("lista"); // "lista" | "custom"

  const cats = ["Todos", ...CATEGORIAS];
  const lista = catFiltro === "Todos" ? SERVICOS : SERVICOS.filter(s=>s.categoria===catFiltro);

  return (
    <Card>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div style={{fontSize:11,fontWeight:800,color:C.textLight,letterSpacing:1}}>SERVIÇO PRESTADO</div>
          <div style={{fontSize:12,color:C.gray,marginTop:2}}>Paciente: <strong style={{color:C.text}}>{patient.name}</strong></div>
        </div>
        <BtnSec label="← Voltar" onClick={onBack}/>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>{setCatFiltro(c);setModo("lista")}} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",background:catFiltro===c&&modo==="lista"?C.primary:C.bgMed,color:catFiltro===c&&modo==="lista"?"#fff":C.dark,fontSize:11,fontWeight:700,fontFamily:"Nunito,sans-serif"}}>{c}</button>
        ))}
        <button onClick={()=>setModo("custom")} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",background:modo==="custom"?C.primary:C.bgMed,color:modo==="custom"?"#fff":C.dark,fontSize:11,fontWeight:700,fontFamily:"Nunito,sans-serif"}}>✏️ Outro...</button>
      </div>

      {modo === "lista" ? (
        <div style={{maxHeight:340,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
          {lista.map(s=>(
            <div key={s.id} onClick={()=>onSelect({desc:s.desc,valor:s.valor,servicoId:s.id})}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 16px",borderRadius:12,cursor:"pointer",border:`1.5px solid #fce8ee`,transition:"all .15s",background:"#fff"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.background=C.bg;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#fce8ee";e.currentTarget.style.background="#fff";}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{s.desc}</div>
                <div style={{fontSize:10,color:C.gray,marginTop:1}}>{s.categoria}</div>
              </div>
              <div style={{fontSize:15,fontWeight:900,color:C.primary,flexShrink:0}}>{brl(s.valor)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input placeholder="Descrição do serviço..." value={custom.desc} onChange={e=>setCustom(f=>({...f,desc:e.target.value}))}
            style={{border:`1.5px solid #f0d6df`,borderRadius:12,padding:"11px 14px",fontSize:13,fontFamily:"Nunito,sans-serif",color:C.text,outline:"none"}}/>
          <input placeholder="Valor (R$)" type="number" value={custom.valor} onChange={e=>setCustom(f=>({...f,valor:e.target.value}))}
            style={{border:`1.5px solid #f0d6df`,borderRadius:12,padding:"11px 14px",fontSize:13,fontFamily:"Nunito,sans-serif",color:C.text,outline:"none"}}/>
          <BtnPrim label="Continuar →" disabled={!custom.desc||!custom.valor} onClick={()=>onSelect({desc:custom.desc,valor:parseFloat(custom.valor),servicoId:"custom"})}/>
        </div>
      )}
    </Card>
  );
}

// ── PASSO 3: Forma de pagamento ──
function StepPagamento({ patient, servico, onSelect, onBack }) {
  const [forma, setForma]   = useState("pix");
  const [valor, setValor]   = useState(servico.valor);
  const [parcelas, setParcelas] = useState(1);
  const [obs, setObs]       = useState("");

  return (
    <Card>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontSize:11,fontWeight:800,color:C.textLight,letterSpacing:1}}>FORMA DE PAGAMENTO</div>
          <div style={{fontSize:12,color:C.gray,marginTop:2}}>{patient.name} · {servico.desc}</div>
        </div>
        <BtnSec label="← Voltar" onClick={onBack}/>
      </div>

      {/* Valor */}
      <div style={{background:C.bg,borderRadius:12,padding:"14px 18px",marginBottom:20,textAlign:"center"}}>
        <div style={{fontSize:11,color:C.gray,fontWeight:700,marginBottom:4}}>VALOR A RECEBER</div>
        <input type="number" value={valor} onChange={e=>setValor(parseFloat(e.target.value)||0)}
          style={{border:"none",background:"transparent",fontSize:28,fontWeight:900,color:C.primary,textAlign:"center",fontFamily:"Nunito,sans-serif",width:"100%",outline:"none"}}/>
        <div style={{fontSize:10,color:C.gray}}>Clique para editar se necessário</div>
      </div>

      {/* Formas */}
      <div style={{fontSize:11,fontWeight:800,color:C.textLight,letterSpacing:1,marginBottom:10}}>FORMA DE PAGAMENTO</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {Object.entries(FORMAS).map(([k,f])=>(
          <button key={k} onClick={()=>setForma(k)} style={{
            padding:"14px 12px",borderRadius:12,border:`2px solid ${forma===k?f.color:"#fce8ee"}`,cursor:"pointer",
            background:forma===k?`${f.color}18`:"#fff",
            display:"flex",alignItems:"center",gap:10,transition:"all .15s",fontFamily:"Nunito,sans-serif",
          }}>
            <span style={{fontSize:22}}>{f.icon}</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:800,color:forma===k?f.color:C.text}}>{f.label}</div>
            </div>
            {forma===k && <span style={{marginLeft:"auto",color:f.color,fontWeight:800}}>✓</span>}
          </button>
        ))}
      </div>

      {/* Parcelas cartão */}
      {(forma==="cartao_credito") && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:800,color:C.textLight,letterSpacing:1,marginBottom:8}}>PARCELAS</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[1,2,3,4,6,10,12].map(n=>(
              <button key={n} onClick={()=>setParcelas(n)} style={{padding:"7px 14px",borderRadius:10,border:"none",cursor:"pointer",background:parcelas===n?C.primary:C.bgMed,color:parcelas===n?"#fff":C.dark,fontSize:12,fontWeight:700,fontFamily:"Nunito,sans-serif"}}>
                {n===1?"À vista":`${n}×`}
              </button>
            ))}
          </div>
          {parcelas > 1 && <div style={{marginTop:8,fontSize:12,color:C.gray}}>= {brl(valor/parcelas)} por parcela</div>}
        </div>
      )}

      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:800,color:C.textLight,letterSpacing:1,marginBottom:8}}>OBSERVAÇÃO (opcional)</div>
        <input placeholder="Ex: paciente pagou entrada, saldo em 3x..." value={obs} onChange={e=>setObs(e.target.value)}
          style={{width:"100%",border:`1.5px solid #f0d6df`,borderRadius:12,padding:"10px 14px",fontSize:13,fontFamily:"Nunito,sans-serif",color:C.text,outline:"none"}}/>
      </div>

      <BtnPrim label="Revisar antes de confirmar →" onClick={()=>onSelect({forma,valor,parcelas,obs})} icon="👁"/>
    </Card>
  );
}

// ── PASSO 4: Conferência antes da NF ──
function StepConferencia({ patient, servico, pagamento, onConfirm, onBack }) {
  const [nfChecked, setNfChecked] = useState(false);
  const f = FORMAS[pagamento.forma];

  return (
    <Card>
      <div style={{background:"#fff8e1",border:"2px solid #fcd34d",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",gap:12,alignItems:"flex-start"}}>
        <span style={{fontSize:22,flexShrink:0}}>⚠️</span>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:"#92400e",marginBottom:4}}>ANTES DE CONFIRMAR — Verifique a Nota Fiscal</div>
          <div style={{fontSize:12,color:"#a16207",lineHeight:1.6}}>
            Confira os dados abaixo com exatidão. Eles serão usados na NFS-e da Prefeitura de Chapecó. Um erro aqui gera problema na contabilidade.
          </div>
        </div>
      </div>

      {/* Dados para conferência */}
      <div style={{background:C.bg,borderRadius:14,padding:18,marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:800,color:C.textLight,letterSpacing:1,marginBottom:14}}>📋 DADOS DO RECEBIMENTO</div>
        {[
          ["Paciente",          patient.name],
          ["Serviço prestado",  servico.desc],
          ["Profissional",      patient.professional],
          ["Valor recebido",    brl(pagamento.valor)],
          ["Forma de pagamento",`${f.icon} ${f.label}${pagamento.parcelas>1?` · ${pagamento.parcelas}×`:""}` ],
          ["Data",              fmt(now())],
          ...(pagamento.obs ? [["Observação", pagamento.obs]] : []),
        ].map(([k,v])=>(
          <div key={k} style={{display:"flex",gap:12,paddingBottom:10,marginBottom:10,borderBottom:"1px solid #fce8ee"}}>
            <div style={{width:140,fontSize:11,fontWeight:700,color:C.gray,flexShrink:0}}>{k}</div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Checkbox de confirmação */}
      <div onClick={()=>setNfChecked(v=>!v)}
        style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderRadius:14,border:`2px solid ${nfChecked?C.green:"#fce8ee"}`,cursor:"pointer",background:nfChecked?"#f0fdf4":"#fff",marginBottom:20,transition:"all .2s"}}>
        <div style={{width:24,height:24,borderRadius:6,border:`2px solid ${nfChecked?C.green:C.gray}`,background:nfChecked?C.green:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
          {nfChecked && <span style={{color:"#fff",fontSize:14,fontWeight:900}}>✓</span>}
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:nfChecked?C.green:C.text}}>
            Conferí os dados — estão corretos para emissão da NF
          </div>
          <div style={{fontSize:11,color:C.gray,marginTop:2}}>Emita a nota no site da prefeitura com esses dados</div>
        </div>
      </div>

      {!nfChecked && (
        <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:C.red,fontWeight:600}}>
          ☝️ Confirme que verificou os dados antes de prosseguir.
        </div>
      )}

      <div style={{display:"flex",gap:12,justifyContent:"space-between"}}>
        <BtnSec label="← Corrigir" onClick={onBack}/>
        <BtnPrim label="✅ Confirmar Recebimento" disabled={!nfChecked} onClick={onConfirm}/>
      </div>
    </Card>
  );
}

// ── PASSO 5: Confirmado ──
function StepConfirmado({ patient, servico, pagamento, onNovo, onFechar }) {
  const f = FORMAS[pagamento.forma];
  return (
    <Card style={{textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:8}}>🎉</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:22,color:C.dark,marginBottom:4}}>Recebimento confirmado!</div>
      <div style={{fontSize:13,color:C.gray,marginBottom:24}}>{patient.name} · {brl(pagamento.valor)} · {f.icon} {f.label}</div>

      <div style={{background:"#fff8e1",border:"1px solid #fcd34d",borderRadius:12,padding:"12px 16px",marginBottom:24,textAlign:"left"}}>
        <div style={{fontSize:12,fontWeight:800,color:"#92400e",marginBottom:4}}>📄 Emita agora a Nota Fiscal</div>
        <div style={{fontSize:12,color:"#a16207",lineHeight:1.6,marginBottom:10}}>
          Acesse o portal da prefeitura e emita a NFS-e com os dados conferidos.<br/>
          <strong>Serviço:</strong> {servico.desc}<br/>
          <strong>Valor:</strong> {brl(pagamento.valor)}<br/>
          <strong>Paciente:</strong> {patient.name}
        </div>
        <a href="https://chapeco.atende.net/autoatendimento/servicos/emissao-de-nota-fiscal-de-servico-eletronico-nfs-e" target="_blank" rel="noopener noreferrer"
          style={{display:"inline-flex",alignItems:"center",gap:6,background:"#f59e0b",color:"#fff",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:800,textDecoration:"none"}}>
          🏛️ Abrir Portal Chapecó →
        </a>
      </div>

      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <BtnSec label="Fechar" onClick={onFechar}/>
        <BtnPrim label="+ Novo recebimento" onClick={onNovo} icon="💸"/>
      </div>
    </Card>
  );
}

// ── Lista do dia ──
function ListaDia({ patients }) {
  const today = now();
  const recebimentos = [];

  patients.forEach(p => {
    (p.financeiro?.pagamentos || []).forEach(pg => {
      if (pg.data === today) {
        recebimentos.push({ ...pg, patientName: p.name, professional: p.professional });
      }
    });
  });

  recebimentos.sort((a,b) => (b.hora||"").localeCompare(a.hora||""));

  const total = recebimentos.reduce((s,r) => s+r.valor, 0);
  const porForma = {};
  recebimentos.forEach(r => { porForma[r.forma] = (porForma[r.forma]||0) + r.valor; });

  if (recebimentos.length === 0) return (
    <div style={{textAlign:"center",padding:"32px 0",color:C.gray,fontSize:13}}>
      <div style={{fontSize:40,marginBottom:8}}>💸</div>
      Nenhum recebimento registrado hoje ainda.
    </div>
  );

  return (
    <div>
      {/* Total do dia */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${Object.keys(porForma).length+1},1fr)`,gap:10,marginBottom:16}}>
        <div style={{background:`linear-gradient(135deg,${C.primary},${C.dark})`,borderRadius:14,padding:"12px 14px",textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>{brl(total)}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.8)",fontWeight:700,marginTop:2}}>TOTAL DO DIA</div>
        </div>
        {Object.entries(porForma).map(([k,v])=>{
          const f = FORMAS[k]||{};
          return (
            <div key={k} style={{background:"#fff",borderRadius:14,padding:"12px 14px",textAlign:"center",boxShadow:"0 2px 8px rgba(196,95,130,0.08)"}}>
              <div style={{fontSize:14,fontWeight:900,color:C.text}}>{brl(v)}</div>
              <div style={{fontSize:9,color:C.gray,fontWeight:700,marginTop:2}}>{f.icon} {(f.label||k).toUpperCase()}</div>
            </div>
          );
        })}
      </div>

      {/* Lista */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {recebimentos.map(r=>{
          const f = FORMAS[r.forma]||{};
          return (
            <div key={r.id} style={{background:"#fff",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 8px rgba(196,95,130,0.06)"}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${f.color||C.primary}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{f.icon||"💵"}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{r.patientName}</div>
                <div style={{fontSize:11,color:C.gray,marginTop:1}}>{r.desc} · {r.hora||"—"}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:15,fontWeight:800,color:C.green}}>{brl(r.valor)}</div>
                <div style={{fontSize:10,color:C.gray}}>{f.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──
export default function CaixaDia({ patients, onSavePatient }) {
  const [fluxo, setFluxo]       = useState(null); // null = lista; "ativo" = fluxo aberto
  const [step, setStep]         = useState("paciente");
  const [sel, setSel]           = useState({ patient:null, servico:null, pagamento:null });

  const resetFluxo = () => { setFluxo(null); setStep("paciente"); setSel({patient:null,servico:null,pagamento:null}); };

  const confirmar = () => {
    const { patient, servico, pagamento } = sel;
    const registro = {
      id: uid(), data: now(), hora: hora(),
      desc: servico.desc, servicoId: servico.servicoId,
      valor: pagamento.valor, forma: pagamento.forma,
      parcelas: pagamento.parcelas, obs: pagamento.obs,
      nfStatus: "pendente",
    };
    const finAtual = patient.financeiro || { parcelas:[], pagamentos:[] };
    const updatedPatient = {
      ...patient,
      financeiro: { ...finAtual, pagamentos: [...finAtual.pagamentos, registro] },
      financialStatus: "Em dia",
    };
    onSavePatient(updatedPatient);
    setStep("confirmado");
  };

  return (
    <div style={{fontFamily:"Nunito,sans-serif"}}>
      {/* Header do caixa */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:22,color:C.dark}}>Caixa do Dia</div>
          <div style={{fontSize:12,color:C.gray,marginTop:2}}>{fmt(now())} · {patients.length} pacientes</div>
        </div>
        {!fluxo && (
          <button onClick={()=>{setFluxo("ativo");setStep("paciente");}} style={{background:`linear-gradient(135deg,${C.primary},${C.dark})`,color:"#fff",border:"none",borderRadius:14,padding:"12px 22px",fontSize:14,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
            <span>💸</span> Registrar Recebimento
          </button>
        )}
        {fluxo && step !== "confirmado" && (
          <button onClick={resetFluxo} style={{background:C.bgMed,color:C.dark,border:"none",borderRadius:12,padding:"10px 18px",fontSize:13,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>✕ Cancelar</button>
        )}
      </div>

      {/* Fluxo ativo */}
      {fluxo === "ativo" && (
        <div style={{marginBottom:24}}>
          <StepBar step={step}/>
          {step === "paciente"    && <StepPaciente patients={patients} onSelect={p=>{setSel(s=>({...s,patient:p}));setStep("servico");}}/>}
          {step === "servico"     && <StepServico  patient={sel.patient} onSelect={sv=>{setSel(s=>({...s,servico:sv}));setStep("pagamento");}} onBack={()=>setStep("paciente")}/>}
          {step === "pagamento"   && <StepPagamento patient={sel.patient} servico={sel.servico} onSelect={pg=>{setSel(s=>({...s,pagamento:pg}));setStep("conferencia");}} onBack={()=>setStep("servico")}/>}
          {step === "conferencia" && <StepConferencia patient={sel.patient} servico={sel.servico} pagamento={sel.pagamento} onConfirm={confirmar} onBack={()=>setStep("pagamento")}/>}
          {step === "confirmado"  && <StepConfirmado patient={sel.patient} servico={sel.servico} pagamento={sel.pagamento} onNovo={()=>{setStep("paciente");setSel({patient:null,servico:null,pagamento:null});}} onFechar={resetFluxo}/>}
        </div>
      )}

      {/* Lista do dia (sempre visível quando não está no fluxo) */}
      {!fluxo && <ListaDia patients={patients}/>}
    </div>
  );
}
