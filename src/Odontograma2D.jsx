import { useState } from "react";

const UPPER_R = [18,17,16,15,14,13,12,11];
const UPPER_L = [21,22,23,24,25,26,27,28];
const LOWER_L = [31,32,33,34,35,36,37,38];
const LOWER_R = [48,47,46,45,44,43,42,41];

const COND = {
  saudavel:    { label:"Saudável",       hex:"#f0ede6", dark:false },
  carie:       { label:"Cárie",          hex:"#e74c3c", dark:true  },
  restauracao: { label:"Restauração",    hex:"#2980b9", dark:true  },
  coroa:       { label:"Coroa",          hex:"#e67e22", dark:true  },
  implante:    { label:"Implante",       hex:"#8e44ad", dark:true  },
  tratamento:  { label:"Em tratamento",  hex:"#27ae60", dark:true  },
  ausente:     { label:"Ausente",        hex:"#b2bec3", dark:false },
  fratura:     { label:"Fratura",        hex:"#fdcb6e", dark:false },
};

const SURF_LABELS = { ves:"Ves", lin:"Lin", mes:"Mes", dis:"Dis", ocl:"Ocl" };

const isUpper = n => n < 30;
const quadrant = n => {
  if (n >= 11 && n <= 18) return 1;
  if (n >= 21 && n <= 28) return 2;
  if (n >= 31 && n <= 38) return 3;
  return 4;
};
const toothType = n => {
  const t = n % 10;
  if (t >= 6) return "molar";
  if (t >= 4) return "premolar";
  if (t === 3) return "canine";
  return "incisor";
};

function ToothSVG({ num, surfaces={}, onClick, selected, activeSurf, onSurfClick, size=44 }) {
  const S = size;
  const pad = S * 0.22;
  const type = toothType(num);
  const q = quadrant(num);

  const topSurf    = isUpper(num) ? "ves" : "lin";
  const botSurf    = isUpper(num) ? "lin" : "ves";
  const leftSurf   = (q===1||q===4) ? "dis" : "mes";
  const rightSurf  = (q===1||q===4) ? "mes" : "dis";

  const cond = surf => {
    const c = surfaces[surf] || "saudavel";
    return COND[c]?.hex || COND.saudavel.hex;
  };

  const surfaceOf = (surf) => {
    const isActive = activeSurf === surf;
    return {
      fill: cond(surf),
      stroke: selected ? (isActive ? "#764ba2" : "#9b7fe8") : "#ccc",
      strokeWidth: selected ? (isActive ? 2 : 1) : 0.5,
    };
  };

  const cx = S/2, cy = S/2;
  const zones = {
    [topSurf]:  `0,0 ${S},0 ${S-pad},${pad} ${pad},${pad}`,
    [botSurf]:  `0,${S} ${S},${S} ${S-pad},${S-pad} ${pad},${S-pad}`,
    [leftSurf]: `0,0 0,${S} ${pad},${S-pad} ${pad},${pad}`,
    [rightSurf]:`${S},0 ${S},${S} ${S-pad},${S-pad} ${S-pad},${pad}`,
    ocl:        `${pad},${pad} ${S-pad},${pad} ${S-pad},${S-pad} ${pad},${S-pad}`,
  };

  return (
    <svg width={S} height={S} style={{ cursor:"pointer", userSelect:"none",
      filter: selected ? "drop-shadow(0 0 5px rgba(118,75,162,0.7))" : "none",
      transition:"filter .2s",
    }}>
      {Object.entries(zones).map(([surf, pts]) => {
        const st = surfaceOf(surf);
        return (
          <polygon key={surf} points={pts}
            fill={st.fill} stroke={st.stroke} strokeWidth={st.strokeWidth}
            style={{ cursor:"pointer", transition:"fill .15s" }}
            onClick={e => { e.stopPropagation(); onSurfClick?.(num, surf); }}
          />
        );
      })}
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
        fontSize={type==="molar"?9:8} fontWeight="800"
        fill={selected?"#764ba2":"#666"} fontFamily="Nunito,sans-serif"
        style={{ pointerEvents:"none", userSelect:"none" }}>
        {num}
      </text>
      {Object.values(surfaces).every(v=>v==="ausente") && (
        <>
          <line x1={4} y1={4} x2={S-4} y2={S-4} stroke="#e74c3c" strokeWidth={2}/>
          <line x1={S-4} y1={4} x2={4} y2={S-4} stroke="#e74c3c" strokeWidth={2}/>
        </>
      )}
    </svg>
  );
}

function CondBtn({ condKey, active, onClick }) {
  const c = COND[condKey];
  return (
    <button onClick={onClick} style={{
      padding:"6px 10px", borderRadius:8, border:"none", cursor:"pointer",
      background: active ? c.hex : "#f3f0ff",
      color: active ? (c.dark?"#fff":"#333") : "#6050a0",
      fontWeight: active ? 800 : 600, fontSize:11,
      fontFamily:"Nunito,sans-serif",
      display:"flex", alignItems:"center", gap:6,
      transition:"all .15s",
      boxShadow: active ? `0 2px 10px ${c.hex}55` : "none",
      transform: active ? "scale(1.03)" : "scale(1)",
    }}>
      <span style={{ width:8, height:8, borderRadius:"50%", background:c.hex,
        display:"inline-block", border:"1px solid rgba(0,0,0,0.15)", flexShrink:0 }}/>
      {c.label}
      {active && <span style={{marginLeft:"auto",fontSize:12}}>✓</span>}
    </button>
  );
}

export default function Odontograma2D({ initialData={}, onSave, patientName }) {
  const [data, setData]         = useState(initialData);
  const [selTooth, setSelTooth] = useState(null);
  const [selSurf, setSelSurf]   = useState(null);
  const [markAll, setMarkAll]   = useState(false);

  const handleToothClick = (num) => {
    setSelTooth(prev => prev===num ? null : num);
    setSelSurf(null);
    setMarkAll(false);
  };

  const handleSurfClick = (num, surf) => {
    setSelTooth(num);
    setSelSurf(surf);
    setMarkAll(false);
  };

  const applyCondition = (cond) => {
    if (!selTooth) return;
    setData(prev => {
      const tooth = prev[selTooth] || {};
      if (markAll) {
        const all = {};
        ["ves","lin","mes","dis","ocl"].forEach(s => all[s]=cond);
        return { ...prev, [selTooth]: all };
      }
      if (selSurf) return { ...prev, [selTooth]: { ...tooth, [selSurf]: cond } };
      return prev;
    });
  };

  const toothSurfaces = (num) => data[num] || {};

  const currentCond = () => {
    if (!selTooth || markAll) return null;
    if (selSurf) return data[selTooth]?.[selSurf] || "saudavel";
    return null;
  };

  const countConditions = () => {
    const counts = {};
    Object.values(data).forEach(tooth => {
      Object.values(tooth).forEach(c => {
        if (c && c !== "saudavel") counts[c] = (counts[c]||0)+1;
      });
    });
    return counts;
  };

  const counts = countConditions();

  const toothName = n => ({
    8:"3º Molar",7:"2º Molar",6:"1º Molar",
    5:"2º Pré-Molar",4:"1º Pré-Molar",3:"Canino",
    2:"Inc. Lateral",1:"Inc. Central"
  })[n%10]||"";

  const archSide = n => quadrant(n)===1||quadrant(n)===2 ? "Superior":"Inferior";

  const tsz = n => {
    const t = toothType(n);
    if (t==="molar") return 44;
    if (t==="premolar") return 40;
    if (t==="canine") return 38;
    return 36;
  };

  const ArchRow = ({ left, right, label }) => (
    <div style={{ marginBottom:8 }}>
      <div style={{ fontSize:9, fontWeight:700, color:"#9b7fe8", letterSpacing:1.5,
        textAlign:"center", marginBottom:5 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>
        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
          {left.map(n => (
            <div key={n} onClick={()=>handleToothClick(n)} style={{ flexShrink:0 }}>
              <ToothSVG num={n} surfaces={toothSurfaces(n)} selected={selTooth===n}
                activeSurf={selTooth===n?selSurf:null} onSurfClick={handleSurfClick} size={tsz(n)} />
            </div>
          ))}
        </div>
        <div style={{ width:1, height:44, background:"rgba(118,75,162,0.3)", margin:"0 4px", flexShrink:0 }}/>
        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
          {right.map(n => (
            <div key={n} onClick={()=>handleToothClick(n)} style={{ flexShrink:0 }}>
              <ToothSVG num={n} surfaces={toothSurfaces(n)} selected={selTooth===n}
                activeSurf={selTooth===n?selSurf:null} onSurfClick={handleSurfClick} size={tsz(n)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"Nunito,sans-serif", background:"#f8f4ff",
      borderRadius:16, overflow:"hidden", minHeight:420 }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#667eea,#764ba2)",
        padding:"12px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.2)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🦷</div>
          <div>
            <div style={{ color:"#fff",fontSize:14,fontWeight:900 }}>Odontograma</div>
            {patientName && <div style={{ color:"rgba(255,255,255,0.8)",fontSize:10 }}>{patientName}</div>}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          {Object.entries(counts).map(([c,n])=>(
            <div key={c} style={{ background:"rgba(255,255,255,0.2)",borderRadius:20,
              padding:"3px 10px",display:"flex",alignItems:"center",gap:5 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:COND[c]?.hex}}/>
              <span style={{ color:"#fff",fontSize:9,fontWeight:800 }}>{n} {COND[c]?.label}</span>
            </div>
          ))}
          {onSave && (
            <button onClick={()=>onSave(data)} style={{ background:"rgba(255,255,255,0.9)",
              border:"none",borderRadius:8,padding:"5px 14px",fontSize:11,fontWeight:800,
              color:"#764ba2",cursor:"pointer" }}>Salvar</button>
          )}
        </div>
      </div>

      <div style={{ padding:"14px 10px 10px" }}>
        {/* Dental chart */}
        <div style={{ background:"#fff", borderRadius:14, padding:"14px 8px",
          boxShadow:"0 2px 16px rgba(102,126,234,0.1)", marginBottom:12, overflowX:"auto" }}>
          <ArchRow left={UPPER_R} right={UPPER_L} label="SUPERIOR"/>
          <div style={{ height:1, background:"rgba(118,75,162,0.1)", margin:"6px 0" }}/>
          <ArchRow left={[...LOWER_R].reverse()} right={LOWER_L} label="INFERIOR"/>
        </div>

        {/* Selected tooth panel */}
        {selTooth ? (
          <div style={{ background:"#fff",borderRadius:14,padding:14,
            boxShadow:"0 2px 16px rgba(102,126,234,0.1)", animation:"fadeInOdonto .25s ease" }}>
            <style>{`@keyframes fadeInOdonto{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
              <div>
                <span style={{ fontSize:20,fontWeight:900,color:"#764ba2",marginRight:8 }}>{selTooth}</span>
                <span style={{ fontSize:12,fontWeight:700,color:"#9b7fe8" }}>
                  {archSide(selTooth)} · {toothName(selTooth)}
                </span>
              </div>
              <button onClick={()=>{setSelTooth(null);setSelSurf(null)}} style={{
                background:"#f3f0ff",border:"none",borderRadius:8,padding:"4px 10px",
                fontSize:11,color:"#9b7fe8",cursor:"pointer",fontWeight:700,fontFamily:"Nunito,sans-serif" }}>
                Fechar ✕
              </button>
            </div>

            <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ flexShrink:0 }}>
                <ToothSVG num={selTooth} surfaces={toothSurfaces(selTooth)} selected={true}
                  activeSurf={selSurf} onSurfClick={handleSurfClick} size={100} />
                <div style={{ display:"flex",flexDirection:"column",gap:2,marginTop:8 }}>
                  {[["ocl","Oclusal/Incisal"],["ves","Vestibular"],["lin","Ling/Palatal"],["mes","Mesial"],["dis","Distal"]].map(([s,l])=>(
                    <button key={s} onClick={()=>{setSelSurf(s);setMarkAll(false)}} style={{
                      padding:"4px 8px",borderRadius:6,border:"none",cursor:"pointer",
                      background:selSurf===s?"#764ba2":"#f3f0ff",
                      color:selSurf===s?"#fff":"#9b7fe8",
                      fontSize:10,fontWeight:700,fontFamily:"Nunito,sans-serif",
                      transition:"all .15s", textAlign:"left",
                    }}>{l}</button>
                  ))}
                  <button onClick={()=>{setMarkAll(true);setSelSurf(null)}} style={{
                    padding:"4px 8px",borderRadius:6,border:"none",cursor:"pointer",
                    background:markAll?"#27ae60":"#f0fdf4",
                    color:markAll?"#fff":"#27ae60",
                    fontSize:10,fontWeight:700,fontFamily:"Nunito,sans-serif", marginTop:4,
                  }}>✓ Marcar tudo</button>
                </div>
              </div>

              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontSize:10,fontWeight:800,color:"#9b7fe8",marginBottom:8,letterSpacing:1 }}>
                  {markAll ? "MARCAR TODO O DENTE" : selSurf ? `MARCAR — ${SURF_LABELS[selSurf]?.toUpperCase()}` : "SELECIONE UMA SUPERFÍCIE"}
                </div>
                {(markAll || selSurf) ? (
                  <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                    {Object.keys(COND).map(k=>(
                      <CondBtn key={k} condKey={k}
                        active={currentCond()===k || (markAll && Object.values(data[selTooth]||{}).every(v=>v===k))}
                        onClick={()=>applyCondition(k)}/>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding:14, background:"#f8f4ff", borderRadius:10,
                    fontSize:12,color:"#9b7fe8",textAlign:"center",fontWeight:600 }}>
                    Clique numa superfície do dente<br/>ou em "Marcar tudo"
                  </div>
                )}
              </div>

              <div style={{ minWidth:130 }}>
                <div style={{ fontSize:10,fontWeight:800,color:"#9b7fe8",marginBottom:8,letterSpacing:1 }}>RESUMO DO DENTE</div>
                {["ves","lin","mes","dis","ocl"].map(s=>{
                  const c = data[selTooth]?.[s]||"saudavel";
                  const cd = COND[c];
                  return (
                    <div key={s} style={{ display:"flex",alignItems:"center",gap:6,
                      marginBottom:4,padding:"4px 8px",borderRadius:6,
                      background:selSurf===s?"#f3f0ff":"transparent", cursor:"pointer" }}
                      onClick={()=>{setSelSurf(s);setMarkAll(false)}}>
                      <div style={{ width:8,height:8,borderRadius:"50%",background:cd.hex,
                        flexShrink:0,border:"1px solid rgba(0,0,0,0.1)" }}/>
                      <span style={{ fontSize:10,fontWeight:700,color:"#6050a0",width:28 }}>{SURF_LABELS[s]}</span>
                      <span style={{ fontSize:10,color:"#9b7fe8" }}>{cd.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background:"#fff",borderRadius:14,padding:14,
            boxShadow:"0 2px 16px rgba(102,126,234,0.1)",
            textAlign:"center",color:"#b0a0d0",fontSize:12,fontWeight:600 }}>
            Clique num dente para marcar condição por superfície
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ padding:"0 10px 14px",display:"flex",gap:5,flexWrap:"wrap" }}>
        {Object.entries(COND).map(([k,v])=>(
          <div key={k} style={{ display:"flex",alignItems:"center",gap:4,
            background:"rgba(255,255,255,0.8)",borderRadius:20,padding:"3px 9px",
            border:"1px solid rgba(118,75,162,0.1)" }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:v.hex,
              border:"1px solid rgba(0,0,0,0.1)",flexShrink:0 }}/>
            <span style={{ fontSize:9,color:"#8070a0",fontWeight:700 }}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
