"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        const devUser = typeof window !== "undefined" ? localStorage.getItem("dev_auth_user") : null;
        if (devUser) {
          try {
            setUser(JSON.parse(devUser));
          } catch (e) {
            // Ignorar erro
          }
        }
      }
    }
    fetchUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("dev_auth_user");
    }
    router.push("/login");
  }

  const userEmail = user?.email || "admin";
  const userName = user?.user_metadata?.name || userEmail.split("@")[0];

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" asChild className="transition-all duration-200">
        <Link href="/">Ver site</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full transition-all duration-200 hover:ring-2 hover:ring-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium ring-1 ring-border/20">
              {userName.charAt(0).toUpperCase()}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer transition-colors">
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer transition-colors">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

