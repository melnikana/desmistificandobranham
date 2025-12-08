// components/admin/AdminLayout.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6f7f9" }}>
      <aside style={{
        width: 260, padding: 20, borderRight: "1px solid #e6e9ee",
        background: "#fff"
      }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8, background: "#0f1724",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700
          }}>B</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href="/admin"><a style={{ padding: "8px 10px", borderRadius: 6 }}>Painel</a></Link>
          <Link href="/admin/create-post"><a style={{ padding: "8px 10px", borderRadius: 6 }}>Novo post</a></Link>
          <Link href="/admin/posts"><a style={{ padding: "8px 10px", borderRadius: 6 }}>Todos os posts</a></Link>
        </nav>

        <div style={{ marginTop: 30 }}>
          <button onClick={handleLogout} style={{
            width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #e6e9ee", background: "#fff"
          }}>Sair</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        {children}
      </main>
    </div>
  );
}
