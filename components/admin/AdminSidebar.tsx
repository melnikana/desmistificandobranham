"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    // Abrir menu de Posts se estiver em uma página relacionada
    if (pathname?.startsWith("/admin/posts") || pathname?.startsWith("/admin/create-post")) {
      return ["posts"];
    }
    return [];
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) =>
      prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]
    );
  };

  const isActive = (path: string) => pathname === path;
  const isActiveParent = (paths: string[]) => paths.some((p) => pathname?.startsWith(p));

  const menuItemClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors admin-menu-item",
      active
        ? "text-white"
        : "text-slate-300 hover:text-white"
    );

  const menuItemStyle = (active: boolean) =>
    active
      ? { backgroundColor: 'rgba(82, 82, 92, 1)', background: 'unset' }
      : undefined;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 text-white flex flex-col z-40" style={{ backgroundColor: 'var(--background)' }}>
      <div className="p-4 border-b" style={{ borderBottomColor: 'var(--color-zinc-600)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg" style={{ backgroundColor: 'var(--color-zinc-600)', background: 'unset' }}>
            B
          </div>
          <span className="font-semibold text-lg">Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Dashboard */}
        <Link
          href="/admin"
          className={menuItemClass(isActive("/admin"))}
          style={menuItemStyle(isActive("/admin"))}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        {/* Posts */}
        <Collapsible
          open={openMenus.includes("posts")}
          onOpenChange={() => toggleMenu("posts")}
        >
          <CollapsibleTrigger
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors admin-menu-item",
              isActiveParent(["/admin/posts", "/admin/new-post"])
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <span>Posts</span>
            </div>
            {openMenus.includes("posts") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 mt-1 space-y-1">
            <Link
              href="/admin/posts"
              className={menuItemClass(isActive("/admin/posts"))}
              style={menuItemStyle(isActive("/admin/posts"))}
            >
              <span className="text-xs">Todos os posts</span>
            </Link>
            <Link
              href="/admin/create-post"
              className={menuItemClass(isActive("/admin/create-post"))}
              style={menuItemStyle(isActive("/admin/create-post"))}
            >
              <span className="text-xs">Adicionar novo</span>
            </Link>
            <Link
              href="/admin/categories"
              className={menuItemClass(isActive("/admin/categories"))}
              style={menuItemStyle(isActive("/admin/categories"))}
            >
              <span className="text-xs">Categorias</span>
            </Link>
            <Link
              href="/admin/tags"
              className={menuItemClass(isActive("/admin/tags"))}
              style={menuItemStyle(isActive("/admin/tags"))}
            >
              <span className="text-xs">Tags</span>
            </Link>
          </CollapsibleContent>
        </Collapsible>

        {/* Biblioteca */}
        <Collapsible
          open={openMenus.includes("library")}
          onOpenChange={() => toggleMenu("library")}
        >
          <CollapsibleTrigger
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors admin-menu-item",
              isActiveParent(["/admin/library"])
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5" />
              <span>Biblioteca</span>
            </div>
            {openMenus.includes("library") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 mt-1 space-y-1">
            <Link
              href="/admin/library"
              className={menuItemClass(isActive("/admin/library"))}
              style={menuItemStyle(isActive("/admin/library"))}
            >
              <span className="text-xs">Todos os arquivos</span>
            </Link>
            <Link
              href="/admin/library/upload"
              className={menuItemClass(isActive("/admin/library/upload"))}
              style={menuItemStyle(isActive("/admin/library/upload"))}
            >
              <span className="text-xs">Enviar arquivo</span>
            </Link>
          </CollapsibleContent>
        </Collapsible>

        {/* Usuários */}
        <Collapsible
          open={openMenus.includes("users")}
          onOpenChange={() => toggleMenu("users")}
        >
          <CollapsibleTrigger
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors admin-menu-item",
              isActiveParent(["/admin/users"])
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <span>Usuários</span>
            </div>
            {openMenus.includes("users") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 mt-1 space-y-1">
            <Link
              href="/admin/users"
              className={menuItemClass(isActive("/admin/users"))}
              style={menuItemStyle(isActive("/admin/users"))}
            >
              <span className="text-xs">Todos os usuários</span>
            </Link>
            <Link
              href="/admin/users/new"
              className={menuItemClass(isActive("/admin/users/new"))}
              style={menuItemStyle(isActive("/admin/users/new"))}
            >
              <span className="text-xs">Adicionar novo</span>
            </Link>
          </CollapsibleContent>
        </Collapsible>

        {/* Configurações */}
        <Link
          href="/admin/settings"
          className={menuItemClass(isActive("/admin/settings"))}
          style={menuItemStyle(isActive("/admin/settings"))}
        >
          <Settings className="h-5 w-5" />
          <span>Configurações</span>
        </Link>
      </nav>
    </aside>
  );
}

