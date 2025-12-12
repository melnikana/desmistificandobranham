"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Editor from "@/components/editor/Editor";
import { useRouter } from "next/navigation";

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [categories, setCategories] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contentText, setContentText] = useState("");
  const [contentJson, setContentJson] = useState<any>(null);
  const [contentHtml, setContentHtml] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(String(reader.result));
      reader.readAsDataURL(f);
    } else {
      setImagePreview(null);
    }
  }

  async function handleSave(publish = true) {
    setSaving(true);
    setMsg("");
    const post = {
      title,
      author,
      slug,
      date: date || new Date().toISOString(),
      categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
      content_text: contentText,
      content_json: contentJson,
      content_html: contentHtml,
      image_url: null as string | null,
      published: publish,
      created_at: new Date().toISOString(),
    } as any;

    try {
      const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (hasSupabase && imageFile) {
        const filePath = `posts/${Date.now()}_${imageFile.name}`;
        const { error: upErr } = await supabase.storage.from("posts").upload(filePath, imageFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("posts").getPublicUrl(filePath);
        post.image_url = urlData.publicUrl;
      }

      if (hasSupabase) {
        const { error } = await supabase.from("posts").insert([post]);
        if (error) throw error;
        setMsg("Post salvo no Supabase com sucesso.");
        router.push("/admin");
        return;
      }

      const existing = JSON.parse(localStorage.getItem("dev_posts") || "[]");
      existing.unshift(post);
      localStorage.setItem("dev_posts", JSON.stringify(existing));
      setMsg(publish ? "Post publicado localmente (dev)." : "Rascunho salvo localmente (dev).");
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      setMsg(err?.message || "Erro ao salvar post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="p-2 rounded border" style={{ color: "#121212" }}>
          ←
        </button>

        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} className="px-4 py-2 border rounded shadow-sm" style={{ backgroundColor: "#ffffff", color: "#121212" }}>Rascunho</button>
          <button onClick={() => handleSave(true)} className="px-4 py-2 bg-black text-white rounded">Publicar</button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <input
          placeholder="Título do post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full max-w-2xl mx-auto text-3xl md:text-4xl font-serif text-center p-4 border-0 outline-none"
          style={{
            backgroundColor: "transparent",
            color: title ? "#121212" : "#B7B6B6",
          }}
        />
      </div>

      {/* Image upload area */}
      <div className="flex justify-center mb-6">
        <label className="w-full max-w-lg h-56 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer" style={{ backgroundColor: "#F7F7F7" }}>
          <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className="max-h-56 object-contain" />
          ) : (
            <div className="text-center" style={{ color: "#B7B6B6" }}>+
              <div className="text-sm">Adicionar imagem</div>
            </div>
          )}
        </label>
      </div>

      {/* Editor */}
      <div className="rounded-lg shadow mb-6" style={{ backgroundColor: "#ffffff" }}>
        <Editor
          onChange={(payload) => {
            setContentText(payload.text || "");
            setContentJson(payload.json || null);
            setContentHtml(payload.html || null);
          }}
          initialJSON={contentJson}
        />
      </div>

      {/* Meta fields */}
      <div className="space-y-4 pb-8">
        <input placeholder="Nome do autor" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-3 rounded border" style={{ backgroundColor: "#ffffff", color: "#121212" }} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="p-3 rounded border md:col-span-2" style={{ backgroundColor: "#ffffff", color: "#121212" }} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-3 rounded border" style={{ backgroundColor: "#ffffff", color: "#121212" }} />
        </div>

        <input placeholder="Categoria" value={categories} onChange={(e) => setCategories(e.target.value)} className="w-full p-3 rounded border" style={{ backgroundColor: "#ffffff", color: "#121212" }} />
      </div>

      {msg && <p className="text-sm text-red-600 mt-4">{msg}</p>}
    </div>
    </div>
  );
}
