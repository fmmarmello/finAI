// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Extracts transaction data from uploaded documents (receipts, credit card statements).
 *
 * - extractTransactionData - A function that handles the transaction data extraction process.
 * - ExtractTransactionDataInput - The input type for the extractTransactionData function.
 * - ExtractTransactionDataOutput - The return type for the extractTransactionData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTransactionDataInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A photo or PDF of a receipt or credit card statement, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTransactionDataInput = z.infer<typeof ExtractTransactionDataInputSchema>;

const TransactionSchema = z.object({
  date: z.string().describe('The date of the transaction (YYYY-MM-DD).'),
  description: z.string().describe('A short description of the transaction.'),
  amount: z.number().describe('The amount of the transaction.'),
  installmentNumber: z.number().optional().describe('If this is an installment payment, the current installment number.'),
  totalInstallments: z.number().optional().describe('If this is an installment payment, the total number of installments.'),
});

const ExtractTransactionDataOutputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('An array of transactions extracted from the document.'),
});
export type ExtractTransactionDataOutput = z.infer<typeof ExtractTransactionDataOutputSchema>;

export async function extractTransactionData(input: ExtractTransactionDataInput): Promise<ExtractTransactionDataOutput> {
  return extractTransactionDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionDataPrompt',
  input: {schema: ExtractTransactionDataInputSchema},
  output: {schema: ExtractTransactionDataOutputSchema},
  prompt: `You are an expert financial data extraction specialist.

  Your task is to extract transaction data from a document (receipt, credit card statement, etc.) provided as an image.
  The document image will be provided as a data URI.

  Carefully analyze the document and extract all relevant transactions. Each transaction should include the date, a description, and the amount.
  
  **CRITICALLY IMPORTANT**: If a transaction is an installment (e.g., "Parcela 2/12", "2 of 12", "item name 3/6"), you MUST extract the current installment number into the \`installmentNumber\` field and the total number of installments into the \`totalInstallments\` field. If it is not an installment, leave these fields blank.

  The output MUST be a JSON array of transactions matching the schema.

  Here is the document:
  {{media url=documentDataUri}}
  `,
});

const extractTransactionDataFlow = ai.defineFlow(
  {
    name: 'extractTransactionDataFlow',
    inputSchema: ExtractTransactionDataInputSchema,
    outputSchema: ExtractTransactionDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
