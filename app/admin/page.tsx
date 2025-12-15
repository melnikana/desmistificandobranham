"use client";

import React, { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      if (error === 'permission_denied') {
        setErrorMessage('Você não tem permissão para acessar essa área. Apenas administradores podem acessar.');
      }
    }
    
    supabase.auth.getUser().then((res) => {
      const user = res?.data?.user;
      if (!mounted) return;
      if (!user) {
        const dev = typeof window !== "undefined" ? localStorage.getItem("dev_auth_user") : null;
        if (!dev) {
          router.push("/login");
        } else {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <AdminShell title="Dashboard">
        <div className="flex items-center justify-center p-10">
          <p className="text-muted-foreground">Verificando sessão...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-6">
        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive shadow-sm">
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie seus posts, categorias, tags e muito mais.
            </p>
          </div>
          <Button onClick={() => router.push("/admin/posts/new")} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo post
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Bem-vindo ao Painel Administrativo</CardTitle>
            <CardDescription>
              Comece criando novos posts ou gerenciando conteúdo existente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => router.push("/admin/posts")} variant="outline" className="shadow-sm">
              Ver todos os posts
            </Button>
            <Button onClick={() => router.push("/admin/posts/new")} className="shadow-sm">
              Criar post
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
