"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleAuthProvider, firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { seedInitialData } from "@/lib/seed";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      
      // Check if user is new by looking for a core data document (e.g., categories).
      // This is more robust if Firestore rules are restrictive on the top-level user doc.
      const categoriesDocRef = doc(firestore, `users/${user.uid}/categories`, "user_categories");
      const categoriesDoc = await getDoc(categoriesDocRef);

      if (!categoriesDoc.exists()) {
        // This is a new user, create their main user document and seed initial data.
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { email: user.email, name: user.displayName });
        await seedInitialData(user.uid);
        toast({
          title: "Bem-vindo(a)!",
          description: "Sua conta foi criada e preenchemos com alguns dados de exemplo.",
        });
      }
    } catch (error: any) {
      console.error("Error signing in with Google: ", error);
      toast({
        variant: "destructive",
        title: "Erro no Login",
        description: error.code === 'auth/popup-closed-by-user' 
            ? "A janela de login foi fechada. Tente novamente."
            : "Não foi possível entrar. Verifique suas configurações de Firebase ou tente novamente."
      });
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Error signing out: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao Sair",
        description: "Ocorreu um erro ao tentar sair.",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
