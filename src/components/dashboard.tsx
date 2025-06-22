"use client";

import { useState, useEffect, useRef } from "react";
import { PlusCircle, Upload, Loader2 } from "lucide-react";

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
  { id: "1", description: "Salário", amount: 5000, type: "receita", date: "2024-05-01", category: "Salário", source: "manual", status: "consolidado" },
  { id: "2", description: "Aluguel", amount: 1500, type: "despesa", date: "2024-05-05", category: "Moradia", source: "manual", status: "consolidado" },
  { id: "3", description: "Supermercado", amount: 450, type: "despesa", date: "2024-05-07", category: "Alimentação", source: "manual", status: "consolidado" },
  { id: "4", description: "Conta de Luz", amount: 150, type: "despesa", date: "2024-05-10", category: "Moradia", source: "boleto", status: "consolidado" },
  { id: "5", description: "Netflix", amount: 39.9, type: "despesa", date: "2024-05-12", category: "Assinaturas & Serviços", source: "nubank", status: "consolidado" },
  { id: "6", description: "Cinema", amount: 60, type: "despesa", date: "2024-05-15", category: "Lazer", source: "itau", status: "consolidado" },
  { id: "7", description: "Uber", amount: 25.5, type: "despesa", date: "2024-05-18", category: "Transporte", source: "porto_seguro", status: "consolidado" },
];

export function Dashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [insights, setInsights] = useState<AnalyzeSpendingOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function analyze() {
      if(transactions.length > 0) {
        setIsAnalyzing(true);
        const result = await runAnalyzeSpending(transactions);
        if (result.data) {
          setInsights(result.data);
        } else {
           toast({
            variant: "destructive",
            title: "Erro na Análise",
            description: result.error,
          });
        }
        setIsAnalyzing(false);
      }
    }
    analyze();
  }, [transactions, toast]);

  const handleAddTransaction = (newTransactionData: Omit<Transaction, "id" | "source" | "status">) => {
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
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      const result = await runExtractTransactionData(dataUri);

      if (result.data) {
        const newTxs: Transaction[] = result.data.map((tx: ExtractTransactionDataOutput['transactions'][0]) => ({
          ...tx,
          id: `${new Date().getTime()}-${tx.description}`,
          type: 'despesa',
          category: 'Outros',
          source: 'upload',
          status: 'pendente',
        }));
        setTransactions(prev => [...newTxs, ...prev]);
        toast({
          title: "Documento Processado",
          description: `${newTxs.length} transações foram extraídas e adicionadas.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro na Extração",
          description: result.error,
        });
      }
      setIsExtracting(false);
    };
    reader.onerror = () => {
       toast({
          variant: "destructive",
          title: "Erro no Upload",
          description: "Não foi possível ler o arquivo.",
        });
      setIsExtracting(false);
    }
    
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
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
          <Button size="sm" onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Transação
          </Button>
        </div>
      </div>

      <BalanceSummary transactions={transactions} />

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
            <RecentTransactions transactions={transactions} />
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
       />
    </main>
  );
}
