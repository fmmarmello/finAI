"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
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

const initialTransactions: Transaction[] = [
    { id: "1", description: "Salário", amount: 5000, type: "receita", date: "2024-05-01", category: "Salário", source: "sample", status: "consolidado" },
    { id: "2", description: "Aluguel", amount: 1500, type: "despesa", date: "2024-05-05", category: "Moradia", source: "sample", status: "consolidado" },
    { id: "3", description: "Supermercado", amount: 450, type: "despesa", date: "2024-05-07", category: "Alimentação", source: "sample", status: "consolidado" },
    { id: "4", description: "Conta de Luz", amount: 150, type: "despesa", date: "2024-05-10", category: "Moradia", source: "sample", status: "consolidado" },
    { id: "5", description: "Netflix", amount: 39.9, type: "despesa", date: "2024-05-12", category: "Assinaturas & Serviços", source: "sample", status: "consolidado" },
    { id: "6", description: "Cinema", amount: 60, type: "despesa", date: "2024-05-15", category: "Lazer", source: "sample", status: "consolidado" },
    { id: "7", description: "Uber", amount: 25.5, type: "despesa", date: "2024-05-18", category: "Transporte", source: "sample", status: "consolidado" },
];

const initialBudgets: Budget[] = [
    { id: "1", category: "Alimentação", amount: 800 },
    { id: "2", category: "Transporte", amount: 200 },
    { id: "3", category: "Lazer", amount: 300 },
    { id: "4", category: "Moradia", amount: 1800 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

function BudgetCard({ budget, transactions, onEdit, onDelete }: { budget: Budget; transactions: Transaction[]; onEdit: (budget: Budget) => void; onDelete: (budget: Budget) => void; }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [transactions] = useState<Transaction[]>(initialTransactions); // In a real app, this would be fetched
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

  const handleAddBudget = (newBudgetData: Omit<Budget, "id">) => {
    const newBudget: Budget = {
      ...newBudgetData,
      id: new Date().getTime().toString(),
    };
    setBudgets(prev => [...prev, newBudget].sort((a,b) => a.category.localeCompare(b.category)));
    toast({
      title: "Orçamento Adicionado",
      description: `Orçamento para "${newBudget.category}" foi adicionado.`,
    });
  };

  const handleUpdateBudget = (updatedBudget: Budget) => {
    setBudgets(prev =>
      prev.map(b => (b.id === updatedBudget.id ? updatedBudget : b))
       .sort((a,b) => a.category.localeCompare(b.category))
    );
    toast({
      title: "Orçamento Atualizado",
      description: `Orçamento para "${updatedBudget.category}" foi atualizado.`,
    });
  };

  const handleDeleteBudget = (budgetToDelete: Budget) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetToDelete.id));
    toast({
        title: "Orçamento Excluído",
        description: `O orçamento para "${budgetToDelete.category}" foi excluído.`,
        variant: "destructive"
    });
  };

  const existingCategories = useMemo(() => budgets.map(b => b.category), [budgets]);

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
