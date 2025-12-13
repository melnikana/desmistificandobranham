/**
 * Serviço de envio de emails
 * Função utilitária para enviar emails através da API route
 */

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Envia email com credenciais de acesso para um novo usuário
 * @param name - Nome completo do usuário
 * @param email - Email do usuário
 * @param password - Senha temporária gerada
 * @returns Promise com resultado do envio
 */
export async function sendUserCredentialsEmail(
  name: string,
  email: string,
  password: string
): Promise<SendEmailResult> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/emailService.ts:24',message:'About to import supabaseClient',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Obter token de autenticação do usuário atual
    const { supabase } = await import('@/lib/supabaseClient');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/emailService.ts:27',message:'Supabase client imported, getting session',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const { data: { session } } = await supabase.auth.getSession();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/emailService.ts:29',message:'Session retrieved',data:{hasSession:!!session,hasToken:!!session?.access_token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    let token: string | null = null;
    
    if (session?.access_token) {
      token = session.access_token;
    } else {
      // Verificar se está em modo dev (localStorage)
      if (typeof window !== 'undefined') {
        const devAuth = localStorage.getItem('dev_auth_user');
        if (devAuth) {
          // Em modo dev, usar um token especial que será tratado na API
          token = 'dev-auth-token';
        }
      }
    }

    if (!token) {
      return {
        success: false,
        error: 'Não autenticado. Faça login para enviar emails.'
      };
    }

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: email,
        name: name,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao enviar email:', data);
      return {
        success: false,
        error: data.error || 'Erro ao enviar email',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Erro ao chamar API de email:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao enviar email',
    };
  }
}

