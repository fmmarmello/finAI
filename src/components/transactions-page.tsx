
"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { RecentTransactions } from "./recent-transactions";
import { AddTransactionSheet } from "./add-transaction-sheet";
import { Transaction } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useTransactions } from "@/hooks/use-transactions";

export function TransactionsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { transactions, loading, addTransaction, updateTransaction, markTransactionAsPaid } = useTransactions();
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

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
  
  const handleMarkAsPaid = async (transaction: Transaction) => {
    await markTransactionAsPaid(transaction);
    toast({
        title: "Transação Paga!",
        description: `"${transaction.description}" foi marcada como paga.`,
    });
  };

  const handleAddTransaction = async (newTransactionData: Omit<Transaction, "id" | "source" | "status" | "ai_confidence_score">) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const newTransaction: Omit<Transaction, "id"> = {
      ...newTransactionData,
      source: "manual",
      status: newTransactionData.date > today ? "pendente" : "consolidado",
    };
    await addTransaction(newTransaction);
    toast({
      title: "Transação Adicionada",
      description: `"${newTransactionData.description}" foi adicionada com sucesso.`,
    });
    setIsSheetOpen(false);
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    await updateTransaction(updatedTransaction.id, updatedTransaction);
    toast({
      title: "Transação Atualizada",
      description: `"${updatedTransaction.description}" foi atualizada com sucesso.`,
    });
    setIsSheetOpen(false);
  };
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      if (!dateRange?.from) return true;
      const transactionDate = new Date(`${transaction.date}T00:00:00`); // Avoid timezone issues
      const fromDate = dateRange.from;
      const toDate = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : fromDate;
      return transactionDate >= fromDate && transactionDate <= toDate;
    });
  }, [transactions, dateRange]);
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-6 xl:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="flex-1 text-lg font-semibold md:text-2xl font-headline">Transações</h1>
        <div className="flex items-center gap-2">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button size="sm" onClick={handleOpenAddSheet}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Transação
          </Button>
        </div>
      </div>
      <RecentTransactions transactions={filteredTransactions} onEdit={handleOpenEditSheet} onMarkAsPaid={handleMarkAsPaid} loading={loading} />
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
