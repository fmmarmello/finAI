
export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "receita" | "despesa";
  date: string; // YYYY-MM-DD
  category: string;
  source: "manual" | "upload" | "sample" | "template";
  status: "pendente" | "consolidado";
  isRecurring?: boolean;
  ai_confidence_score?: number;
  installmentNumber?: number;
  totalInstallments?: number;
  templateId?: string; // Links back to an ExpenseTemplate
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
};

export type Message = {
  id:string;
  role: "user" | "assistant";
  content: string;
};

export type LoginCredentials = {
  email: string;
  password: string
}

export type RegisterCredentials = LoginCredentials & {
  name: string;
}

export type ExpenseTemplate = {
    id: string;
    name: string;
    category: string;
}
