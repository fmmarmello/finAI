import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // Use a cost-effective and capable model for general tasks.
  model: 'googleai/gemini-1.5-flash-latest',
});
