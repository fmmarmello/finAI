
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
import { useData } from "@/contexts/data-context";
import { Switch } from "./ui/switch";

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
  isRecurring: z.boolean().default(false),
});

type AddTransactionSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTransaction: (transaction: Omit<Transaction, "id" | "source" | "status">) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  transactionToEdit: Transaction | null;
};

export function AddTransactionSheet({ isOpen, onOpenChange, onAddTransaction, onUpdateTransaction, transactionToEdit }: AddTransactionSheetProps) {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();
  const { categories } = useData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      type: "despesa",
      category: "",
      isRecurring: false,
    },
  });

  const transactionType = form.watch("type");

  useEffect(() => {
    if (transactionToEdit) {
      const [year, month, day] = transactionToEdit.date.split('-').map(Number);
      form.reset({
        ...transactionToEdit,
        date: new Date(year, month - 1, day),
        isRecurring: transactionToEdit.isRecurring || false,
      });
    } else {
      form.reset({
        description: "",
        amount: 0,
        date: new Date(),
        type: "despesa",
        category: "",
        isRecurring: false,
      });
    }
  }, [transactionToEdit, form, isOpen]);


  async function handleDescriptionBlur(description: string) {
    if (description.length < 3 || transactionToEdit || !categories.length) return;
    setIsCategorizing(true);
    try {
      const result = await runCategorizeTransaction(description, categories);
      if (result.data) {
        form.setValue("category", result.data.category);
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
    const finalValues = {
        ...values,
        isRecurring: values.type === 'despesa' ? values.isRecurring : false,
    }

    if (transactionToEdit) {
      const updatedTransaction: Transaction = {
        ...transactionToEdit,
        description: finalValues.description,
        amount: finalValues.amount,
        date: format(finalValues.date, "yyyy-MM-dd"),
        type: finalValues.type,
        category: finalValues.category,
        isRecurring: finalValues.isRecurring,
      };
      onUpdateTransaction(updatedTransaction);
    } else {
      const transactionData = {
        ...finalValues,
        date: format(finalValues.date, "yyyy-MM-dd"),
      };
      onAddTransaction(transactionData);
    }
  }

  const isEditMode = !!transactionToEdit;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
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
             {transactionType === 'despesa' && (
                <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <FormLabel>Despesa Recorrente</FormLabel>
                            <FormMessage />
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
                />
            )}
            <Button type="submit" className="w-full">{isEditMode ? 'Salvar Alterações' : 'Adicionar Transação'}</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
