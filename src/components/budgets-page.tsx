"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusCircle, MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Transaction, Budget } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { AddBudgetDialog } from "./add-budget-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBudgets } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

function BudgetCard({ budget, transactions, onEdit, onDelete }: { budget: Budget; transactions: Transaction[]; onEdit: (budget: Budget) => void; onDelete: (budget: Budget) => void; }) {
  const [currentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());

  const spentAmount = useMemo(() => {
    return transactions
      .filter(t => {
        const transactionDate = new Date(`${t.date}T00:00:00`);
        return t.category === budget.category &&
               t.type === 'despesa' &&
               t.status === 'consolidado' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions, budget.category, currentMonth, currentYear]);

  const remainingAmount = budget.amount - spentAmount;
  const progress = (spentAmount / budget.amount) * 100;
  const progressColor = progress > 100 ? "bg-red-500" : "bg-primary";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{budget.category}</CardTitle>
          <CardDescription>Orçamento de {formatCurrency(budget.amount)}</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Abrir menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(budget)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(budget)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            <Progress value={progress} indicatorClassName={progressColor} />
            <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{formatCurrency(spentAmount)}</span> gastos de {formatCurrency(budget.amount)}
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className={`text-sm font-medium ${remainingAmount < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
          {remainingAmount >= 0 ? `${formatCurrency(remainingAmount)} restantes` : `${formatCurrency(Math.abs(remainingAmount))} acima do orçamento`}
        </p>
      </CardFooter>
    </Card>
  );
}


export function BudgetsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { budgets, loading: budgetsLoading, addBudget, updateBudget, deleteBudget } = useBudgets();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isDialogOpen) {
      setBudgetToEdit(null);
    }
  }, [isDialogOpen]);

  const handleOpenAddDialog = () => {
    setBudgetToEdit(null);
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (budget: Budget) => {
    setBudgetToEdit(budget);
    setIsDialogOpen(true);
  };

  const handleAddBudget = async (newBudgetData: Omit<Budget, "id">) => {
    await addBudget(newBudgetData);
    toast({
      title: "Orçamento Adicionado",
      description: `Orçamento para "${newBudgetData.category}" foi adicionado.`,
    });
  };

  const handleUpdateBudget = async (updatedBudget: Budget) => {
    await updateBudget(updatedBudget.id, { category: updatedBudget.category, amount: updatedBudget.amount });
    toast({
      title: "Orçamento Atualizado",
      description: `Orçamento para "${updatedBudget.category}" foi atualizado.`,
    });
  };

  const handleDeleteBudget = async (budgetToDelete: Budget) => {
    await deleteBudget(budgetToDelete.id);
    toast({
        title: "Orçamento Excluído",
        description: `O orçamento para "${budgetToDelete.category}" foi excluído.`,
        variant: "destructive"
    });
  };

  const existingCategories = useMemo(() => budgets.map(b => b.category), [budgets]);
  const isLoading = budgetsLoading || transactionsLoading;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-6 xl:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Orçamentos</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Orçamento
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {budgets.length > 0 ? (
            budgets.map(budget => (
              <BudgetCard key={budget.id} budget={budget} transactions={transactions} onEdit={handleOpenEditDialog} onDelete={handleDeleteBudget} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
               <h3 className="text-2xl font-bold tracking-tight">Você ainda não tem orçamentos</h3>
               <p className="text-sm text-muted-foreground mt-2">Comece a adicionar orçamentos para controlar seus gastos.</p>
               <Button className="mt-6" onClick={handleOpenAddDialog}>Adicionar Orçamento</Button>
            </div>
          )}
        </div>
      )}

      <AddBudgetDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddBudget={handleAddBudget}
        onUpdateBudget={handleUpdateBudget}
        budgetToEdit={budgetToEdit}
        existingCategories={existingCategories}
      />
    </main>
  );
}
