import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { checkAdminPermissionServer } from '@/lib/authUtils';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        return NextResponse.json({ ok: true, data: devUsers });
      }
      return NextResponse.json({ ok: true, data: [] });
    }

    // Buscar usuários da tabela profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      // Se a tabela profiles não existir, buscar do auth.users
      console.warn('Erro ao buscar profiles, tentando auth.users:', profilesError);
      
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (usersError) {
        throw usersError;
      }

      // Mapear usuários do auth para o formato esperado
      const usersData = users.map((user) => ({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        role: user.user_metadata?.role || 'assinante',
        created_at: user.created_at,
      }));

      return NextResponse.json({ ok: true, data: usersData });
    }

    return NextResponse.json({ ok: true, data: profiles || [] });
  } catch (e: any) {
    console.error('Erro ao listar usuários:', e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const body = await req.json();
    const { userId } = body;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
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
        const filtered = devUsers.filter((u: any) => u.id !== userId);
        localStorage.setItem('dev_users', JSON.stringify(filtered));
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Deletar da tabela profiles (se existir)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    // Ignorar erro se a tabela não existir
    if (profileError && !profileError.message.includes('does not exist')) {
      console.warn('Erro ao deletar profile:', profileError);
    }

    // Deletar do Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      throw authError;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Erro ao deletar usuário:', e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}




