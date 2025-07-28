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
import { ExpenseTemplate } from "@/types";

export function useExpenseTemplates() {
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(firestore, `users/${user.uid}/expense_templates`),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const templatesData: ExpenseTemplate[] = [];
        querySnapshot.forEach((doc) => {
          templatesData.push({
            id: doc.id,
            ...doc.data(),
          } as ExpenseTemplate);
        });
        setTemplates(templatesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching expense templates:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTemplate = useCallback(
    async (templateData: Omit<ExpenseTemplate, "id">) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await addDoc(
          collection(firestore, `users/${user.uid}/expense_templates`),
          templateData
        );
      } catch (error) {
        console.error("Error adding template: ", error);
      }
    },
    [user]
  );

  const updateTemplate = useCallback(
    async (id: string, templateData: Partial<Omit<ExpenseTemplate, "id">>) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await updateDoc(
          doc(firestore, `users/${user.uid}/expense_templates`, id),
          templateData
        );
      } catch (error) {
        console.error("Error updating template: ", error);
      }
    },
    [user]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await deleteDoc(doc(firestore, `users/${user.uid}/expense_templates`, id));
      } catch (error) {
        console.error("Error deleting template: ", error);
      }
    },
    [user]
  );

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
