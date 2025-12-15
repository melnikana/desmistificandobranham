"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LexicalEditorComplete from "@/components/admin/LexicalEditorComplete";
import PublishModal, { PublishData } from "@/components/admin/PublishModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Save, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NewPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(!!postId);
  const [isEditMode, setIsEditMode] = useState(!!postId);
  const [title, setTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [contentJson, setContentJson] = useState<any>(null);
  const [contentHtml, setContentHtml] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    
    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      if (mounted && checking) {
        console.log('⚠️ Timeout na verificação de sessão, assumindo modo dev');
        const dev = typeof window !== "undefined" ? localStorage.getItem("dev_auth_user") : null;
        if (dev || true) { // Force dev mode if timeout
          setChecking(false);
        }
      }
    }, 2000); // 2 segundos
    
    supabase.auth.getUser().then((res) => {
      const user = res?.data?.user;
      if (!mounted) return;
      clearTimeout(timeoutId);
      
      if (!user) {
        const dev = typeof window !== "undefined" ? localStorage.getItem("dev_auth_user") : null;
        if (!dev) {
          // Criar usuário dev se não existir
          if (typeof window !== "undefined") {
            localStorage.setItem("dev_auth_user", JSON.stringify({ id: "dev", email: "dev@local" }));
          }
        }
        setChecking(false);
      } else {
        setChecking(false);
      }
    }).catch((err) => {
      console.error('Erro ao verificar usuário:', err);
      clearTimeout(timeoutId);
      if (mounted) {
        // Force dev mode on error
        if (typeof window !== "undefined") {
          localStorage.setItem("dev_auth_user", JSON.stringify({ id: "dev", email: "dev@local" }));
        }
        setChecking(false);
      }
    });
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [router]);

  // Load post data if editing
  useEffect(() => {
    if (!postId || checking) return;
    
    async function loadPost() {
      setLoading(true);
      try {
        const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (hasSupabase) {
          const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("id", postId)
            .single();

          if (error) throw error;
          
          if (data) {
            setTitle(data.title || "");
            setContentText(data.content_text || "");
            setContentJson(data.content_json || null);
            setContentHtml(data.content_html || null);
          }
        } else {
          // Fallback to localStorage
          const existing = JSON.parse(localStorage.getItem("dev_posts") || "[]");
          const post = existing.find((p: any) => String(p.id) === String(postId));
          
          if (post) {
            setTitle(post.title || "");
            setContentText(post.content_text || "");
            setContentJson(post.content_json || null);
            setContentHtml(post.content_html || null);
          } else {
            setMsg("Post não encontrado.");
          }
        }
      } catch (err: any) {
        console.error("Erro ao carregar post:", err);
        setMsg("Erro ao carregar post: " + (err.message || ""));
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [postId, checking]);

  async function handleSave(publish = false, publishData?: PublishData) {
    setSaving(true);
    setMsg("");

    if (!title.trim()) {
      setMsg("Por favor, adicione um título ao post");
      setSaving(false);
      return;
    }

    let coverImageUrl = null;

    // Upload cover image if provided
    if (publish && publishData?.coverImage) {
      try {
        const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (hasSupabase) {
          const fileExt = publishData.coverImage.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const { data, error } = await supabase.storage
            .from('post-covers')
            .upload(fileName, publishData.coverImage);

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('post-covers')
            .getPublicUrl(fileName);
          
          coverImageUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error("Error uploading cover image:", err);
        // Continue without cover image
      }
    }

    const postData = {
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      content_text: contentText,
      content_json: contentJson,
      content_html: contentHtml,
      status: publish ? (publishData?.isScheduled ? "scheduled" : "published") : "draft",
      featured_image_url: coverImageUrl,
      publish_date: publishData?.publishDate || new Date().toISOString(),
      categories: publishData?.categories || [],
      tags: publishData?.tags || [],
      updated_at: new Date().toISOString(),
    } as any;

    // Add created_at only for new posts
    if (!isEditMode) {
      postData.created_at = new Date().toISOString();
    }

    try {
      const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (hasSupabase) {
        if (isEditMode && postId) {
          // Update existing post
          const { error } = await supabase
            .from("posts")
            .update(postData)
            .eq("id", postId);
          
          if (error) throw error;
          setMsg("Post atualizado com sucesso.");
        } else {
          // Create new post
          const { error } = await supabase.from("posts").insert([postData]);
          if (error) throw error;
          setMsg("Post criado com sucesso.");
        }
        setTimeout(() => router.push("/admin/posts"), 1500);
        return;
      }

      // Fallback to localStorage
      const existing = JSON.parse(localStorage.getItem("dev_posts") || "[]");
      
      if (isEditMode && postId) {
        // Update existing post in localStorage
        const index = existing.findIndex((p: any) => String(p.id) === String(postId));
        if (index !== -1) {
          existing[index] = { ...existing[index], ...postData };
          localStorage.setItem("dev_posts", JSON.stringify(existing));
          setMsg("Post atualizado localmente (dev).");
        }
      } else {
        // Create new post in localStorage
        postData.id = Date.now();
        existing.unshift(postData);
        localStorage.setItem("dev_posts", JSON.stringify(existing));
        setMsg(publish ? "Post publicado localmente (dev)." : "Rascunho salvo localmente (dev).");
      }
      
      setTimeout(() => router.push("/admin/posts"), 1500);
    } catch (err: any) {
      console.error(err);
      setMsg(err?.message || "Erro ao salvar post");
    } finally {
      setSaving(false);
      setShowPublishModal(false);
    }
  }

  async function handlePublish(publishData: PublishData) {
    await handleSave(true, publishData);
  }

  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-muted-foreground">
          {checking ? "Verificando sessão..." : "Carregando post..."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/posts")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Editando
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {saving ? "Salvando..." : msg || ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              disabled={!title.trim()}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={saving || !title.trim()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Rascunho
            </Button>
            <Button
              size="sm"
              onClick={() => setShowPublishModal(true)}
              disabled={saving || !title.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Publicar
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto py-12" style={{ paddingLeft: '80px', paddingRight: '80px' }}>
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título sem título"
              className="w-full text-5xl font-bold mb-8 border-none outline-none resize-none"
              style={{
                paddingLeft: 0,
                fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              }}
            />

            {/* Editor */}
            <div className="relative" style={{ marginLeft: '-80px', paddingLeft: '80px' }}>
              <LexicalEditorComplete
                onChange={(payload) => {
                  setContentText(payload.text || "");
                  setContentJson(payload.json || null);
                  setContentHtml(payload.html || null);
                }}
                placeholder="Digite / para comandos..."
                initialContent={contentJson ? JSON.stringify(contentJson) : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do Post</DialogTitle>
          </DialogHeader>
          <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-8" style={{
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
            }}>
              {title || "Título sem título"}
            </h1>
            {contentHtml ? (
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            ) : (
              <p className="text-muted-foreground italic">Nenhum conteúdo ainda...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Modal */}
      <PublishModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        title={title}
        onPublish={handlePublish}
        publishing={saving}
      />
    </>
  );
}

