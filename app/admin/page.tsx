// app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import PostsList from "@/components/admin/PostsList";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h1>Painel administrativo</h1>
          <div>
            <button onClick={() => router.push("/admin/create-post")}>Novo post</button>
          </div>
        </div>

        <PostsList />
      </div>
    </AdminLayout>
  );
}
