// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const u = data?.user || null;
      if (!u) {
        const dev = typeof window !== "undefined" ? localStorage.getItem("dev_auth_user") : null;
        if (dev) {
          setUser(JSON.parse(dev));
          setLoading(false);
          return;
        }
        router.push("/login");
        return;
      }
      setUser(u);
      setLoading(false);
    }
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        const dev = typeof window !== "undefined" ? localStorage.getItem("dev_auth_user") : null;
        if (!dev) {
          router.push("/login");
        } else {
          setUser(JSON.parse(dev));
        }
      } else {
        setUser(session.user);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    try {
      localStorage.removeItem("dev_auth_user");
    } catch (e) {}
    router.push("/login");
  }

  if (loading) return <div style={{ padding: 40 }}>Verificando sessão...</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1>Painel Admin</h1>
      <p>Bem-vinda, {user.email}</p>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => router.push("/admin/posts/new")} style={{ marginRight: 8 }}>
          Novo Post
        </button>
        <button onClick={handleLogout}>Sair</button>
      </div>

      <hr style={{ marginTop: 20, marginBottom: 20 }} />

      <p>Aqui listaremos os posts em breve.</p>
    </div>
  );
}
