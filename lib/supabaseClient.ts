import { createClient } from "@supabase/supabase-js";

// #region agent log
fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabaseClient.ts:4',message:'Checking env vars before createClient',data:{hasUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasKey:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,urlValue:process.env.NEXT_PUBLIC_SUPABASE_URL||'undefined',isClient:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// Verificar se as variáveis estão definidas antes de criar o cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// #region agent log
fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabaseClient.ts:12',message:'Env vars extracted',data:{supabaseUrl:supabaseUrl||'undefined',supabaseAnonKey:supabaseAnonKey?'defined':'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// Se não houver variáveis, criar um cliente dummy que não falha mas não funciona
// Isso permite que o código rode em modo dev sem Supabase
let supabase: ReturnType<typeof createClient>;
if (!supabaseUrl || !supabaseAnonKey) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabaseClient.ts:18',message:'Creating dummy client - env vars missing',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  // Criar cliente com valores dummy válidos para evitar erro de inicialização
  // Usar uma URL válida mas que não será usada realmente
  supabase = createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder');
} else {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabaseClient.ts:28',message:'Creating real Supabase client',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Exportar também uma função helper para verificar se Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

export { supabase };
