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

const initialTransactions: Transaction[] = [
  { id: "1", description: "Salário", amount: 5000, type: "receita", date: "2024-05-01", category: "Salário", source: "sample", status: "consolidado" },
  { id: "2", description: "Aluguel", amount: 1500, type: "despesa", date: "2024-05-05", category: "Moradia", source: "sample", status: "consolidado" },
  { id: "3", description: "Supermercado", amount: 450, type: "despesa", date: "2024-05-07", category: "Alimentação", source: "sample", status: "consolidado" },
  { id: "4", description: "Conta de Luz", amount: 150, type: "despesa", date: "2024-05-10", category: "Moradia", source: "sample", status: "consolidado" },
  { id: "5", description: "Netflix", amount: 39.9, type: "despesa", date: "2024-05-12", category: "Assinaturas & Serviços", source: "sample", status: "consolidado" },
  { id: "6", description: "Cinema", amount: 60, type: "despesa", date: "2024-05-15", category: "Lazer", source: "sample", status: "consolidado" },
  { id: "7", description: "Uber", amount: 25.5, type: "despesa", date: "2024-05-18", category: "Transporte", source: "sample", status: "consolidado" },
];

export function Dashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [insights, setInsights] = useState<AnalyzeSpendingOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function analyze() {
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
  }, [transactions, toast]);
  
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
    const today = format(new Date(), "yyyy-MM-dd");
    const newTransaction: Transaction = {
      ...newTransactionData,
      id: new Date().getTime().toString(),
      source: "manual",
      status: newTransactionData.date > today ? "pendente" : "consolidado",
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
          const allNewTxs: Transaction[] = [];
          
          result.data.forEach((tx: ExtractTransactionDataOutput['transactions'][0]) => {
            const isInstallment = tx.installmentNumber && tx.totalInstallments && tx.totalInstallments > 1;
            
            const baseTx: Omit<Transaction, 'id'| 'description'> = {
                amount: Math.abs(tx.amount),
                date: tx.date,
                type: tx.amount > 0 ? 'despesa' : 'receita', // Basic logic, could be improved
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
            const originalTx: Transaction = {
                ...baseTx,
                id: `${new Date().getTime()}-${tx.description}-${Math.random()}`,
                description: isInstallment ? `${tx.description.replace(/(\d+[/of]+\d+)/, '').trim()} (${tx.installmentNumber}/${tx.totalInstallments})` : tx.description,
                status: originalDate > today ? "pendente" : "consolidado",
            };
            allNewTxs.push(originalTx);

            // Create future installments if applicable
            if (isInstallment && tx.installmentNumber! < tx.totalInstallments!) {
              for (let i = tx.installmentNumber! + 1; i <= tx.totalInstallments!; i++) {
                const futureDate = addMonths(originalDate, i - tx.installmentNumber!);
                const futureTx: Transaction = {
                  ...baseTx,
                  id: `${new Date().getTime()}-${tx.description}-${i}`,
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
          
          setTransactions(prev => [...allNewTxs, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
            <RecentTransactions transactions={transactions} onEdit={handleOpenEditSheet} limit={7} />
        </div>
        <div className="space-y-4">
            <CategoryChart transactions={transactions} />
        </div>
      </div>

       <div className="grid gap-4 md:gap-8">
         <AiInsights insights={insights} isLoading={isAnalyzing} />
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
