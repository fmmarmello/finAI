
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, googleAuthProvider, firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { seedInitialData } from "@/lib/seed";
import { useToast } from "@/hooks/use-toast";
import { LoginCredentials, RegisterCredentials } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (credentials: LoginCredentials) => Promise<void>;
  signUpWithEmail: (credentials: RegisterCredentials) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleAuthError = (error: any) => {
    console.error("Firebase Auth Error: ", error);
    let title = "Erro de Autenticação";
    let description = "Ocorreu um erro inesperado. Tente novamente.";

    switch (error.code) {
      case 'auth/invalid-credential':
        title = "Credenciais Inválidas";
        description = "O e-mail ou a senha estão incorretos. Por favor, verifique e tente novamente.";
        break;
      case 'auth/email-already-in-use':
        title = "E-mail já cadastrado";
        description = "Este e-mail já está sendo utilizado por outra conta.";
        break;
      case 'auth/weak-password':
        title = "Senha Fraca";
        description = "Sua senha deve ter pelo menos 6 caracteres.";
        break;
      case 'auth/operation-not-allowed':
         title = "Operação não permitida";
         description = "O login por e-mail e senha não está ativado. Por favor, contate o suporte.";
         break;
      case 'auth/popup-closed-by-user':
        title = "Janela Fechada";
        description = "A janela de login do Google foi fechada antes da conclusão. Tente novamente.";
        break;
    }
    toast({ variant: "destructive", title, description });
  }

  const setupNewUser = async (user: User, name?: string) => {
    const categoriesDocRef = doc(firestore, `users/${user.uid}/categories`, "user_categories");
    const categoriesDoc = await getDoc(categoriesDocRef);

    if (!categoriesDoc.exists()) {
      if (name) {
         await updateProfile(user, { displayName: name });
      }
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, { email: user.email, name: user.displayName });
      await seedInitialData(user.uid);
      toast({
        title: "Bem-vindo(a)!",
        description: "Sua conta foi criada e preenchemos com alguns dados de exemplo.",
      });
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      await setupNewUser(result.user);
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const signUpWithEmail = async ({ name, email, password }: RegisterCredentials) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setupNewUser(userCredential.user, name);
    } catch (error: any) {
      handleAuthError(error);
    }
  }

  const signInWithEmail = async ({ email, password }: LoginCredentials) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      handleAuthError(error);
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      handleAuthError(error);
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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, logOut }}>
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
