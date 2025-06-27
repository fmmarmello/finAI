"use client";

import { useState, useEffect, useRef } from "react";
import { PlusCircle, Upload, Loader2 } from "lucide-react";
import { format, addMonths } from "date-fns";

import { Button } from "@/components/ui/button";
import { BalanceSummary } from "./balance-summary";
import { RecentTransactions } from "./recent-transactions";
import { CategoryChart } from "./category-chart";
import { AddTransactionSheet } from "./add-transaction-sheet";
import { AiInsights } from "./ai-insights";
import { Transaction } from "@/types";
import { type AnalyzeSpendingOutput } from "@/ai/flows/analyze-spending";
import { runAnalyzeSpending, runExtractTransactionData } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { type ExtractTransactionDataOutput } from "@/ai/flows/extract-transaction-data";
import { useTransactions } from "@/hooks/use-transactions";

export function Dashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { transactions, loading, addTransaction, updateTransaction } = useTransactions();
  const [insights, setInsights] = useState<AnalyzeSpendingOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function analyze() {
      if (loading) return; // Wait for transactions to load
      const consolidatedTransactions = transactions.filter(t => t.status === 'consolidado');
      if(consolidatedTransactions.length > 3) {
        setIsAnalyzing(true);
        try {
          const result = await runAnalyzeSpending(consolidatedTransactions);
          if (result.data) {
            setInsights(result.data);
          } else {
             toast({
              variant: "destructive",
              title: "Erro na Análise",
              description: result.error,
            });
          }
        } catch(e) {
           toast({
              variant: "destructive",
              title: "Erro na Análise",
              description: "Não foi possível gerar os insights.",
            });
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setInsights(null);
        setIsAnalyzing(false);
      }
    }
    analyze();
  }, [transactions, loading, toast]);
  
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

  const handleAddTransaction = async (newTransactionData: Omit<Transaction, "id" | "source" | "status" | "ai_confidence_score">) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const transactionToAdd = {
      ...newTransactionData,
      source: "manual",
      status: newTransactionData.date > today ? "pendente" : "consolidado",
    };
    await addTransaction(transactionToAdd as Omit<Transaction, "id">);
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const dataUri = reader.result as string;
        const result = await runExtractTransactionData(dataUri);

        if (result.data) {
          const allNewTxs: Omit<Transaction, 'id'>[] = [];
          
          result.data.forEach((tx: ExtractTransactionDataOutput['transactions'][0]) => {
            const isInstallment = tx.installmentNumber && tx.totalInstallments && tx.totalInstallments > 1;
            
            const baseTx: Omit<Transaction, 'id'| 'description'> = {
                amount: Math.abs(tx.amount),
                date: tx.date,
                type: tx.amount >= 0 ? 'despesa' : 'receita', // Basic logic, could be improved
                category: 'Outros', // Default category, user can change later
                source: 'upload',
                status: 'consolidado', // will be updated below
                installmentNumber: tx.installmentNumber,
                totalInstallments: tx.totalInstallments,
            };

            const originalDate = new Date(`${tx.date}T00:00:00`);
            const today = new Date();
            today.setHours(0,0,0,0);

            // Add the original transaction from the document
            const originalTx: Omit<Transaction, 'id'> = {
                ...baseTx,
                description: isInstallment ? `${tx.description.replace(/(\d+[/of]+\d+)/, '').trim()} (${tx.installmentNumber}/${tx.totalInstallments})` : tx.description,
                status: originalDate > today ? "pendente" : "consolidado",
            };
            allNewTxs.push(originalTx);

            // Create future installments if applicable
            if (isInstallment && tx.installmentNumber! < tx.totalInstallments!) {
              for (let i = tx.installmentNumber! + 1; i <= tx.totalInstallments!; i++) {
                const futureDate = addMonths(originalDate, i - tx.installmentNumber!);
                const futureTx: Omit<Transaction, 'id'> = {
                  ...baseTx,
                  date: format(futureDate, "yyyy-MM-dd"),
                  description: `${tx.description.replace(/(\d+[/of]+\d+)/, '').trim()} (${i}/${tx.totalInstallments})`,
                  installmentNumber: i,
                  totalInstallments: tx.totalInstallments,
                  status: 'pendente', // All future installments are pending
                };
                allNewTxs.push(futureTx);
              }
            }
          });
          
          // Batch add transactions
          for (const tx of allNewTxs) {
            await addTransaction(tx);
          }

          toast({
            title: "Documento Processado",
            description: `${allNewTxs.length} transações foram extraídas e adicionadas.`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro na Extração",
            description: result.error,
          });
        }
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Erro no Processamento",
          description: "Ocorreu um erro ao processar o arquivo.",
        });
      } finally {
        setIsExtracting(false);
         if(fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
       toast({
          variant: "destructive",
          title: "Erro no Upload",
          description: "Não foi possível ler o arquivo.",
        });
      setIsExtracting(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-6 xl:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
           <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
            />
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isExtracting}>
            {isExtracting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Carregar Documento
          </Button>
          <Button size="sm" onClick={handleOpenAddSheet}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Transação
          </Button>
        </div>
      </div>

      <BalanceSummary transactions={transactions} />

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
            <RecentTransactions transactions={transactions} onEdit={handleOpenEditSheet} limit={7} loading={loading}/>
        </div>
        <div className="space-y-4">
            <CategoryChart transactions={transactions} />
        </div>
      </div>

       <div className="grid gap-4 md:gap-8">
         <AiInsights insights={insights} isLoading={isAnalyzing || loading} />
       </div>

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
