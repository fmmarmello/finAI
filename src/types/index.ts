export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "receita" | "despesa";
  date: string; // YYYY-MM-DD
  category: string;
  source: "manual" | "boleto" | "itau" | "nubank" | "porto_seguro" | "upload";
  status: "pendente" | "consolidado";
  ai_confidence_score?: number;
};
