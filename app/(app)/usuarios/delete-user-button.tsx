"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteUser } from "./actions";

export function DeleteUserButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(`Excluir o usuário ${userName}?`)) return;
    startTransition(async () => {
      try {
        await deleteUser(userId);
        toast.success("Usuário excluído.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao excluir";
        toast.error(msg);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={pending}
      aria-label={`Excluir ${userName}`}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
