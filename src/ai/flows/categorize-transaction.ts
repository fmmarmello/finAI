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

const CategorizeTransactionInputSchema = z.object({
  description: z.string().describe('The description of the transaction.'),
});
export type CategorizeTransactionInput = z.infer<
  typeof CategorizeTransactionInputSchema
>;

const CategorizeTransactionOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The predicted category of the transaction (e.g., Food, Transportation, Entertainment).'
    ),
  confidenceScore: z
    .number()
    .describe(
      'A score between 0 and 1 indicating the confidence level of the categorization.'
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

  Given the transaction description, you will determine the most appropriate category and provide a confidence score.

  Transaction Description: {{{description}}}
  
  Consider these categories:
  - Food
  - Transportation
  - Entertainment
  - Shopping
  - Bills
  - Salary
  - Subscriptions
  - Other
  
  Make a determination as to the best category, and provide a confidence score.
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
