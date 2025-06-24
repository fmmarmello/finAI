export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "receita" | "despesa";
  date: string; // YYYY-MM-DD
  category: string;
  source: "manual" | "upload" | "sample";
  status: "pendente" | "consolidado";
  ai_confidence_score?: number;
};
