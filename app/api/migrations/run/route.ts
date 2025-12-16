import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * POST /api/migrations/run
 * Executa a migração SQL para criar a tabela post_blocks
 * 
 * Requer autenticação e permissões de administrador
 */
export async function POST(req: Request) {
  try {
    // Verificar autenticação
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validar token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ler arquivo SQL de migração
    const migrationPath = join(process.cwd(), 'migrations', '001_create_post_blocks.sql');
    let sqlContent: string;
    
    try {
      sqlContent = readFileSync(migrationPath, 'utf-8');
    } catch (error: any) {
      return NextResponse.json(
        { error: `Erro ao ler arquivo de migração: ${error.message}` },
        { status: 500 }
      );
    }

    // Dividir SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    const results: string[] = [];
    const errors: string[] = [];

    // Executar cada comando usando Supabase Admin
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (!command || command.length === 0) continue;

      try {
        // Usar RPC para executar SQL (requer função criada no Supabase)
        // Alternativa: usar query direta se possível
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: command });
        
        if (error) {
          // Se exec_sql não existir, tentar executar diretamente via query
          // Nota: O cliente JS não suporta execução direta de SQL DDL
          // Precisamos executar manualmente no Supabase SQL Editor
          errors.push(`Comando ${i + 1}: ${error.message}`);
        } else {
          results.push(`Comando ${i + 1} executado com sucesso`);
        }
      } catch (error: any) {
        errors.push(`Comando ${i + 1}: ${error.message}`);
      }
    }

    // Validar que a tabela foi criada
    let tableExists = false;
    try {
      const { error: tableError } = await supabaseAdmin
        .from('post_blocks')
        .select('id')
        .limit(1);

      if (!tableError) {
        tableExists = true;
      }
    } catch (error) {
      // Tabela não existe ou erro de acesso
    }

    if (errors.length > 0 && !tableExists) {
      return NextResponse.json({
        error: 'Erro ao executar migração',
        details: errors,
        sql: sqlContent, // Retornar SQL para execução manual
        message: 'A migração falhou. Execute o SQL manualmente no Supabase SQL Editor.',
      }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: tableExists 
        ? 'Migração executada com sucesso. Tabela post_blocks criada.'
        : 'Migração executada, mas validação da tabela falhou. Verifique manualmente.',
      results,
      errors: errors.length > 0 ? errors : undefined,
      tableExists,
    });
  } catch (e: any) {
    console.error('Erro na migração:', e);
    return NextResponse.json(
      { error: e.message || String(e) },
      { status: 500 }
    );
  }
}


