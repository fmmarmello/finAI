"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import Logo from "@/components/logo";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex w-full max-w-sm flex-col items-center rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo className="size-12 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-foreground">
            Bem-vindo ao FinAI
          </h1>
          <p className="text-muted-foreground">
            Seu assistente financeiro inteligente. Entre para continuar.
          </p>
        </div>
        <Button onClick={signInWithGoogle} className="w-full">
          Entrar com Google
        </Button>
      </div>
    </main>
  );
}
