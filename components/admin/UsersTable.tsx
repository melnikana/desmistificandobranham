"use client";

import React from "react";
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
import { MoreHorizontal, Trash2, Key } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

interface UsersTableProps {
  users: User[];
  onDelete: (userId: string) => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onPasswordReset: (userId: string) => void;
}

const ROLE_OPTIONS = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'editor', label: 'Editor' },
  { value: 'autor', label: 'Autor' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'assinante', label: 'Assinante' },
];

export default function UsersTable({
  users,
  onDelete,
  onRoleChange,
  onPasswordReset,
}: UsersTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-12 font-medium">Nome</TableHead>
            <TableHead className="h-12 font-medium">Email</TableHead>
            <TableHead className="h-12 font-medium">Função</TableHead>
            <TableHead className="h-12 font-medium">Data de Criação</TableHead>
            <TableHead className="h-12 w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="border-b transition-colors hover:bg-muted/30"
            >
              <TableCell className="font-medium py-4">
                {user.name || "Sem nome"}
              </TableCell>
              <TableCell className="py-4">
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Select
                  value={user.role || 'assinante'}
                  onValueChange={(newRole) => onRoleChange(user.id, newRole)}
                >
                  <SelectTrigger className="w-40 h-9 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="py-4">
                <span className="text-sm text-muted-foreground">
                  {formatDate(user.created_at)}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50">
                    <DropdownMenuItem onClick={() => onPasswordReset(user.id)} className="cursor-pointer">
                      <Key className="h-4 w-4 mr-2" />
                      <span>Gerar nova senha</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(user.id)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
