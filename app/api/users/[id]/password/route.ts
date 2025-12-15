import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { checkAdminPermissionServer } from '@/lib/authUtils';

function generateRandomPassword(length = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const all = uppercase + lowercase + numbers + symbols;

  let password = "";
  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Preencher o resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Embaralhar a senha
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const userId = params.id;

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
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Gerar nova senha
    const newPassword = generateRandomPassword(12);

    // Atualizar senha no Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      throw updateError;
    }

    // Buscar dados do usuário para enviar email
    let userName = 'Usuário';
    let userEmail = '';

    // Tentar buscar da tabela profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (profile) {
      userName = profile.name || userName;
      userEmail = profile.email || userEmail;
    } else {
      // Se não encontrar no profile, buscar do auth
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (user) {
        userName = user.user_metadata?.name || user.email?.split('@')[0] || userName;
        userEmail = user.email || userEmail;
      }
    }

    // Tentar enviar email (não bloqueia se falhar)
    let emailSent = false;
    let emailError = null;

    if (userEmail) {
      try {
        // Importar função de envio de email
        const { sendPasswordResetEmail } = await import('@/lib/emailService');
        const emailResult = await sendPasswordResetEmail(userName, userEmail, newPassword);
        emailSent = emailResult.success;
        emailError = emailResult.error || null;
      } catch (emailErr: any) {
        console.error('Erro ao enviar email de redefinição de senha:', emailErr);
        emailError = emailErr.message || 'Erro ao enviar email';
      }
    }

    return NextResponse.json({ 
      ok: true, 
      data: { 
        password: newPassword,
        emailSent,
        emailError: emailError || undefined,
      } 
    });
  } catch (e: any) {
    console.error('Erro ao gerar nova senha:', e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}




