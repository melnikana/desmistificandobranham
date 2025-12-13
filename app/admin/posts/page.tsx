"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminLayout from "@/components/admin/AdminLayout";
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
    try {
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

      const { data, error, count } = await query;

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

      setPosts(postsWithAuthors as Post[]);
      setTotalItems(count || 0);
    } catch (err) {
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
    router.push(`/admin/create-post?id=${postId}`);
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
    <AdminLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <Button 
            onClick={() => router.push("/admin/create-post")}
            className="text-white hover:bg-[#2a2a2a]"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <Plus className="h-4 w-4" />
            Adicionar novo
          </Button>
        </div>

        {/* Mensagem de feedback */}
        {feedbackMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-blue-800">{feedbackMessage}</span>
            <div className="flex items-center gap-2">
              {feedbackAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    feedbackAction();
                    setFeedbackAction(null);
                  }}
                  className="text-blue-800 hover:text-blue-900"
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
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              <span className="text-sm text-gray-600">
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
              >
                Limpar seleção
              </Button>
            </div>
          )}
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Carregando posts...</p>
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
    </AdminLayout>
  );
}
