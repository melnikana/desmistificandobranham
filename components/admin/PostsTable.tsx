"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type Post = {
  id: number | string;
  title: string;
  slug?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  author_id?: string;
  author_name?: string;
  author_email?: string;
  category?: string;
  tags?: string[];
  featured_image_url?: string | null;
};

interface PostsTableProps {
  posts: Post[];
  selectedPosts: Set<string | number>;
  onSelectPost: (postId: string | number) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit?: (postId: string | number) => void;
  onDelete?: (postId: string | number) => void;
}

export default function PostsTable({
  posts,
  selectedPosts,
  onSelectPost,
  onSelectAll,
  onEdit,
  onDelete,
}: PostsTableProps) {
  const router = useRouter();
  const allSelected = posts.length > 0 && posts.every((p) => selectedPosts.has(p.id));
  const someSelected = posts.some((p) => selectedPosts.has(p.id));

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Publicado</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Rascunho</Badge>;
      case "trash":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Lixeira</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getSEOScore = (post: Post) => {
    // Simulação de pontuação SEO (pode ser implementada com lógica real)
    const score = Math.floor(Math.random() * 30) + 70; // 70-100
    return score;
  };

  const getSEOBadge = (score: number) => {
    if (score >= 90) {
      return <Badge className="bg-green-500 text-white hover:bg-green-500">{score}/100</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">{score}/100</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white hover:bg-red-500">{score}/100</Badge>;
    }
  };

  const handleEdit = (postId: string | number) => {
    if (onEdit) {
      onEdit(postId);
    } else {
      router.push(`/admin/create-post?id=${postId}`);
    }
  };

  const handleDelete = (postId: string | number) => {
    if (onDelete) {
      onDelete(postId);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Nenhum post encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
                aria-label="Selecionar todos"
              />
            </TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Autor</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SEO Score</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => {
            const isSelected = selectedPosts.has(post.id);
            const seoScore = getSEOScore(post);

            return (
              <TableRow
                key={post.id}
                className={cn(
                  "hover:bg-gray-50",
                  isSelected && "bg-blue-50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelectPost(post.id)}
                    aria-label={`Selecionar ${post.title}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/create-post?id=${post.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {post.title || "Sem título"}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {post.author_name || post.author_email || "Desconhecido"}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {post.category || "Sem categoria"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {post.tags && post.tags.length > 0 ? (
                      post.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {formatDate(post.created_at)}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(post.status)}</TableCell>
                <TableCell>{getSEOBadge(seoScore)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(post.id)}>
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

