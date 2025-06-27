
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "./ui/button";

type DeleteCategoryAlertProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  categoryName: string | null;
};

export function DeleteCategoryAlert({ isOpen, onOpenChange, onConfirm, categoryName }: DeleteCategoryAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            A categoria <span className="font-semibold text-foreground">"{categoryName}"</span> será excluída permanentemente. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={buttonVariants({ variant: "destructive" })}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
