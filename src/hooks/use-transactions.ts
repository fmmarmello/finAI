
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
import { Transaction } from "@/types";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactionsData: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactionsData.push({
            id: doc.id,
            ...doc.data(),
          } as Transaction);
        });
        setTransactions(transactionsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTransaction = useCallback(
    async (transactionData: Omit<Transaction, "id">) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await addDoc(
          collection(firestore, `users/${user.uid}/transactions`),
          transactionData
        );
      } catch (error) {
        console.error("Error adding transaction: ", error);
      }
    },
    [user]
  );

  const updateTransaction = useCallback(
    async (id: string, transactionData: Partial<Transaction>) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await updateDoc(
          doc(firestore, `users/${user.uid}/transactions`, id),
          transactionData
        );
      } catch (error) {
        console.error("Error updating transaction: ", error);
      }
    },
    [user]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await deleteDoc(doc(firestore, `users/${user.uid}/transactions`, id));
      } catch (error) {
        console.error("Error deleting transaction: ", error);
      }
    },
    [user]
  );

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
