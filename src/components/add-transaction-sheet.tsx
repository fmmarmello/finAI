"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types";
import { runCategorizeTransaction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";
import { defaultCategories } from "@/lib/categories";

const formSchema = z.object({
  description: z.string().min(2, {
    message: "A descrição deve ter pelo menos 2 caracteres.",
  }),
  amount: z.coerce.number().positive({ message: "O valor deve ser positivo." }),
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
  type: z.enum(["receita", "despesa"]),
  category: z.string().min(1, { message: "A categoria é obrigatória." }),
});

type AddTransactionSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTransaction: (transaction: Omit<Transaction, "id" | "source" | "status" | "ai_confidence_score">) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  transactionToEdit: Transaction | null;
};

export function AddTransactionSheet({ isOpen, onOpenChange, onAddTransaction, onUpdateTransaction, transactionToEdit }: AddTransactionSheetProps) {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();
  const { categories } = useCategories();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      type: "despesa",
      category: "",
    },
  });

  useEffect(() => {
    if (transactionToEdit) {
      const [year, month, day] = transactionToEdit.date.split('-').map(Number);
      form.reset({
        ...transactionToEdit,
        date: new Date(year, month - 1, day),
      });
    } else {
      form.reset({
        description: "",
        amount: 0,
        date: new Date(),
        type: "despesa",
        category: "",
      });
    }
  }, [transactionToEdit, form, isOpen]);


  async function handleDescriptionBlur(description: string) {
    if (description.length < 3 || transactionToEdit) return; // Do not categorize on edit
    setIsCategorizing(true);
    try {
      const result = await runCategorizeTransaction(description);
      if (result.data) {
        // Match against user's categories (case-insensitive)
        const categoryMatch = categories.find(c => c.toLowerCase() === result.data.category.toLowerCase());
        if (categoryMatch) {
          form.setValue("category", categoryMatch);
        } else {
          // If no match in user's list, but it's a default one, use it. Otherwise, "Outros".
          const defaultMatch = defaultCategories.find(c => c.toLowerCase() === result.data.category.toLowerCase());
          form.setValue("category", defaultMatch || "Outros");
        }
      }
    } catch(e) {
      toast({
        variant: "destructive",
        title: "Erro na categorização",
        description: "Não foi possível sugerir uma categoria.",
      });
    } finally {
      setIsCategorizing(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (transactionToEdit) {
      const updatedTransaction: Transaction = {
        ...transactionToEdit,
        description: values.description,
        amount: values.amount,
        date: format(values.date, "yyyy-MM-dd"),
        type: values.type,
        category: values.category,
      };
      onUpdateTransaction(updatedTransaction);
    } else {
      const transactionData = {
        ...values,
        date: format(values.date, "yyyy-MM-dd"),
      };
      onAddTransaction(transactionData);
    }
  }

  const isEditMode = !!transactionToEdit;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar Transação' : 'Adicionar Transação'}</SheetTitle>
          <SheetDescription>
            {isEditMode 
              ? 'Atualize os detalhes da sua transação.'
              : 'Adicione uma nova despesa ou receita. A categoria será sugerida automaticamente.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Almoço no restaurante" {...field} onBlur={() => handleDescriptionBlur(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="despesa">Despesa</SelectItem>
                      <SelectItem value="receita">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Categoria
                    {isCategorizing && <Loader2 className="h-4 w-4 animate-spin" />}
                  </FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da transação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", {})
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">{isEditMode ? 'Salvar Alterações' : 'Adicionar Transação'}</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
