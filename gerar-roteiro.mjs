import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "Roteiro_Eyng_v2.pdf");

const VINHO  = "#8b3458";
const OURO   = "#c9a84c";
const BRANCO = "#ffffff";
const CINZA1 = "#f8f8f8";
const CINZA2 = "#e2e8f0";
const TEXTO  = "#1a1a1a";
const VERDE  = "#16a34a";
const AZUL   = "#1d4ed8";
const LARANJA= "#d97706";
const VERDE_BG = "#f0fdf4";
const OURO_BG  = "#fefce8";

const W = 595, H = 842, ML = 48, MR = 48;
const CW = W - ML - MR;

const doc = new PDFDocument({
  size: "A4", margin: 0,
  info: { Title: "Eyng Odontologia — Roteiro Primeiros Passos" }
});
doc.pipe(fs.createWriteStream(OUT));

// ── helpers ──
const fc  = c => doc.fillColor(c);
const sc  = c => doc.strokeColor(c);
const box = (x,y,w,h,color,r=0) => { fc(color); r ? doc.roundedRect(x,y,w,h,r).fill() : doc.rect(x,y,w,h).fill(); };
const line= (x,y,w,color) => { sc(color); doc.moveTo(x,y).lineTo(x+w,y).stroke(); };

function badge(x, y, n, color) {
  box(x, y, 26, 26, color, 13);
  fc(BRANCO);
  doc.font("Helvetica-Bold").fontSize(12).text(String(n), x, y + 7, { width: 26, align: "center" });
}

function sectionHead(title, y) {
  fc(VINHO);
  doc.font("Helvetica-Bold").fontSize(10).text(title.toUpperCase(), ML, y, { characterSpacing: 1.2 });
  box(ML, y + 14, 36, 2, OURO);
  return y + 26;
}

function stepHeader(num, title, y) {
  box(0, y, W, 40, CINZA1);
  badge(ML, y + 7, num, VINHO);
  fc(VINHO);
  doc.font("Helvetica-Bold").fontSize(13).text(title, ML + 36, y + 11);
  line(ML, y + 40, CW, CINZA2);
  return y + 52;
}

function tableRow(cols, y, bg) {
  box(ML, y, CW, 22, bg);
  fc(OURO);
  doc.font("Helvetica-Bold").fontSize(8.5).text(cols[0], ML + 10, y + 6, { width: 120 });
  fc(TEXTO);
  doc.font("Helvetica").fontSize(9).text(cols[1], ML + 140, y + 6, { width: CW - 150 });
  return y + 22;
}

function calloutBox(x, y, w, icon, label, body, bg, borderColor) {
  const lines = body.split("\n").length;
  const bh = Math.max(54, lines * 16 + 30);
  box(x, y, w, bh, bg, 8);
  box(x, y, 3, bh, borderColor, 2);
  fc(borderColor);
  doc.font("Helvetica-Bold").fontSize(8.5).text(`${icon}  ${label}`, x + 12, y + 10, { width: w - 20 });
  fc(TEXTO);
  doc.font("Helvetica").fontSize(9).text(body, x + 12, y + 24, { width: w - 24, lineGap: 3 });
  return y + bh + 8;
}

function pageHeader() {
  doc.addPage();
  box(0, 0, W, 36, VINHO);
  fc(OURO);
  doc.font("Helvetica-Bold").fontSize(9).text("EYNG ODONTOLOGIA", ML, 13, { characterSpacing: 1.5 });
  fc("#cccccc");
  doc.font("Helvetica").fontSize(8).text("Roteiro · Primeiros Passos", W - MR - 160, 14, { width: 160, align: "right" });
  return 58;
}

// ══════════════════════════════════════════
// CAPA
// ══════════════════════════════════════════
box(0, 0, W, H, VINHO);
box(0, 500, W, H - 500, "#6b2442");

// Circulo decorativo
fc(BRANCO);
doc.fillOpacity(0.06).circle(W - 60, 120, 180).fill();
doc.fillOpacity(0.05).circle(70, H - 90, 130).fill();
doc.fillOpacity(1);

// Logo
box(W/2 - 42, 138, 84, 84, "rgba(255,255,255,0.15)", 20);
fc(BRANCO);
doc.font("Helvetica-Bold").fontSize(50).text("E", W/2 - 42, 155, { width: 84, align: "center" });

// Título
fc(BRANCO);
doc.font("Helvetica-Bold").fontSize(30).text("Eyng Odontologia", ML, 248, { width: CW, align: "center" });
fc(OURO);
doc.font("Helvetica").fontSize(12).text("Plataforma de Gestão Inteligente", ML, 286, { width: CW, align: "center" });
box(W/2 - 50, 310, 100, 1.5, OURO);

fc(BRANCO);
doc.font("Helvetica-Bold").fontSize(20).text("Roteiro · Primeiros Passos", ML, 322, { width: CW, align: "center" });
fc("#dddddd");
doc.font("Helvetica").fontSize(10).text("Para dentistas e secretárias · Mai/2026", ML, 350, { width: CW, align: "center" });

// Card descritivo
box(ML + 40, 390, CW - 80, 72, "rgba(255,255,255,0.1)", 10);
fc(BRANCO);
doc.font("Helvetica").fontSize(9.5).text(
  "Este guia foi feito para você explorar o Eyng em 15 minutos.\nSiga os passos, veja o resultado esperado em cada um\ne preencha o formulário de feedback no final.",
  ML + 56, 408, { width: CW - 112, align: "center", lineGap: 4 }
);

// Mini índice
const steps = ["① Login", "② Paciente", "③ Agenda", "④ Voz / IA", "⑤ Financeiro", "⑥ Arquivos"];
const sw = (CW - 40) / 3;
steps.forEach((s, i) => {
  const cx = ML + (i % 3) * (sw + 10);
  const cy = 490 + Math.floor(i / 3) * 42;
  box(cx, cy, sw, 32, "rgba(255,255,255,0.12)", 8);
  fc(BRANCO);
  doc.font("Helvetica-Bold").fontSize(9).text(s, cx, cy + 10, { width: sw, align: "center" });
});

// Rodapé capa
fc("#aaaaaa");
doc.font("Helvetica").fontSize(7.5).text("eyng-odontologia.vercel.app", ML, H - 40, { width: CW, align: "center" });

// ══════════════════════════════════════════
// PÁG 2 — Como usar + Passo 1 + Passo 2
// ══════════════════════════════════════════
let y = pageHeader();

y = sectionHead("Como usar este guia", y);
fc(TEXTO);
doc.font("Helvetica").fontSize(9.5).text(
  "Cada passo traz o que fazer, um exemplo real para digitar ou falar, e o resultado esperado na tela. Se algo não aparecer como descrito, anote no formulário de feedback (última página).",
  ML, y, { width: CW, lineGap: 3 }
);
y += 38;

// — Passo 1 Login —
y = stepHeader(1, "Login no sistema", y);

fc(TEXTO);
doc.font("Helvetica").fontSize(9.5).text(
  "Acesse https://eyng-odontologia.vercel.app e entre com as credenciais abaixo:", ML, y, { width: CW }
);
y += 22;

box(ML, y, CW, 24, VINHO);
fc(BRANCO);
doc.font("Helvetica-Bold").fontSize(8.5).text("PERFIL", ML + 10, y + 7);
doc.font("Helvetica-Bold").fontSize(8.5).text("USUÁRIO", ML + 160, y + 7);
doc.font("Helvetica-Bold").fontSize(8.5).text("SENHA", ML + 310, y + 7);
y += 24;

[["Dentista (Dra. Caroline)", "caroline", "carol123"],
 ["Secretária", "recepcao", "recepcao123"]].forEach(([perfil, user, pass], i) => {
  box(ML, y, CW, 22, i % 2 ? CINZA1 : BRANCO);
  fc(TEXTO); doc.font("Helvetica").fontSize(9).text(perfil, ML + 10, y + 6, { width: 140 });
  fc(VINHO);  doc.font("Helvetica-Bold").fontSize(9).text(user, ML + 160, y + 6, { width: 130 });
  fc(TEXTO);  doc.font("Helvetica-Bold").fontSize(9).text(pass, ML + 310, y + 6, { width: 130 });
  y += 22;
});
y += 10;

y = calloutBox(ML, y, CW, "✅", "RESULTADO ESPERADO",
  "Splash screen com logo Eyng → painel principal com:\nRetornos · Agenda · Pacientes · Caixa do Dia",
  VERDE_BG, VERDE);
y += 14;

// — Passo 2 Paciente —
y = stepHeader(2, "Cadastrar um paciente de teste", y);

fc(TEXTO);
doc.font("Helvetica").fontSize(9.5).text(
  'Clique em "+ Novo Paciente" (canto superior direito) e preencha os dados abaixo:', ML, y, { width: CW }
);
y += 20;

[["Nome", "Maria Silva Teste"], ["Telefone", "(49) 99999-0001"],
 ["Data de nascimento", "15/03/1985"], ["Tratamento atual", "Ortodontia"],
 ["Alergias", "Dipirona"], ["Profissional", "Dra. Caroline"]
].forEach(([k, v], i) => { y = tableRow([k, v], y, i % 2 ? CINZA1 : BRANCO); });
y += 10;

y = calloutBox(ML, y, CW, "✅", "RESULTADO ESPERADO",
  "Paciente aparece na lista com ícone de especialidade e botão de contato.\nAlergia à Dipirona ficará registrada e será exibida como alerta nos próximos atendimentos.",
  VERDE_BG, VERDE);

// ══════════════════════════════════════════
// PÁG 3 — Passo 3 + Passo 4 (Voz/IA)
// ══════════════════════════════════════════
y = pageHeader();

// — Passo 3 Agenda —
y = stepHeader(3, "Marcar uma consulta na Agenda", y);

fc(TEXTO);
doc.font("Helvetica").fontSize(9.5).text(
  'Clique na aba "Agenda" → escolha um dia → clique num horário vazio → preencha:', ML, y, { width: CW }
);
y += 20;

[["Paciente", "Maria Silva Teste"], ["Horário", "10:00"],
 ["Procedimento", "Consulta de avaliação"], ["Profissional", "Dra. Caroline"]
].forEach(([k, v], i) => { y = tableRow([k, v], y, i % 2 ? CINZA1 : BRANCO); });
y += 10;

y = calloutBox(ML, y, CW, "✅", "RESULTADO ESPERADO",
  "Consulta aparece na grade com cor e nome do paciente.\nHorário 12:00–13:30 fica bloqueado automaticamente (almoço ☕).",
  VERDE_BG, VERDE);
y += 8;

y = calloutBox(ML, y, CW, "💡", "DICA — Fila de Espera",
  "Se não houver vaga, use o botão \"🪑 Fila de Espera\" no topo da agenda.\nCadastre o paciente e envie convite pelo WhatsApp quando abrir horário.",
  OURO_BG, OURO);
y += 14;

// — Passo 4 Voz/IA —
y = stepHeader(4, "Registro por Voz com IA  ⭐ Principal novidade", y);

fc(TEXTO);
doc.font("Helvetica").fontSize(9.5).text(
  "Abra a ficha de Maria → aba 🎤 Voz/IA → toque no microfone e diga naturalmente:", ML, y, { width: CW }
);
y += 18;

// Bloco de exemplo de fala
box(ML, y, CW, 58, "#1e1e2e", 10);
fc(OURO);
doc.font("Helvetica-Bold").fontSize(8).text("● EXEMPLO — fale isso (pode adaptar):", ML + 14, y + 10);
fc(BRANCO);
doc.font("Helvetica").fontSize(9.5).text(
  '"Fiz limpeza completa e aplicação de flúor. Paciente tem sensibilidade nos dentes posteriores.\nOrientar escovar 3x ao dia e usar fio dental. Retorno em 6 semanas."',
  ML + 14, y + 24, { width: CW - 28, lineGap: 3 }
);
y += 68;

fc(TEXTO);
doc.font("Helvetica").fontSize(9.5).text(
  "Toque no quadrado vermelho para parar → aguarde 2-3 segundos → a IA vai separar:", ML, y, { width: CW }
);
y += 18;

const campos = [
  ["📋  Procedimento", "Profilaxia dental com aplicação de flúor e controle de sensibilidade", VINHO],
  ["🗓  Próximo Retorno", "\"6 semanas\" → calcula a data automaticamente (ex: 11/06/2026)", AZUL],
  ["💬  Orientação", "Mensagem pronta em linguagem amigável para enviar ao paciente", VERDE],
  ["⚠️  Alerta", "Dipirona (alergia cadastrada) aparece automaticamente como alerta", LARANJA],
];
campos.forEach(([campo, desc, cor], i) => {
  box(ML, y, CW, 26, i % 2 ? CINZA1 : BRANCO, 0);
  box(ML, y, 3, 26, cor);
  fc(cor);
  doc.font("Helvetica-Bold").fontSize(8.5).text(campo, ML + 10, y + 7, { width: 120 });
  fc(TEXTO);
  doc.font("Helvetica").fontSize(8.5).text(desc, ML + 136, y + 7, { width: CW - 146, lineGap: 2 });
  y += 26;
});
y += 8;

y = calloutBox(ML, y, CW, "📲", "ENVIAR ORIENTAÇÃO PELO WHATSAPP",
  "No card \"Orientação ao Paciente\", clique no botão verde \"Enviar WhatsApp\".\nAbre o WhatsApp com o número da Maria e a mensagem já escrita — só apertar enviar!",
  VERDE_BG, VERDE);

// ══════════════════════════════════════════
// PÁG 4 — Passo 5 + 6 + Feedback
// ══════════════════════════════════════════
y = pageHeader();

// — Passo 5 Financeiro —
y = stepHeader(5, "Lançar valor no Financeiro", y);

fc(TEXTO);
doc.font("Helvetica").fontSize(9.5).text(
  "Na ficha de Maria → aba 💰 Financeiro → botão \"+ Lançamento\":", ML, y, { width: CW }
);
y += 20;

[["Tipo", "Receita"], ["Descrição", "Limpeza + flúor"],
 ["Valor", "R$ 180,00"], ["Forma de pagamento", "Pix"], ["Status", "Pago"]
].forEach(([k, v], i) => { y = tableRow([k, v], y, i % 2 ? CINZA1 : BRANCO); });
y += 10;

y = calloutBox(ML, y, CW, "✅", "RESULTADO ESPERADO",
  "Valor aparece em \"Caixa do Dia\" no painel.\nCard \"Recebido/Mês\" no dashboard atualiza com o total.",
  VERDE_BG, VERDE);
y += 14;

// — Passo 6 Arquivos —
y = stepHeader(6, "Enviar foto ou arquivo do paciente", y);

fc(TEXTO);
doc.font("Helvetica").fontSize(9.5).text(
  "Na ficha de Maria → aba 😠 Arquivos → arraste uma foto ou PDF direto para a área:", ML, y, { width: CW }
);
y += 18;

box(ML, y, CW, 44, CINZA1, 10);
sc(CINZA2); doc.roundedRect(ML, y, CW, 44, 10).stroke();
fc(OURO);
doc.font("Helvetica-Bold").fontSize(11).text("📎  Arraste fotos ou PDFs aqui", ML, y + 12, { width: CW, align: "center" });
fc("#999999");
doc.font("Helvetica").fontSize(8).text("JPG · PNG · PDF · HEIC · DOC", ML, y + 28, { width: CW, align: "center" });
y += 54;

y = calloutBox(ML, y, CW, "✅", "RESULTADO ESPERADO",
  "Arquivo aparece na lista com ícone, nome e opção de remover.\nFotos ficam salvas na nuvem — acessíveis de qualquer dispositivo.",
  VERDE_BG, VERDE);
y += 16;

// ── FORMULÁRIO DE FEEDBACK ──
box(0, y, W, 36, VINHO);
fc(BRANCO);
doc.font("Helvetica-Bold").fontSize(13).text("📝  Formulário de Feedback", ML, y + 10);
y += 46;

fc(TEXTO);
doc.font("Helvetica").fontSize(9).text(
  "Depois de testar, responda abaixo e devolva o PDF (ou tire foto e mande por WhatsApp):",
  ML, y, { width: CW }
);
y += 20;

const perguntas = [
  "1.  O registro por voz separou os campos corretamente?  ( sim · parcialmente · não )",
  "2.  O botão de WhatsApp funcionou? Abriu com a mensagem certa?",
  "3.  Conseguiu fazer upload de foto ou arquivo?",
  "4.  Algo travou ou ficou confuso? Descreva:",
  "5.  O que mais te animou no sistema?",
  "6.  O que está faltando para usar no dia a dia?",
];

perguntas.forEach(p => {
  fc(VINHO);
  doc.font("Helvetica-Bold").fontSize(8.5).text(p, ML, y, { width: CW });
  y += 14;
  line(ML, y, CW, CINZA2); y += 8;
  line(ML, y, CW, CINZA2); y += 14;
});

// Rodapé
box(0, H - 32, W, 32, CINZA1);
fc("#999999");
doc.font("Helvetica").fontSize(7.5).text(
  "Eyng Odontologia · Plataforma de Gestão Inteligente · Mai/2026  |  eyng-odontologia.vercel.app",
  ML, H - 19, { width: CW, align: "center" }
);

doc.end();
console.log("✅ PDF gerado em:", OUT);
