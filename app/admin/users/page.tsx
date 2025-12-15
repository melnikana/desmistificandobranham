"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/admin/AdminShell";
import UsersTable, { User } from "@/components/admin/UsersTable";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { checkAdminPermission } from "@/lib/authUtils";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "warning">("success");

  useEffect(() => {
    async function checkPermission() {
      const { isAdmin, error } = await checkAdminPermission();
      if (!isAdmin) {
        router.push("/admin?error=permission_denied");
        return;
      }
      setChecking(false);
    }
    checkPermission();
  }, [router]);

  const showFeedback = (message: string, type: "success" | "error" | "warning" = "success") => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 5000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let token = session?.access_token;
      
      if (!token) {
        if (typeof window !== 'undefined') {
          const devAuth = localStorage.getItem('dev_auth_user');
          if (devAuth) {
            token = 'dev-auth-token';
          }
        }
      }

      if (!token) {
        throw new Error('Não autenticado');
      }

      const hasSupabase = 
        typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

      if (!hasSupabase) {
        const devUsers = JSON.parse(localStorage.getItem('dev_users') || '[]');
        setUsers(devUsers);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar usuários');
      }

      setUsers(data.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      showFeedback(error.message || 'Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checking) {
      loadUsers();
    }
  }, [checking, loadUsers]);

  const handleDelete = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let token = session?.access_token;
      
      if (!token) {
        if (typeof window !== 'undefined') {
          const devAuth = localStorage.getItem('dev_auth_user');
          if (devAuth) {
            token = 'dev-auth-token';
          }
        }
      }

      if (!token) {
        throw new Error('Não autenticado');
      }

      const hasSupabase = 
        typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

      if (!hasSupabase) {
        const devUsers = JSON.parse(localStorage.getItem('dev_users') || '[]');
        const filtered = devUsers.filter((u: any) => u.id !== userToDelete.id);
        localStorage.setItem('dev_users', JSON.stringify(filtered));
        setUsers(filtered);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        showFeedback('Usuário excluído com sucesso!', 'success');
        setDeleting(false);
        return;
      }

      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir usuário');
      }

      setUsers(users.filter(u => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      showFeedback('Usuário excluído com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      showFeedback(error.message || 'Erro ao excluir usuário', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let token = session?.access_token;
      
      if (!token) {
        if (typeof window !== 'undefined') {
          const devAuth = localStorage.getItem('dev_auth_user');
          if (devAuth) {
            token = 'dev-auth-token';
          }
        }
      }

      if (!token) {
        throw new Error('Não autenticado');
      }

      const hasSupabase = 
        typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

      if (!hasSupabase) {
        const devUsers = JSON.parse(localStorage.getItem('dev_users') || '[]');
        const updated = devUsers.map((u: any) => 
          u.id === userId ? { ...u, role: newRole } : u
        );
        localStorage.setItem('dev_users', JSON.stringify(updated));
        setUsers(updated);
        showFeedback('Função atualizada com sucesso!', 'success');
        return;
      }

      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar função');
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showFeedback('Função atualizada com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao atualizar função:', error);
      showFeedback(error.message || 'Erro ao atualizar função', 'error');
    }
  };

  const handlePasswordReset = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let token = session?.access_token;
      
      if (!token) {
        if (typeof window !== 'undefined') {
          const devAuth = localStorage.getItem('dev_auth_user');
          if (devAuth) {
            token = 'dev-auth-token';
          }
        }
      }

      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar nova senha');
      }

      if (data.data?.emailSent) {
        showFeedback('Nova senha gerada e enviada por email com sucesso!', 'success');
      } else if (data.data?.emailError) {
        showFeedback(
          `Nova senha gerada, mas houve um problema ao enviar o email: ${data.data.emailError}`,
          'warning'
        );
      } else {
        showFeedback('Nova senha gerada com sucesso!', 'success');
      }
    } catch (error: any) {
      console.error('Erro ao gerar nova senha:', error);
      showFeedback(error.message || 'Erro ao gerar nova senha', 'error');
    }
  };

  if (checking) {
    return (
      <AdminShell title="Usuários">
        <div className="flex items-center justify-center p-10">
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Usuários">
      <div className="space-y-6">
        {/* Feedback Messages */}
        {feedbackMessage && (
          <div
            className={`rounded-lg border p-4 shadow-sm ${
              feedbackType === 'success'
                ? 'bg-green-50 text-green-900 border-green-200'
                : feedbackType === 'error'
                ? 'border-destructive bg-destructive/10 text-destructive'
                : 'bg-yellow-50 text-yellow-900 border-yellow-200'
            }`}
          >
            <p className="text-sm font-medium">
              {feedbackMessage}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie usuários do sistema e suas permissões
            </p>
          </div>
          <Button onClick={() => router.push("/admin/users/new")} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar usuário
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
            <p className="text-muted-foreground">Carregando usuários...</p>
          </div>
        ) : (
          <UsersTable
            users={users}
            onDelete={handleDelete}
            onRoleChange={handleRoleChange}
            onPasswordReset={handlePasswordReset}
          />
        )}
      </div>

      {/* Delete Dialog */}
      {userToDelete && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          userName={userToDelete.name || 'Usuário'}
          userEmail={userToDelete.email}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
    </AdminShell>
  );
}
