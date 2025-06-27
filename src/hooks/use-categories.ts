
"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { defaultCategories } from "@/lib/categories";

export function useCategories() {
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCategories(defaultCategories);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(firestore, `users/${user.uid}/categories`, "user_categories");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCategories(data.list || []);
        } else {
          setCategories(defaultCategories);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addCategory = useCallback(
    async (category: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(firestore, `users/${user.uid}/categories`, "user_categories");
      await updateDoc(docRef, {
        list: arrayUnion(category),
      });
    },
    [user]
  );

  const updateCategory = useCallback(
    async (oldCategory: string, newCategory: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(firestore, `users/${user.uid}/categories`, "user_categories");
      // This is a two-step process: remove the old, add the new
      await updateDoc(docRef, {
          list: arrayRemove(oldCategory)
      });
      await updateDoc(docRef, {
          list: arrayUnion(newCategory)
      });
    },
    [user]
  );

  const deleteCategory = useCallback(
    async (category: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(firestore, `users/${user.uid}/categories`, "user_categories");
      await updateDoc(docRef, {
        list: arrayRemove(category),
      });
    },
    [user]
  );

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
