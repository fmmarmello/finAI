"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { runConversationalChat } from "@/lib/actions";
import { Message, Transaction } from "@/types";

// Using the same initial transactions for the assistant's context
const initialTransactions: Transaction[] = [
    { id: "1", description: "Salário", amount: 5000, type: "receita", date: "2024-05-01", category: "Salário", source: "sample", status: "consolidado" },
    { id: "2", description: "Aluguel", amount: 1500, type: "despesa", date: "2024-05-05", category: "Moradia", source: "sample", status: "consolidado" },
    { id: "3", description: "Supermercado", amount: 450, type: "despesa", date: "2024-05-07", category: "Alimentação", source: "sample", status: "consolidado" },
    { id: "4", description: "Conta de Luz", amount: 150, type: "despesa", date: "2024-05-10", category: "Moradia", source: "sample", status: "consolidado" },
    { id: "5", description: "Netflix", amount: 39.9, type: "despesa", date: "2024-05-12", category: "Assinaturas & Serviços", source: "sample", status: "consolidado" },
    { id: "6", description: "Cinema", amount: 60, type: "despesa", date: "2024-05-15", category: "Lazer", source: "sample", status: "consolidado" },
    { id: "7", description: "Uber", amount: 25.5, type: "despesa", date: "2024-05-18", category: "Transporte", source: "sample", status: "consolidado" },
];

export function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Como posso ajudar com suas finanças hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions] = useState<Transaction[]>(initialTransactions); // In a real app, this would be fetched
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await runConversationalChat(input, transactions);
      if (result.data?.answer) {
        const assistantMessage: Message = {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: result.data.answer,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || "A resposta da IA estava vazia.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao contatar assistente",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível obter uma resposta.",
      });
       const assistantErrorMessage: Message = {
          id: Date.now().toString() + "-ai-error",
          role: "assistant",
          content: "Desculpe, não consegui processar sua solicitação no momento.",
        };
       setMessages((prev) => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-6 xl:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Assistente com IA
        </h1>
      </div>

      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle>Chat Financeiro</CardTitle>
          <CardDescription>
            Faça perguntas sobre suas finanças em linguagem natural.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-[50vh] pr-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={cn(
                        "flex items-start gap-4",
                        message.role === "user" && "justify-end"
                    )}
                    >
                    {message.role === "assistant" && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback>
                            <Bot className="h-5 w-5" />
                        </AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        "max-w-xs rounded-lg p-3 text-sm md:max-w-md",
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                    >
                        {message.content}
                    </div>
                    {message.role === "user" && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback>
                            <User className="h-5 w-5" />
                        </AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>
                                <Bot className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="max-w-xs rounded-lg p-3 text-sm bg-muted md:max-w-md">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Ex: Quanto gastei com Lazer esse mês?"
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
