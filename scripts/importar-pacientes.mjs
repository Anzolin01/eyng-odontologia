// Importa pacientes da agenda do Google (via /api/agenda-import) pro Supabase.
// Replica o comportamento do onImportarPacientes do App.jsx.
// Uso: node scripts/importar-pacientes.mjs [--dry]
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://swwxrybldjfhicdurnch.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3d3hyeWJsZGpmaGljZHVybmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzAzMzMsImV4cCI6MjA5Mjk0NjMzM30.ba1232EYersCtHILmSm5pv4Sb6fgtMUuaNyDC07AjDY";

const DRY = process.argv.includes("--dry");
const EXCLUIR = new Set(["cleber", "sobrancelha"]); // lembretes pessoais / blocos sem nome, não pacientes

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const hoje = new Date().toLocaleDateString("pt-BR");
const hojeISO = new Date().toISOString().split("T")[0];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Nomes da agenda
const r = await fetch("https://eyng-odontologia.vercel.app/api/agenda-import");
const d = await r.json();
const nomes = d.nomesPacientes;

// 2. Pacientes já existentes
const { data: existentes, error: e1 } = await supabase.from("patients").select("id, data");
if (e1) { console.error("Erro lendo existentes:", e1.message); process.exit(1); }
const nomesExistentes = existentes.map(p => (p.data?.name || "").toLowerCase());

// jaExiste: todas as palavras >=3 chars do nome aparecem em algum cadastrado
const jaExiste = (nome) => {
  const palavras = nome.toLowerCase().split(/\s+/).filter(p => p.length >= 3);
  if (!palavras.length) return false;
  return nomesExistentes.some(ex => palavras.every(p => ex.includes(p)));
};

// 3. Decide
const aInserir = [], pulados = [];
for (const n of nomes) {
  if (EXCLUIR.has(n.nome.toLowerCase()))      { pulados.push([n.nome, "lembrete/excluido"]); continue; }
  if (jaExiste(n.nome))                        { pulados.push([n.nome, "ja cadastrado"]);     continue; }
  aInserir.push(n);
}

console.log(`\n== Existentes no banco: ${existentes.length} ==`);
console.log(`== Vao ser inseridos: ${aInserir.length} ==`);
aInserir.forEach(n => console.log("  + " + n.nome));
console.log(`== Pulados: ${pulados.length} ==`);
pulados.forEach(([nm, motivo]) => console.log(`  - ${nm} (${motivo})`));

if (DRY) { console.log("\n[DRY-RUN] nada foi inserido."); process.exit(0); }

// 4. Insere
let ok = 0;
for (const n of aInserir) {
  const futuro = n.ultimaConsulta && n.ultimaConsulta > hojeISO;
  const novo = {
    id: uid(),
    name: n.nome,
    phone: "", birth: "", cpf: "",
    professional: "Dr. João Beno",
    specialty: "Clínico Geral",
    treatment: "",
    financialStatus: "Em dia", balance: 0,
    allergies: [],
    notes: [{ id: uid(), type: "preference", text: `Importado da agenda do Google em ${hoje}` }],
    procedures: [], contactLog: [],
    lastVisit: futuro ? "" : (n.ultimaConsulta || ""),
    nextReturn: futuro ? n.ultimaConsulta : "",
    returnStatus: "ok",
  };
  const { error } = await supabase.from("patients").insert({ data: novo });
  if (error) console.error("  ERRO ao inserir", n.nome, ":", error.message);
  else { ok++; console.log("  inserido:", n.nome); }
}
console.log(`\nConcluido: ${ok}/${aInserir.length} inseridos.`);
