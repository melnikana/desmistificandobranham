// app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
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

  if (checking) return <div style={{ padding: 40 }}>Verificando sessão...</div>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button 
            onClick={() => router.push("/admin/create-post")}
            className="text-white hover:bg-[#2a2a2a]"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <Plus className="h-4 w-4" />
            Novo post
          </Button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-zinc-950)' }}>Bem-vindo ao Painel Administrativo</h2>
          <p className="text-gray-600 mb-4">
            Gerencie seus posts, categorias, tags e muito mais.
          </p>
          <Button onClick={() => router.push("/admin/posts")} variant="outline">
            Ver todos os posts
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
