import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { checkAdminPermissionServer } from '@/lib/authUtils';

const VALID_ROLES = ['administrador', 'editor', 'autor', 'colaborador', 'assinante'];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const body = await req.json();
    const { role: newRole } = body;
    const userId = params.id;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (!newRole) {
      return NextResponse.json({ error: 'Missing role' }, { status: 400 });
    }

    // Validar role
    if (!VALID_ROLES.includes(newRole)) {
      return NextResponse.json({ 
        error: `Role inválida. Deve ser uma das: ${VALID_ROLES.join(', ')}` 
      }, { status: 400 });
    }

    // Verificar se usuário é admin
    const { isAdmin, error: permError } = await checkAdminPermissionServer(token);
    if (!isAdmin) {
      return NextResponse.json({ error: permError || 'Unauthorized' }, { status: 403 });
    }

    // Verificar se Supabase está configurado
    if (!isSupabaseAdminConfigured()) {
      // Fallback para localStorage em modo dev
      if (typeof window !== 'undefined') {
        const devUsers = JSON.parse(localStorage.getItem('dev_users') || '[]');
        const updated = devUsers.map((u: any) => 
          u.id === userId ? { ...u, role: newRole } : u
        );
        localStorage.setItem('dev_users', JSON.stringify(updated));
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Atualizar na tabela profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    // Ignorar erro se a tabela não existir
    if (profileError && !profileError.message.includes('does not exist')) {
      console.warn('Erro ao atualizar profile:', profileError);
    }

    // Atualizar user_metadata no Supabase Auth
    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (getUserError) {
      throw getUserError;
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user?.user_metadata,
        role: newRole,
      },
    });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ ok: true, data: { role: newRole } });
  } catch (e: any) {
    console.error('Erro ao atualizar role:', e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}




