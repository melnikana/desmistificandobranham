// components/admin/PostsList.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type PostRow = {
  id: number | string;
  title: string;
  slug?: string;
  status?: string;
  created_at?: string;
  featured_image_url?: string | null;
};

export default function PostsList() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function loadPosts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
  .from("posts")
  .select("id,title,slug,status,created_at,featured_image_url")
  .order("created_at", { ascending: false })
  .limit(200);


      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
      alert("Erro ao carregar posts. Veja console.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();

    // opcional: realtime subscription para atualizar a lista automaticamente
    const channel = supabase.channel("public:posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      // cleanup
      channel.unsubscribe();
    };
  }, []);

  async function handleDelete(id: number | string) {
    if (!confirm("Deseja realmente excluir esse post?")) return;
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      setPosts(posts.filter((p) => p.id !== id));
      alert("Post removido");
    } catch (err: any) {
      console.error(err);
      alert("Erro ao remover: " + (err.message || err));
    }
  }

  return (
    <div>
      <h2>Posts</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : posts.length === 0 ? (
        <p>Nenhum post encontrado.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {posts.map((p) => (
            <div key={p.id} style={{
              padding: 12, background: "#fff", borderRadius: 8, display: "flex",
              alignItems: "center", justifyContent: "space-between", border: "1px solid #eceff3"
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {p.featured_image_url ? (
                  <img src={p.featured_image_url} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 80, height: 60, borderRadius: 6, background: "#f1f3f6" }} />
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>{p.slug ?? ""} • {p.status}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => router.push(`/admin/posts/new?id=${p.id}`)} style={{ padding: "6px 10px" }}>Editar</button>
                <button onClick={() => handleDelete(p.id)} style={{ padding: "6px 10px" }}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
