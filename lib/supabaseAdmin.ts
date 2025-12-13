import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Se não houver variáveis, criar um cliente dummy para evitar erro de inicialização
// Isso permite que o código rode sem Supabase configurado
let supabaseAdmin: ReturnType<typeof createClient>;
if (!supabaseUrl || !serviceRoleKey) {
  // Criar cliente com valores dummy válidos
  supabaseAdmin = createClient(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.placeholder'
  );
} else {
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
}

// Exportar função helper para verificar se Supabase está configurado
export const isSupabaseAdminConfigured = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
};

export { supabaseAdmin };
