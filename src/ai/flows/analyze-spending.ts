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
  trendAnalysis: z.string().describe('Analysis of spending trends over time.'),
  anomalyDetection: z.string().describe('Identified anomalies in spending patterns.'),
  recurringSubscriptions: z.string().describe('List of identified recurring subscriptions and their total monthly cost.'),
  spendingSummary: z.string().describe('Overall summary of spending habits.'),
});
export type AnalyzeSpendingOutput = z.infer<typeof AnalyzeSpendingOutputSchema>;

export async function analyzeSpending(input: AnalyzeSpendingInput): Promise<AnalyzeSpendingOutput> {
  return analyzeSpendingFlow(input);
}

const analyzeSpendingPrompt = ai.definePrompt({
  name: 'analyzeSpendingPrompt',
  input: {schema: AnalyzeSpendingInputSchema},
  output: {schema: AnalyzeSpendingOutputSchema},
  prompt: `You are a personal finance advisor analyzing spending habits to provide insights.

  Analyze the following transactions and provide insights on spending trends, anomalies, and recurring subscriptions.

  Transactions:
  {{#each transactions}}
  - Date: {{date}}, Description: {{description}}, Amount: {{amount}} {{../currency}}, Category: {{category}}, Type: {{type}}
  {{/each}}

  Provide the following insights:
  - Trend Analysis: Analyze spending trends over time (e.g., increased spending in a specific category).
  - Anomaly Detection: Identify any unusual or unexpected transactions.
  - Recurring Subscriptions: List any recurring subscriptions and their total monthly cost.
  - Spending Summary: Give an overall summary of the spending habits.

  Format the response as a JSON object.
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
