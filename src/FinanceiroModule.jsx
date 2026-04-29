import { useState } from "react";

const C = {
  primary:  "#c45f82",
  dark:     "#8b3458",
  bg:       "#fdf4f6",
  bgMed:    "#fce8ee",
  text:     "#4a2c3a",
  textLight:"#8b3458",
  green:    "#16a34a",
  red:      "#dc2626",
  yellow:   "#d97706",
  gray:     "#94a3b8",
};

export const FORMAS = {
  dinheiro:       { label: "Dinheiro",       icon: "💵", color: "#16a34a" },
  pix:            { label: "PIX",            icon: "⚡", color: "#0ea5e9" },
  cartao_credito: { label: "Cartão Crédito", icon: "💳", color: "#8b3458" },
  cartao_debito:  { label: "Cartão Débito",  icon: "🏧", color: "#c45f82" },
};

const uid = () => Math.random().toString(36).slice(2, 9);
const todayISO = () => new Date().toISOString().split("T")[0];
const fmt = (s) => { if (!s) return "—"; const [y,m,d] = s.split("-"); return `${d}/${m}/${y}`; };
const brl = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

// ── Resumo do paciente (usado externamente também) ──
export function calcResumo(fin = {}) {
  const parcelas  = fin.parcelas  || [];
  const pagamentos = fin.pagamentos || [];
  const totalPlano = parcelas.filter(p => p.status !== "cancelado").reduce((s, p) => s + (p.valor || 0), 0);
  const totalPago  = pagamentos.reduce((s, p) => s + (p.valor || 0), 0);
  const saldo      = totalPlano - totalPago;
  return { totalPlano, totalPago, saldo };
}

// ── Modal base ──
function Modal({ title, onClose, children, width = 420 }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(74,44,58,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:width, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(139,52,88,0.25)", animation:"finFadeUp .2s ease" }}>
        <style>{`@keyframes finFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})`, padding:"16px 20px", borderRadius:"20px 20px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#fff", fontWeight:800, fontSize:15, fontFamily:"Nunito,sans-serif" }}>{title}</span>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, padding:"4px 10px", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>✕</button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:0.8, marginBottom:5 }}>{label}</div>
      {children}
    </div>
  );
}

const inputSt = { width:"100%", border:`1.5px solid #f0d6df`, borderRadius:10, padding:"10px 12px", fontSize:13, fontFamily:"Nunito,sans-serif", color:C.text, outline:"none", background:"#fff" };
const BtnPrim = ({ label, onClick, disabled, small }) => (
  <button onClick={onClick} disabled={disabled} style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})`, color:"#fff", border:"none", borderRadius:10, padding: small ? "7px 14px" : "10px 20px", fontSize: small ? 11 : 13, fontWeight:800, fontFamily:"Nunito,sans-serif", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 }}>{label}</button>
);
const BtnSec = ({ label, onClick, small }) => (
  <button onClick={onClick} style={{ background:C.bgMed, color:C.dark, border:"none", borderRadius:10, padding: small ? "7px 14px" : "10px 20px", fontSize: small ? 11 : 13, fontWeight:700, fontFamily:"Nunito,sans-serif", cursor:"pointer" }}>{label}</button>
);

// ── Modal Nova Cobrança ──
function ModalNovaCobranca({ onSave, onClose }) {
  const [form, setForm] = useState({ desc:"", valor:"", vencimento: todayISO(), tipo:"parcela" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.desc && form.valor && form.vencimento;

  return (
    <Modal title="➕ Nova Cobrança" onClose={onClose}>
      <Field label="DESCRIÇÃO">
        <input style={inputSt} placeholder="Ex: Entrada, Parcela 1/12, Consulta avulsa..." value={form.desc} onChange={e => set("desc", e.target.value)} />
      </Field>
      <Field label="VALOR (R$)">
        <input style={inputSt} type="number" placeholder="0,00" min="0" step="0.01" value={form.valor} onChange={e => set("valor", parseFloat(e.target.value) || "")} />
      </Field>
      <Field label="VENCIMENTO">
        <input style={inputSt} type="date" value={form.vencimento} onChange={e => set("vencimento", e.target.value)} />
      </Field>
      <Field label="TIPO">
        <div style={{ display:"flex", gap:8 }}>
          {[["parcela","📋 Parcela"],["avulso","🩺 Avulso"],["entrada","💰 Entrada"]].map(([v,l]) => (
            <button key={v} onClick={() => set("tipo", v)} style={{ flex:1, padding:"8px 6px", borderRadius:10, border:"none", cursor:"pointer", background: form.tipo===v ? C.primary : C.bgMed, color: form.tipo===v ? "#fff" : C.dark, fontSize:11, fontWeight:700, fontFamily:"Nunito,sans-serif" }}>{l}</button>
          ))}
        </div>
      </Field>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <BtnSec label="Cancelar" onClick={onClose} />
        <BtnPrim label="Salvar Cobrança" disabled={!valid} onClick={() => onSave({ id: uid(), ...form, valor: parseFloat(form.valor), status: "pendente" })} />
      </div>
    </Modal>
  );
}

// ── Modal Registrar Pagamento ──
function ModalPagamento({ parcelas, onSave, onClose }) {
  const [form, setForm] = useState({ valor:"", forma:"pix", data: todayISO(), obs:"", parcelaId:"" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const pendentes = parcelas.filter(p => p.status === "pendente");
  const valid = form.valor && form.forma && form.data;

  const handleSave = () => {
    onSave({ id: uid(), ...form, valor: parseFloat(form.valor) });
  };

  return (
    <Modal title="💸 Registrar Pagamento" onClose={onClose}>
      <Field label="VINCULAR A UMA COBRANÇA (opcional)">
        <select style={inputSt} value={form.parcelaId} onChange={e => {
          const p = pendentes.find(x => x.id === e.target.value);
          set("parcelaId", e.target.value);
          if (p) set("valor", p.valor);
        }}>
          <option value="">— Pagamento avulso —</option>
          {pendentes.map(p => (
            <option key={p.id} value={p.id}>{p.desc} · {brl(p.valor)} · venc. {fmt(p.vencimento)}</option>
          ))}
        </select>
      </Field>
      <Field label="VALOR RECEBIDO (R$)">
        <input style={inputSt} type="number" placeholder="0,00" min="0" step="0.01" value={form.valor} onChange={e => set("valor", e.target.value)} />
      </Field>
      <Field label="FORMA DE PAGAMENTO">
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {Object.entries(FORMAS).map(([k, f]) => (
            <button key={k} onClick={() => set("forma", k)} style={{ flex:"1 1 auto", padding:"9px 8px", borderRadius:10, border:"none", cursor:"pointer", background: form.forma===k ? f.color : C.bgMed, color: form.forma===k ? "#fff" : C.dark, fontSize:11, fontWeight:700, fontFamily:"Nunito,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="DATA DO PAGAMENTO">
        <input style={inputSt} type="date" value={form.data} onChange={e => set("data", e.target.value)} />
      </Field>
      <Field label="OBSERVAÇÃO (opcional)">
        <input style={inputSt} placeholder="Ex: Pago em 2x no cartão..." value={form.obs} onChange={e => set("obs", e.target.value)} />
      </Field>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <BtnSec label="Cancelar" onClick={onClose} />
        <BtnPrim label="Confirmar Pagamento" disabled={!valid} onClick={handleSave} />
      </div>
    </Modal>
  );
}

// ── Componente principal ──
export default function FinanceiroModule({ patient, onSave }) {
  const fin = patient.financeiro || { parcelas: [], pagamentos: [] };
  const { totalPlano, totalPago, saldo } = calcResumo(fin);
  const [modal, setModal] = useState(null); // "cobranca" | "pagamento"

  const saveFin = (newFin) => {
    const updated = { ...patient, financeiro: newFin, financialStatus: newFin.parcelas.length === 0 || (totalPlano - totalPago <= 0) ? "Em dia" : "Pendente", balance: Math.max(0, totalPlano - totalPago) };
    onSave(updated);
  };

  const addCobranca = (c) => {
    saveFin({ ...fin, parcelas: [...fin.parcelas, c] });
    setModal(null);
  };

  const addPagamento = (p) => {
    const novasFin = { ...fin, pagamentos: [...fin.pagamentos, p] };
    // Se vinculou a uma parcela, marca como pago
    if (p.parcelaId) {
      novasFin.parcelas = fin.parcelas.map(x => x.id === p.parcelaId ? { ...x, status: "pago" } : x);
    }
    saveFin(novasFin);
    setModal(null);
  };

  const cancelarParcela = (id) => {
    saveFin({ ...fin, parcelas: fin.parcelas.map(x => x.id === id ? { ...x, status: "cancelado" } : x) });
  };

  const excluirPagamento = (id) => {
    saveFin({ ...fin, pagamentos: fin.pagamentos.filter(x => x.id !== id) });
  };

  const statusBadge = (s) => ({
    pendente:  { label:"Pendente",  bg:"#fef3c7", color:"#d97706" },
    pago:      { label:"Pago",      bg:"#dcfce7", color:"#16a34a" },
    cancelado: { label:"Cancelado", bg:"#f1f5f9", color:"#94a3b8" },
  }[s] || { label:s, bg:"#f1f5f9", color:"#94a3b8" });

  return (
    <div style={{ fontFamily:"Nunito,sans-serif", display:"flex", flexDirection:"column", gap:16 }}>

      {/* Resumo financeiro */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
        {[
          { label:"Total do Plano", value: brl(totalPlano), color:"#4a2c3a", icon:"📋" },
          { label:"Total Recebido", value: brl(totalPago),  color:C.green,   icon:"✅" },
          { label:"Saldo Devedor",  value: brl(saldo),      color: saldo > 0 ? C.red : C.green, icon: saldo > 0 ? "⚠️" : "🎉" },
        ].map((s, i) => (
          <div key={i} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", boxShadow:"0 2px 12px rgba(196,95,130,0.1)", textAlign:"center" }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:18, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:9, color:C.gray, fontWeight:700, letterSpacing:0.5, marginTop:4 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Botões de ação */}
      <div style={{ display:"flex", gap:10 }}>
        <BtnPrim label="➕ Nova Cobrança" onClick={() => setModal("cobranca")} />
        <BtnPrim label="💸 Registrar Pagamento" onClick={() => setModal("pagamento")} />
      </div>

      {/* Cobranças */}
      <div style={{ background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(196,95,130,0.08)" }}>
        <div style={{ fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:1, marginBottom:12 }}>📋 COBRANÇAS DO PLANO</div>
        {fin.parcelas.length === 0 ? (
          <div style={{ textAlign:"center", padding:"24px 0", color:C.gray, fontSize:13 }}>Nenhuma cobrança cadastrada.</div>
        ) : (
          fin.parcelas.map(p => {
            const st = statusBadge(p.status);
            const vencida = p.status === "pendente" && p.vencimento < todayISO();
            return (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #fce8ee" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{p.desc}</div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>
                    Venc. {fmt(p.vencimento)}
                    {vencida && <span style={{ color:C.red, fontWeight:700, marginLeft:6 }}>⚠ Vencida</span>}
                  </div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text }}>{brl(p.valor)}</div>
                <span style={{ background:st.bg, color:st.color, padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:800 }}>{st.label}</span>
                {p.status === "pendente" && (
                  <button onClick={() => cancelarParcela(p.id)} title="Cancelar" style={{ background:"none", border:"none", color:"#cbd5e1", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Histórico de pagamentos */}
      <div style={{ background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(196,95,130,0.08)" }}>
        <div style={{ fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:1, marginBottom:12 }}>💸 HISTÓRICO DE PAGAMENTOS</div>
        {fin.pagamentos.length === 0 ? (
          <div style={{ textAlign:"center", padding:"24px 0", color:C.gray, fontSize:13 }}>Nenhum pagamento registrado.</div>
        ) : (
          [...fin.pagamentos].reverse().map(p => {
            const f = FORMAS[p.forma] || {};
            return (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #fce8ee" }}>
                <div style={{ width:36, height:36, borderRadius:10, background:C.bgMed, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{f.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{f.label}</div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:1 }}>
                    {fmt(p.data)}{p.obs ? ` · ${p.obs}` : ""}
                  </div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.green }}>+{brl(p.valor)}</div>
                <button onClick={() => excluirPagamento(p.id)} title="Remover" style={{ background:"none", border:"none", color:"#cbd5e1", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
              </div>
            );
          })
        )}
      </div>

      {modal === "cobranca"  && <ModalNovaCobranca onSave={addCobranca}  onClose={() => setModal(null)} />}
      {modal === "pagamento" && <ModalPagamento parcelas={fin.parcelas} onSave={addPagamento} onClose={() => setModal(null)} />}
    </div>
  );
}
