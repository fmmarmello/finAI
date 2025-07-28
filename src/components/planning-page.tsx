"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useExpenseTemplates } from "@/hooks/use-expense-templates";
import { useToast } from "@/hooks/use-toast";
import { ClipboardPen, Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseTemplate } from "@/types";
import { ExpenseTemplateDialog } from "./expense-template-dialog";
import { DeleteTemplateAlert } from "./delete-template-alert";

export function PlanningPage() {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useExpenseTemplates();
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
        {/* Placeholder for monthly expense list */}
        <Card>
          <CardHeader>
             <CardTitle>Despesas de Junho</CardTitle>
             <CardDescription>Preencha os valores para as despesas deste mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Em breve...</p>
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
