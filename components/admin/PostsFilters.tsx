"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PostsFiltersProps {
  statusFilter: string;
  dateFilter: string;
  categoryFilter: string;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFilter: () => void;
}

export default function PostsFilters({
  statusFilter,
  dateFilter,
  categoryFilter,
  onStatusChange,
  onDateChange,
  onCategoryChange,
  onFilter,
}: PostsFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="trash">Lixeira</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={onDateChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas as datas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as datas</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
            <SelectItem value="year">Este ano</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="uncategorized">Sem categoria</SelectItem>
            {/* Categorias dinâmicas podem ser adicionadas aqui */}
          </SelectContent>
        </Select>

        <Button onClick={onFilter} variant="outline">
          Filtrar
        </Button>
      </div>
    </div>
  );
}




