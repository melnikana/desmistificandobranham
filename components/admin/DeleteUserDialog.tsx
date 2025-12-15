"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userEmail: string;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteUserDialog({
  open,
  onOpenChange,
  userName,
  userEmail,
  onConfirm,
  loading = false,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar exclusão
          </DialogTitle>
          <DialogDescription className="pt-4 text-muted-foreground">
            Tem certeza que deseja excluir o usuário <strong className="text-foreground">{userName}</strong> ({userEmail})?
            <br />
            <br />
            Esta ação não pode ser desfeita. O usuário perderá acesso permanente ao sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

