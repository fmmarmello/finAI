// src/ai/flows/analyze-spending.ts
'use server';

/**
 * @fileOverview Provides insights into user spending habits, including trend analysis, anomaly detection, and recurring subscription identification.
 *
 * - analyzeSpending - Analyzes spending habits and provides insights.
 * - AnalyzeSpendingInput - The input type for the analyzeSpending function.
 * - AnalyzeSpendingOutput - The return type for the analyzeSpending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSpendingInputSchema = z.object({
  transactions: z.array(
    z.object({
      description: z.string().describe('Description of the transaction'),
      amount: z.number().describe('Amount of the transaction'),
      date: z.string().describe('Date of the transaction (YYYY-MM-DD)'),
      category: z.string().describe('Category of the transaction'),
      type: z.enum(['receita', 'despesa']).describe('Type of transaction (receita or despesa)'),
    })
  ).describe('List of transactions to analyze'),
  currency: z.string().default('BRL').describe('Currency of the transactions'),
});
export type AnalyzeSpendingInput = z.infer<typeof AnalyzeSpendingInputSchema>;

const AnalyzeSpendingOutputSchema = z.object({
  trendAnalysis: z.string().describe('Análise das tendências de gastos ao longo do tempo.'),
  anomalyDetection: z.string().describe('Anomalias identificadas nos padrões de gastos.'),
  recurringSubscriptions: z.string().describe('Lista de assinaturas recorrentes identificadas e seu custo mensal total.'),
  spendingSummary: z.string().describe('Resumo geral dos hábitos de consumo.'),
});
export type AnalyzeSpendingOutput = z.infer<typeof AnalyzeSpendingOutputSchema>;

export async function analyzeSpending(input: AnalyzeSpendingInput): Promise<AnalyzeSpendingOutput> {
  return analyzeSpendingFlow(input);
}

const analyzeSpendingPrompt = ai.definePrompt({
  name: 'analyzeSpendingPrompt',
  input: {schema: AnalyzeSpendingInputSchema},
  output: {schema: AnalyzeSpendingOutputSchema},
  prompt: `Você é um consultor financeiro pessoal que analisa hábitos de consumo para fornecer insights.

  Analise as seguintes transações e forneça insights sobre tendências de gastos, anomalias e assinaturas recorrentes.

  Transações:
  {{#each transactions}}
  - Data: {{date}}, Descrição: {{description}}, Valor: {{amount}} {{../currency}}, Categoria: {{category}}, Tipo: {{type}}
  {{/each}}

  Forneça os seguintes insights em português do Brasil:
  - Análise de Tendências (trendAnalysis): Analise as tendências de gastos ao longo do tempo (por exemplo, aumento de gastos em uma categoria específica).
  - Detecção de Anomalias (anomalyDetection): Identifique transações incomuns ou inesperadas.
  - Assinaturas Recorrentes (recurringSubscriptions): Liste as assinaturas recorrentes e seu custo mensal total.
  - Resumo de Gastos (spendingSummary): Forneça um resumo geral dos hábitos de consumo.

  Formate a resposta como um objeto JSON.
  `,
});

const analyzeSpendingFlow = ai.defineFlow(
  {
    name: 'analyzeSpendingFlow',
    inputSchema: AnalyzeSpendingInputSchema,
    outputSchema: AnalyzeSpendingOutputSchema,
  },
  async input => {
    const {output} = await analyzeSpendingPrompt(input);
    return output!;
  }
);
