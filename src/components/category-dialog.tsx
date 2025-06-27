
"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "O nome da categoria é obrigatório." }),
});

type CategoryDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (name: string) => void;
  categoryToEdit: string | null;
  existingCategories: string[];
};

export function CategoryDialog({
  isOpen,
  onOpenChange,
  onSave,
  categoryToEdit,
  existingCategories,
}: CategoryDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: categoryToEdit || "" });
    }
  }, [isOpen, categoryToEdit, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values.name);
  };

  const isEditMode = !!categoryToEdit;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Categoria" : "Adicionar Categoria"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere o nome da sua categoria." : "Crie uma nova categoria para organizar suas transações."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Investimentos" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? "Salvar Alterações" : "Adicionar Categoria"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
