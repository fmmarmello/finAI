'use client'

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Palette, FolderCog, BellRing, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/use-local-storage";
import { defaultCategories } from "@/lib/categories";
import { CategoryDialog } from "@/components/category-dialog";
import { DeleteCategoryAlert } from "@/components/delete-category-alert";

export default function SettingsPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useLocalStorage<string[]>("user_categories", defaultCategories);

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  const handleOpenAddDialog = () => {
    setCategoryToEdit(null);
    setAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (category: string) => {
    setCategoryToEdit(category);
    setAddEditDialogOpen(true);
  };

  const handleOpenDeleteAlert = (category: string) => {
    setCategoryToDelete(category);
    setDeleteAlertOpen(true);
  };

  const handleSaveCategory = (newCategoryName: string) => {
    if (categoryToEdit) { // Editing existing category
      if (categories.some(c => c.toLowerCase() === newCategoryName.toLowerCase() && c.toLowerCase() !== categoryToEdit.toLowerCase())) {
        toast({ variant: "destructive", title: "Erro", description: "Essa categoria já existe." });
        return;
      }
      setCategories(categories.map(c => c === categoryToEdit ? newCategoryName : c));
      toast({ title: "Sucesso", description: `Categoria "${categoryToEdit}" foi atualizada para "${newCategoryName}".` });
    } else { // Adding new category
       if (categories.some(c => c.toLowerCase() === newCategoryName.toLowerCase())) {
        toast({ variant: "destructive", title: "Erro", description: "Essa categoria já existe." });
        return;
      }
      setCategories([...categories, newCategoryName].sort((a,b) => a.localeCompare(b)));
      toast({ title: "Sucesso", description: `Categoria "${newCategoryName}" foi adicionada.` });
    }
    setAddEditDialogOpen(false);
    setCategoryToEdit(null);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      setCategories(categories.filter(c => c !== categoryToDelete));
      toast({ variant: "destructive", title: "Sucesso", description: `Categoria "${categoryToDelete}" foi excluída.` });
    }
    setDeleteAlertOpen(false);
    setCategoryToDelete(null);
  };

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
                <Button onClick={handleOpenAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Nova
                </Button>
            </div>
          </CardHeader>
          <CardContent>
             <Separator className="my-4" />
            <div className="space-y-4">
                <ul className="space-y-3">
                    {categories.map((category) => (
                        <li key={category} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                            <span className="font-medium">{category}</span>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(category)}>
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleOpenDeleteAlert(category)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Excluir</span>
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                    Quando você edita uma categoria, as transações passadas não são alteradas para manter a integridade do histórico.
                </p>
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
       <CategoryDialog
        isOpen={isAddEditDialogOpen}
        onOpenChange={setAddEditDialogOpen}
        onSave={handleSaveCategory}
        categoryToEdit={categoryToEdit}
        existingCategories={categories}
      />
      <DeleteCategoryAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={handleDeleteConfirm}
        categoryName={categoryToDelete}
      />
    </main>
  );
}
