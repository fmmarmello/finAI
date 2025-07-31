
"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ClipboardPen, Pencil, PlusCircle, Trash2, Wallet } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseTemplate } from "@/types";
import { ExpenseTemplateDialog } from "./expense-template-dialog";
import { DeleteTemplateAlert } from "./delete-template-alert";
import { useData } from "@/contexts/data-context";
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from "./ui/input";

export function PlanningPage() {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<ExpenseTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<ExpenseTemplate | null>(null);
  const { toast } = useToast();

  const handleOpenAddDialog = () => {
    setTemplateToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (template: ExpenseTemplate) => {
    setTemplateToEdit(template);
    setIsDialogOpen(true);
  };
  
  const handleOpenDeleteAlert = (template: ExpenseTemplate) => {
    setTemplateToDelete(template);
    setIsAlertOpen(true);
  };

  const handleSaveTemplate = async (data: Omit<ExpenseTemplate, "id">) => {
    if (templateToEdit) {
      await updateTemplate(templateToEdit.id, data);
      toast({ title: "Sucesso", description: `Modelo "${data.name}" foi atualizado.` });
    } else {
      await addTemplate(data);
      toast({ title: "Sucesso", description: `Modelo "${data.name}" foi adicionado.` });
    }
    setIsDialogOpen(false);
    setTemplateToEdit(null);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete.id);
      toast({ variant: "destructive", title: "Sucesso", description: `Modelo "${templateToDelete.name}" foi excluído.` });
    }
    setIsAlertOpen(false);
    setTemplateToDelete(null);
  };

  const currentMonthName = useMemo(() => {
    const now = new Date();
    return format(now, "MMMM", { locale: ptBR });
  }, []);


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-6 xl:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Planejamento Mensal
        </h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <ClipboardPen className="size-8 text-primary" />
                <div>
                  <CardTitle>Modelos de Despesas</CardTitle>
                  <CardDescription>
                    Crie modelos para suas despesas recorrentes mensais (ex:
                    Fatura do Cartão, Aluguel).
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleOpenAddDialog} disabled={loading}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Modelo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : (
                <ul className="space-y-3">
                  {templates.map((template) => (
                    <li
                      key={template.id}
                      className="flex items-center justify-between gap-2 rounded-lg border p-3"
                    >
                      <div>
                        <span className="font-medium">{template.name}</span>
                        <p className="text-sm text-muted-foreground">{template.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEditDialog(template)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleOpenDeleteAlert(template)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                   {templates.length === 0 && (
                     <p className="text-center text-muted-foreground py-4">Nenhum modelo de despesa encontrado.</p>
                   )}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <CardTitle className="capitalize">Despesas de {currentMonthName}</CardTitle>
             <CardDescription>Preencha os valores para as despesas deste mês. Em breve, você poderá salvar essas despesas como transações.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : (
                <ul className="space-y-3">
                  {templates.length > 0 ? templates.map((template) => (
                    <li key={template.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3">
                        <div className="flex items-center gap-4">
                            <Wallet className="size-6 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{template.name}</p>
                                <p className="text-sm text-muted-foreground">{template.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <Input 
                                type="number" 
                                placeholder="R$ 0,00" 
                                className="w-32"
                                disabled // Will be enabled in a future step
                            />
                            <Button disabled>Salvar</Button> 
                        </div>
                    </li>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">Crie modelos de despesa para começar a planejar o seu mês.</p>
                  )}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <ExpenseTemplateDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveTemplate}
        templateToEdit={templateToEdit}
      />
       <DeleteTemplateAlert
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={handleDeleteConfirm}
        templateName={templateToDelete?.name || null}
      />
    </main>
  );
}
