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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Budget } from "@/types";
import { useCategories } from "@/hooks/use-categories";

const formSchema = z.object({
  category: z.string().min(1, { message: "A categoria é obrigatória." }),
  amount: z.coerce.number().positive({ message: "O valor do orçamento deve ser positivo." }),
});

type AddBudgetDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddBudget: (budget: Omit<Budget, "id">) => void;
  onUpdateBudget: (budget: Budget) => void;
  budgetToEdit: Budget | null;
  existingCategories: string[];
};

export function AddBudgetDialog({
  isOpen,
  onOpenChange,
  onAddBudget,
  onUpdateBudget,
  budgetToEdit,
  existingCategories,
}: AddBudgetDialogProps) {
  const { categories: userCategories } = useCategories();
  const expenseCategories = userCategories.filter(c => c !== 'Salário');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      amount: 0,
    },
  });

  useEffect(() => {
    if (budgetToEdit) {
      form.reset(budgetToEdit);
    } else {
      form.reset({
        category: "",
        amount: 0,
      });
    }
  }, [budgetToEdit, form, isOpen]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (budgetToEdit) {
      const updatedBudget: Budget = {
        ...budgetToEdit,
        ...values,
      };
      onUpdateBudget(updatedBudget);
    } else {
      onAddBudget(values);
    }
    onOpenChange(false);
  }

  const isEditMode = !!budgetToEdit;
  const availableCategories = expenseCategories.filter(
    (cat) => !existingCategories.includes(cat) || (isEditMode && cat === budgetToEdit.category)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Orçamento" : "Adicionar Orçamento"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize o valor para a sua categoria de orçamento."
              : "Defina um limite de gastos para uma categoria."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isEditMode && budgetToEdit && (
                        <SelectItem key={budgetToEdit.category} value={budgetToEdit.category}>
                          {budgetToEdit.category}
                        </SelectItem>
                      )}
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Orçamento (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="500.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? "Salvar Alterações" : "Adicionar Orçamento"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
