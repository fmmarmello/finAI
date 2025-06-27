'use server';
/**
 * @fileOverview A conversational AI assistant for financial queries.
 *
 * - conversationalChat - A function that answers user questions about their finances.
 * - ConversationalChatInput - The input type for the conversationalChat function.
 * - ConversationalChatOutput - The return type for the conversationalChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionSchema = z.object({
  description: z.string().describe('Description of the transaction'),
  amount: z.number().describe('Amount of the transaction'),
  date: z.string().describe('Date of the transaction (YYYY-MM-DD)'),
  category: z.string().describe('Category of the transaction'),
  type: z.enum(['receita', 'despesa']).describe('Type of transaction (receita or despesa)'),
});

const ConversationalChatInputSchema = z.object({
  query: z.string().describe('The user\'s question about their finances.'),
  transactions: z.array(TransactionSchema).describe('The list of user transactions.'),
  currency: z.string().default('BRL').describe('The currency of the transactions.'),
});
export type ConversationalChatInput = z.infer<typeof ConversationalChatInputSchema>;

const ConversationalChatOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type ConversationalChatOutput = z.infer<typeof ConversationalChatOutputSchema>;


export async function conversationalChat(input: ConversationalChatInput): Promise<ConversationalChatOutput> {
  return conversationalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalChatPrompt',
  input: {schema: ConversationalChatInputSchema},
  output: {schema: ConversationalChatOutputSchema},
  prompt: `Você é um assistente financeiro amigável e prestativo para o app FinAI. Sua tarefa é responder a perguntas do usuário sobre suas finanças pessoais com base em uma lista de transações fornecida. Seja conciso e direto em suas respostas.

  Use os dados das transações a seguir para responder à pergunta do usuário. A moeda é {{currency}}.

  Data das Transações:
  {{#each transactions}}
  - Data: {{date}}, Descrição: {{description}}, Valor: {{amount}}, Categoria: {{category}}, Tipo: {{type}}
  {{/each}}

  Pergunta do Usuário:
  "{{{query}}}"

  Responda à pergunta do usuário de forma clara e útil, em português do Brasil. Formate a resposta como um objeto JSON.
  `,
});


const conversationalChatFlow = ai.defineFlow(
  {
    name: 'conversationalChatFlow',
    inputSchema: ConversationalChatInputSchema,
    outputSchema: ConversationalChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
