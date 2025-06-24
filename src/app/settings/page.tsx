import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Palette, FolderCog, BellRing } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-6 xl:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Configurações</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <p className="text-sm text-muted-foreground">Em construção...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <FolderCog className="size-8 text-primary" />
              <div>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Gerencie suas categorias de transações.</CardDescription>
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
