/**
 * GET /api/ping
 * Endpoint leve que executa uma query trivial no Supabase apenas para
 * gerar atividade e evitar o pause automático do plano Free (7 dias ociosos).
 *
 * Pode ser chamado manualmente ou por monitor externo (UptimeRobot etc).
 */
import { createClient } from "@supabase/supabase-js";

// Mesmas credenciais usadas no frontend (anon key — pública por design)
const SUPABASE_URL = "https://swwxrybldjfhicdurnch.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3d3hyeWJsZGpmaGljZHVybmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzAzMzMsImV4cCI6MjA5Mjk0NjMzM30.ba1232EYersCtHILmSm5pv4Sb6fgtMUuaNyDC07AjDY";

export default async function handler(req, res) {
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
