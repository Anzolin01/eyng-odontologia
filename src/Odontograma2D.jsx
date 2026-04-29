import { useState } from "react";

/* ── Arcos FDI ─────────────────────────────────────────── */
const UPPER_R = [18,17,16,15,14,13,12,11]; // Q1 – Superior direito
const UPPER_L = [21,22,23,24,25,26,27,28]; // Q2 – Superior esquerdo
const LOWER_L = [31,32,33,34,35,36,37,38]; // Q3 – Inferior esquerdo
const LOWER_R = [48,47,46,45,44,43,42,41]; // Q4 – Inferior direito

/* ── Condições ─────────────────────────────────────────── */
const COND = {
  saudavel:    { label:"Saudável",       hex:"#eeeae3", dark:false },
  carie:       { label:"Cárie",          hex:"#ef4444", dark:true  },
  restauracao: { label:"Restauração",    hex:"#3b82f6", dark:true  },
  coroa:       { label:"Coroa",          hex:"#f59e0b", dark:true  },
  implante:    { label:"Implante",       hex:"#8b5cf6", dark:true  },
  tratamento:  { label:"Em tratamento",  hex:"#10b981", dark:true  },
  ausente:     { label:"Ausente",        hex:"#94a3b8", dark:false },
  fratura:     { label:"Fratura",        hex:"#fbbf24", dark:false },
};

const SURF_LABELS = {
  ves:"Vestibular", lin:"Lingual/Palatal",
  mes:"Mesial",     dis:"Distal",
  ocl:"Oclusal/Incisal",
};

/* ── Helpers ───────────────────────────────────────────── */
const isUpper   = n => n < 30;
const quadrant  = n => {
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
const toothW = type =>
  ({ molar:40, premolar:34, canine:30, incisor:26 })[type] ?? 30;
const toothLabel = n =>
  ({8:"3º Molar",7:"2º Molar",6:"1º Molar",
    5:"2º Pré-Molar",4:"1º Pré-Molar",3:"Canino",
    2:"Inc. Lateral",1:"Inc. Central"})[n%10] ?? "";
const archName  = n => isUpper(n) ? "Superior" : "Inferior";

const TOOTH_H  = 44;   // altura fixa do corpo do dente
const NUM_SP   = 13;   // espaço reservado para o número (acima/abaixo)

/* ── ToothSVG ──────────────────────────────────────────── */
function ToothSVG({ num, surfaces={}, selected, activeSurf,
                    onToothClick, onSurfClick, scale=1 }) {
  const [hov, setHov] = useState(false);

  const type  = toothType(num);
  const q     = quadrant(num);
  const isUp  = isUpper(num);

  const W     = toothW(type) * scale;
  const H     = TOOTH_H * scale;
  const ns    = NUM_SP * scale;
  const rx    = 7 * scale;
  const pad   = W * 0.22;
  const totalH= H + ns;

  // dente superior: corpo começa em Y=ns (número em cima)
  // dente inferior: corpo começa em Y=0  (número em baixo)
  const ty    = isUp ? ns : 0;
  const numY  = isUp ? ns * 0.5 : H + ns * 0.7;

  const topSurf   = isUp ? "ves" : "lin";
  const botSurf   = isUp ? "lin" : "ves";
  const leftSurf  = (q===1||q===4) ? "dis" : "mes";
  const rightSurf = (q===1||q===4) ? "mes" : "dis";

  const cHex = s => COND[surfaces[s] || "saudavel"]?.hex ?? COND.saudavel.hex;

  const zones = [
    { s:topSurf,   x:0,      y:ty,        w:W,        h:pad      },
    { s:botSurf,   x:0,      y:ty+H-pad,  w:W,        h:pad      },
    { s:leftSurf,  x:0,      y:ty+pad,    w:pad,      h:H-2*pad  },
    { s:rightSurf, x:W-pad,  y:ty+pad,    w:pad,      h:H-2*pad  },
    { s:"ocl",     x:pad,    y:ty+pad,    w:W-2*pad,  h:H-2*pad  },
  ];

  const allAbsent = ["ves","lin","mes","dis","ocl"]
    .every(s => (surfaces[s]||"saudavel") === "ausente");

  const clipId = `tc-${num}-${Math.round(scale*10)}`;

  const borderColor = selected ? "#764ba2" : hov ? "#b09ae0" : "#ccc5d8";
  const borderW     = selected ? 2*scale : hov ? 1.2 : 0.8;

  return (
    <svg
      width={W} height={totalH}
      overflow="visible"
      style={{
        cursor: "pointer", userSelect: "none",
        filter: selected
          ? `drop-shadow(0 0 ${6*scale}px rgba(118,75,162,0.8))`
          : hov
            ? "drop-shadow(0 0 3px rgba(118,75,162,0.35))"
            : "none",
        transition: "filter .18s",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={e => { e.stopPropagation(); onToothClick?.(num); }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={ty} width={W} height={H} rx={rx} ry={rx} />
        </clipPath>
      </defs>

      {/* Número */}
      <text
        x={W/2} y={numY}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={8 * scale} fontWeight={selected ? "900" : "700"}
        fill={selected ? "#764ba2" : "#b0a0cc"}
        fontFamily="Nunito,sans-serif"
        style={{ pointerEvents:"none", userSelect:"none" }}
      >{num}</text>

      {/* Zonas preenchidas (clipped) */}
      <g clipPath={`url(#${clipId})`}>
        {zones.map(({s,x,y,w,h}) => (
          <rect key={s}
            x={x} y={y} width={w} height={h}
            fill={cHex(s)}
            style={{ transition:"fill .15s", cursor:"pointer" }}
            onClick={e => { e.stopPropagation(); onSurfClick?.(num, s); }}
          />
        ))}
      </g>

      {/* Linhas divisórias das zonas */}
      <g clipPath={`url(#${clipId})`} style={{ pointerEvents:"none" }}>
        <line x1={pad}   y1={ty}       x2={pad}   y2={ty+H}     stroke="rgba(0,0,0,0.1)"  strokeWidth={0.5}/>
        <line x1={W-pad} y1={ty}       x2={W-pad} y2={ty+H}     stroke="rgba(0,0,0,0.1)"  strokeWidth={0.5}/>
        <line x1={0}     y1={ty+pad}   x2={W}     y2={ty+pad}   stroke="rgba(0,0,0,0.1)"  strokeWidth={0.5}/>
        <line x1={0}     y1={ty+H-pad} x2={W}     y2={ty+H-pad} stroke="rgba(0,0,0,0.1)"  strokeWidth={0.5}/>
      </g>

      {/* Contorno do dente */}
      <rect
        x={0} y={ty} width={W} height={H} rx={rx} ry={rx}
        fill="none"
        stroke={borderColor} strokeWidth={borderW}
        style={{ pointerEvents:"none", transition:"stroke .18s" }}
      />

      {/* Destaque da superfície ativa (no painel grande) */}
      {activeSurf && (() => {
        const z = zones.find(z => z.s === activeSurf);
        return z ? (
          <rect
            x={z.x} y={z.y} width={z.w} height={z.h}
            fill="none"
            stroke="#764ba2" strokeWidth={2.2 * scale}
            strokeDasharray={`${3.5*scale} ${2*scale}`}
            rx={3}
            style={{ pointerEvents:"none" }}
          />
        ) : null;
      })()}

      {/* X dente ausente */}
      {allAbsent && (
        <g style={{ pointerEvents:"none" }}>
          <line x1={3}   y1={ty+3}   x2={W-3} y2={ty+H-3} stroke="#ef4444" strokeWidth={1.5*scale}/>
          <line x1={W-3} y1={ty+3}   x2={3}   y2={ty+H-3} stroke="#ef4444" strokeWidth={1.5*scale}/>
        </g>
      )}
    </svg>
  );
}

/* ── Botão de condição ─────────────────────────────────── */
function CondBtn({ condKey, active, onClick }) {
  const c = COND[condKey];
  return (
    <button
      onClick={onClick}
      style={{
        padding:"7px 10px",
        borderRadius:10,
        border:`2px solid ${active ? c.hex : "transparent"}`,
        cursor:"pointer",
        background: active ? c.hex : "#f5f2ff",
        color: active ? (c.dark ? "#fff" : "#222") : "#7060a0",
        fontWeight: active ? 800 : 600,
        fontSize:11,
        fontFamily:"Nunito,sans-serif",
        display:"flex", alignItems:"center", gap:7,
        transition:"all .15s",
        boxShadow: active ? `0 3px 10px ${c.hex}55` : "none",
        transform: active ? "scale(1.04)" : "scale(1)",
        textAlign:"left",
      }}
    >
      <span style={{
        width:9, height:9, borderRadius:"50%",
        background: c.hex,
        flexShrink:0,
        border:"1.5px solid rgba(0,0,0,0.12)",
        boxShadow: active ? "0 0 0 2px rgba(255,255,255,0.4) inset" : "none",
      }}/>
      {c.label}
    </button>
  );
}

/* ── Componente principal ──────────────────────────────── */
export default function Odontograma2D({ initialData={}, onSave, patientName }) {
  const [data,     setData]     = useState(initialData);
  const [selTooth, setSelTooth] = useState(null);
  const [selSurf,  setSelSurf]  = useState(null);
  const [markAll,  setMarkAll]  = useState(false);

  const handleToothClick = num => {
    setSelTooth(prev => prev === num ? null : num);
    setSelSurf(null);
    setMarkAll(false);
  };
  const handleSurfClick = (num, surf) => {
    setSelTooth(num);
    setSelSurf(surf);
    setMarkAll(false);
  };

  const applyCondition = cond => {
    if (!selTooth) return;
    setData(prev => {
      const tooth = prev[selTooth] || {};
      if (markAll) {
        const all = {};
        ["ves","lin","mes","dis","ocl"].forEach(s => { all[s] = cond; });
        return { ...prev, [selTooth]: all };
      }
      if (selSurf)
        return { ...prev, [selTooth]: { ...tooth, [selSurf]: cond } };
      return prev;
    });
  };

  const surfaces = num => data[num] || {};

  const currentCond = () => {
    if (!selTooth || markAll) return null;
    if (selSurf) return data[selTooth]?.[selSurf] || "saudavel";
    return null;
  };

  const counts = (() => {
    const c = {};
    Object.values(data).forEach(tooth =>
      Object.values(tooth).forEach(v => {
        if (v && v !== "saudavel") c[v] = (c[v]||0) + 1;
      })
    );
    return c;
  })();

  /* ── Linha de dentes ── */
  const ArchLine = ({ teeth, alignEnd=false }) => (
    <div style={{
      display:"flex",
      alignItems: alignEnd ? "flex-end" : "flex-start",
      justifyContent:"center",
      gap:2,
    }}>
      {teeth.map(n => (
        <div key={n} style={{ flexShrink:0 }}>
          <ToothSVG
            num={n}
            surfaces={surfaces(n)}
            selected={selTooth === n}
            activeSurf={selTooth === n ? selSurf : null}
            onToothClick={handleToothClick}
            onSurfClick={handleSurfClick}
          />
        </div>
      ))}
    </div>
  );

  /* ── Separador vertical da linha média ── */
  const MidSep = ({ h }) => (
    <div style={{
      width:2, height:h, flexShrink:0, margin:"0 4px",
      background:"linear-gradient(to bottom, #9b7fe8, #764ba2)",
      borderRadius:2,
    }}/>
  );

  /* ── Rótulo de quadrante ── */
  const QLabel = ({ children, align="right" }) => (
    <div style={{
      flex:1,
      textAlign: align,
      fontSize:8, fontWeight:800,
      color:"#c0aee0", letterSpacing:1.5,
      paddingRight: align==="right" ? 10 : 0,
      paddingLeft:  align==="left"  ? 10 : 0,
    }}>{children}</div>
  );

  return (
    <div style={{
      fontFamily:"Nunito,sans-serif",
      background:"#faf8ff",
      borderRadius:16,
      overflow:"hidden",
      minHeight:400,
    }}>

      {/* ── Header ── */}
      <div style={{
        background:"linear-gradient(135deg,#667eea,#764ba2)",
        padding:"12px 18px",
        display:"flex", alignItems:"center",
        justifyContent:"space-between", flexWrap:"wrap", gap:8,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:10,
            background:"rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18,
          }}>🦷</div>
          <div>
            <div style={{ color:"#fff", fontSize:14, fontWeight:900 }}>Odontograma</div>
            {patientName && (
              <div style={{ color:"rgba(255,255,255,0.75)", fontSize:10 }}>{patientName}</div>
            )}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          {Object.entries(counts).map(([c,n]) => (
            <div key={c} style={{
              background:"rgba(255,255,255,0.18)",
              borderRadius:20, padding:"3px 10px",
              display:"flex", alignItems:"center", gap:5,
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:COND[c]?.hex }}/>
              <span style={{ color:"#fff", fontSize:9, fontWeight:800 }}>
                {n}× {COND[c]?.label}
              </span>
            </div>
          ))}
          {onSave && (
            <button onClick={() => onSave(data)} style={{
              background:"rgba(255,255,255,0.92)",
              border:"none", borderRadius:8,
              padding:"5px 14px", fontSize:11, fontWeight:800,
              color:"#764ba2", cursor:"pointer",
              boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
            }}>
              Salvar
            </button>
          )}
        </div>
      </div>

      <div style={{ padding:"14px 10px 10px" }}>

        {/* ── Mapa dental ── */}
        <div style={{
          background:"#fff",
          borderRadius:14, padding:"10px 6px 10px",
          boxShadow:"0 2px 20px rgba(102,126,234,0.08)",
          marginBottom:12, overflowX:"auto",
        }}>

          {/* Rótulos quadrantes superiores */}
          <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:6 }}>
            <QLabel align="right">QUADRANTE I</QLabel>
            <div style={{ width:10 }}/>
            <QLabel align="left">QUADRANTE II</QLabel>
          </div>

          {/* Arco superior */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:2 }}>
            <ArchLine teeth={UPPER_R} alignEnd />
            <MidSep h={TOOTH_H + NUM_SP} />
            <ArchLine teeth={UPPER_L} alignEnd />
          </div>

          {/* Linha da arcada */}
          <div style={{
            height:2, margin:"5px 16px",
            background:"linear-gradient(90deg,transparent,#d8c8f0 20%,#764ba2 50%,#d8c8f0 80%,transparent)",
            borderRadius:1,
          }}/>

          {/* Arco inferior */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"center", gap:2 }}>
            <ArchLine teeth={[...LOWER_R].reverse()} />
            <MidSep h={TOOTH_H + NUM_SP} />
            <ArchLine teeth={LOWER_L} />
          </div>

          {/* Rótulos quadrantes inferiores */}
          <div style={{ display:"flex", justifyContent:"center", gap:4, marginTop:6 }}>
            <QLabel align="right">QUADRANTE IV</QLabel>
            <div style={{ width:10 }}/>
            <QLabel align="left">QUADRANTE III</QLabel>
          </div>
        </div>

        {/* ── Painel do dente selecionado ── */}
        {selTooth ? (
          <div style={{
            background:"#fff", borderRadius:14, padding:14,
            boxShadow:"0 2px 20px rgba(102,126,234,0.1)",
            animation:"fioOdonto .22s ease",
          }}>
            <style>{`
              @keyframes fioOdonto {
                from { opacity:0; transform:translateY(8px); }
                to   { opacity:1; transform:translateY(0);   }
              }
            `}</style>

            {/* Cabeçalho do painel */}
            <div style={{
              display:"flex", alignItems:"center",
              justifyContent:"space-between", marginBottom:14,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{
                  background:"linear-gradient(135deg,#667eea,#764ba2)",
                  borderRadius:10, width:38, height:38,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{ color:"#fff", fontWeight:900, fontSize:15 }}>
                    {selTooth}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight:900, fontSize:13, color:"#3d2e6e" }}>
                    {toothLabel(selTooth)}
                  </div>
                  <div style={{ fontSize:10, color:"#9b7fe8" }}>
                    {archName(selTooth)} · Quadrante {quadrant(selTooth)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setSelTooth(null); setSelSurf(null); setMarkAll(false); }}
                style={{
                  background:"#f3f0ff", border:"none", borderRadius:8,
                  padding:"5px 12px", fontSize:11,
                  color:"#9b7fe8", cursor:"pointer",
                  fontWeight:700, fontFamily:"Nunito,sans-serif",
                }}
              >✕ Fechar</button>
            </div>

            <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>

              {/* Dente grande + seletor de superfície */}
              <div style={{
                flexShrink:0,
                display:"flex", flexDirection:"column",
                alignItems:"center", gap:10,
              }}>
                <ToothSVG
                  num={selTooth}
                  surfaces={surfaces(selTooth)}
                  selected={true}
                  activeSurf={selSurf}
                  onToothClick={() => {}}
                  onSurfClick={handleSurfClick}
                  scale={2.1}
                />
                {/* Botões de superfície */}
                <div style={{
                  display:"grid", gridTemplateColumns:"1fr 1fr",
                  gap:4, width:"100%",
                }}>
                  {[["ocl","Oclusal"],["ves","Vestibular"],["lin","Lingual"],["mes","Mesial"],["dis","Distal"]].map(([s,l]) => {
                    const hasMark = data[selTooth]?.[s] && data[selTooth][s] !== "saudavel";
                    return (
                      <button key={s}
                        onClick={() => { setSelSurf(s); setMarkAll(false); }}
                        style={{
                          padding:"5px 8px", borderRadius:7, border:"none",
                          cursor:"pointer",
                          background: selSurf===s
                            ? "#764ba2"
                            : hasMark
                              ? `${COND[data[selTooth][s]]?.hex}44`
                              : "#f3f0ff",
                          color: selSurf===s ? "#fff" : "#9b7fe8",
                          fontSize:10, fontWeight:700,
                          fontFamily:"Nunito,sans-serif",
                          gridColumn: s==="ocl" ? "1 / -1" : "auto",
                          transition:"all .15s", textAlign:"center",
                          boxShadow: selSurf===s
                            ? "0 2px 8px rgba(118,75,162,0.35)" : "none",
                        }}
                      >
                        {hasMark && selSurf!==s && (
                          <span style={{
                            display:"inline-block", width:6, height:6,
                            borderRadius:"50%",
                            background: COND[data[selTooth][s]]?.hex,
                            marginRight:4, verticalAlign:"middle",
                          }}/>
                        )}
                        {l}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setMarkAll(true); setSelSurf(null); }}
                    style={{
                      padding:"5px 8px", borderRadius:7, border:"none",
                      cursor:"pointer",
                      background: markAll ? "#10b981" : "#f0fdf9",
                      color: markAll ? "#fff" : "#10b981",
                      fontSize:10, fontWeight:700,
                      fontFamily:"Nunito,sans-serif",
                      gridColumn:"1 / -1",
                      transition:"all .15s",
                      boxShadow: markAll ? "0 2px 8px rgba(16,185,129,0.35)" : "none",
                    }}
                  >✓ Marcar todo o dente</button>
                </div>
              </div>

              {/* Seletor de condição */}
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{
                  fontSize:10, fontWeight:800,
                  color:"#9b7fe8", marginBottom:10, letterSpacing:1,
                }}>
                  {markAll
                    ? "CONDIÇÃO — TODO O DENTE"
                    : selSurf
                      ? `CONDIÇÃO — ${selSurf.toUpperCase()}`
                      : "SELECIONE UMA SUPERFÍCIE →"}
                </div>

                {(markAll || selSurf) ? (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                    {Object.keys(COND).map(k => (
                      <CondBtn key={k} condKey={k}
                        active={
                          currentCond() === k ||
                          (markAll && Object.values(data[selTooth]||{}).length > 0 &&
                           Object.values(data[selTooth]||{}).every(v => v === k))
                        }
                        onClick={() => applyCondition(k)}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding:18, background:"#f8f4ff", borderRadius:10,
                    fontSize:12, color:"#b0a0cc",
                    textAlign:"center", fontWeight:600, lineHeight:1.7,
                  }}>
                    <div style={{ fontSize:28, marginBottom:6 }}>🦷</div>
                    Clique em uma<br/>superfície no dente<br/>ao lado
                  </div>
                )}
              </div>

              {/* Resumo das superfícies */}
              <div style={{ minWidth:130 }}>
                <div style={{
                  fontSize:10, fontWeight:800,
                  color:"#9b7fe8", marginBottom:8, letterSpacing:1,
                }}>RESUMO DO DENTE</div>
                {["ocl","ves","lin","mes","dis"].map(s => {
                  const c  = data[selTooth]?.[s] || "saudavel";
                  const cd = COND[c];
                  return (
                    <div
                      key={s}
                      onClick={() => { setSelSurf(s); setMarkAll(false); }}
                      style={{
                        display:"flex", alignItems:"center", gap:7,
                        marginBottom:5, padding:"5px 8px", borderRadius:8,
                        background: selSurf===s ? "#f3f0ff" : "transparent",
                        cursor:"pointer", transition:"background .15s",
                      }}
                    >
                      <div style={{
                        width:10, height:10, borderRadius:3,
                        background:cd.hex, flexShrink:0,
                        border:"1px solid rgba(0,0,0,0.1)",
                      }}/>
                      <div>
                        <div style={{
                          fontSize:9, fontWeight:700,
                          color:"#5040a0", lineHeight:1.2,
                        }}>
                          {SURF_LABELS[s]?.split("/")[0]}
                        </div>
                        <div style={{ fontSize:9, color:"#9b7fe8" }}>
                          {cd.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Estado vazio */
          <div style={{
            background:"#fff", borderRadius:14, padding:20,
            boxShadow:"0 2px 16px rgba(102,126,234,0.07)",
            textAlign:"center",
            color:"#c0b0d8", fontSize:12, fontWeight:600,
            display:"flex", alignItems:"center",
            justifyContent:"center", gap:8,
          }}>
            <span style={{ fontSize:22 }}>🦷</span>
            Toque em qualquer dente para marcar condição por superfície
          </div>
        )}
      </div>

      {/* ── Legenda ── */}
      <div style={{
        padding:"0 10px 14px",
        display:"flex", gap:4, flexWrap:"wrap", justifyContent:"center",
      }}>
        {Object.entries(COND).map(([k,v]) => (
          <div key={k} style={{
            display:"flex", alignItems:"center", gap:4,
            background:"rgba(255,255,255,0.9)", borderRadius:20,
            padding:"3px 9px",
            border:"1px solid rgba(118,75,162,0.12)",
          }}>
            <div style={{
              width:8, height:8, borderRadius:"50%",
              background:v.hex, flexShrink:0,
              border:"1px solid rgba(0,0,0,0.1)",
            }}/>
            <span style={{ fontSize:9, color:"#8070a0", fontWeight:700 }}>
              {v.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
