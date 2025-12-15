"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/admin/AdminShell";
import PostsFilters from "@/components/admin/PostsFilters";
import PostsTable, { Post } from "@/components/admin/PostsTable";
import Pagination from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 20;

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState<Set<string | number>>(new Set());
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackAction, setFeedbackAction] = useState<(() => void) | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/posts/page.tsx:45',message:'loadPosts called',data:{hasSupabaseUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasSupabaseKey:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,statusFilter,searchQuery,currentPage},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      // Verificar se Supabase está configurado
      const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined';

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/posts/page.tsx:52',message:'Supabase check',data:{hasSupabase},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
      // #endregion

      if (hasSupabase) {
        let query = supabase
          .from("posts")
          .select("id,title,slug,status,created_at,updated_at,author_id,featured_image_url", { count: "exact" });

        // Aplicar filtro de status
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }

        // Aplicar filtro de busca
        if (searchQuery.trim()) {
          query = query.ilike("title", `%${searchQuery.trim()}%`);
        }

        // Aplicar filtro de data
        if (dateFilter !== "all") {
          const now = new Date();
          let startDate: Date;
          
          switch (dateFilter) {
            case "today":
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              break;
            case "week":
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              break;
            case "month":
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(0);
          }
          
          query = query.gte("created_at", startDate.toISOString());
        }

        // Ordenar e paginar
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE - 1;

        query = query
          .order("created_at", { ascending: false })
          .range(startIndex, endIndex);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/posts/page.tsx:94',message:'About to execute query',data:{startIndex,endIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        const { data, error, count } = await query;

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/posts/page.tsx:100',message:'Query executed',data:{hasData:!!data,dataLength:data?.length,hasError:!!error,errorMessage:error?.message,errorDetails:JSON.stringify(error),count},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        if (error) throw error;

        // Buscar informações dos autores
        // Nota: No cliente, não temos acesso ao admin API, então usamos fallback
        const postsWithAuthors = (data || []).map((post) => {
          // Em produção, você pode buscar de uma tabela de usuários ou usar o admin API no servidor
          return {
            ...post,
            author_name: post.author_id ? `Usuário ${post.author_id}` : "Desconhecido",
            author_email: undefined,
          };
        });

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/posts/page.tsx:111',message:'Success - setting posts from Supabase',data:{postsCount:postsWithAuthors.length,totalItems:count||0},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
        // #endregion

        setPosts(postsWithAuthors as Post[]);
        setTotalItems(count || 0);
      } else {
        // Fallback para localStorage quando Supabase não está configurado
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/posts/page.tsx:141',message:'Using localStorage fallback',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
        // #endregion

        const localPosts = JSON.parse(localStorage.getItem("dev_posts") || "[]");
        
        // Aplicar filtros no localStorage
        let filteredPosts = [...localPosts];

        if (statusFilter !== "all") {
          filteredPosts = filteredPosts.filter((post: any) => post.status === statusFilter);
        }

        if (searchQuery.trim()) {
          filteredPosts = filteredPosts.filter((post: any) => 
            post.title?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (dateFilter !== "all") {
          const now = new Date();
          let startDate: Date;
          
          switch (dateFilter) {
            case "today":
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              break;
            case "week":
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              break;
            case "month":
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(0);
          }
          
          filteredPosts = filteredPosts.filter((post: any) => 
            new Date(post.created_at) >= startDate
          );
        }

        // Ordenar por data de criação (mais recente primeiro)
        filteredPosts.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Paginar
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        const postsWithAuthors = paginatedPosts.map((post: any) => ({
          ...post,
          id: post.id || crypto.randomUUID(),
          author_name: "Dev User",
          author_email: undefined,
        }));

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/posts/page.tsx:201',message:'Success - setting posts from localStorage',data:{totalPosts:localPosts.length,filteredCount:filteredPosts.length,postsCount:postsWithAuthors.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
        // #endregion

        setPosts(postsWithAuthors as Post[]);
        setTotalItems(filteredPosts.length);
      }
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/posts/page.tsx:198',message:'Error caught',data:{errorType:typeof err,errorConstructor:err?.constructor?.name,errorMessage:err?.message,errorCode:err?.code,errorDetails:err?.details,errorHint:err?.hint,errorStringified:JSON.stringify(err),errorKeys:err?Object.keys(err):[]},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error("Erro ao buscar posts:", err);
      setFeedbackMessage("Erro ao carregar posts. Veja o console.");
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, categoryFilter, searchQuery, currentPage]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("public:posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loadPosts]);

  const handleSelectPost = (postId: string | number) => {
    setSelectedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(new Set(posts.map((p) => p.id)));
    } else {
      setSelectedPosts(new Set());
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.size === 0) {
      setFeedbackMessage("Selecione pelo menos um post.");
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }

    const postIds = Array.from(selectedPosts);

    try {
      switch (action) {
        case "trash":
          const { error: trashError } = await supabase
            .from("posts")
            .update({ status: "trash" })
            .in("id", postIds);
          
          if (trashError) throw trashError;
          
          setFeedbackMessage(`${postIds.length} item(s) movido(s) para a lixeira.`);
          setFeedbackAction(() => () => {
            // Função para desfazer
            supabase
              .from("posts")
              .update({ status: "draft" })
              .in("id", postIds)
              .then(() => {
                loadPosts();
                setFeedbackMessage(null);
              });
          });
          setSelectedPosts(new Set());
          loadPosts();
          break;

        case "restore":
          const { error: restoreError } = await supabase
            .from("posts")
            .update({ status: "draft" })
            .in("id", postIds);
          
          if (restoreError) throw restoreError;
          
          setFeedbackMessage(`${postIds.length} item(s) restaurado(s).`);
          setSelectedPosts(new Set());
          loadPosts();
          break;

        case "delete":
          if (!confirm(`Tem certeza que deseja excluir permanentemente ${postIds.length} item(s)?`)) {
            return;
          }
          
          const { error: deleteError } = await supabase
            .from("posts")
            .delete()
            .in("id", postIds);
          
          if (deleteError) throw deleteError;
          
          setFeedbackMessage(`${postIds.length} item(s) excluído(s) permanentemente.`);
          setSelectedPosts(new Set());
          loadPosts();
          break;
      }
    } catch (err: any) {
      console.error(err);
      setFeedbackMessage(`Erro: ${err.message || "Erro ao executar ação"}`);
    }
    
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleEdit = (postId: string | number) => {
    router.push(`/admin/posts/new?id=${postId}`);
  };

  const handleDelete = async (postId: string | number) => {
    if (!confirm("Deseja realmente excluir esse post?")) return;
    
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      
      setFeedbackMessage("Post excluído com sucesso.");
      loadPosts();
    } catch (err: any) {
      console.error(err);
      setFeedbackMessage(`Erro ao excluir: ${err.message || "Erro desconhecido"}`);
    }
    
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    loadPosts();
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <AdminShell title="Posts">
      <div className="space-y-6">
        {/* Mensagem de feedback */}
        {feedbackMessage && (
          <div className="rounded-lg border bg-muted p-4 flex items-center justify-between shadow-sm">
            <span className="text-sm text-foreground">{feedbackMessage}</span>
            <div className="flex items-center gap-2">
              {feedbackAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    feedbackAction();
                    setFeedbackAction(null);
                  }}
                >
                  Desfazer
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFeedbackMessage(null);
                  setFeedbackAction(null);
                }}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gerenciar Posts</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Visualize e gerencie todos os seus posts
            </p>
          </div>
          <Button onClick={() => router.push("/admin/posts/new")} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar novo
          </Button>
        </div>

        {/* Filtros */}
        <PostsFilters
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          categoryFilter={categoryFilter}
          onStatusChange={setStatusFilter}
          onDateChange={setDateFilter}
          onCategoryChange={setCategoryFilter}
          onFilter={handleFilter}
        />

        {/* Busca e ações em massa */}
        <div className="bg-card p-4 rounded-lg border flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFilter();
                }
              }}
              className="pl-10"
            />
          </div>
        </div>

        {selectedPosts.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedPosts.size} selecionado(s)
            </span>
            <Select
              onValueChange={handleBulkAction}
              defaultValue=""
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ações em massa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trash">Mover para lixeira</SelectItem>
                {statusFilter === "trash" && (
                  <SelectItem value="restore">Restaurar</SelectItem>
                )}
                <SelectItem value="delete">Excluir permanentemente</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSelectedPosts(new Set())}
              className="shadow-sm"
            >
              Limpar seleção
            </Button>
          </div>
        )}
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="bg-card rounded-lg border p-12 text-center shadow-sm">
            <p className="text-muted-foreground">Carregando posts...</p>
          </div>
        ) : (
          <>
            <PostsTable
              posts={posts}
              selectedPosts={selectedPosts}
              onSelectPost={handleSelectPost}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Paginação */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}
