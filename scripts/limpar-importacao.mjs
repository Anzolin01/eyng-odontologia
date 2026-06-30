// Corrige lixo da importação de 19/06: apaga lembretes que entraram como paciente,
// renomeia nomes com procedimento grudado, remove duplicados da mesma leva.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://swwxrybldjfhicdurnch.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3d3hyeWJsZGpmaGljZHVybmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzAzMzMsImV4cCI6MjA5Mjk0NjMzM30.ba1232EYersCtHILmSm5pv4Sb6fgtMUuaNyDC07AjDY";

const DRY = process.argv.includes("--dry");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Nomes a apagar por completo (não são pacientes)
const APAGAR = new Set([
  "lembrar paulo agendar tomografia",
  "certificado digital",
]);

// Renomear (nome errado -> nome corrigido)
const RENOMEAR = {
  "elisa delfina agendar": "Elisa Delfina",
  "beatris da silva chamar pra": "Beatris da Silva",
  "pedro aparelho hyrax": "Pedro",
};

// Duplicados a apagar (já existe outro registro com o nome certo)
const APAGAR_DUPLICADO = new Set([
  "clara luna requisicao",
  "gabi (hipoplasia e",
  "lucas pontos",
  "maria clara observar  se o dente 51 está bem fechado",
  "orlando azambuja dente",
  "walter cirurgia",
  "ana  luisa porciuncula",
]);

const { data: pacientes, error } = await supabase.from("patients").select("id, data");
if (error) { console.error(error); process.exit(1); }

let apagados = 0, renomeados = 0, duplicadosRemovidos = 0;
const vistosExatos = new Map(); // nome lowercase -> id já mantido (pra exact-duplicate como "Helena Bender Thomas" e "Laura Gomes ")

for (const p of pacientes) {
  const nome = (p.data?.name || "").trim();
  const key = nome.toLowerCase();

  if (APAGAR.has(key)) {
    console.log("[APAGAR-LIXO]", nome);
    if (!DRY) await supabase.from("patients").delete().eq("id", p.id);
    apagados++;
    continue;
  }

  if (APAGAR_DUPLICADO.has(key)) {
    console.log("[APAGAR-DUPLICADO]", nome);
    if (!DRY) await supabase.from("patients").delete().eq("id", p.id);
    duplicadosRemovidos++;
    continue;
  }

  if (RENOMEAR[key]) {
    console.log("[RENOMEAR]", nome, "->", RENOMEAR[key]);
    if (!DRY) {
      const novoData = { ...p.data, name: RENOMEAR[key] };
      await supabase.from("patients").update({ data: novoData }).eq("id", p.id);
    }
    renomeados++;
    continue;
  }

  // Exact-duplicate dentro da mesma leva (nome idêntico já visto)
  if (vistosExatos.has(key)) {
    console.log("[APAGAR-EXATO-DUPLICADO]", nome, "(mantendo", vistosExatos.get(key) + ")");
    if (!DRY) await supabase.from("patients").delete().eq("id", p.id);
    duplicadosRemovidos++;
    continue;
  }
  vistosExatos.set(key, p.id);
}

console.log(`\nApagados (lixo): ${apagados}`);
console.log(`Renomeados: ${renomeados}`);
console.log(`Duplicados removidos: ${duplicadosRemovidos}`);
if (DRY) console.log("\n[DRY-RUN] nenhuma alteração foi salva.");
