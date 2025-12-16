import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkAdminPermissionServer } from '@/lib/authUtils';

// Inicializar Resend apenas se a API key estiver configurada
const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validar token - aceitar token de dev em desenvolvimento
    if (token === 'dev-auth-token') {
      // Em modo dev, permitir sem validação completa
      // Apenas verificar se está em ambiente de desenvolvimento
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      // Validar token real do Supabase apenas se estiver configurado
      const { isSupabaseAdminConfigured } = await import('@/lib/supabaseAdmin');
      if (isSupabaseAdminConfigured()) {
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (userErr || !userData?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }
      // Se Supabase não estiver configurado, aceitar qualquer token não-dummy em dev
    }

    const { to, name, email, password } = body;
    
    if (!to || !name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verificar se RESEND_API_KEY está configurada
    const resend = getResend();
    if (!resend) {
      console.error('RESEND_API_KEY não configurada');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@desmistificandobranham.com';

    // Template HTML do email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nova senha gerada</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px;">
            <h1 style="color: #111827; font-size: 24px; margin-top: 0; margin-bottom: 20px;">
              Olá, ${name}!
            </h1>
            
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Uma nova senha foi gerada para sua conta no Painel Administrativo.
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0 0 12px 0; font-weight: 600; color: #92400e;">Sua nova senha:</p>
              <p style="margin: 8px 0; color: #78350f;">
                <code style="background-color: #fde68a; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 16px; display: inline-block;">${password}</code>
              </p>
            </div>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                <strong>Importante:</strong> Por segurança, recomendamos que você altere esta senha assim que fizer login no sistema.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px; margin-bottom: 0;">
              Use esta senha para fazer login e, em seguida, altere-a nas configurações da sua conta.
            </p>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Atenciosamente,<br>
                <strong>Equipe Desmistificando Branham</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: 'Nova senha gerada - Painel Administrativo',
      html: emailHtml,
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error('Erro no endpoint de email:', e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}





