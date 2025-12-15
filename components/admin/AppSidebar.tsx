"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = React.useState<string[]>(() => {
    if (pathname?.startsWith("/admin/posts")) {
      return ["posts"];
    }
    if (pathname?.startsWith("/admin/users")) {
      return ["users"];
    }
    if (pathname?.startsWith("/admin/library")) {
      return ["library"];
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

  return (
    <aside className="w-64 border-r bg-background flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Admin</span>
            <span className="text-xs text-muted-foreground">Painel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        <div className="space-y-1">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive("/admin")
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {/* Posts */}
          <div>
            <button
              onClick={() => toggleMenu("posts")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActiveParent(["/admin/posts", "/admin/categories", "/admin/tags"])
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span className="flex-1 text-left">Posts</span>
              {openMenus.includes("posts") ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              )}
            </button>
            {openMenus.includes("posts") && (
              <div className="ml-7 mt-1 space-y-1">
                <Link
                  href="/admin/posts"
                  className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive("/admin/posts")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Todos os posts
                </Link>
                <Link
                  href="/admin/posts/new"
                  className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive("/admin/posts/new")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Adicionar novo
                </Link>
                <Link
                  href="/admin/categories"
                  className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive("/admin/categories")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Categorias
                </Link>
                <Link
                  href="/admin/tags"
                  className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive("/admin/tags")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Tags
                </Link>
              </div>
            )}
          </div>

          {/* Biblioteca */}
          <div>
            <button
              onClick={() => toggleMenu("library")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActiveParent(["/admin/library"])
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              <span className="flex-1 text-left">Biblioteca</span>
              {openMenus.includes("library") ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              )}
            </button>
            {openMenus.includes("library") && (
              <div className="ml-7 mt-1 space-y-1">
                <Link
                  href="/admin/library"
                  className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive("/admin/library")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Todos os arquivos
                </Link>
                <Link
                  href="/admin/library/upload"
                  className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive("/admin/library/upload")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Enviar arquivo
                </Link>
              </div>
            )}
          </div>

          {/* Usuários */}
          <div>
            <button
              onClick={() => toggleMenu("users")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActiveParent(["/admin/users"])
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="flex-1 text-left">Usuários</span>
              {openMenus.includes("users") ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              )}
            </button>
            {openMenus.includes("users") && (
              <div className="ml-7 mt-1 space-y-1">
                <Link
                  href="/admin/users"
                  className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive("/admin/users")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Todos os usuários
                </Link>
                <Link
                  href="/admin/users/new"
                  className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive("/admin/users/new")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Adicionar novo
                </Link>
              </div>
            )}
          </div>

          {/* Configurações */}
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive("/admin/settings")
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

