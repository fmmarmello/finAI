import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-transaction.ts';
import '@/ai/flows/analyze-spending.ts';
import '@/ai/flows/extract-transaction-data.ts';