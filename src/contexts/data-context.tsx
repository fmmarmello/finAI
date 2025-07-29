
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Transaction, Budget, ExpenseTemplate } from "@/types";
import { defaultCategories } from "@/lib/categories";
import { addMonths, format } from "date-fns";

// Types
interface DataContextType {
  // State
  transactions: Transaction[];
  budgets: Budget[];
  categories: string[];
  templates: ExpenseTemplate[];
  loading: boolean;

  // Actions
  addTransaction: (data: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  markTransactionAsPaid: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addBudget: (data: Omit<Budget, "id">) => Promise<void>;
  updateBudget: (id: string, data: Partial<Omit<Budget, "id">>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  addCategory: (category: string) => Promise<void>;
  updateCategory: (oldCategory: string, newCategory: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;

  addTemplate: (data: Omit<ExpenseTemplate, "id">) => Promise<void>;
  updateTemplate: (id: string, data: Partial<Omit<ExpenseTemplate, "id">>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Data Fetching Effect
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setCategories(defaultCategories);
      setTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const collections = {
      transactions: query(collection(firestore, `users/${user.uid}/transactions`), orderBy("date", "desc")),
      budgets: query(collection(firestore, `users/${user.uid}/budgets`), orderBy("category", "asc")),
      categories: doc(firestore, `users/${user.uid}/categories`, "user_categories"),
      templates: query(collection(firestore, `users/${user.uid}/expense_templates`), orderBy("name", "asc")),
    };

    const unsubscribes = [
      onSnapshot(collections.transactions, (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      }),
      onSnapshot(collections.budgets, (snapshot) => {
        setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)));
      }),
      onSnapshot(collections.categories, (docSnap) => {
        setCategories(docSnap.exists() ? docSnap.data().list : defaultCategories);
      }),
       onSnapshot(collections.templates, (snapshot) => {
        setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseTemplate)));
      }),
    ];
    
    // Once all initial listeners are set up, set loading to false.
    // This is a simplified approach; for production, you might use Promise.all with getDocs for initial load.
    Promise.all(unsubscribes).then(() => {
        setLoading(false);
    }).catch(error => {
        console.error("Error setting up listeners:", error);
        setLoading(false);
    });
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, [user]);
  
  // Memoized Actions
  const addTransaction = useCallback(async (transactionData: Omit<Transaction, "id">) => {
    if (!user) throw new Error("User not authenticated");
    await addDoc(collection(firestore, `users/${user.uid}/transactions`), transactionData);
  }, [user]);

  const updateTransaction = useCallback(async (id: string, transactionData: Partial<Transaction>) => {
    if (!user) throw new Error("User not authenticated");
    await updateDoc(doc(firestore, `users/${user.uid}/transactions`, id), transactionData);
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      await deleteDoc(doc(firestore, `users/${user.uid}/transactions`, id));
  }, [user]);
  
  const markTransactionAsPaid = useCallback(async (transaction: Transaction) => {
    if (!user) throw new Error("User not authenticated");
    const batch = writeBatch(firestore);

    // 1. Mark current transaction as paid
    const currentTxRef = doc(firestore, `users/${user.uid}/transactions`, transaction.id);
    batch.update(currentTxRef, { status: "consolidado" });

    // 2. If it's recurring, create the next month's transaction
    if (transaction.isRecurring) {
        const nextDate = addMonths(new Date(`${transaction.date}T00:00:00`), 1);
        const nextTransaction: Omit<Transaction, "id" | "ai_confidence_score"> = {
            ...transaction,
            date: format(nextDate, "yyyy-MM-dd"),
            status: "pendente",
        };
        delete (nextTransaction as Partial<Transaction>).id;
        
        const nextTxRef = doc(collection(firestore, `users/${user.uid}/transactions`));
        batch.set(nextTxRef, nextTransaction);
    }
    await batch.commit();
  }, [user]);

  const addBudget = useCallback(async (budgetData: Omit<Budget, "id">) => {
    if (!user) throw new Error("User not authenticated");
    await addDoc(collection(firestore, `users/${user.uid}/budgets`), budgetData);
  }, [user]);

  const updateBudget = useCallback(async (id: string, budgetData: Partial<Omit<Budget, "id">>) => {
    if (!user) throw new Error("User not authenticated");
    await updateDoc(doc(firestore, `users/${user.uid}/budgets`, id), budgetData);
  }, [user]);

  const deleteBudget = useCallback(async (id: string) => {
    if (!user) throw new Error("User not authenticated");
    await deleteDoc(doc(firestore, `users/${user.uid}/budgets`, id));
  }, [user]);

  const addCategory = useCallback(async (category: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(firestore, `users/${user.uid}/categories`, "user_categories");
      await updateDoc(docRef, { list: [...categories, category] });
  }, [user, categories]);

  const updateCategory = useCallback(async (oldCategory: string, newCategory: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(firestore, `users/${user.uid}/categories`, "user_categories");
      const newCategories = categories.map(c => c === oldCategory ? newCategory : c);
      await updateDoc(docRef, { list: newCategories });
  }, [user, categories]);

  const deleteCategory = useCallback(async (category: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(firestore, `users/${user.uid}/categories`, "user_categories");
      await updateDoc(docRef, { list: categories.filter(c => c !== category) });
  }, [user, categories]);

  const addTemplate = useCallback(async (templateData: Omit<ExpenseTemplate, "id">) => {
      if (!user) throw new Error("User not authenticated");
      await addDoc(collection(firestore, `users/${user.uid}/expense_templates`), templateData);
  }, [user]);

  const updateTemplate = useCallback(async (id: string, templateData: Partial<Omit<ExpenseTemplate, "id">>) => {
      if (!user) throw new Error("User not authenticated");
      await updateDoc(doc(firestore, `users/${user.uid}/expense_templates`, id), templateData);
  }, [user]);

  const deleteTemplate = useCallback(async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      await deleteDoc(doc(firestore, `users/${user.uid}/expense_templates`, id));
  }, [user]);


  const value = useMemo(() => ({
    transactions,
    budgets,
    categories,
    templates,
    loading,
    addTransaction,
    updateTransaction,
    markTransactionAsPaid,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addCategory,
    updateCategory,
    deleteCategory,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  }), [
    transactions, budgets, categories, templates, loading,
    addTransaction, updateTransaction, markTransactionAsPaid, deleteTransaction,
    addBudget, updateBudget, deleteBudget,
    addCategory, updateCategory, deleteCategory,
    addTemplate, updateTemplate, deleteTemplate,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Hook
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
