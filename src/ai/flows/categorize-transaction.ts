// src/ai/flows/categorize-transaction.ts
'use server';

/**
 * @fileOverview A transaction categorization AI agent.
 *
 * - categorizeTransaction - A function that handles the transaction categorization process.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// List of possible categories to guide the AI.
const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Assinaturas & Serviços",
  "Moradia",
  "Lazer",
  "Saúde",
  "Compras",
  "Salário",
  "Outros",
];

const CategorizeTransactionInputSchema = z.object({
  description: z.string().describe('The description of the transaction.'),
  userCategories: z.array(z.string()).describe('A list of categories defined by the user to select from.'),
});
export type CategorizeTransactionInput = z.infer<
  typeof CategorizeTransactionInputSchema
>;

const CategorizeTransactionOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The predicted category for the transaction, chosen from the user-provided list.'
    ),
});
export type CategorizeTransactionOutput = z.infer<
  typeof CategorizeTransactionOutputSchema
>;

export async function categorizeTransaction(
  input: CategorizeTransactionInput
): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const categorizeTransactionPrompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are a financial expert specializing in categorizing transactions.

  Your task is to select the most appropriate category for the given transaction description from the list of available categories.

  Transaction Description:
  "{{{description}}}"

  Available Categories:
  {{#each userCategories}}
  - {{this}}
  {{/each}}
  
  Please select the single best category from the list above.
  `,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await categorizeTransactionPrompt(input);
    return output!;
  }
);
