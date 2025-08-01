'use server';

import { analyzeSpending, AnalyzeSpendingInput } from "@/ai/flows/analyze-spending";
import { categorizeTransaction, CategorizeTransactionInput } from "@/ai/flows/categorize-transaction";
import { conversationalChat, ConversationalChatInput } from "@/ai/flows/conversational-chat";
import { extractTransactionData } from "@/ai/flows/extract-transaction-data";
import { Transaction } from "@/types";

export async function runCategorizeTransaction(description: string, userCategories: string[]) {
  const input: CategorizeTransactionInput = {
    description,
    userCategories,
  };
  try {
    const result = await categorizeTransaction(input);
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to categorize transaction.' };
  }
}

export async function runAnalyzeSpending(transactions: Transaction[]) {
  // The AI flow expects a specific format, so we map our transaction type to it.
  const formattedTransactions: AnalyzeSpendingInput['transactions'] = transactions.map(t => ({
    description: t.description,
    amount: t.amount,
    date: t.date,
    category: t.category,
    type: t.type,
  }));

  try {
    const result = await analyzeSpending({ transactions: formattedTransactions, currency: 'BRL' });
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to analyze spending.' };
  }
}

export async function runExtractTransactionData(documentDataUri: string) {
  try {
    const result = await extractTransactionData({ documentDataUri });
    return { data: result.transactions };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to extract data from document.' };
  }
}

export async function runConversationalChat(query: string, transactions: Transaction[]) {
    const formattedTransactions: ConversationalChatInput['transactions'] = transactions.map(t => ({
        description: t.description,
        amount: t.amount,
        date: t.date,
        category: t.category,
        type: t.type,
    }));

    try {
        const result = await conversationalChat({ query, transactions: formattedTransactions, currency: 'BRL' });
        return { data: result };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to get response from AI assistant.' };
    }
}
