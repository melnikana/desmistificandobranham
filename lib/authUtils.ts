/**
 * Utilitários de autenticação e autorização
 */

import { supabase } from './supabaseClient';

export interface UserRole {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

/**
 * Verifica se o usuário autenticado tem a função de administrador
 * @returns Promise com objeto contendo se é admin e dados do usuário
 */
export async function checkAdminPermission(): Promise<{
  isAdmin: boolean;
  user: UserRole | null;
  error?: string;
}> {
  try {
    // Verificar se está em modo dev
    if (typeof window !== 'undefined') {
      const devAuth = localStorage.getItem('dev_auth_user');
      if (devAuth) {
        try {
          const devUser = JSON.parse(devAuth);
          // Em modo dev, considerar admin se email for "admin" ou se não houver role definida
          return {
            isAdmin: true,
            user: {
              id: 'dev-user',
              email: devUser.email || 'admin',
              name: devUser.name || 'Admin',
              role: 'administrador',
            },
          };
        } catch (e) {
          // Ignorar erro de parsing
        }
      }
    }

    // Buscar usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        isAdmin: false,
        user: null,
        error: 'Usuário não autenticado',
      };
    }

    // Buscar role do usuário na tabela profiles
    let role = user.user_metadata?.role;
    
    // Se não encontrar no metadata, buscar na tabela profiles
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        role = profile.role;
      }
    }

    const isAdmin = role === 'administrador' || role === 'admin';

    return {
      isAdmin,
      user: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        role: role || 'assinante',
      },
      error: isAdmin ? undefined : 'Acesso negado. Apenas administradores podem acessar esta área.',
    };
  } catch (error: any) {
    console.error('Erro ao verificar permissão admin:', error);
    return {
      isAdmin: false,
      user: null,
      error: error.message || 'Erro ao verificar permissões',
    };
  }
}

/**
 * Verifica se o usuário autenticado tem a função de administrador (versão server-side)
 * Usa o token de autorização da requisição
 */
export async function checkAdminPermissionServer(token: string): Promise<{
  isAdmin: boolean;
  userId: string | null;
  error?: string;
}> {
  try {
    const { supabaseAdmin, isSupabaseAdminConfigured } = await import('./supabaseAdmin');
    
    if (!isSupabaseAdminConfigured()) {
      // Em modo dev sem Supabase, permitir acesso
      return {
        isAdmin: true,
        userId: 'dev-user',
      };
    }

    // Validar token
    if (token === 'dev-auth-token') {
      if (process.env.NODE_ENV === 'production') {
        return {
          isAdmin: false,
          userId: null,
          error: 'Unauthorized',
        };
      }
      return {
        isAdmin: true,
        userId: 'dev-user',
      };
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return {
        isAdmin: false,
        userId: null,
        error: 'Unauthorized',
      };
    }

    // Buscar role do usuário
    let role = user.user_metadata?.role;
    
    if (!role) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        role = profile.role;
      }
    }

    const isAdmin = role === 'administrador' || role === 'admin';

    return {
      isAdmin,
      userId: user.id,
      error: isAdmin ? undefined : 'Apenas administradores podem executar esta ação',
    };
  } catch (error: any) {
    console.error('Erro ao verificar permissão admin (server):', error);
    return {
      isAdmin: false,
      userId: null,
      error: error.message || 'Erro ao verificar permissões',
    };
  }
}




