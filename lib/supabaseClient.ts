import { createClient } from "@supabase/supabase-js";

// Verificar se as variáveis estão definidas antes de criar o cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Se não houver variáveis, criar um cliente dummy que não falha mas não funciona
// Isso permite que o código rode em modo dev sem Supabase
let supabase: ReturnType<typeof createClient>;
if (!supabaseUrl || !supabaseAnonKey) {
  // Criar cliente com valores dummy válidos para evitar erro de inicialização
  supabase = createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder');
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Exportar também uma função helper para verificar se Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

export { supabase };
