'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Palette, FolderCog, BellRing, PlusCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// In a real app, this would come from a database or a shared state management solution
const categories = [
  "Alimentação",
  "Transporte",
  "Assinaturas & Serviços",
  "Moradia",
  "Lazer",
  "Saúde",
  "Compras",
  "Salário",
  "Outros",
];

export default function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-6 xl:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Configurações</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <User className="size-8 text-primary" />
              <div>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Gerencie seus dados de perfil.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Em construção...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Palette className="size-8 text-primary" />
              <div>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Customize a aparência do app.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                    <FolderCog className="size-8 text-primary" />
                    <div>
                        <CardTitle>Categorias</CardTitle>
                        <CardDescription>Gerencie suas categorias de transações.</CardDescription>
                    </div>
                </div>
                <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Nova
                </Button>
            </div>
          </CardHeader>
          <CardContent>
             <Separator className="my-4" />
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <Badge key={category} variant="outline" className="text-base font-normal py-1 px-3">
                            {category}
                        </Badge>
                    ))}
                </div>
                 <p className="text-xs text-muted-foreground">A funcionalidade completa para adicionar, editar e excluir categorias será implementada em breve.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <BellRing className="size-8 text-primary" />
              <div>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure suas preferências de notificação.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Em construção...</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
