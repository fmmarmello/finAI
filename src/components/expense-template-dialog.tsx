"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { useData } from "@/contexts/data-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ExpenseTemplate } from "@/types";

const formSchema = z.object({
  name: z.string().trim().min(2, { message: "O nome do modelo é obrigatório." }),
  category: z.string().min(1, { message: "A categoria é obrigatória." }),
});

type ExpenseTemplateDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<ExpenseTemplate, "id">) => void;
  templateToEdit: ExpenseTemplate | null;
};

export function ExpenseTemplateDialog({
  isOpen,
  onOpenChange,
  onSave,
  templateToEdit,
}: ExpenseTemplateDialogProps) {
  const { categories } = useData();
  const expenseCategories = categories.filter(c => c !== 'Salário');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", category: "" },
  });

  useEffect(() => {
    if (isOpen) {
      if (templateToEdit) {
        form.reset(templateToEdit);
      } else {
        form.reset({ name: "", category: "" });
      }
    }
  }, [isOpen, templateToEdit, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
  };

  const isEditMode = !!templateToEdit;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Modelo" : "Adicionar Modelo"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere os detalhes do seu modelo." : "Crie um novo modelo para suas despesas mensais."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Fatura Nubank" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Padrão</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? "Salvar Alterações" : "Adicionar Modelo"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
