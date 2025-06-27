"use server";
import { firestore } from "@/lib/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { Transaction, Budget } from "@/types";
import { defaultCategories } from "./categories";

const initialTransactions: Transaction[] = [
    { id: "1", description: "Salário", amount: 5000, type: "receita", date: "2024-05-01", category: "Salário", source: "sample", status: "consolidado" },
    { id: "2", description: "Aluguel", amount: 1500, type: "despesa", date: "2024-05-05", category: "Moradia", source: "sample", status: "consolidado" },
    { id: "3", description: "Supermercado", amount: 450, type: "despesa", date: "2024-05-07", category: "Alimentação", source: "sample", status: "consolidado" },
    { id: "4", description: "Conta de Luz", amount: 150, type: "despesa", date: "2024-05-10", category: "Moradia", source: "sample", status: "consolidado" },
    { id: "5", description: "Netflix", amount: 39.9, type: "despesa", date: "2024-05-12", category: "Assinaturas & Serviços", source: "sample", status: "consolidado" },
    { id: "6", description: "Cinema", amount: 60, type: "despesa", date: "2024-05-15", category: "Lazer", source: "sample", status: "consolidado" },
    { id: "7", description: "Uber", amount: 25.5, type: "despesa", date: "2024-05-18", category: "Transporte", source: "sample", status: "consolidado" },
];

const initialBudgets: Omit<Budget, "id">[] = [
    { category: "Alimentação", amount: 800 },
    { category: "Transporte", amount: 200 },
    { category: "Lazer", amount: 300 },
    { category: "Moradia", amount: 1800 },
];

export async function seedInitialData(userId: string) {
  const batch = writeBatch(firestore);

  // Seed Transactions
  const transactionsColRef = collection(firestore, `users/${userId}/transactions`);
  initialTransactions.forEach((transaction) => {
    const { id, ...txData } = transaction;
    const newDocRef = doc(transactionsColRef, id);
    batch.set(newDocRef, txData);
  });

  // Seed Budgets
  const budgetsColRef = collection(firestore, `users/${userId}/budgets`);
  initialBudgets.forEach((budget) => {
    const newDocRef = doc(budgetsColRef);
    batch.set(newDocRef, budget);
  });

  // Seed Categories
  const categoriesDocRef = doc(firestore, `users/${userId}/categories`, "user_categories");
  batch.set(categoriesDocRef, { list: defaultCategories });

  await batch.commit();
}
