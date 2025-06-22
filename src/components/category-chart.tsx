"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Transaction } from "@/types";

type CategoryChartProps = {
  transactions: Transaction[];
};

const chartConfig = {
  value: {
    label: "Valor",
  },
  Alimentação: {
    label: "Alimentação",
    color: "hsl(var(--chart-1))",
  },
  Transporte: {
    label: "Transporte",
    color: "hsl(var(--chart-2))",
  },
  "Assinaturas & Serviços": {
    label: "Assinaturas & Serviços",
    color: "hsl(var(--chart-3))",
  },
  Moradia: {
    label: "Moradia",
    color: "hsl(var(--chart-4))",
  },
  Lazer: {
    label: "Lazer",
    color: "hsl(var(--chart-5))",
  },
  Outros: {
    label: "Outros",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

export function CategoryChart({ transactions }: CategoryChartProps) {
  const expenseData = transactions
    .filter((t) => t.type === "despesa")
    .reduce((acc, t) => {
      const existing = acc.find((item) => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Despesas por Categoria</CardTitle>
        <CardDescription>
          Distribuição dos seus gastos no período.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenseData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                 {expenseData.map((entry) => (
                    <Cell 
                        key={`cell-${entry.name}`} 
                        fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || chartConfig.Outros.color}
                    />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-muted-foreground">Sem dados de despesa para exibir.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
