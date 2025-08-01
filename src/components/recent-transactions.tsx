
"use client";

import { MoreVertical, Pencil, Loader2, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transaction } from "@/types";
import { cn } from "@/lib/utils";

type RecentTransactionsProps = {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onMarkAsPaid?: (transaction: Transaction) => void;
  limit?: number;
  loading?: boolean;
};

export function RecentTransactions({ transactions, onEdit, onMarkAsPaid, limit, loading }: RecentTransactionsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat("pt-BR", {timeZone: 'UTC'}).format(date);
  }

  const transactionsToDisplay = limit ? transactions.slice(0, limit) : transactions;

  const canPerformActions = onEdit || onMarkAsPaid;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Transações Recentes</CardTitle>
        <CardDescription>
          Suas atividades financeiras mais recentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                {canPerformActions && <TableHead className="w-[50px] text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsToDisplay.length > 0 ? (
                transactionsToDisplay.map((transaction) => (
                  <TableRow key={transaction.id} className={cn(transaction.status === 'pendente' && 'text-muted-foreground/80')}>
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        {formatDate(transaction.date)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(transaction.date)}</TableCell>
                     <TableCell className="hidden sm:table-cell">
                      <Badge variant={transaction.status === 'consolidado' ? 'secondary' : 'outline'} className="capitalize">{transaction.status}</Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        transaction.type === "receita"
                          ? "text-green-500"
                          : "text-red-500",
                        transaction.status === 'pendente' && 'text-opacity-60'
                      )}
                    >
                      {transaction.type === "receita" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    {canPerformActions && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onMarkAsPaid && transaction.status === 'pendente' && (
                                <>
                                    <DropdownMenuItem onClick={() => onMarkAsPaid(transaction)}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Marcar como Paga
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(transaction)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={canPerformActions ? 6 : 5} className="h-24 text-center">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
