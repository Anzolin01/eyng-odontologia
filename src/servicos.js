// Tabela de serviços pré-definidos
// Adicione, remova ou ajuste valores conforme necessário

export const SERVICOS = [
  // ── Consultas ──
  { id: "s01", categoria: "Consultas",     desc: "Consulta / Avaliação inicial",     valor: 150  },
  { id: "s02", categoria: "Consultas",     desc: "Retorno / Acompanhamento",          valor: 100  },

  // ── Ortodontia ──
  { id: "s10", categoria: "Ortodontia",    desc: "Instalação de aparelho metálico",   valor: 2500 },
  { id: "s11", categoria: "Ortodontia",    desc: "Instalação de aparelho estético",   valor: 3200 },
  { id: "s12", categoria: "Ortodontia",    desc: "Manutenção ortodôntica mensal",     valor: 180  },
  { id: "s13", categoria: "Ortodontia",    desc: "Contenção fixa",                    valor: 350  },
  { id: "s14", categoria: "Ortodontia",    desc: "Contenção removível",               valor: 250  },
  { id: "s15", categoria: "Ortodontia",    desc: "Documentação ortodôntica completa", valor: 400  },

  // ── Implantodontia ──
  { id: "s20", categoria: "Implantodontia", desc: "Cirurgia de implante",             valor: 3500 },
  { id: "s21", categoria: "Implantodontia", desc: "Coroa sobre implante (unitária)",  valor: 1800 },
  { id: "s22", categoria: "Implantodontia", desc: "Reabertura / cicatrizador",        valor: 350  },
  { id: "s23", categoria: "Implantodontia", desc: "Enxerto ósseo",                   valor: 1500 },

  // ── Prótese ──
  { id: "s30", categoria: "Prótese",       desc: "PPR (prótese parcial removível)",   valor: 1800 },
  { id: "s31", categoria: "Prótese",       desc: "Prótese total (dentadura)",         valor: 1400 },
  { id: "s32", categoria: "Prótese",       desc: "Coroa metalocerâmica",              valor: 900  },
  { id: "s33", categoria: "Prótese",       desc: "Coroa em zircônia",                 valor: 1400 },

  // ── Estética ──
  { id: "s40", categoria: "Estética",      desc: "Clareamento a laser (sessão)",      valor: 350  },
  { id: "s41", categoria: "Estética",      desc: "Clareamento caseiro (kit)",         valor: 280  },
  { id: "s42", categoria: "Estética",      desc: "Faceta de resina (dente)",          valor: 450  },
  { id: "s43", categoria: "Estética",      desc: "Faceta de porcelana (dente)",       valor: 1200 },

  // ── Clínico Geral ──
  { id: "s50", categoria: "Clínico Geral", desc: "Limpeza / Profilaxia",              valor: 150  },
  { id: "s51", categoria: "Clínico Geral", desc: "Restauração simples (resina)",      valor: 220  },
  { id: "s52", categoria: "Clínico Geral", desc: "Restauração composta (resina)",     valor: 320  },
  { id: "s53", categoria: "Clínico Geral", desc: "Extração simples",                  valor: 250  },
  { id: "s54", categoria: "Clínico Geral", desc: "Extração de siso (simples)",        valor: 450  },
  { id: "s55", categoria: "Clínico Geral", desc: "Extração de siso (cirúrgica)",      valor: 700  },
  { id: "s56", categoria: "Clínico Geral", desc: "Tratamento de canal (unirradicular)", valor: 650 },
  { id: "s57", categoria: "Clínico Geral", desc: "Tratamento de canal (multirradicular)", valor: 900 },
  { id: "s58", categoria: "Clínico Geral", desc: "Placa de bruxismo",                 valor: 600  },
  { id: "s59", categoria: "Clínico Geral", desc: "Raio-X periapical",                 valor: 50   },
  { id: "s60", categoria: "Clínico Geral", desc: "Raio-X panorâmico",                 valor: 120  },
  { id: "s61", categoria: "Clínico Geral", desc: "Aplicação de flúor",                valor: 80   },

  // ── Fotografias / Documentação ──
  { id: "s70", categoria: "Documentação",  desc: "Fotografias bucais (set completo)", valor: 180  },
  { id: "s71", categoria: "Documentação",  desc: "Tomografia computadorizada",        valor: 280  },
];

export const CATEGORIAS = [...new Set(SERVICOS.map(s => s.categoria))];
