/**
 * GET /api/ping
 * Endpoint leve que executa uma query trivial no Supabase apenas para
 * gerar atividade e evitar o pause automático do plano Free (7 dias ociosos).
 *
 * Pode ser chamado manualmente ou por monitor externo (UptimeRobot etc).
 */
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({
      ok: false,
      error: "Supabase não configurado (faltam env vars)",
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Query leve: conta pacientes (só pra movimentar o banco)
    const { count, error } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      pacientes: count,
      mensagem: "Banco respondeu — pause adiado por +7 dias",
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
