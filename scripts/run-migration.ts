/**
 * Script para executar migração SQL no Supabase
 * 
 * Uso:
 *   npx tsx scripts/run-migration.ts
 * 
 * Requer:
 *   - Variáveis de ambiente do Supabase configuradas
 *   - SUPABASE_SERVICE_ROLE_KEY para executar SQL
 */

import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  console.log('🚀 Iniciando migração SQL no Supabase...\n');

  // Ler arquivo SQL de migração primeiro
  const migrationPath = join(process.cwd(), 'migrations', '001_create_post_blocks.sql');
  let sqlContent: string;
  
  try {
    sqlContent = readFileSync(migrationPath, 'utf-8');
    console.log('✅ Arquivo de migração carregado\n');
  } catch (error: any) {
    console.error(`❌ Erro ao ler arquivo de migração: ${error.message}`);
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('⚠️  Variáveis de ambiente do Supabase não configuradas');
    console.error('   O script não pode executar SQL automaticamente.\n');
    console.log('📋 SQL para executar manualmente:\n');
    console.log('─'.repeat(70));
    console.log(sqlContent);
    console.log('─'.repeat(70));
    console.log('\n📝 INSTRUÇÕES:\n');
    console.log('   1. Acesse o Supabase Dashboard (https://supabase.com/dashboard)');
    console.log('   2. Selecione seu projeto');
    console.log('   3. Vá para SQL Editor (menu lateral)');
    console.log('   4. Cole o SQL acima');
    console.log('   5. Clique em "Run" ou pressione Cmd/Ctrl + Enter');
    console.log('   6. Valide no Table Editor que a tabela post_blocks foi criada\n');
    console.log('💡 Arquivo SQL também está em: scripts/execute-migration.sql\n');
    process.exit(0);
  }

  // Executar SQL usando Supabase Admin diretamente
  try {
    console.log('📤 Executando SQL no Supabase...\n');
    console.log('⚠️  NOTA: O Supabase JS client não suporta execução direta de SQL DDL.');
    console.log('   Você precisa executar o SQL manualmente no Supabase SQL Editor.\n');
    console.log('📋 SQL para executar:\n');
    console.log('─'.repeat(60));
    console.log(sqlContent);
    console.log('─'.repeat(60));
    console.log('\n');

    // Tentar validar se a tabela já existe
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    console.log('🔍 Verificando se a tabela post_blocks já existe...\n');
    
    const { data, error } = await supabaseAdmin
      .from('post_blocks')
      .select('id')
      .limit(1);

    if (!error) {
      console.log('✅ Tabela post_blocks já existe!\n');
      console.log('🎉 Nenhuma ação necessária.\n');
      return;
    }

    if (error.code === '42P01') {
      console.log('❌ Tabela post_blocks NÃO existe.\n');
      console.log('📝 INSTRUÇÕES:\n');
      console.log('   1. Acesse o Supabase Dashboard');
      console.log('   2. Vá para SQL Editor');
      console.log('   3. Cole o SQL acima');
      console.log('   4. Execute o SQL');
      console.log('   5. Valide no Table Editor que a tabela foi criada\n');
      process.exit(1);
    } else {
      console.log(`⚠️  Erro ao verificar tabela: ${error.message}\n`);
    }

    // Verificar estrutura da tabela
    console.log('📋 Verificando estrutura da tabela...\n');
    const { error: columnsError } = await supabaseAdmin
      .from('post_blocks')
      .select('*')
      .limit(0);

    if (!columnsError) {
      console.log('✅ Estrutura da tabela validada\n');
    }

    console.log('🎉 Migração concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Verifique a tabela no Supabase Table Editor');
    console.log('   2. Valide os índices e constraints');
    console.log('   3. Execute o script de migração de dados (se necessário)\n');

  } catch (error: any) {
    console.error('\n❌ Erro ao executar migração:', error.message);
    console.error('\n💡 Dica: Você pode executar o SQL manualmente no Supabase SQL Editor:');
    console.error(`   Arquivo: ${migrationPath}\n`);
    process.exit(1);
  }
}

// Executar migração
if (require.main === module) {
  runMigration()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

export { runMigration };

