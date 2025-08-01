import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";
import { MainLayout } from "@/components/main-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { DataProvider } from "@/contexts/data-context";

export const metadata: Metadata = {
  title: "FinAI: Seu Assistente Financeiro",
  description: "Um aplicativo de monitoramento de despesas e receitas com inteligência artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <DataProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <MainLayout>
                {children}
              </MainLayout>
              <Toaster />
            </ThemeProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
