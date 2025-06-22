"use client";

import { Sparkles, TrendingUp, AlertTriangle, Repeat } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type AnalyzeSpendingOutput } from "@/ai/flows/analyze-spending";
import { Skeleton } from "./ui/skeleton";

type AiInsightsProps = {
  insights: AnalyzeSpendingOutput | null;
  isLoading: boolean;
};

export function AiInsights({ insights, isLoading }: AiInsightsProps) {
  const renderSkeletons = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
      </div>
       <div className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          <CardTitle className="font-headline">Insights com IA</CardTitle>
        </div>
        <CardDescription>
          Análise inteligente dos seus hábitos financeiros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? renderSkeletons() : (
          !insights ? (
            <p className="text-sm text-muted-foreground">Adicione mais transações para receber insights.</p>
          ) : (
            <Accordion type="multiple" defaultValue={["summary", "trends"]}>
               <AccordionItem value="summary">
                <AccordionTrigger className="text-base font-medium">Resumo Geral</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {insights.spendingSummary}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="trends">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4" />
                    <span className="text-base font-medium">Análise de Tendências</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {insights.trendAnalysis}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="anomalies">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4" />
                    <span className="text-base font-medium">Detecção de Anomalias</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                   {insights.anomalyDetection}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="subscriptions">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Repeat className="size-4" />
                    <span className="text-base font-medium">Assinaturas Recorrentes</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                   {insights.recurringSubscriptions}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )
        )}
      </CardContent>
    </Card>
  );
}
