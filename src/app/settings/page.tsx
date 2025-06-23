import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-6 xl:p-8">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Configurações</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Página de Configurações</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Esta página está em construção.</p>
            </CardContent>
        </Card>
    </main>
  );
}
