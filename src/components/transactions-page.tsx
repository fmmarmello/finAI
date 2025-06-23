"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RecentTransactions } from "./recent-transactions";
import { AddTransactionSheet } from "./add-transaction-sheet";
import { Transaction } from "@/types";
import { useToast } from "@/hooks/use-toast";

const initialTransactions: Transaction[] = [
    { id: "1", description: "Salário", amount: 5000, type: "receita", date: "2024-05-01", category: "Salário", source: "manual", status: "consolidado" },
    { id: "2", description: "Aluguel", amount: 1500, type: "despesa", date: "2024-05-05", category: "Moradia", source: "manual", status: "consolidado" },
    { id: "3", description: "Supermercado", amount: 450, type: "despesa", date: "2024-05-07", category: "Alimentação", source: "manual", status: "consolidado" },
    { id: "4", description: "Conta de Luz", amount: 150, type: "despesa", date: "2024-05-10", category: "Moradia", source: "boleto", status: "consolidado" },
    { id: "5", description: "Netflix", amount: 39.9, type: "despesa", date: "2024-05-12", category: "Assinaturas & Serviços", source: "nubank", status: "consolidado" },
    { id: "6", description: "Cinema", amount: 60, type: "despesa", date: "2024-05-15", category: "Lazer", source: "itau", status: "consolidado" },
    { id: "7", description: "Uber", amount: 25.5, type: "despesa", date: "2024-05-18", category: "Transporte", source: "porto_seguro", status: "consolidado" },
];

export function TransactionsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isSheetOpen) {
      setTransactionToEdit(null);
    }
  }, [isSheetOpen]);

  const handleOpenAddSheet = () => {
    setTransactionToEdit(null);
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsSheetOpen(true);
  };

  const handleAddTransaction = (newTransactionData: Omit<Transaction, "id" | "source" | "status" | "ai_confidence_score">) => {
    const newTransaction: Transaction = {
      ...newTransactionData,
      id: new Date().getTime().toString(),
      source: "manual",
      status: "consolidado",
    };
    setTransactions(prev => [newTransaction, ...prev]);
    toast({
      title: "Transação Adicionada",
      description: `"${newTransaction.description}" foi adicionada com sucesso.`,
    });
    setIsSheetOpen(false);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev =>
      prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
    toast({
      title: "Transação Atualizada",
      description: `"${updatedTransaction.description}" foi atualizada com sucesso.`,
    });
    setIsSheetOpen(false);
  };
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-6 xl:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Transações</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={handleOpenAddSheet}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Transação
          </Button>
        </div>
      </div>
      <RecentTransactions transactions={transactions} onEdit={handleOpenEditSheet} />
      <AddTransactionSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onAddTransaction={handleAddTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        transactionToEdit={transactionToEdit}
      />
    </main>
  );
}
