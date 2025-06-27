
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Budget } from "@/types";

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(firestore, `users/${user.uid}/budgets`),
      orderBy("category", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const budgetsData: Budget[] = [];
        querySnapshot.forEach((doc) => {
          budgetsData.push({
            id: doc.id,
            ...doc.data(),
          } as Budget);
        });
        setBudgets(budgetsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching budgets:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addBudget = useCallback(
    async (budgetData: Omit<Budget, "id">) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await addDoc(
          collection(firestore, `users/${user.uid}/budgets`),
          budgetData
        );
      } catch (error) {
        console.error("Error adding budget: ", error);
      }
    },
    [user]
  );

  const updateBudget = useCallback(
    async (id: string, budgetData: Partial<Omit<Budget, "id">>) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await updateDoc(
          doc(firestore, `users/${user.uid}/budgets`, id),
          budgetData
        );
      } catch (error) {
        console.error("Error updating budget: ", error);
      }
    },
    [user]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await deleteDoc(doc(firestore, `users/${user.uid}/budgets`, id));
      } catch (error) {
        console.error("Error deleting budget: ", error);
      }
    },
    [user]
  );

  return {
    budgets,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
  };
}
