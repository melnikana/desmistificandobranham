"use client";

import React from "react";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminShell({ children, title }: AdminShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 md:px-8">
          <div className="flex flex-1 items-center justify-between">
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
            <div className="ml-auto">
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}

